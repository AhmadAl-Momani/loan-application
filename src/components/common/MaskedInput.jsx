import { forwardRef, useState } from 'react';
import Input from './Input.jsx';
import { maskValue } from '../../utils/formatters.js';

/**
 * Shows only the last 4 characters while the field isn't focused. `transform` cleans typed input
 * (e.g. digits only, uppercase). `status` renders a text badge: 'verifying' | 'verified'.
 */
const MaskedInput = forwardRef(function MaskedInput({
  value = '', onChange, onBlur, transform = (v) => v, status, ...rest
}, ref) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <Input
        ref={ref}
        autoComplete="off"
        spellCheck={false}
        value={focused ? value : maskValue(value, 4)}
        onFocus={() => setFocused(true)}
        onChange={(e) => onChange?.(transform(e.target.value))}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        {...rest}
      />
      <div aria-live="polite" className="-mt-2 mb-3 min-h-[1.25rem] text-sm font-semibold">
        {status === 'verifying' && <span className="text-slate-700">Verifying…</span>}
        {status === 'verified' && <span className="text-accent-dark">✓ Verified</span>}
      </div>
    </div>
  );
});

export default MaskedInput;
