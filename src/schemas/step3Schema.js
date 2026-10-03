import { z } from 'zod';
import {
  validatePAN, validateAadhaar, validateVoterId, validatePassport,
} from '../utils/validators.js';
import { LOAN_TYPE_HOME } from '../utils/constants.js';

export function makeStep3Schema({ loanType, loanAmount } = {}) {
  return z.object({
    pan: z.string({ required_error: 'Enter your PAN' }),
    panVerified: z.boolean().optional(),
    aadhaar: z.string({ required_error: 'Enter your Aadhaar number' }),
    aadhaarVerified: z.boolean().optional(),
    aadhaarConsent: z.literal(true, { errorMap: () => ({ message: 'Give your consent to use Aadhaar to continue' }) }),
    voterId: z.string().optional(),
    passport: z.string().optional(),
  }).superRefine((v, ctx) => {
    const pan = validatePAN(v.pan, loanType);
    if (!pan.valid) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pan'], message: pan.message });
    else if (!v.panVerified) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pan'], message: 'Verify your PAN to continue (tap outside the field to start)' });

    const aadhaar = validateAadhaar(v.aadhaar);
    if (!aadhaar.valid) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['aadhaar'], message: aadhaar.message });
    else if (!v.aadhaarVerified) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['aadhaar'], message: 'Verify your Aadhaar to continue (tap outside the field to start)' });

    if (v.voterId) {
      const r = validateVoterId(v.voterId);
      if (!r.valid) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['voterId'], message: r.message });
    }
    if (v.passport) {
      const r = validatePassport(v.passport);
      if (!r.valid) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['passport'], message: r.message });
    }
  });
}

/** Passport field only appears for home loans above ₹50 lakh. */
export const isPassportVisible = ({ loanType, loanAmount }) => loanType === LOAN_TYPE_HOME && Number(loanAmount) > 5000000;
