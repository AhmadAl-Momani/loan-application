import { z } from 'zod';
import { MIN_APPLICANT_AGE, MAX_APPLICANT_AGE, MAX_AGE_AT_MATURITY } from '../utils/constants.js';
import { calculateAge, maxTenureForAge, parseISODate } from '../utils/validators.js';

const NAME_RE = /^[A-Za-z .]+$/;
const nameField = (label) => z.string({ required_error: `Enter ${label}` })
  .trim()
  .min(2, `${label} must be at least 2 characters`)
  .max(100, `${label} must be at most 100 characters`)
  .regex(NAME_RE, `${label} can contain only letters, spaces and periods`);

export const MARITAL_STATUSES = ['single', 'married', 'divorced', 'widowed'];
export const GENDERS = ['male', 'female', 'other'];

/** `loanTenure` (from Step 1) lets DOB be checked against the age-65 cap. */
export function makeStep2Schema({ loanTenure } = {}) {
  return z.object({
    fullName: nameField('your full name'),
    dob: z.string({ required_error: 'Enter your date of birth' }).min(1, 'Enter your date of birth'),
    gender: z.enum(GENDERS, { errorMap: () => ({ message: 'Select your gender' }) }),
    maritalStatus: z.enum(MARITAL_STATUSES, { errorMap: () => ({ message: 'Select your marital status' }) }),
    fatherName: nameField("your father's name"),
    motherName: nameField("your mother's name"),
    email: z.string({ required_error: 'Enter your email' }).trim().min(1, 'Enter your email').email('Enter a valid email like name@example.com'),
    mobile: z.string({ required_error: 'Enter your mobile number' }).regex(/^[6-9]\d{9}$/, 'Mobile number must be 10 digits starting with 6, 7, 8 or 9'),
    alternateMobile: z.string().regex(/^[6-9]\d{9}$/, 'Alternate mobile must be 10 digits starting with 6, 7, 8 or 9').optional().or(z.literal('')),
  }).superRefine((v, ctx) => {
    if (v.dob) {
      if (!parseISODate(v.dob)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dob'], message: 'Enter a valid date of birth' });
      } else {
        const age = calculateAge(v.dob);
        if (age < MIN_APPLICANT_AGE) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dob'], message: `You must be at least ${MIN_APPLICANT_AGE} years old to apply` });
        } else if (age > MAX_APPLICANT_AGE) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['dob'], message: `Applicants must be at most ${MAX_APPLICANT_AGE} years old` });
        } else if (loanTenure && loanTenure > maxTenureForAge(age)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['dob'],
            message: `At age ${age} the longest tenure is ${maxTenureForAge(age)} months (loan must end by age ${MAX_AGE_AT_MATURITY}). Shorten the tenure in Step 1`,
          });
        }
      }
    }
    if (v.alternateMobile && v.alternateMobile === v.mobile) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['alternateMobile'], message: 'Alternate mobile must be different from your primary number' });
    }
  });
}
