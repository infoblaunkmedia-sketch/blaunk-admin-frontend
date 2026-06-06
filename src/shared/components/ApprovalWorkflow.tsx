import React from 'react';
import { toast } from 'react-toastify';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';
import {
  PAYOUT_APPROVAL_OPTIONS,
  isPendingPayoutStatus,
  isNegativePayoutStatus,
  normalizePayoutStatus,
  payoutStatusLabel,
  type PayoutStatus,
} from '../constants/payoutStatus';
import { PAYOUT_SELECT_CLASS } from './payoutSelectStyles';
import { PayoutRemarkSelect } from './PayoutRemarkSelect';

export interface ApprovalItem {
  id: string;
  status: string;
}

interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
}

interface ApprovalWorkflowProps<T extends ApprovalItem> {
  items: T[];
  columns: Column<T>[];
  onStatusChange: (id: string, status: PayoutStatus, note: string) => Promise<void>;
  loading?: boolean;
}

const selectClass = PAYOUT_SELECT_CLASS;

export function ApprovalWorkflow<T extends ApprovalItem>({
  items, columns, onStatusChange, loading = false,
}: ApprovalWorkflowProps<T>) {
  const [noteMap, setNoteMap] = React.useState<Record<string, string>>({});
  const [statusMap, setStatusMap] = React.useState<Record<string, PayoutStatus>>({});
  const [processing, setProcessing] = React.useState<string | null>(null);

  const setNote = (id: string, val: string) =>
    setNoteMap((p) => ({ ...p, [id]: val }));

  const handleApply = async (item: T) => {
    const nextStatus = statusMap[item.id] ?? normalizePayoutStatus(item.status);
    const note = noteMap[item.id] ?? '';
    if (isNegativePayoutStatus(nextStatus) && !note.trim()) {
      toast.error('Select a remark before rejecting.');
      return;
    }
    setProcessing(item.id);
    try {
      await onStatusChange(item.id, nextStatus, note.trim());
      toast.success(`Status updated to ${payoutStatusLabel(nextStatus)}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const pending = items.filter((i) => isPendingPayoutStatus(i.status));

  if (pending.length === 0) {
    return <EmptyState message="No pending approvals." />;
  }

  return (
    <div className="overflow-x-auto rounded-card border border-slate-200 bg-white shadow-card">
      <table className="w-full min-w-max border-collapse text-sm">
        <thead>
          <tr className="bg-primary text-white">
            {columns.map((c) => (
              <th key={c.header} className="px-4 py-3 text-left font-bold">{c.header}</th>
            ))}
            <th className="px-4 py-3 text-left font-bold">Current Status</th>
            <th className="min-w-[220px] px-4 py-3 text-left font-bold">Remark</th>
            <th className="px-4 py-3 text-left font-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pending.map((item, i) => {
            const current = normalizePayoutStatus(item.status);
            const selected = statusMap[item.id] ?? current;
            return (
              <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-surface'}>
                {columns.map((c) => (
                  <td key={c.header} className="border-b border-slate-100 px-4 py-3">
                    {c.render(item)}
                  </td>
                ))}
                <td className="border-b border-slate-100 px-4 py-3">
                  <StatusBadge status={item.status} />
                </td>
                <td className="border-b border-slate-100 px-4 py-3">
                  {selected === 'REJECTED' ? (
                    <PayoutRemarkSelect
                      value={noteMap[item.id] ?? ''}
                      onChange={(remark) => setNote(item.id, remark)}
                    />
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="border-b border-slate-100 px-4 py-3">
                  <div className="flex min-w-[14rem] flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      className={selectClass}
                      value={selected}
                      disabled={processing === item.id}
                      onChange={(e) =>
                        setStatusMap((p) => ({ ...p, [item.id]: e.target.value as PayoutStatus }))
                      }
                    >
                      {PAYOUT_APPROVAL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={processing === item.id}
                      onClick={() => handleApply(item)}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-60"
                    >
                      {processing === item.id ? '…' : 'Apply'}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
