import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { FormField } from '../../../shared/components/FormField';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { Contest, ContestStatus } from '../marketing.types';
import { fetchContests, saveContest, deleteContest } from '../marketing.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const emptyForm = (): Omit<Contest, 'id'> => ({
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  prize: '',
  eligibilityCriteria: '',
  status: 'Draft',
});

export const Contests: React.FC = () => {
  const [contests, setContests] = React.useState<Contest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm());
  const [editId, setEditId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setContests(await fetchContests());
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleEdit = (c: Contest) => {
    setForm({ name: c.name, description: c.description, startDate: c.startDate, endDate: c.endDate, prize: c.prize, eligibilityCriteria: c.eligibilityCriteria, status: c.status });
    setEditId(c.id);
    setShowForm(true);
  };

  const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Contest name required'); return; }
    setSaving(true);
    try {
      await saveContest({ ...form, id: editId ?? crypto.randomUUID() });
      toast.success(editId ? 'Contest updated' : 'Contest created');
      setShowForm(false);
      setForm(emptyForm());
      setEditId(null);
      load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    await deleteContest(confirmDel);
    setConfirmDel(null);
    load();
    toast.success('Contest deleted');
  };

  const displayed = statusFilter ? contests.filter((c) => c.status === statusFilter) : contests;

  const columns: TableColumn<Contest>[] = [
    { name: 'Contest Name', selector: (r) => r.name, sortable: true, grow: 2 },
    { name: 'Prize', selector: (r) => r.prize },
    { name: 'Start Date', selector: (r) => r.startDate, width: '110px' },
    { name: 'End Date', selector: (r) => r.endDate, width: '110px' },
    { name: 'Status', cell: (r) => <StatusBadge status={r.status} />, width: '100px' },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => handleEdit(r)}
            className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10">Edit</button>
          <button type="button" onClick={() => setConfirmDel(r.id)}
            className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
        </div>
      ),
      width: '120px', ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="Contests" subtitle="Manage marketing contests and campaigns."
        actions={[{ label: '+ New Contest', onClick: () => { setShowForm(true); setEditId(null); setForm(emptyForm()); } }]} />

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-600">Filter:</label>
        {(['', 'Draft', 'Active', 'Ended'] as (ContestStatus | '')[]).map((s) => (
          <button key={s} type="button" onClick={() => setStatusFilter(s)}
            className={['rounded-lg border px-3 py-1 text-xs font-semibold transition',
              statusFilter === s ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'].join(' ')}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {showForm && (
        <SectionCard title={editId ? 'Edit Contest' : 'New Contest'} className="mb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Contest Name" required>
              <input className={inputClass} value={form.name} onChange={(e) => setField('name', e.target.value)} />
            </FormField>
            <FormField label="Prize">
              <input className={inputClass} value={form.prize} onChange={(e) => setField('prize', e.target.value)} />
            </FormField>
            <FormField label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setField('status', e.target.value as ContestStatus)}>
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Ended">Ended</option>
              </select>
            </FormField>
            <FormField label="Start Date">
              <input type="date" className={`${inputClass} [color-scheme:light]`} value={form.startDate}
                onChange={(e) => setField('startDate', e.target.value)} />
            </FormField>
            <FormField label="End Date">
              <input type="date" className={`${inputClass} [color-scheme:light]`} value={form.endDate}
                onChange={(e) => setField('endDate', e.target.value)} />
            </FormField>
            <FormField label="Eligibility Criteria">
              <input className={inputClass} value={form.eligibilityCriteria}
                onChange={(e) => setField('eligibilityCriteria', e.target.value)} />
            </FormField>
            <FormField label="Description" className="sm:col-span-2">
              <textarea className={`${inputClass} h-auto py-2`} rows={3} value={form.description}
                onChange={(e) => setField('description', e.target.value)} />
            </FormField>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" disabled={saving} onClick={handleSave}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {saving ? 'Saving…' : editId ? 'Update' : 'Create Contest'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm()); setEditId(null); }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </SectionCard>
      )}

      <DataTableWrapper columns={columns} data={displayed} loading={loading} searchable />

      {confirmDel && (
        <ConfirmDialog title="Delete Contest" message="Delete this contest permanently?"
          confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />
      )}
    </ErrorBoundary>
  );
};
