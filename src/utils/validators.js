import {
  PAN_ENTITY_TYPES, LOAN_TYPE_BUSINESS, MAX_AGE_AT_MATURITY,
} from './constants.js';

// ---------- Verhoeff (Aadhaar) ----------
const D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];
const P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];
const INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

/** True when the checksum over all digits is 0. */
export function verhoeffValidate(digits) {
  let c = 0;
  const reversed = String(digits).split('').reverse().map(Number);
  for (let i = 0; i < reversed.length; i += 1) c = D[c][P[i % 8][reversed[i]]];
  return c === 0;
}

/** Check digit to append to a digit string (used for fixtures/tests). */
export function verhoeffGenerate(digits) {
  let c = 0;
  const reversed = String(digits).split('').reverse().map(Number);
  for (let i = 0; i < reversed.length; i += 1) c = D[c][P[(i + 1) % 8][reversed[i]]];
  return INV[c];
}

// ---------- Result helper ----------
const ok = () => ({ valid: true, message: null });
const fail = (message) => ({ valid: false, message });

// ---------- PAN ----------
export function allowedPanEntityTypes(loanType) {
  return loanType === LOAN_TYPE_BUSINESS ? ['P', 'C', 'F'] : ['P'];
}

export function validatePAN(value, loanType) {
  const pan = String(value ?? '').trim().toUpperCase();
  if (!pan) return fail('Enter your PAN');
  if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(pan)) {
    return fail('PAN must be 10 characters in format AAAAA9999A (5 letters, 4 digits, 1 letter)');
  }
  if (!PAN_ENTITY_TYPES[pan[3]]) {
    return fail('PAN 4th character must indicate entity type (P for Individual, C for Company, etc.)');
  }
  const allowed = allowedPanEntityTypes(loanType);
  if (!allowed.includes(pan[3])) {
    return fail(
      loanType === LOAN_TYPE_BUSINESS
        ? 'Business loans accept PANs with 4th character P, C or F'
        : 'This loan type accepts only an individual PAN (4th character P)',
    );
  }
  return ok();
}

// ---------- Aadhaar ----------
// Per the brief: 12 digits + Verhoeff. (Real UIDAI numbers also never start with 0 or 1;
// add /^[2-9]/ here if you want to enforce that.)
export function validateAadhaar(value) {
  const s = String(value ?? '').replace(/\s/g, '');
  if (!s) return fail('Enter your Aadhaar number');
  if (!/^\d{12}$/.test(s)) return fail('Aadhaar must be exactly 12 digits');
  if (!verhoeffValidate(s)) return fail('This Aadhaar number fails the checksum. Check for a typo in the digits');
  return ok();
}

// ---------- Voter ID / Passport ----------
export const validateVoterId = (v) => (/^[A-Z]{3}\d{7}$/.test(String(v ?? '').toUpperCase())
  ? ok() : fail('Voter ID must be 3 letters followed by 7 digits'));
export const validatePassport = (v) => (/^[A-Z]\d{7}$/.test(String(v ?? '').toUpperCase())
  ? ok() : fail('Passport number must be 1 letter followed by 7 digits'));

// ---------- GSTIN ----------
const GST_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function gstChecksumChar(first14) {
  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const product = GST_CHARS.indexOf(first14[i]) * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return GST_CHARS[(36 - (sum % 36)) % 36];
}

export function validateGST(value) {
  const g = String(value ?? '').trim().toUpperCase();
  if (!g) return fail('Enter your GST number');
  if (!/^(0[1-9]|[12]\d|3[0-8])[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(g)) {
    return fail('GST number must be 15 characters: 2-digit state code, 10-character PAN, entity number, "Z", checksum');
  }
  if (gstChecksumChar(g.slice(0, 14)) !== g[14]) return fail('GST number checksum is incorrect. Check for a typo');
  return ok();
}

// ---------- Dates / age ----------
/** Parse "YYYY-MM-DD" without timezone surprises. Returns null for impossible dates. */
export function parseISODate(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str ?? ''));
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  return { y, mo, d };
}

/** Completed years on `today`. Turning 21 today counts as 21. */
export function calculateAge(dob, today = new Date()) {
  const p = parseISODate(dob);
  if (!p) return null;
  let age = today.getFullYear() - p.y;
  const beforeBirthday = today.getMonth() + 1 < p.mo
    || (today.getMonth() + 1 === p.mo && today.getDate() < p.d);
  if (beforeBirthday) age -= 1;
  return age;
}

/** Max tenure in months so that age + tenure <= 65 years. */
export function maxTenureForAge(age) {
  if (age === null || age === undefined) return Infinity;
  return Math.max(0, (MAX_AGE_AT_MATURITY - age) * 12);
}
