import React from 'react';
import { useCountries } from '../hooks/useCountries';

const selectClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';

type Props = {
  value: string;
  onChange: (countryName: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
};

export const CountryNameSelect: React.FC<Props> = ({
  value,
  onChange,
  disabled,
  className,
  placeholder = 'Select country',
}) => {
  const { countryNames, loading } = useCountries();

  return (
    <select
      className={className ? `${selectClass} ${className}` : selectClass}
      value={value}
      disabled={disabled || loading}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{loading ? 'Loading…' : placeholder}</option>
      {countryNames.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
};
