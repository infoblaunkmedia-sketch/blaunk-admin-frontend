import React from 'react';
import { formatBankName } from '../../utils/inputFormats';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

type BankNameInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

/** Controlled bank name field — formats on every keystroke (State Bank of India). */
export const BankNameInput: React.FC<BankNameInputProps> = ({
  value,
  onChange,
  className = inputClass,
  placeholder,
  disabled,
}) => (
  <input
    type="text"
    className={className}
    placeholder={placeholder}
    disabled={disabled}
    value={value}
    onChange={(e) => onChange(formatBankName(e.target.value))}
  />
);
