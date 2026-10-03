import {
  LOAN_CONFIG, PROCESSING_FEE_RATE, PROCESSING_FEE_MIN, PROCESSING_FEE_MAX, MAX_EMI_TO_INCOME_RATIO,
} from './constants.js';

/** EMI = P × r × (1+r)^n / ((1+r)^n − 1), r = annual / 12 / 100 */
export function calculateEMI(principal, annualRatePct, months) {
  const r = annualRatePct / 12 / 100;
  if (r === 0) return principal / months;
  const growth = (1 + r) ** months;
  return (principal * r * growth) / (growth - 1);
}

export function calculateProcessingFee(principal) {
  return Math.min(PROCESSING_FEE_MAX, Math.max(PROCESSING_FEE_MIN, Math.round(principal * PROCESSING_FEE_RATE)));
}

/** Everything the Key Fact Statement card needs. Returns null if inputs are incomplete. */
export function buildLoanSummary({ loanType, loanAmount, loanTenure }) {
  const cfg = LOAN_CONFIG[loanType];
  if (!cfg || !loanAmount || !loanTenure) return null;
  const emi = Math.round(calculateEMI(loanAmount, cfg.annualRate, loanTenure));
  return {
    loanAmount,
    tenure: loanTenure,
    annualRate: cfg.annualRate,
    emi,
    totalCostOfBorrowing: emi * loanTenure - loanAmount,
    processingFee: calculateProcessingFee(loanAmount),
  };
}

/** EMI must not exceed 50% of (applicant + co-applicant) monthly income. */
export function checkAffordability({ emi, income = 0, coApplicantIncome = 0 }) {
  const total = (Number(income) || 0) + (Number(coApplicantIncome) || 0);
  if (!total) return { known: false, ratio: null, exceeds: false };
  const ratio = emi / total;
  return { known: true, ratio, exceeds: ratio > MAX_EMI_TO_INCOME_RATIO };
}
