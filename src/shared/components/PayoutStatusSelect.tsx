import React from 'react';
import {
  PAYOUT_APPROVAL_OPTIONS,
  normalizePayoutStatus,
  type PayoutStatus,
} from '../constants/payoutStatus';
import { PAYOUT_SELECT_CLASS } from './payoutSelectStyles';

interface PayoutStatusSelectProps {
  value: string;
  disabled?: boolean;
  onChange: (status: PayoutStatus) => void;
  className?: string;
}

export const PayoutStatusSelect: React.FC<PayoutStatusSelectProps> = ({
  value,
  disabled,
  onChange,
  className = '',
}) => (
  <select
    className={`${PAYOUT_SELECT_CLASS} ${className}`.trim()}
    value={normalizePayoutStatus(value)}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value as PayoutStatus)}
  >
    {PAYOUT_APPROVAL_OPTIONS.map((opt) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);
