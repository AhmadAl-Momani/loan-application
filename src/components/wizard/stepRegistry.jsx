import { lazy } from 'react';
import { isCoApplicantRequired } from '../../utils/stepLogic.js';

/**
 * Ordered step registry. `implemented: false` steps render a placeholder and are not validated,
 * so the whole flow can be walked end to end while the remaining steps are built.
 * Step ids stay fixed (1–8) even when Step 6 is hidden; display numbers are position-based.
 */
export const STEP_REGISTRY = [
  { id: 1, title: 'Loan details', implemented: true, Component: lazy(() => import('../steps/Step1LoanType.jsx')) },
  { id: 2, title: 'Personal information', implemented: true, Component: lazy(() => import('../steps/Step2PersonalInfo.jsx')) },
  { id: 3, title: 'Identity verification', implemented: true, Component: lazy(() => import('../steps/Step3KYC.jsx')) },
  { id: 4, title: 'Address', implemented: false, Component: lazy(() => import('../steps/Step4Address.jsx')) },
  { id: 5, title: 'Employment and income', implemented: false, Component: lazy(() => import('../steps/Step5Employment.jsx')) },
  {
    id: 6, title: 'Co-applicant', implemented: false, isActive: isCoApplicantRequired, Component: lazy(() => import('../steps/Step6CoApplicant.jsx')),
  },
  { id: 7, title: 'Documents and signature', implemented: false, Component: lazy(() => import('../steps/Step7Documents.jsx')) },
  { id: 8, title: 'Review and submit', implemented: true, Component: lazy(() => import('../steps/Step8Review.jsx')) },
];

export const TOTAL_STEPS = STEP_REGISTRY.length;

/** Steps that apply to the current answers. Re-evaluated on every change, so Step 6 appears/disappears live. */
export const getActiveSteps = (values) => STEP_REGISTRY.filter((s) => !s.isActive || s.isActive(values));
