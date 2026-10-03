import { useEffect, useRef, useState } from 'react';
import {
  AUTOSAVE_INTERVAL_MS, DRAFT_KEY_PREFIX, DRAFT_SCHEMA_VERSION,
} from '../utils/constants.js';
import { encryptString } from '../utils/encryption.js';

const hasContent = (state) => Object.values(state || {}).some((v) => v !== '' && v !== undefined && v !== null && v !== false);

export const draftKeyFor = (loanType) => `${DRAFT_KEY_PREFIX}${loanType || 'unselected'}`;
export const metaKeyFor = (key) => `${key}:meta`;

/**
 * Debounced, encrypted draft saving (spec C3.4). The timer resets on every state change and
 * fires `interval` ms after the user stops editing. Encryption is async so the UI never blocks.
 *
 * @param {object} formState  current form values
 * @param {number} interval   ms
 * @param {{enabled?: boolean, step?: number, onSaved?: (date: Date) => void}} options
 */
export default function useAutoSave(formState, interval = AUTOSAVE_INTERVAL_MS, options = {}) {
  const { enabled = true, step = 1, onSaved } = options;
  const timer = useRef(null);
  const latest = useRef({ formState, step, onSaved });
  const [lastSaved, setLastSaved] = useState(null);

  latest.current = { formState, step, onSaved };

  useEffect(() => {
    if (!enabled) return undefined;
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const { formState: state, step: currentStep, onSaved: notify } = latest.current;
      if (!hasContent(state)) return;
      try {
        const key = draftKeyFor(state.loanType);
        const encrypted = await encryptString(JSON.stringify(state)); // File objects don't serialise; uploads are not persisted
        // Keep a single draft: remove drafts saved under other loan types
        Object.keys(localStorage)
          .filter((k) => k.startsWith(DRAFT_KEY_PREFIX) && !k.startsWith(key))
          .forEach((k) => localStorage.removeItem(k));
        localStorage.setItem(key, encrypted);
        localStorage.setItem(metaKeyFor(key), JSON.stringify({
          version: DRAFT_SCHEMA_VERSION,
          timestamp: new Date().toISOString(),
          step: currentStep,
          loanType: state.loanType || null,
        }));
        const now = new Date();
        setLastSaved(now);
        notify?.(now);
      } catch (err) {
        console.error('Auto-save failed', err.name); // never log form contents (PII)
      }
    }, interval);
    return () => clearTimeout(timer.current);
  }, [formState, step, interval, enabled]);

  return { lastSaved };
}
