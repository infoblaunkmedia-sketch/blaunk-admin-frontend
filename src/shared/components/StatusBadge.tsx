import React from 'react';

type StatusVariant =
  | 'Active' | 'Approved' | 'Resolved' | 'Published' | 'Open'
  | 'Pending' | 'Draft' | 'In Progress' | 'PENDING_APPROVAL'
  | 'Suspended' | 'Rejected' | 'HOLD' | 'Blocked' | 'Flagged'
  | 'Inactive' | 'Expired' | 'EXIT' | 'Ended' | 'Closed'
  | string;

const STATUS_STYLES: Record<string, string> = {
  // Green — success states
  Active: 'bg-emerald-100 text-emerald-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Published: 'bg-emerald-100 text-emerald-700',
  Open: 'bg-emerald-100 text-emerald-700',

  // Amber — pending / draft states
  Pending: 'bg-amber-100 text-amber-700',
  Draft: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700',

  // Red — suspended / rejected / blocked
  Suspended: 'bg-red-100 text-red-700',
  Rejected: 'bg-red-100 text-red-700',
  HOLD: 'bg-red-100 text-red-700',
  Blocked: 'bg-red-100 text-red-700',
  Flagged: 'bg-red-100 text-red-700',

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
  const style = STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600';
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        style,
        className,
      ].join(' ')}
    >
      {status}
    </span>
  );
};
