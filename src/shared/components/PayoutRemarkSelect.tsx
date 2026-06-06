import React from 'react';
import { PAYOUT_REMARK_OPTIONS, type PayoutRemark } from '../constants/payoutStatus';
import { PAYOUT_SELECT_CLASS } from './payoutSelectStyles';

interface PayoutRemarkSelectProps {
  value?: string;
  disabled?: boolean;
  placeholder?: string;
  onChange: (remark: PayoutRemark) => void;
  className?: string;
}

export const PayoutRemarkSelect: React.FC<PayoutRemarkSelectProps> = ({
  value = '',
  disabled,
  placeholder = 'Select remark…',
  onChange,
  className = '',
}) => (
  <select
    className={`${PAYOUT_SELECT_CLASS} ${className}`.trim()}
    value={value}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value as PayoutRemark)}
  >
    <option value="" disabled>
      {placeholder}
    </option>
    {PAYOUT_REMARK_OPTIONS.map((opt) => (
      <option key={opt} value={opt}>
        {opt}
      </option>
    ))}
  </select>
);
