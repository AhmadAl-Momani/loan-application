import { z } from 'zod';

const consent = (message) => z.literal(true, { errorMap: () => ({ message }) });

export const makeStep8Schema = () => z.object({
  consentAccurate: consent('Confirm that the information you provided is accurate'),
  consentCreditCheck: consent('Authorise the credit score check to continue'),
  consentTerms: consent('Accept the Terms and Conditions to continue'),
  consentComms: consent('Consent to communications about this application to continue'),
});
