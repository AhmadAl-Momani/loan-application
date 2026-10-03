import { useEffect, useRef } from 'react';

export function Toast({ message }) {
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
      {message && <p className="rounded bg-slate-900 px-4 py-2 text-sm text-white shadow">{message}</p>}
    </div>
  );
}

function Modal({ titleId, title, children }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.querySelector('button')?.focus(); }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 id={titleId} className="mb-2 text-xl font-bold text-primary">{title}</h2>
        {children}
      </div>
    </div>
  );
}

const primary = 'min-h-[44px] rounded-md bg-primary px-5 py-2 font-semibold text-white';
const secondary = 'min-h-[44px] rounded-md border border-primary px-5 py-2 font-semibold text-primary';

export function ResumeModal({
  loanTypeLabel, savedAt, onResume, onStartFresh,
}) {
  return (
    <Modal titleId="resume-title" title="Pick up where you left off?">
      <p className="mb-4 text-slate-800">
        {`You have a saved application${loanTypeLabel ? ` for a ${loanTypeLabel.toLowerCase()}` : ''}, last saved ${savedAt}.`}
      </p>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onResume} className={primary}>Resume</button>
        <button type="button" onClick={onStartFresh} className={secondary}>Start fresh</button>
      </div>
    </Modal>
  );
}

export function NoticeModal({ title, children, onClose }) {
  return (
    <Modal titleId="notice-title" title={title}>
      <div className="mb-4 text-slate-800">{children}</div>
      <button type="button" onClick={onClose} className={primary}>OK</button>
    </Modal>
  );
}

export function SuccessModal({ reference, onClose }) {
  return (
    <Modal titleId="success-title" title="Application submitted">
      <p className="mb-2 text-slate-800">Keep this reference number to track your application:</p>
      <p className="mb-4 break-all rounded bg-slate-100 p-3 font-mono text-sm">{reference}</p>
      <button type="button" onClick={onClose} className={primary}>Start a new application</button>
    </Modal>
  );
}
