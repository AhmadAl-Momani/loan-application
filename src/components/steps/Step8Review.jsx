import { useFormContext, useWatch } from 'react-hook-form';
import Checkbox from '../common/Checkbox.jsx';
import { buildLoanSummary, checkAffordability } from '../../utils/emiCalculator.js';
import { formatINR, maskValue } from '../../utils/formatters.js';
import { LOAN_CONFIG } from '../../utils/constants.js';

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-200 py-2 text-sm last:border-0">
      <dt className="text-slate-700">{label}</dt>
      <dd className="text-right font-semibold text-slate-900">{value || '—'}</dd>
    </div>
  );
}

function Section({
  title, stepId, goToStep, children,
}) {
  return (
    <section className="mb-4 rounded-md border border-slate-300 bg-white p-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="font-semibold text-primary">{title}</h3>
        <button type="button" onClick={() => goToStep(stepId)} className="min-h-[44px] min-w-[44px] text-sm font-semibold text-primary underline">
          Edit
          <span className="sr-only">{` ${title}`}</span>
        </button>
      </div>
      <dl>{children}</dl>
    </section>
  );
}

export default function Step8Review({ goToStep }) {
  const { register, control, formState: { errors } } = useFormContext();
  const v = useWatch({ control });
  const summary = buildLoanSummary(v);
  const income = v.monthlyNetSalary ?? v.monthlyIncome;
  const afford = summary
    ? checkAffordability({ emi: summary.emi, income, coApplicantIncome: v.coApplicantIncome })
    : null;

  return (
    <div>
      {summary && (
        <section aria-labelledby="kfs-heading" className="mb-4 rounded-md border-2 border-primary bg-white p-4">
          <h3 id="kfs-heading" className="text-lg font-bold text-primary">Key fact statement</h3>
          <dl className="mt-2">
            <Row label="Loan amount" value={formatINR(summary.loanAmount)} />
            <Row label="Tenure" value={`${summary.tenure} months`} />
            <Row label="Indicative interest rate" value={`${summary.annualRate}% p.a.`} />
            <Row label="Estimated EMI" value={formatINR(summary.emi)} />
            <Row label="Total cost of borrowing (interest)" value={formatINR(summary.totalCostOfBorrowing)} />
            <Row label="Processing fee" value={formatINR(summary.processingFee)} />
          </dl>
          {afford?.known && afford.exceeds && (
            <p role="alert" className="mt-3 rounded bg-amber-50 p-3 text-sm font-medium text-warning-dark">
              {`Your EMI is ${Math.round(afford.ratio * 100)}% of your income, above the 50% guideline. You can still apply, but approval may be harder.`}
            </p>
          )}
          {afford && !afford.known && (
            <p className="mt-3 text-sm text-slate-700">The affordability check will run once your income is captured in Step 5.</p>
          )}
          <p className="mt-3 text-sm text-slate-700">
            Cooling-off: you can exit this loan without penalty within the cooling-off period stated in your sanction letter.
            Grievances: contact LendSwift’s nodal grievance officer; if unresolved in 30 days, escalate to the RBI Ombudsman.
          </p>
        </section>
      )}

      <Section title="Loan details" stepId={1} goToStep={goToStep}>
        <Row label="Type" value={LOAN_CONFIG[v.loanType]?.label} />
        <Row label="Purpose" value={v.loanPurpose} />
      </Section>
      <Section title="Personal information" stepId={2} goToStep={goToStep}>
        <Row label="Name" value={v.fullName} />
        <Row label="Date of birth" value={v.dob} />
        <Row label="Mobile" value={v.mobile ? maskValue(v.mobile) : ''} />
      </Section>
      <Section title="Identity" stepId={3} goToStep={goToStep}>
        <Row label="PAN" value={v.pan ? maskValue(v.pan) : ''} />
        <Row label="Aadhaar" value={v.aadhaar ? maskValue(v.aadhaar) : ''} />
      </Section>

      <fieldset className="mt-6">
        <legend className="mb-2 font-semibold text-slate-900">Consents (each one is separate and required)</legend>
        <Checkbox label="I confirm all information I provided is accurate." error={errors.consentAccurate?.message} {...register('consentAccurate')} />
        <Checkbox label="I authorise LendSwift to check my credit score via CIBIL/Equifax." error={errors.consentCreditCheck?.message} {...register('consentCreditCheck')} />
        <Checkbox label="I agree to the Terms and Conditions." error={errors.consentTerms?.message} {...register('consentTerms')} />
        <Checkbox label="I consent to receive communications about this application." error={errors.consentComms?.message} {...register('consentComms')} />
      </fieldset>
    </div>
  );
}
