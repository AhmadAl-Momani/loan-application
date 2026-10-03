import { forwardRef, useId } from 'react';
import ErrorMessage from './ErrorMessage.jsx';

const Checkbox = forwardRef(function Checkbox({
  label, error, id, ...rest
}, ref) {
  const auto = useId();
  const fieldId = id || auto;
  const errorId = `${fieldId}-error`;
  return (
    <div className="mb-3">
      <label htmlFor={fieldId} className="flex min-h-[44px] cursor-pointer items-start gap-3 py-2 text-base text-slate-900">
        <input
          ref={ref}
          id={fieldId}
          type="checkbox"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : undefined}
          className="mt-1 h-5 w-5 shrink-0 accent-primary"
          {...rest}
        />
        <span>{label}</span>
      </label>
      <ErrorMessage id={errorId} message={error} />
    </div>
  );
});

export default Checkbox;
