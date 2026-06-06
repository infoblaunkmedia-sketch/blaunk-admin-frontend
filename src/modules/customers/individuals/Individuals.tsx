import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { FormField } from '../../../shared/components/FormField';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { formatDateDDMMYYYY } from '../../../shared/utils/dateFormat';
import type { Individual, CustomerStatus } from '../customers.types';
import {
  fetchIndividuals,
  fetchIndividualById,
  updateIndividualProfile,
} from '../customers.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export const Individuals: React.FC = () => {
  const [individuals, setIndividuals] = React.useState<Individual[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<Individual | null>(null);
  const [notesDraft, setNotesDraft] = React.useState('');
  const [statusDraft, setStatusDraft] = React.useState<CustomerStatus>('Active');
  const [saving, setSaving] = React.useState(false);
  const [confirmSave, setConfirmSave] = React.useState(false);
  const [tableSearch, setTableSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<CustomerStatus | ''>('');
  const [total, setTotal] = React.useState(0);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { records, pagination } = await fetchIndividuals({
        q: tableSearch.trim() || undefined,
        status: statusFilter || undefined,
        limit: 200,
      });
      setIndividuals(records);
      setTotal(pagination.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load customers');
      setIndividuals([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [tableSearch, statusFilter]);

  React.useEffect(() => {
    const t = window.setTimeout(() => { load(); }, 300);
    return () => window.clearTimeout(t);
  }, [load]);

  const openProfile = async (ind: Individual) => {
    try {
      const fresh = await fetchIndividualById(ind.id);
      setSelected(fresh);
      setNotesDraft(fresh.internalNotes);
      setStatusDraft(fresh.accountStatus);
    } catch {
      toast.error('Failed to load customer profile');
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateIndividualProfile(selected.id, {
        accountStatus: statusDraft,
        internalNotes: notesDraft,
      });
      toast.success('Customer profile updated');
      setConfirmSave(false);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const columns: TableColumn<Individual>[] = [
    { name: 'Customer ID', selector: (r) => r.customerId, width: '130px', sortable: true },
    { name: 'Full Name', selector: (r) => r.fullName, sortable: true, grow: 2 },
    { name: 'Email', selector: (r) => r.email, grow: 2 },
    { name: 'Mobile', selector: (r) => r.mobile, width: '130px' },
    { name: 'Country', selector: (r) => r.country, width: '110px' },
    { name: 'Registered', selector: (r) => r.registrationDate, format: (r) => formatDateDDMMYYYY(r.registrationDate) || '—', width: '110px', sortable: true },
    { name: 'Last Login', selector: (r) => r.lastLoginDate, format: (r) => formatDateDDMMYYYY(r.lastLoginDate) || '—', width: '110px' },
    { name: 'Orders', selector: (r) => r.totalOrders, width: '80px', sortable: true },
    { name: 'Status', cell: (r) => <StatusBadge status={r.accountStatus} />, width: '100px' },
    {
      name: 'Actions',
      cell: (r) => (
        <button type="button" onClick={() => openProfile(r)}
          className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10">
          View / Edit
        </button>
      ),
      width: '100px', ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="Individual Customers"
        subtitle={`End users registered via the website. ${total} total.`}
        beforeActions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CustomerStatus | '')}
            >
              <option value="">All statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Blocked">Blocked</option>
            </select>
            <ListTableSearchInput value={tableSearch} onChange={setTableSearch} />
          </div>
        } />

      <DataTableWrapper columns={columns} data={individuals} loading={loading} searchable
        filterText={tableSearch} onFilterTextChange={setTableSearch} hideSearchInput />

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="text-base font-bold text-primary">Customer Profile</h3>
              <button type="button" onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="font-semibold text-slate-500">ID:</span> <span>{selected.customerId}</span></div>
                <div><span className="font-semibold text-slate-500">Name:</span> <span>{selected.fullName}</span></div>
                <div><span className="font-semibold text-slate-500">Email:</span> <span>{selected.email}</span></div>
                <div><span className="font-semibold text-slate-500">Mobile:</span> <span>{selected.mobile}</span></div>
                <div><span className="font-semibold text-slate-500">Country:</span> <span>{selected.country}</span></div>
                <div><span className="font-semibold text-slate-500">Registered:</span> <span>{formatDateDDMMYYYY(selected.registrationDate) || '—'}</span></div>
                <div><span className="font-semibold text-slate-500">Last Login:</span> <span>{selected.lastLoginDate}</span></div>
              </div>
              <SectionCard title="Account Status">
                <FormField label="Status">
                  <select className={inputClass} value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value as CustomerStatus)}>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </FormField>
              </SectionCard>
              <SectionCard title="Internal Notes">
                <textarea className={`${inputClass} h-auto py-2`} rows={3}
                  value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Add internal notes visible only to admin staff…" />
              </SectionCard>
            </div>
            <div className="flex gap-3 border-t border-slate-100 px-5 py-4">
              <button type="button" disabled={saving} onClick={() => setConfirmSave(true)}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setSelected(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmSave && selected ? (
        <ConfirmDialog
          title="Update customer"
          message={`Are you sure you want to update ${selected.fullName} (status: ${statusDraft})? This cannot be undone.`}
          confirmLabel="Confirm"
          variant="primary"
          loading={saving}
          onConfirm={() => void handleSave()}
          onCancel={() => setConfirmSave(false)}
        />
      ) : null}
    </ErrorBoundary>
  );
};
