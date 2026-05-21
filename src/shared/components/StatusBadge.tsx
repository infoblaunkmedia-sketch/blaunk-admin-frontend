import React from 'react';
import { isPayoutStatus, payoutStatusLabel } from '../constants/payoutStatus';

type StatusVariant =
  | 'Active' | 'Approved' | 'Resolved' | 'Published' | 'Open'
  | 'Pending' | 'Draft' | 'In Progress' | 'PENDING' | 'PENDING_APPROVAL'
  | 'Suspended' | 'Rejected' | 'HOLD' | 'ON_HOLD' | 'Blocked' | 'Flagged'
  | 'Inactive' | 'Expired' | 'EXIT' | 'Ended' | 'Closed'
  | 'CANCELLED' | 'REVERSE_BACK' | 'DOUBLE_ENTRY' | 'ENTRY_MISSING'
  | string;

const STATUS_STYLES: Record<string, string> = {
  // Green — success states
  Active: 'bg-emerald-100 text-emerald-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Published: 'bg-emerald-100 text-emerald-700',
  Open: 'bg-emerald-100 text-emerald-700',

  // Amber — pending / draft states
  Pending: 'bg-amber-100 text-amber-700',
  PENDING: 'bg-amber-100 text-amber-700',
  Draft: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700',

  // Red — suspended / rejected / blocked
  Suspended: 'bg-red-100 text-red-700',
  Rejected: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-red-100 text-red-700',
  ENTRY_MISSING: 'bg-red-100 text-red-700',
  HOLD: 'bg-red-100 text-red-700',
  ON_HOLD: 'bg-orange-100 text-orange-800',
  Blocked: 'bg-red-100 text-red-700',
  Flagged: 'bg-red-100 text-red-700',

  // Blue / purple — review states
  REVERSE_BACK: 'bg-violet-100 text-violet-800',
  DOUBLE_ENTRY: 'bg-indigo-100 text-indigo-800',

  // Gray — inactive / expired / exited
  Inactive: 'bg-slate-100 text-slate-600',
  Expired: 'bg-slate-100 text-slate-600',
  EXIT: 'bg-slate-100 text-slate-600',
  Ended: 'bg-slate-100 text-slate-600',
  Closed: 'bg-slate-100 text-slate-600',
  Hidden: 'bg-slate-100 text-slate-600',
};

interface StatusBadgeProps {
  status: StatusVariant;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const label = isPayoutStatus(status) ? payoutStatusLabel(status) : status;
  const style = STATUS_STYLES[status] ?? STATUS_STYLES[label] ?? 'bg-slate-100 text-slate-600';
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        style,
        className,
      ].join(' ')}
    >
      {label}
    </span>
  );
};
