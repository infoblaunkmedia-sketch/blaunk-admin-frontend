import React from 'react';
import {
  PAYOUT_STATUS_OPTIONS,
  normalizePayoutStatus,
  type PayoutStatus,
} from '../constants/payoutStatus';

const selectClass =
  'h-8 w-full min-w-[10rem] rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold outline-none focus:border-primary disabled:opacity-60';

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
    className={`${selectClass} ${className}`.trim()}
    value={normalizePayoutStatus(value)}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value as PayoutStatus)}
  >
    {PAYOUT_STATUS_OPTIONS.map((opt) => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);
