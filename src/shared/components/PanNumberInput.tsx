import React from 'react';
import { sanitizePan } from '../../utils/inputFormats';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm uppercase outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

type PanNumberInputProps = {
  value: string;
  onChange: (value: string) => void;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  name?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

/** Indian PAN: uppercase, position-aware typing (ABCDE1234F). */
export const PanNumberInput: React.FC<PanNumberInputProps> = ({
  value,
  onChange,
  onBlur,
  name,
  inputRef,
  className = inputClass,
  placeholder = 'ABCDE1234F',
  disabled,
}) => (
  <input
    type="text"
    className={className}
    placeholder={placeholder}
    disabled={disabled}
    maxLength={10}
    autoComplete="off"
    spellCheck={false}
    value={value}
    name={name}
    ref={inputRef}
    onBlur={onBlur}
    onChange={(e) => onChange(sanitizePan(e.target.value))}
  />
);
