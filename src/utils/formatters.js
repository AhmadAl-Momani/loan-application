const inNumber = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** 1050000 -> "10,50,000" */
export function formatIndianNumber(value) {
  if (value === undefined || value === null || value === '' || Number.isNaN(Number(value))) return '';
  return inNumber.format(Number(value));
}

/** 1050000 -> "₹10,50,000" */
export function formatINR(value) {
  const n = formatIndianNumber(value);
  return n === '' ? '' : `₹${n}`;
}

/** "₹10,50,000" -> 1050000 (undefined when empty) */
export function parseIndianNumber(text) {
  const digits = String(text ?? '').replace(/[^\d]/g, '');
  return digits === '' ? undefined : Number(digits);
}

/** Show only the last `visible` characters. */
export function maskValue(value, visible = 4) {
  const s = String(value ?? '');
  if (s.length <= visible) return s;
  return '•'.repeat(s.length - visible) + s.slice(-visible);
}
