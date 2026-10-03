import { forwardRef } from 'react';
import Input from './Input.jsx';
import { formatIndianNumber, parseIndianNumber } from '../../utils/formatters.js';

/**
 * Controlled. `value` is a number (or undefined), shown as 10,50,000.
 * With RHF use <Controller> and pass field.value / field.onChange / field.onBlur / field.ref.
 */
const CurrencyInput = forwardRef(function CurrencyInput({
  value, onChange, ...rest
}, ref) {
  return (
    <Input
      ref={ref}
      inputMode="numeric"
      autoComplete="off"
      value={value === undefined ? '' : `₹${formatIndianNumber(value)}`}
      onChange={(e) => onChange?.(parseIndianNumber(e.target.value))}
      {...rest}
    />
  );
});

export default CurrencyInput;
