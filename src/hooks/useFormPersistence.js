import { useCallback, useEffect, useState } from 'react';
import {
  DRAFT_KEY_PREFIX, DRAFT_SCHEMA_VERSION, DRAFT_TTL_HOURS,
} from '../utils/constants.js';
import { decryptString } from '../utils/encryption.js';
import { savedDraftSchema } from '../schemas/schemaFactory.js';
import { metaKeyFor } from './useAutoSave.js';

const TTL_MS = DRAFT_TTL_HOURS * 60 * 60 * 1000;

function removeDraft(key) {
  localStorage.removeItem(key);
  localStorage.removeItem(metaKeyFor(key));
}

/** Newest non-expired draft, purging expired or unreadable ones. */
function findDraft() {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(DRAFT_KEY_PREFIX) && !k.endsWith(':meta'));
  let best = null;
  keys.forEach((key) => {
    try {
      const meta = JSON.parse(localStorage.getItem(metaKeyFor(key)));
      const age = Date.now() - new Date(meta.timestamp).getTime();
      if (!(age >= 0 && age < TTL_MS) || meta.version !== DRAFT_SCHEMA_VERSION) throw new Error('stale');
      if (!best || meta.timestamp > best.meta.timestamp) best = { key, meta };
    } catch {
      removeDraft(key);
    }
  });
  return best;
}

/**
 * Resume / start-fresh flow. `pendingDraft` is non-null while the modal should be shown.
 * `resume()` resolves to { values, step } or null if the draft is corrupted (it is then deleted).
 */
export default function useFormPersistence(totalSteps = 8) {
  const [pendingDraft, setPendingDraft] = useState(null);

  useEffect(() => { setPendingDraft(findDraft()); }, []);

  const resume = useCallback(async () => {
    if (!pendingDraft) return null;
    const { key, meta } = pendingDraft;
    try {
      const values = JSON.parse(await decryptString(localStorage.getItem(key))); // throws if tampered
      const parsed = savedDraftSchema.safeParse(values);
      const stepOk = Number.isInteger(meta.step) && meta.step >= 1 && meta.step <= totalSteps;
      if (!parsed.success || !stepOk) throw new Error('invalid');
      setPendingDraft(null);
      return { values, step: meta.step };
    } catch {
      removeDraft(key);
      setPendingDraft(null);
      return null;
    }
  }, [pendingDraft, totalSteps]);

  const startFresh = useCallback(() => {
    if (pendingDraft) removeDraft(pendingDraft.key);
    setPendingDraft(null);
  }, [pendingDraft]);

  const clearAllDrafts = useCallback(() => {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(DRAFT_KEY_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  }, []);

  return {
    pendingDraft, resume, startFresh, clearAllDrafts,
  };
}
