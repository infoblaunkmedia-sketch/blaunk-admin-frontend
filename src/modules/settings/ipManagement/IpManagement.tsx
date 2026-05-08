import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { IpEntry } from '../settings.types';
import {
  createIpWhitelistEntry,
  deleteIpEntry,
  fetchIpEntries,
  patchIpWhitelistEntry,
} from '../settings.service';
import { useAuthStore } from '../../../auth/authStore';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const emptyForm = (): Omit<IpEntry, 'id' | 'addedAt' | 'addedBy'> => ({
  ip: '',
  label: '',
  status: 'Active',
});

function parseErrMessage(raw: string): string {
  try {
    const j = JSON.parse(raw) as { message?: string };
    return j?.message || raw || 'Request failed';
  } catch {
    return raw || 'Request failed';
  }
}

export const IpManagement: React.FC = () => {
  const [entries, setEntries] = React.useState<IpEntry[]>([]);
  const [form, setForm] = React.useState(emptyForm());
  const [showForm, setShowForm] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);
  const currentUser = useAuthStore((s) => s.user);

  const reload = React.useCallback(async () => {
    const rows = await fetchIpEntries();
    setEntries(rows);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const rows = await fetchIpEntries();
        if (!cancelled) setEntries(rows);
      } catch (e) {
        if (!cancelled) {
          setEntries([]);
          toast.error(e instanceof Error ? e.message : 'Failed to load IP list');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = async () => {
    if (!form.ip.trim()) {
      toast.error('IP address is required');
      return;
    }
    setSaving(true);
    try {
      await createIpWhitelistEntry({
        ip: form.ip.trim(),
        label: form.label.trim(),
        status: form.status,
        addedBy: currentUser?.code || currentUser?.username || '',
      });
      await reload();
      setForm(emptyForm());
      setShowForm(false);
      toast.success('IP address saved');
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Failed to save IP';
      toast.error(parseErrMessage(raw));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (entry: IpEntry) => {
    const nextStatus: IpEntry['status'] = entry.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await patchIpWhitelistEntry(entry.id, { status: nextStatus });
      await reload();
      toast.success(nextStatus === 'Active' ? 'IP enabled' : 'IP disabled');
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Failed to update';
      toast.error(parseErrMessage(raw));
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteIpEntry(confirmDelete);
      await reload();
      setConfirmDelete(null);
      toast.success('IP removed');
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Failed to delete';
      toast.error(parseErrMessage(raw));
    }
  };

  const hasApiBase = !!import.meta.env.VITE_API_BASE_URL;

  return (
    <ErrorBoundary>
      <PageHeader
        title="IP Management"
        subtitle="Whitelist office IPs for employee requests. Admin login is not limited by this list."
        actions={[{ label: 'Add IP', onClick: () => setShowForm(true) }]}
      />

      {!hasApiBase ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Set <code className="font-mono text-xs">VITE_API_BASE_URL</code> to your API origin so IP rules sync with the server.
        </p>
      ) : null}

      {showForm && (
        <SectionCard title="Add IP Address" className="mb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">
                IP Address / CIDR <span className="text-red-500">*</span>
              </label>
              <input
                className={inputClass}
                placeholder="e.g. 192.168.1.1 or 10.0.0.0/24"
                value={form.ip}
                onChange={(e) => setForm((f) => ({ ...f, ip: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Label</label>
              <input
                className={inputClass}
                placeholder="e.g. Blaunk Office Mumbai"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Status</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value as IpEntry['status'] }))
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleAdd}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save IP'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm());
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </SectionCard>
      )}

      <div className="rounded-card border border-slate-200 bg-white shadow-card">
        {loading ? (
          <div className="flex min-h-[120px] items-center justify-center text-sm text-slate-500">
            Loading whitelist…
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            message="No IP addresses whitelisted yet."
            action={{ label: 'Add IP', onClick: () => setShowForm(true) }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="bg-primary text-white">
                  {['IP / CIDR', 'Label', 'Added By', 'Added Date', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr key={entry.id} className={i % 2 === 0 ? 'bg-white' : 'bg-surface'}>
                    <td className="border-b border-slate-100 px-4 py-2.5 font-mono text-sm font-semibold text-slate-900">
                      {entry.ip}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-2.5 text-slate-700">
                      {entry.label || '—'}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-2.5 text-slate-500">
                      {entry.addedBy}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-2.5 text-xs text-slate-500">
                      {entry.addedAt ? new Date(entry.addedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="border-b border-slate-100 px-4 py-2.5">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="border-b border-slate-100 px-4 py-2.5">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => toggleStatus(entry)}
                          className="rounded px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          {entry.status === 'Active' ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(entry.id)}
                          className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Remove IP Address"
          message="Are you sure you want to remove this IP from the whitelist?"
          confirmLabel="Remove"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </ErrorBoundary>
  );
};
