import {
  LOAN_TYPE_HOME, LOAN_TYPE_BUSINESS, EMPLOYMENT_SALARIED,
} from './constants.js';

const ANY = ['PDF', 'JPG', 'PNG'];

/** Documents Step 7 must collect, driven by loan type (Step 1), employment (Step 5), PAN status (Step 3). */
export function getRequiredDocuments({ loanType, employmentType, panVerified } = {}) {
  const docs = [
    { id: 'pan', label: 'PAN card copy', formats: ANY, maxMB: 5, maxFiles: 1, required: !panVerified },
    { id: 'aadhaar', label: 'Aadhaar card (front and back)', formats: ANY, maxMB: 5, maxFiles: 2, required: true },
    { id: 'bank', label: 'Bank statements (last 6 months)', formats: ['PDF'], maxMB: 10, maxFiles: 1, required: true },
    { id: 'photo', label: 'Passport-size photograph', formats: ['JPG', 'PNG'], maxMB: 2, maxFiles: 1, required: true },
  ];
  if (employmentType === EMPLOYMENT_SALARIED) {
    docs.push({ id: 'salary', label: 'Salary slips (last 3 months)', formats: ['PDF'], maxMB: 5, maxFiles: 3, required: true });
  } else if (employmentType) {
    docs.push({ id: 'itr', label: 'ITR (last 2 years)', formats: ['PDF'], maxMB: 5, maxFiles: 2, required: true });
  }
  if (loanType === LOAN_TYPE_HOME) {
    docs.push({ id: 'property', label: 'Property documents', formats: ['PDF'], maxMB: 10, maxFiles: 1, required: true });
  }
  if (loanType === LOAN_TYPE_BUSINESS) {
    docs.push(
      { id: 'bizReg', label: 'Business registration certificate', formats: ['PDF'], maxMB: 5, maxFiles: 1, required: true },
      { id: 'gstReturns', label: 'GST returns (last 4 quarters)', formats: ['PDF'], maxMB: 5, maxFiles: 4, required: true },
    );
  }
  return docs;
}
