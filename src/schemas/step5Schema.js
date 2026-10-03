import { z } from 'zod';
import {
  EMPLOYMENT_SALARIED, EMPLOYMENT_SELF_EMPLOYED, EMPLOYMENT_BUSINESS_OWNER, LOAN_TYPE_BUSINESS,
} from '../utils/constants.js';
import { validateGST } from '../utils/validators.js';

const money = (label, min) => z.number({ required_error: `Enter ${label}`, invalid_type_error: `Enter ${label}` }).min(min, `${label} must be at least ₹${min.toLocaleString('en-IN')}`);
const text = (label) => z.string({ required_error: `Enter ${label}` }).trim().min(2, `Enter ${label}`);
const years = (label) => z.number({ required_error: `Enter ${label}`, invalid_type_error: `Enter ${label}` }).min(0).max(50, 'Enter 0–50 years');

const salaried = z.object({
  employmentType: z.literal(EMPLOYMENT_SALARIED),
  companyName: text('your company name'),
  designation: text('your designation'),
  monthlyNetSalary: money('your monthly net salary', 15000),
  yearsOfExperience: years('years of experience'),
});

const businessCommon = {
  businessName: text('your business name'),
  businessType: text('your business type'),
  annualTurnover: money('annual turnover', 300000),
  yearsInBusiness: z.number({ required_error: 'Enter years in business', invalid_type_error: 'Enter years in business' }).min(2, 'Business must be at least 2 years old'),
  businessAddress: text('your business address'),
  yearsOfExperience: years('years of experience'),
};

const selfEmployed = z.object({
  employmentType: z.literal(EMPLOYMENT_SELF_EMPLOYED),
  ...businessCommon,
  monthlyIncome: money('your monthly income', 1),
});

const businessOwner = z.object({
  employmentType: z.literal(EMPLOYMENT_BUSINESS_OWNER),
  ...businessCommon,
  gstNumber: z.string({ required_error: 'Enter your GST number' }).refine((g) => validateGST(g).valid, (g) => ({ message: validateGST(g).message ?? 'Enter your GST number' })),
  monthlyIncome: money('your monthly income', 1).optional(),
});

const employmentChoice = z.object({
  employmentType: z.enum([EMPLOYMENT_SALARIED, EMPLOYMENT_SELF_EMPLOYED, EMPLOYMENT_BUSINESS_OWNER], {
    errorMap: () => ({ message: 'Select your employment type' }),
  }),
});

export function makeStep5Schema({ loanType, employmentType } = {}) {
  // Until a valid type is chosen, only ask for that (discriminatedUnion needs a literal match).
  if (!employmentType) return employmentChoice;
  return z.discriminatedUnion('employmentType', [salaried, selfEmployed, businessOwner])
    .superRefine((v, ctx) => {
      if (loanType === LOAN_TYPE_BUSINESS && v.employmentType === EMPLOYMENT_SALARIED) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['employmentType'], message: 'Business loans are for self-employed people and business owners. Choose one of those, or change the loan type in Step 1' });
      }
    });
}
