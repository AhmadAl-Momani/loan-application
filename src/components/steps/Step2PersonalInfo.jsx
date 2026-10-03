import { useFormContext } from 'react-hook-form';
import Input from '../common/Input.jsx';
import Select from '../common/Select.jsx';
import RadioGroup from '../common/RadioGroup.jsx';
import { MARITAL_STATUSES, GENDERS } from '../../schemas/step2Schema.js';
import { MIN_APPLICANT_AGE } from '../../utils/constants.js';

const title = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function latestAllowedDob() {
  const d = new Date();
  d.setFullYear(d.getFullYear() - MIN_APPLICANT_AGE);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Step2PersonalInfo() {
  const { register, formState: { errors } } = useFormContext();
  return (
    <section>
      <Input label="Full name (as per PAN)" required autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
      <Input
        label="Date of birth"
        type="date"
        required
        autoComplete="bday"
        max={latestAllowedDob()}
        helpText="You must be 21–65 years old. Your age also limits the longest loan tenure"
        error={errors.dob?.message}
        {...register('dob')}
      />
      <RadioGroup
        legend="Gender"
        required
        layout="horizontal"
        options={GENDERS.map((g) => ({ value: g, label: title(g) }))}
        error={errors.gender?.message}
        {...register('gender')}
      />
      <Select
        label="Marital status"
        required
        options={MARITAL_STATUSES.map((m) => ({ value: m, label: title(m) }))}
        error={errors.maritalStatus?.message}
        {...register('maritalStatus')}
      />
      <Input label="Father’s name" required autoComplete="off" error={errors.fatherName?.message} {...register('fatherName')} />
      <Input label="Mother’s name" required autoComplete="off" error={errors.motherName?.message} {...register('motherName')} />
      <Input label="Email" type="email" required autoComplete="email" error={errors.email?.message} {...register('email')} />
      <Input label="Mobile number" type="tel" inputMode="numeric" maxLength={10} required autoComplete="tel-national" error={errors.mobile?.message} {...register('mobile')} />
      <Input label="Alternate mobile number" type="tel" inputMode="numeric" maxLength={10} autoComplete="off" error={errors.alternateMobile?.message} {...register('alternateMobile')} />
    </section>
  );
}
