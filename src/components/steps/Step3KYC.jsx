import { Controller, useFormContext, useWatch } from 'react-hook-form';
import Input from '../common/Input.jsx';
import MaskedInput from '../common/MaskedInput.jsx';
import Checkbox from '../common/Checkbox.jsx';
import useVerification from '../../hooks/useVerification.js';
import { isPassportVisible } from '../../schemas/step3Schema.js';

const upper10 = (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
const digits12 = (v) => v.replace(/\D/g, '').slice(0, 12);

function VerifiedField({
  name, verifiedName, type, label, helpText, transform, maxLength, loanType,
}) {
  const {
    control, setValue, getValues, formState: { errors },
  } = useFormContext();
  const value = useWatch({ control, name }) ?? '';
  const v = useVerification(value, type, {
    loanType,
    initialVerified: Boolean(getValues(verifiedName)),
    onResult: (ok) => setValue(verifiedName, ok, { shouldDirty: true }),
  });
  const status = (v.isVerifying && 'verifying') || (v.isVerified && 'verified') || undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <MaskedInput
          label={label}
          required
          helpText={helpText}
          maxLength={maxLength}
          transform={transform}
          status={status}
          error={errors[name]?.message || v.error}
          value={field.value ?? ''}
          onChange={field.onChange}
          onBlur={() => { field.onBlur(); v.verify(); }}
          ref={field.ref}
        />
      )}
    />
  );
}

export default function Step3KYC() {
  const {
    register, control, formState: { errors },
  } = useFormContext();
  const [loanType, loanAmount] = useWatch({ control, name: ['loanType', 'loanAmount'] });

  return (
    <section>
      <VerifiedField
        name="pan"
        verifiedName="panVerified"
        type="PAN"
        label="PAN"
        helpText="Format AAAAA9999A"
        transform={upper10}
        maxLength={10}
        loanType={loanType}
      />
      <VerifiedField
        name="aadhaar"
        verifiedName="aadhaarVerified"
        type="Aadhaar"
        label="Aadhaar number"
        helpText="12 digits. Only the last 4 show once you leave the field"
        transform={digits12}
        maxLength={12}
      />
      <Checkbox
        label="I consent to LendSwift using my Aadhaar number to verify my identity, only for this loan application."
        error={errors.aadhaarConsent?.message}
        {...register('aadhaarConsent')}
      />
      <Input label="Voter ID" helpText="3 letters followed by 7 digits" autoComplete="off" error={errors.voterId?.message} {...register('voterId', { setValueAs: (v) => v.toUpperCase() })} />
      {isPassportVisible({ loanType, loanAmount }) && (
        <Input label="Passport number" helpText="1 letter followed by 7 digits" autoComplete="off" error={errors.passport?.message} {...register('passport', { setValueAs: (v) => v.toUpperCase() })} />
      )}
    </section>
  );
}
