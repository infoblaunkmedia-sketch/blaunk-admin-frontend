import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  isReadOnly?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  isReadOnly = false,
  className = '',
  ...props
}) => {
  const baseSelectStyles = 'w-full max-w-full rounded-sm border border-slate-300 bg-white px-3 h-11 text-base font-semibold text-slate-900 shadow-sm outline-none transition appearance-none focus:border-primary focus:ring-2 focus:ring-primary/25';
  const readOnlyStyles = 'bg-slate-50 cursor-not-allowed text-slate-500 border-slate-200';
  const errorStyles = 'border-rose-500 focus:border-rose-600 focus:ring-rose-200/50';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-bold text-slate-700 ml-0.5">{label}</label>}
      <div className="relative">
        <select
          className={[
            baseSelectStyles,
            isReadOnly ? readOnlyStyles : '',
            error ? errorStyles : '',
          ].join(' ')}
          disabled={isReadOnly}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="ml-0.5 text-xs font-semibold text-rose-600" role="alert">{error}</p>}
    </div>
  );
};
