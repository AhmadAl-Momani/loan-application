import { Controller, useFormContext, useWatch } from 'react-hook-form';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import RadioGroup from '../common/RadioGroup.jsx';
import CurrencyInput from '../common/CurrencyInput.jsx';
import { LOAN_CONFIG, LOAN_TYPES } from '../../utils/constants.js';
import { formatINR } from '../../utils/formatters.js';
import { calculateAge, maxTenureForAge } from '../../utils/validators.js';

const toNumber = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

function tenureOptions(cfg, dob) {
  const cap = maxTenureForAge(dob ? calculateAge(dob) : null);
  const out = [];
  for (let t = cfg.minTenure; t <= cfg.maxTenure; t += cfg.tenureStep) {
    if (t <= cap) out.push({ value: t, label: `${t} months (${t % 12 === 0 ? `${t / 12} yr` : `${(t / 12).toFixed(1)} yr`})` });
  }
  return out;
}

export default function Step1LoanType() {
  const {
    register, control, setValue, formState: { errors },
  } = useFormContext();
  const [loanType, dob] = useWatch({ control, name: ['loanType', 'dob'] });
  const cfg = LOAN_CONFIG[loanType];

  const loanTypeField = register('loanType');
  const onLoanTypeChange = (e) => {
    loanTypeField.onChange(e);
    // Options differ per type, so clear dependent fields instead of leaving stale values
    setValue('loanTenure', undefined);
    setValue('loanPurpose', '');
  };

  return (
    <section aria-labelledby="step-heading">
      <RadioGroup
        legend="Loan type"
        required
        error={errors.loanType?.message}
        options={LOAN_TYPES.map((t) => ({
          value: t,
          label: LOAN_CONFIG[t].label,
          description: `Up to ${formatINR(LOAN_CONFIG[t].maxAmount)} · ${LOAN_CONFIG[t].annualRate}% p.a. indicative`,
        }))}
        {...loanTypeField}
        onChange={onLoanTypeChange}
      />

      <Controller
        name="loanAmount"
        control={control}
        render={({ field }) => (
          <CurrencyInput
            label="Loan amount"
            required
            helpText={cfg ? `Between ${formatINR(50000)} and ${formatINR(cfg.maxAmount)}` : 'Select a loan type first to see the limit'}
            error={errors.loanAmount?.message}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            ref={field.ref}
          />
        )}
      />

      <Select
        label="Loan tenure"
        required
        placeholder={cfg ? 'Select tenure' : 'Select a loan type first'}
        disabled={!cfg}
        options={cfg ? tenureOptions(cfg, dob) : []}
        error={errors.loanTenure?.message}
        {...register('loanTenure', { setValueAs: toNumber })}
      />

      <Select
        label="Loan purpose"
        required
        placeholder={cfg ? 'Select purpose' : 'Select a loan type first'}
        disabled={!cfg}
        options={(cfg?.purposes ?? []).map((p) => ({ value: p, label: p }))}
        error={errors.loanPurpose?.message}
        {...register('loanPurpose')}
      />

      <Input
        label="Referral code"
        helpText="6–10 letters or digits"
        autoComplete="off"
        error={errors.referralCode?.message}
        {...register('referralCode')}
      />
    </section>
  );
}
