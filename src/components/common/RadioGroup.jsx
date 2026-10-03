import { forwardRef, useId } from 'react';
import ErrorMessage from './ErrorMessage.jsx';

/** The same `ref` goes on every radio, which is what RHF's register expects. */
const RadioGroup = forwardRef(function RadioGroup({
  legend, name, options, error, required = false, layout = 'vertical', ...rest
}, ref) {
  const groupId = useId();
  const errorId = `${groupId}-error`;
  return (
    <fieldset className="mb-4" aria-describedby={error ? errorId : undefined}>
      <legend className="mb-1 text-sm font-semibold text-slate-900">
        {legend}
        <span className="ml-1 font-normal text-slate-700">{required ? '(required)' : '(optional)'}</span>
      </legend>
      <div className={layout === 'horizontal' ? 'flex flex-wrap gap-3' : 'flex flex-col gap-2'}>
        {options.map((o) => {
          const inputId = `${groupId}-${o.value}`;
          return (
            <label key={o.value} htmlFor={inputId} className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md border border-slate-600 bg-white px-3 py-2 text-base">
              <input
                ref={ref}
                id={inputId}
                type="radio"
                name={name}
                value={o.value}
                aria-invalid={error ? 'true' : 'false'}
                className="h-5 w-5 accent-primary"
                {...rest}
              />
              <span>
                <span className="font-medium">{o.label}</span>
                {o.description && <span className="block text-sm text-slate-700">{o.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
      <ErrorMessage id={errorId} message={error} />
    </fieldset>
  );
});

export default RadioGroup;
