import { z } from 'zod';
import { makeStep1Schema } from './step1Schema.js';
import { makeStep2Schema } from './step2Schema.js';
import { makeStep3Schema } from './step3Schema.js';
import { makeStep4Schema } from './step4Schema.js';
import { makeStep5Schema } from './step5Schema.js';
import { makeStep6Schema } from './step6Schema.js';
import { makeStep8Schema } from './step8Schema.js';

/**
 * Single entry point: current form state in, the schema for `stepId` out.
 * Cross-step dependencies are wired here (e.g. DOB -> Step 1 tenure cap, loanType -> PAN rules).
 * Step 7 (documents/e-signature) is validated by its own component for now.
 */
export function getStepSchema(stepId, state = {}) {
  switch (stepId) {
    case 1: return makeStep1Schema(state);
    case 2: return makeStep2Schema(state);
    case 3: return makeStep3Schema(state);
    case 4: return makeStep4Schema(state);
    case 5: return makeStep5Schema(state);
    case 6: return makeStep6Schema(state);
    case 8: return makeStep8Schema(state);
    default: return z.object({}).passthrough();
  }
}

/**
 * Loose structural check for a restored draft. Anything with the wrong primitive type means the
 * saved state was tampered with or came from an incompatible version -> start fresh.
 */
export const savedDraftSchema = z.object({
  loanType: z.string().optional(),
  loanAmount: z.number().optional(),
  loanTenure: z.number().optional(),
  loanPurpose: z.string().optional(),
  referralCode: z.string().optional(),
  fullName: z.string().optional(),
  dob: z.string().optional(),
  email: z.string().optional(),
  mobile: z.string().optional(),
  pan: z.string().optional(),
  aadhaar: z.string().optional(),
  panVerified: z.boolean().optional(),
  aadhaarVerified: z.boolean().optional(),
  aadhaarConsent: z.boolean().optional(),
}).passthrough();
