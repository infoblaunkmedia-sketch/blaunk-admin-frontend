import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isReadOnly?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isReadOnly = false,
  className = '',
  ...props
}) => {
  const baseInputStyles = 'w-full rounded-sm border border-slate-300 bg-white px-3 h-11 text-base font-semibold text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/25';
  const readOnlyStyles = 'bg-slate-50 cursor-not-allowed text-slate-500 border-slate-200';
  const errorStyles = 'border-rose-500 focus:border-rose-600 focus:ring-rose-200/50';

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-bold text-slate-700 ml-0.5">{label}</label>}
      <input
        className={[
          baseInputStyles,
          isReadOnly ? readOnlyStyles : '',
          error ? errorStyles : '',
        ].join(' ')}
        readOnly={isReadOnly}
        {...props}
      />
      {error && <p className="ml-0.5 text-xs font-semibold text-rose-600" role="alert">{error}</p>}
    </div>
  );
};
