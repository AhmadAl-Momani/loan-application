/** Always rendered so screen readers register the live region before the message appears. */
export default function ErrorMessage({ id, message }) {
  return (
    <p id={id} role="alert" aria-live="polite" className={message ? 'mt-1 text-sm font-medium text-error-dark' : 'sr-only'}>
      {message || ''}
    </p>
  );
}
