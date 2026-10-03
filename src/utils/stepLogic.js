import { LOAN_CONFIG, LOAN_TYPE_HOME } from './constants.js';

/** Step 6 shows for every home loan, and when the amount *exceeds* the type's threshold. */
export function isCoApplicantRequired({ loanType, loanAmount } = {}) {
  if (!loanType) return false;
  if (loanType === LOAN_TYPE_HOME) return true;
  const threshold = LOAN_CONFIG[loanType]?.coApplicantAbove;
  return Number(loanAmount) > threshold;
}
