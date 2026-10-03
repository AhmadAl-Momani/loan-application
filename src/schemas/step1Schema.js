import { z } from 'zod';
import {
  LOAN_TYPES, LOAN_CONFIG, MIN_LOAN_AMOUNT,
} from '../utils/constants.js';
import { calculateAge, maxTenureForAge } from '../utils/validators.js';
import { formatINR } from '../utils/formatters.js';

/** Step 1 schema. `dob` (from Step 2) tightens max tenure: age + tenure <= 65. */
export function makeStep1Schema({ dob } = {}) {
  const age = dob ? calculateAge(dob) : null;
  const ageCap = maxTenureForAge(age);

  return z.object({
    loanType: z.enum(LOAN_TYPES, { errorMap: () => ({ message: 'Select a loan type: personal, home or business' }) }),
    loanAmount: z.number({ required_error: 'Enter the loan amount', invalid_type_error: 'Enter the loan amount as a number' }),
    loanTenure: z.number({ required_error: 'Select a loan tenure', invalid_type_error: 'Select a loan tenure' }),
    loanPurpose: z.string({ required_error: 'Select the loan purpose' }).min(1, 'Select the loan purpose'),
    referralCode: z.string().regex(/^[A-Za-z0-9]{6,10}$/, 'Referral code must be 6–10 letters or digits').optional().or(z.literal('')),
  }).superRefine((v, ctx) => {
    const cfg = LOAN_CONFIG[v.loanType];
    if (!cfg) return;
    if (v.loanAmount < MIN_LOAN_AMOUNT) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['loanAmount'], message: `Minimum loan amount is ${formatINR(MIN_LOAN_AMOUNT)}` });
    } else if (v.loanAmount > cfg.maxAmount) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['loanAmount'], message: `${cfg.label} amount can be at most ${formatINR(cfg.maxAmount)}` });
    }
    if (v.loanTenure < cfg.minTenure || v.loanTenure > cfg.maxTenure) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['loanTenure'], message: `${cfg.label} tenure must be ${cfg.minTenure}–${cfg.maxTenure} months` });
    } else if (v.loanTenure > ageCap) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['loanTenure'],
        message: `Based on your age (${age}), the longest tenure is ${ageCap} months so the loan ends by age 65`,
      });
    }
    if (v.loanPurpose && !cfg.purposes.includes(v.loanPurpose)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['loanPurpose'], message: `Select a purpose that applies to a ${cfg.label.toLowerCase()}` });
    }
  });
}
