import { z } from 'zod';
import { validatePAN } from '../utils/validators.js';

export const RELATIONSHIPS = ['spouse', 'parent', 'sibling', 'business_partner'];

export function makeStep6Schema({ loanType } = {}) {
  return z.object({
    coApplicantName: z.string().trim().min(2, 'Enter the co-applicant’s full name').regex(/^[A-Za-z .]+$/, 'Name can contain only letters, spaces and periods'),
    coApplicantRelationship: z.enum(RELATIONSHIPS, { errorMap: () => ({ message: 'Select the relationship' }) }),
    coApplicantPan: z.string(),
    coApplicantPanVerified: z.boolean().optional(),
    coApplicantIncome: z.number({ required_error: 'Enter the co-applicant’s monthly income', invalid_type_error: 'Enter the co-applicant’s monthly income' }).min(1, 'Enter the co-applicant’s monthly income'),
    coApplicantConsent: z.literal(true, { errorMap: () => ({ message: 'The co-applicant must give consent to continue' }) }),
    coApplicantSignature: z.string({ required_error: 'Co-applicant signature is required' }).min(1, 'Co-applicant signature is required'),
  }).superRefine((v, ctx) => {
    const pan = validatePAN(v.coApplicantPan, loanType);
    if (!pan.valid) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['coApplicantPan'], message: pan.message });
    else if (!v.coApplicantPanVerified) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['coApplicantPan'], message: 'Verify the co-applicant’s PAN to continue' });
  });
}
