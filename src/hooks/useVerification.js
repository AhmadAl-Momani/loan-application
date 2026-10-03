import {
  useCallback, useEffect, useRef, useState,
} from 'react';
import { validatePAN, validateAadhaar } from '../utils/validators.js';
import { VERIFICATION_DELAY_MS } from '../utils/constants.js';

const IDLE = { isVerifying: false, isVerified: false, error: null };

/**
 * Simulated NSDL/UIDAI verification. Call `verify()` on blur: invalid formats fail immediately,
 * valid ones show a spinner for 1.5s and then succeed. Editing the value resets verification.
 *
 * @param {string} value
 * @param {'PAN'|'Aadhaar'} type
 * @param {{loanType?: string, initialVerified?: boolean, onResult?: (ok: boolean) => void}} options
 */
export default function useVerification(value, type, options = {}) {
  const { loanType, initialVerified = false, onResult } = options;
  const [state, setState] = useState({ ...IDLE, isVerified: initialVerified });
  const timer = useRef(null);
  const previous = useRef(value);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    clearTimeout(timer.current);
    setState(IDLE);
    onResultRef.current?.(false);
  }, [value]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const verify = useCallback(() => {
    if (state.isVerified || state.isVerifying || !value) return;
    const result = type === 'PAN' ? validatePAN(value, loanType) : validateAadhaar(value);
    if (!result.valid) {
      setState({ ...IDLE, error: result.message });
      onResultRef.current?.(false);
      return;
    }
    setState({ ...IDLE, isVerifying: true });
    timer.current = setTimeout(() => {
      setState({ isVerifying: false, isVerified: true, error: null });
      onResultRef.current?.(true);
    }, VERIFICATION_DELAY_MS);
  }, [state.isVerified, state.isVerifying, value, type, loanType]);

  return { ...state, verify };
}
