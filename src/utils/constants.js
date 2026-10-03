export const LOAN_TYPE_PERSONAL = 'personal';
export const LOAN_TYPE_HOME = 'home';
export const LOAN_TYPE_BUSINESS = 'business';
export const LOAN_TYPES = [LOAN_TYPE_PERSONAL, LOAN_TYPE_HOME, LOAN_TYPE_BUSINESS];

export const EMPLOYMENT_SALARIED = 'salaried';
export const EMPLOYMENT_SELF_EMPLOYED = 'self_employed';
export const EMPLOYMENT_BUSINESS_OWNER = 'business_owner';

export const MIN_LOAN_AMOUNT = 50000;
export const MAX_AGE_AT_MATURITY = 65;
export const MIN_APPLICANT_AGE = 21;
export const MAX_APPLICANT_AGE = 65;
export const DRAFT_TTL_HOURS = 72;
export const DRAFT_KEY_PREFIX = 'lendswift_draft_';
export const DRAFT_SCHEMA_VERSION = '1.0';
export const AUTOSAVE_INTERVAL_MS = 30000;
export const VERIFICATION_DELAY_MS = 1500;

// Amounts are in INR. "coApplicantAbove" is a strict "exceeds" threshold.
export const LOAN_CONFIG = {
  [LOAN_TYPE_PERSONAL]: {
    label: 'Personal loan',
    maxAmount: 1000000,
    minTenure: 12,
    maxTenure: 60,
    tenureStep: 6,
    annualRate: 10.5,
    coApplicantAbove: 500000,
    purposes: ['Medical expenses', 'Wedding', 'Travel', 'Education', 'Debt consolidation', 'Home renovation', 'Other'],
  },
  [LOAN_TYPE_HOME]: {
    label: 'Home loan',
    maxAmount: 10000000,
    minTenure: 60,
    maxTenure: 360,
    tenureStep: 12,
    annualRate: 8.5,
    coApplicantAbove: 0, // always required
    purposes: ['Purchase of ready property', 'Purchase of under-construction property', 'Construction', 'Plot purchase', 'Balance transfer'],
  },
  [LOAN_TYPE_BUSINESS]: {
    label: 'Business loan',
    maxAmount: 5000000,
    minTenure: 12,
    maxTenure: 120,
    tenureStep: 6,
    annualRate: 14,
    coApplicantAbove: 2000000,
    purposes: ['Working capital', 'Equipment purchase', 'Business expansion', 'Inventory', 'Other'],
  },
};

// 4th character of a PAN
export const PAN_ENTITY_TYPES = {
  P: 'Individual', C: 'Company', H: 'HUF', A: 'AOP', B: 'BOI', G: 'Government',
  J: 'Artificial Juridical Person', L: 'Local Authority', F: 'Firm', T: 'Trust',
};

export const PROCESSING_FEE_RATE = 0.01;
export const PROCESSING_FEE_MIN = 2000;
export const PROCESSING_FEE_MAX = 25000;
export const MAX_EMI_TO_INCOME_RATIO = 0.5;
