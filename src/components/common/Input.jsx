import {
  createContext, forwardRef, useContext, useId,
} from 'react';
import ErrorMessage from './ErrorMessage.jsx';

const FieldContext = createContext({});

const baseField = 'block w-full min-h-[44px] rounded-md border bg-white px-3 py-2 text-base text-slate-900 placeholder:text-slate-500 disabled:bg-slate-100';
export const fieldClasses = (hasError) => `${baseField} ${hasError ? 'border-error-dark' : 'border-slate-600'}`;

function Root({
  id, error, helpText, children,
}) {
  const auto = useId();
  const fieldId = id || auto;
  const value = {
    id: fieldId, errorId: `${fieldId}-error`, helpId: `${fieldId}-help`, error, hasHelp: Boolean(helpText),
  };
  return (
    <FieldContext.Provider value={value}>
      <div className="mb-4">{children}</div>
    </FieldContext.Provider>
  );
}

function Label({ children, required }) {
  const { id } = useContext(FieldContext);
  return (
    <label htmlFor={id} className="mb-1 block text-sm font-semibold text-slate-900">
      {children}
      <span className="ml-1 font-normal text-slate-700">{required ? '(required)' : '(optional)'}</span>
    </label>
  );
}

const Field = forwardRef(function Field({ className = '', ...rest }, ref) {
  const {
    id, errorId, helpId, error, hasHelp,
  } = useContext(FieldContext);
  const describedBy = [error ? errorId : null, hasHelp ? helpId : null].filter(Boolean).join(' ') || undefined;
  return (
    <input
      ref={ref}
      id={id}
      aria-invalid={error ? 'true' : 'false'}
      aria-describedby={describedBy}
      className={`${fieldClasses(Boolean(error))} ${className}`}
      {...rest}
    />
  );
});

function FieldError({ message }) {
  const { errorId, error } = useContext(FieldContext);
  return <ErrorMessage id={errorId} message={message ?? error} />;
}

function HelpText({ children }) {
  const { helpId } = useContext(FieldContext);
  return <p id={helpId} className="mt-1 text-sm text-slate-700">{children}</p>;
}

/**
 * Compound input. Works uncontrolled with RHF's register (forwardRef) or controlled (value/onChange).
 * <Input label="Email" required error={errors.email?.message} {...register('email')} />
 * or compose: <Input.Root><Input.Label/><Input.Field/><Input.Error/></Input.Root>
 */
const Input = forwardRef(function Input({
  label, helpText, error, required = false, id, ...rest
}, ref) {
  return (
    <Root id={id} error={error} helpText={helpText}>
      <Label required={required}>{label}</Label>
      <Field ref={ref} {...rest} />
      {helpText && <HelpText>{helpText}</HelpText>}
      <FieldError />
    </Root>
  );
});

Input.Root = Root;
Input.Label = Label;
Input.Field = Field;
Input.Error = FieldError;
Input.HelpText = HelpText;

export default Input;
