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
import { DEPARTMENTS } from '../../../shared/constants/hrConstants';
import type { Vacancy } from '../people.types';
import { fetchVacancies, saveVacancy, deleteVacancy } from '../people.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const emptyForm = (): Omit<Vacancy, 'id'> => ({
  jobTitle: '',
  department: '',
  numberOfOpenings: 1,
  description: '',
  requiredExperience: '',
  location: '',
  postedDate: new Date().toISOString().slice(0, 10),
  status: 'Open',
});

export const Vacancies: React.FC = () => {
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm());
  const [editId, setEditId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    const data = await fetchVacancies();
    setVacancies(data);
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleEdit = (v: Vacancy) => {
    setForm({ ...v });
    setEditId(v.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.jobTitle.trim()) { toast.error('Job title required'); return; }
    setSaving(true);
    try {
      const vac: Vacancy = { ...form, id: editId ?? crypto.randomUUID() };
      await saveVacancy(vac);
      toast.success(editId ? 'Vacancy updated' : 'Vacancy posted');
      setShowForm(false);
      setForm(emptyForm());
      setEditId(null);
      load();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    await deleteVacancy(confirmDel);
    setConfirmDel(null);
    load();
  };

  const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const columns: TableColumn<Vacancy>[] = [
    { name: 'Job Title', selector: (r) => r.jobTitle, sortable: true, grow: 2 },
    { name: 'Department', selector: (r) => r.department, sortable: true },
    { name: 'Openings', selector: (r) => r.numberOfOpenings, width: '90px' },
    { name: 'Location', selector: (r) => r.location },
    { name: 'Posted', selector: (r) => r.postedDate, width: '110px' },
    { name: 'Status', cell: (r) => <StatusBadge status={r.status} />, width: '90px' },
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
      width: '120px',
      ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader
        title="Vacancies"
        subtitle="Post and manage open positions."
        actions={[{ label: '+ Post Vacancy', onClick: () => { setShowForm(true); setEditId(null); setForm(emptyForm()); } }]}
      />

      {showForm && (
        <SectionCard title={editId ? 'Edit Vacancy' : 'New Vacancy'} className="mb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Job Title" required>
              <input className={inputClass} value={form.jobTitle} onChange={(e) => setField('jobTitle', e.target.value)} />
            </FormField>
            <FormField label="Department">
              <select className={inputClass} value={form.department} onChange={(e) => setField('department', e.target.value)}>
                <option value="">Select</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Number of Openings">
              <input type="number" min={1} className={inputClass} value={form.numberOfOpenings}
                onChange={(e) => setField('numberOfOpenings', parseInt(e.target.value) || 1)} />
            </FormField>
            <FormField label="Required Experience">
              <input className={inputClass} placeholder="e.g. 2-4 years" value={form.requiredExperience}
                onChange={(e) => setField('requiredExperience', e.target.value)} />
            </FormField>
            <FormField label="Location">
              <input className={inputClass} value={form.location} onChange={(e) => setField('location', e.target.value)} />
            </FormField>
            <FormField label="Posted Date">
              <input type="date" className={inputClass} value={form.postedDate} onChange={(e) => setField('postedDate', e.target.value)} />
            </FormField>
            <FormField label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setField('status', e.target.value as Vacancy['status'])}>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </FormField>
            <FormField label="Description" className="sm:col-span-2">
              <textarea className={`${inputClass} h-auto py-2`} rows={3} value={form.description}
                onChange={(e) => setField('description', e.target.value)} />
            </FormField>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" disabled={saving} onClick={handleSave}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {saving ? 'Saving…' : editId ? 'Update' : 'Post Vacancy'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm()); setEditId(null); }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </SectionCard>
      )}

      <DataTableWrapper columns={columns} data={vacancies} loading={loading} searchable />

      {confirmDel && (
        <ConfirmDialog
          title="Delete Vacancy"
          message="Delete this vacancy posting?"
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </ErrorBoundary>
  );
};
