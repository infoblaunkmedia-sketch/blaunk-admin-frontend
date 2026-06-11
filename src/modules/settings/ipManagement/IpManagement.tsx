import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { FormField } from '../../../shared/components/FormField';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper';
import { RowActionsMenu } from '../../../shared/components/RowActionsMenu';
import { formatDateDDMMYYYY } from '../../../shared/utils/dateFormat';
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

type IpFormState = {
  ip: string;
  label: string;
  status: IpEntry['status'];
  city: string;
  state: string;
  asn: string;
  country: string;
  timeZone: string;
};

const emptyForm = (): IpFormState => ({
  ip: '',
  label: '',
  status: 'Active',
  city: '',
  state: '',
  asn: '',
  country: '',
  timeZone: '',
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
  const [editId, setEditId] = React.useState<string | null>(null);
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

  const closeForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm());
  };

  const openAdd = () => {
    setEditId(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (entry: IpEntry) => {
    setEditId(entry.id);
    setForm({
      ip: entry.ip,
      label: entry.label,
      status: entry.status,
      city: '',
      state: '',
      asn: '',
      country: '',
      timeZone: '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.ip.trim()) {
      toast.error('IP address is required');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await patchIpWhitelistEntry(editId, {
          ip: form.ip.trim(),
          label: form.label.trim(),
          status: form.status,
        });
        toast.success('IP address updated');
      } else {
        await createIpWhitelistEntry({
          ip: form.ip.trim(),
          label: form.label.trim(),
          status: form.status,
          addedBy: currentUser?.code || currentUser?.username || '',
        });
        toast.success('IP address saved');
      }
      await reload();
      closeForm();
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

  const columns: TableColumn<IpEntry>[] = [
    {
      name: 'IP/CIDR',
      selector: (r) => r.ip,
      sortable: true,
      grow: 2,
      cell: (r) => <span className="font-mono font-semibold text-slate-900">{r.ip}</span>,
    },
    {
      name: 'Label / ISP',
      selector: (r) => r.label,
      sortable: true,
      grow: 2,
      format: (r) => r.label || '—',
    },
    {
      name: 'ASN',
      selector: () => '',
      width: '90px',
      format: () => '—',
    },
    {
      name: 'Added Date',
      selector: (r) => r.addedAt,
      sortable: true,
      width: '115px',
      format: (r) => (r.addedAt ? formatDateDDMMYYYY(String(r.addedAt)) : '—'),
    },
    {
      name: 'Status',
      cell: (r) => <StatusBadge status={r.status} />,
      width: '95px',
    },
    {
      name: 'Actions',
      cell: (r) => (
        <RowActionsMenu
          onEdit={() => openEdit(r)}
          onToggle={() => toggleStatus(r)}
          toggleLabel={r.status === 'Active' ? 'Disable' : 'Enable'}
          onDelete={() => setConfirmDelete(r.id)}
        />
      ),
      width: '100px',
      ignoreRowClick: true,
    },
    {
      name: 'Approved',
      selector: (r) => r.addedBy,
      width: '100px',
      format: (r) => r.addedBy || '—',
    },
  ];

  const hasApiBase = !!import.meta.env.VITE_API_BASE_URL;

  return (
    <ErrorBoundary>
      <PageHeader
        title="IP Management"
        subtitle="Whitelist office IPs for employee requests. Admin login is not limited by this list."
        actions={[{ label: '+ Add', onClick: openAdd }]}
      />

      {!hasApiBase ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Set <code className="font-mono text-xs">VITE_API_BASE_URL</code> to your API origin so IP rules sync with the server.
        </p>
      ) : null}

      {showForm && (
        <SectionCard title={editId ? 'Edit IP Address' : 'Add IP Address'} className="mb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="IP Address / CIDR" required>
              <input
                className={inputClass}
                placeholder="e.g. 192.168.1.1 or 10.0.0.0/24"
                value={form.ip}
                onChange={(e) => setForm((f) => ({ ...f, ip: e.target.value }))}
              />
            </FormField>
            <FormField label="Label">
              <input
                className={inputClass}
                placeholder="e.g. Blaunk Office Mumbai"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              />
            </FormField>
            <FormField label="City">
              <input
                className={inputClass}
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </FormField>
            <FormField label="State">
              <input
                className={inputClass}
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              />
            </FormField>
            <FormField label="ASN">
              <input
                className={inputClass}
                placeholder="ASN"
                value={form.asn}
                onChange={(e) => setForm((f) => ({ ...f, asn: e.target.value }))}
              />
            </FormField>
            <FormField label="Country">
              <input
                className={inputClass}
                placeholder="Country"
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </FormField>
            <FormField label="Status">
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
            </FormField>
            <FormField label="Time Zone">
              <input
                className={inputClass}
                placeholder="e.g. Asia/Kolkata"
                value={form.timeZone}
                onChange={(e) => setForm((f) => ({ ...f, timeZone: e.target.value }))}
              />
            </FormField>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? 'Saving…' : editId ? 'Update IP' : 'Save IP'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </SectionCard>
      )}

      <DataTableWrapper columns={columns} data={entries} loading={loading} searchable={false} />

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
