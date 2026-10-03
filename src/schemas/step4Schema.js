import { z } from 'zod';

export const RESIDENCE_TYPES = ['owned', 'rented', 'company', 'family'];

const address = (prefix, label) => ({
  [`${prefix}Line1`]: z.string().trim().min(5, `${label} address must be at least 5 characters`).max(200, `${label} address must be at most 200 characters`),
  [`${prefix}Line2`]: z.string().optional(),
  [`${prefix}Pin`]: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  [`${prefix}City`]: z.string().min(1, 'Enter your city'),
  [`${prefix}State`]: z.string().min(1, 'Enter your state'),
});

export const makeStep4Schema = () => z.object({
  ...address('current', 'Current'),
  residenceType: z.enum(RESIDENCE_TYPES, { errorMap: () => ({ message: 'Select your residence type' }) }),
  rentAmount: z.number().optional(),
  yearsAtAddress: z.number({ required_error: 'Enter years at current address', invalid_type_error: 'Enter years at current address' }).min(0).max(50, 'Enter 0–50 years'),
  sameAsPermanent: z.boolean().optional(),
  // Permanent / previous address blocks are validated conditionally below
  permanentLine1: z.string().optional(),
  permanentPin: z.string().optional(),
  permanentCity: z.string().optional(),
  permanentState: z.string().optional(),
  previousLine1: z.string().optional(),
  previousPin: z.string().optional(),
}).superRefine((v, ctx) => {
  const add = (path, message) => ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });
  if (v.residenceType === 'rented' && !(v.rentAmount > 0)) add('rentAmount', 'Enter your monthly rent');
  if (!v.sameAsPermanent) {
    if (!v.permanentLine1 || v.permanentLine1.length < 5) add('permanentLine1', 'Enter your permanent address (at least 5 characters)');
    if (!/^\d{6}$/.test(v.permanentPin ?? '')) add('permanentPin', 'Permanent PIN code must be 6 digits');
    if (!v.permanentCity) add('permanentCity', 'Enter your permanent city');
    if (!v.permanentState) add('permanentState', 'Enter your permanent state');
  }
  if (v.yearsAtAddress < 1) {
    if (!v.previousLine1 || v.previousLine1.length < 5) add('previousLine1', 'Enter your previous address (at least 5 characters)');
    if (!/^\d{6}$/.test(v.previousPin ?? '')) add('previousPin', 'Previous PIN code must be 6 digits');
  }
});
