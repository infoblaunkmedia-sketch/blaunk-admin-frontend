import React from 'react';
import { useCountries } from '../hooks/useCountries';

const selectClass =
  'h-9 w-full min-w-0 max-w-full rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';

type Props = {
  value: string;
  onChange: (currencyCode: string) => void;
  disabled?: boolean;
  className?: string;
};

export const CurrencySelect: React.FC<Props> = ({ value, onChange, disabled, className }) => {
  const { countries, loading } = useCountries();

  return (
    <select
      className={className ? `${selectClass} ${className}` : selectClass}
      value={value}
      disabled={disabled || loading}
      onChange={(e) => onChange(e.target.value)}
    >
      {loading ? <option value="">Loading…</option> : null}
      {!loading && !countries.length ? <option value="">No currencies</option> : null}
      {countries.map((c) => (
        <option key={c.id} value={c.currencyCode}>
          {c.country} ({c.currencyCode} {c.icon})
        </option>
      ))}
    </select>
  );
};
