import {
  Suspense, useCallback, useEffect, useRef, useState,
} from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getStepSchema } from '../../schemas/schemaFactory.js';
import useAutoSave from '../../hooks/useAutoSave.js';
import useFormPersistence from '../../hooks/useFormPersistence.js';
import { LOAN_CONFIG, AUTOSAVE_INTERVAL_MS } from '../../utils/constants.js';
import { STEP_REGISTRY, TOTAL_STEPS, getActiveSteps } from './stepRegistry.jsx';
import ProgressBar from './ProgressBar.jsx';
import StepNavigation from './StepNavigation.jsx';
import {
  Toast, ResumeModal, SuccessModal, NoticeModal,
} from './Overlays.jsx';

const DEFAULT_VALUES = {
  loanType: '',
  loanAmount: undefined,
  loanTenure: undefined,
  loanPurpose: '',
  referralCode: '',
  fullName: '',
  dob: '',
  gender: '',
  maritalStatus: '',
  fatherName: '',
  motherName: '',
  email: '',
  mobile: '',
  alternateMobile: '',
  pan: '',
  panVerified: false,
  aadhaar: '',
  aadhaarVerified: false,
  aadhaarConsent: false,
  voterId: '',
  passport: '',
  consentAccurate: false,
  consentCreditCheck: false,
  consentTerms: false,
  consentComms: false,
};

const permissive = z.object({}).passthrough();

export default function Wizard() {
  const [currentStepId, setCurrentStepId] = useState(1);
  const stepRef = useRef(1); // read by the resolver; updated synchronously on navigation
  const navLock = useRef(false);
  const formRef = useRef(null);
  const firstRender = useRef(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [reference, setReference] = useState(null);
  const [notice, setNotice] = useState(null);

  // The resolver picks the schema for the *current* step from the *current* values, which is how
  // cross-step rules (DOB -> tenure, loan type -> PAN entity types, ...) stay live.
  const resolver = useCallback((values, context, options) => {
    const entry = STEP_REGISTRY.find((s) => s.id === stepRef.current);
    const schema = entry?.implemented ? getStepSchema(stepRef.current, values) : permissive;
    return zodResolver(schema)(values, context, options);
  }, []);

  const methods = useForm({
    mode: 'onBlur', reValidateMode: 'onChange', defaultValues: DEFAULT_VALUES, resolver,
  });
  const { reset, control, handleSubmit } = methods;
  const values = useWatch({ control });

  const activeSteps = getActiveSteps(values);
  const currentIndex = Math.max(0, activeSteps.findIndex((s) => s.id === currentStepId));
  const current = activeSteps[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === activeSteps.length - 1;

  const { pendingDraft, resume, startFresh, clearAllDrafts } = useFormPersistence(TOTAL_STEPS);
  const submitted = reference !== null;
  useAutoSave(values, AUTOSAVE_INTERVAL_MS, {
    enabled: !pendingDraft && !submitted,
    step: currentStepId,
    onSaved: (d) => setToast(`Draft saved at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`),
  });

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  // Clear PII from memory when the wizard unmounts
  useEffect(() => () => reset(DEFAULT_VALUES), [reset]);

  // Move focus to the first input on step change
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    formRef.current?.querySelector('input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea')?.focus();
  }, [currentStepId]);

  const goToStep = useCallback((id) => {
    stepRef.current = id;
    setCurrentStepId(id);
  }, []);

  const handleNext = handleSubmit(async () => {
    if (isLast) {
      setReference(window.crypto.randomUUID());
      clearAllDrafts();
      return;
    }
    // Use the *latest* active list so a step that just appeared (e.g. Step 6) is not skipped
    const list = getActiveSteps(methods.getValues());
    const idx = list.findIndex((s) => s.id === stepRef.current);
    goToStep(list[Math.min(idx + 1, list.length - 1)].id);
  });

  // Lock so 20 rapid clicks (or a double-submit) can't skip steps or submit twice
  const onSubmit = async (e) => {
    e.preventDefault();
    if (navLock.current) return;
    navLock.current = true;
    setBusy(true);
    try { await handleNext(); } finally { navLock.current = false; setBusy(false); }
  };

  const onPrevious = () => {
    if (navLock.current) return;
    const list = getActiveSteps(methods.getValues());
    const idx = list.findIndex((s) => s.id === stepRef.current);
    if (idx > 0) goToStep(list[idx - 1].id);
  };

  const onResume = async () => {
    const restored = await resume();
    if (!restored) {
      setNotice('We could not restore your saved application because the saved data was damaged or out of date. You are starting fresh.');
      return;
    }
    reset({ ...DEFAULT_VALUES, ...restored.values });
    goToStep(restored.step);
  };

  const startNew = () => {
    reset(DEFAULT_VALUES);
    setReference(null);
    goToStep(1);
  };

  const consentsOk = ['consentAccurate', 'consentCreditCheck', 'consentTerms', 'consentComms'].every((k) => values[k] === true);
  const { Component } = current;

  return (
    <FormProvider {...methods}>
      <ProgressBar steps={activeSteps} currentIndex={currentIndex} />
      <form ref={formRef} onSubmit={onSubmit} noValidate aria-labelledby="step-heading">
        <h2 id="step-heading" className="mb-4 text-xl font-bold text-slate-900">{current.title}</h2>
        <Suspense fallback={<p className="text-slate-700">Loading…</p>}>
          <Component goToStep={goToStep} />
        </Suspense>
        <StepNavigation
          isFirst={isFirst}
          isLast={isLast}
          onPrevious={onPrevious}
          busy={busy}
          nextDisabled={isLast && !consentsOk}
        />
      </form>

      <Toast message={toast} />
      {pendingDraft && !notice && (
        <ResumeModal
          loanTypeLabel={LOAN_CONFIG[pendingDraft.meta.loanType]?.label}
          savedAt={new Date(pendingDraft.meta.timestamp).toLocaleString()}
          onResume={onResume}
          onStartFresh={startFresh}
        />
      )}
      {notice && <NoticeModal title="Starting fresh" onClose={() => setNotice(null)}>{notice}</NoticeModal>}
      {submitted && <SuccessModal reference={reference} onClose={startNew} />}
    </FormProvider>
  );
}
