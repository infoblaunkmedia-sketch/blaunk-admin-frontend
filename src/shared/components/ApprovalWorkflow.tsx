import React from 'react';
import { StatusBadge } from './StatusBadge';
import { EmptyState } from './EmptyState';

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
  onApprove: (id: string, note: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  loading?: boolean;
}

export function ApprovalWorkflow<T extends ApprovalItem>({
  items, columns, onApprove, onReject, loading = false,
}: ApprovalWorkflowProps<T>) {
  const [noteMap, setNoteMap] = React.useState<Record<string, string>>({});
  const [processing, setProcessing] = React.useState<string | null>(null);

  const setNote = (id: string, val: string) =>
    setNoteMap((p) => ({ ...p, [id]: val }));

  const handle = async (id: string, action: 'approve' | 'reject') => {
    setProcessing(id);
    try {
      if (action === 'approve') await onApprove(id, noteMap[id] ?? '');
      else await onReject(id, noteMap[id] ?? '');
    } finally {
      setProcessing(null);
      setNoteMap((p) => { const n = { ...p }; delete n[id]; return n; });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const pending = items.filter((i) => i.status === 'PENDING_APPROVAL');

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
            <th className="px-4 py-3 text-left font-bold">Status</th>
            <th className="min-w-[220px] px-4 py-3 text-left font-bold">Note / Reason</th>
            <th className="px-4 py-3 text-left font-bold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pending.map((item, i) => (
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
                <input
                  className="h-8 w-full rounded-lg border border-slate-300 px-2 text-xs outline-none focus:border-primary"
                  placeholder="Add note or rejection reason…"
                  value={noteMap[item.id] ?? ''}
                  onChange={(e) => setNote(item.id, e.target.value)}
                />
              </td>
              <td className="border-b border-slate-100 px-4 py-3">
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={processing === item.id}
                    onClick={() => handle(item.id, 'approve')}
                    className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-60"
                  >
                    {processing === item.id ? '…' : 'Approve'}
                  </button>
                  <button
                    type="button"
                    disabled={processing === item.id}
                    onClick={() => handle(item.id, 'reject')}
                    className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600 disabled:opacity-60"
                  >
                    {processing === item.id ? '…' : 'Reject'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
