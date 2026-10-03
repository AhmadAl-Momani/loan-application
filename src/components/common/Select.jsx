import { forwardRef, useId } from 'react';
import ErrorMessage from './ErrorMessage.jsx';
import { fieldClasses } from './Input.jsx';

const Select = forwardRef(function Select({
  label, options, placeholder = 'Select an option', error, required = false, id, ...rest
}, ref) {
  const auto = useId();
  const fieldId = id || auto;
  const errorId = `${fieldId}-error`;
  return (
    <div className="mb-4">
      <label htmlFor={fieldId} className="mb-1 block text-sm font-semibold text-slate-900">
        {label}
        <span className="ml-1 font-normal text-slate-700">{required ? '(required)' : '(optional)'}</span>
      </label>
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={fieldClasses(Boolean(error))}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ErrorMessage id={errorId} message={error} />
    </div>
  );
});

export default Select;
