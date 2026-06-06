import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { FormField } from '../../../shared/components/FormField';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { Vacancy } from '../people.types';
import {
  fetchVacancies,
  fetchVacancyApplyEmail,
  saveVacancy,
  saveVacancyApplyEmail,
  deleteVacancy,
} from '../people.service';
import { onIntegerInputKeyDown } from '../../../shared/utils/numericInput';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

type VacancyForm = Omit<Vacancy, 'id' | 'applyEmail'>;

const emptyForm = (): VacancyForm => ({
  jobTitle: '',
  requiredExperience: '',
  location: '',
  packageLpa: '',
  qualification: '',
  numberOfOpenings: 1,
});

export const Vacancies: React.FC = () => {
  const [vacancies, setVacancies] = React.useState<Vacancy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(emptyForm);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [tableSearch, setTableSearch] = React.useState('');
  const [applyEmail, setApplyEmail] = React.useState('careers@blaunk.com');
  const [savingEmail, setSavingEmail] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [data, email] = await Promise.all([fetchVacancies(), fetchVacancyApplyEmail()]);
      setVacancies(data);
      setApplyEmail(email);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load vacancies';
      setLoadError(msg);
      setVacancies([]);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditId(null);
    setShowForm(false);
  };

  const openAddForm = () => {
    setForm(emptyForm());
    setEditId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (v: Vacancy) => {
    setForm({
      jobTitle: v.jobTitle,
      requiredExperience: v.requiredExperience,
      location: v.location,
      packageLpa: v.packageLpa,
      qualification: v.qualification,
      numberOfOpenings: v.numberOfOpenings,
    });
    setEditId(v.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!form.jobTitle.trim()) {
      toast.error('Role title is required');
      return;
    }
    if (!form.requiredExperience.trim()) {
      toast.error('Experience is required');
      return;
    }
    if (!form.location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!form.packageLpa.trim()) {
      toast.error('Package LPA is required');
      return;
    }
    if (!form.qualification.trim()) {
      toast.error('Qualification is required');
      return;
    }
    setSaving(true);
    try {
      const vac: Vacancy = { ...form, id: editId ?? '', applyEmail };
      await saveVacancy(vac);
      toast.success(editId ? 'Vacancy updated' : 'Vacancy added');
      resetForm();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      await deleteVacancy(confirmDel);
      toast.success('Vacancy removed from website');
      if (editId === confirmDel) resetForm();
      setConfirmDel(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSaveApplyEmail = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(applyEmail.trim())) {
      toast.error('Enter a valid apply email');
      return;
    }
    setSavingEmail(true);
    try {
      const saved = await saveVacancyApplyEmail(applyEmail);
      setApplyEmail(saved);
      toast.success('Careers apply email updated');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save apply email');
    } finally {
      setSavingEmail(false);
    }
  };

  const columns: TableColumn<Vacancy>[] = [
    { name: 'Role', selector: (r) => r.jobTitle || '—', sortable: true, grow: 2 },
    { name: 'Experience', selector: (r) => r.requiredExperience || '—', sortable: true },
    { name: 'Location', selector: (r) => r.location || '—', sortable: true },
    { name: 'Package LPA', selector: (r) => r.packageLpa || '—', sortable: true },
    { name: 'Vacancies', selector: (r) => String(r.numberOfOpenings ?? '—'), width: '100px' },
    { name: 'Qualification', selector: (r) => r.qualification || '—', grow: 2 },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleEdit(r)}
            className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setConfirmDel(r.id)}
            className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      ),
      width: '130px',
      ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader
        title="Vacancies"
        subtitle="Add roles shown on the Careers page. All postings stay active until you delete them."
        beforeActions={<ListTableSearchInput value={tableSearch} onChange={setTableSearch} />}
        actions={[{ label: '+ Add Vacancy', onClick: openAddForm }]}
      />

      <SectionCard title="Careers apply email" className="mb-5">
        <p className="mb-3 text-sm text-slate-600">
          One shared email for all vacancy applications on the Careers page. Update here once — not per vacancy.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <FormField label="Apply / CV email" className="min-w-[16rem] flex-1">
            <input
              type="email"
              className={inputClass}
              value={applyEmail}
              onChange={(e) => setApplyEmail(e.target.value)}
              placeholder="careers@blaunk.com"
            />
          </FormField>
          <button
            type="button"
            disabled={savingEmail || loading}
            onClick={() => void handleSaveApplyEmail()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {savingEmail ? 'Saving…' : 'Save email'}
          </button>
        </div>
      </SectionCard>

      {loadError ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="m-0 font-semibold">Could not load vacancies</p>
          <p className="m-0 mt-1 text-red-700">{loadError}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      ) : null}

      {showForm ? (
      <SectionCard title={editId ? 'Edit vacancy' : 'Add vacancy'} className="mb-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Role title" required>
            <input
              className={inputClass}
              value={form.jobTitle}
              onChange={(e) => setField('jobTitle', e.target.value)}
              placeholder="e.g. Software Engineer"
            />
          </FormField>
          <FormField label="Experience" required>
            <input
              className={inputClass}
              value={form.requiredExperience}
              onChange={(e) => setField('requiredExperience', e.target.value)}
              placeholder="e.g. 2 Years"
            />
          </FormField>
          <FormField label="Location" required>
            <input
              className={inputClass}
              value={form.location}
              onChange={(e) => setField('location', e.target.value)}
              placeholder="e.g. Mumbai"
            />
          </FormField>
          <FormField label="Package LPA" required>
            <input
              className={inputClass}
              value={form.packageLpa}
              onChange={(e) => setField('packageLpa', e.target.value)}
              placeholder="e.g. 6 or 6 LPA"
            />
          </FormField>
          <FormField label="Vacancies" required>
            <input
              type="number"
              min={1}
              className={inputClass}
              value={form.numberOfOpenings}
              onKeyDown={onIntegerInputKeyDown}
              onChange={(e) => setField('numberOfOpenings', parseInt(e.target.value, 10) || 1)}
            />
          </FormField>
          <FormField label="Qualification" required className="sm:col-span-2 lg:col-span-3">
            <input
              className={inputClass}
              value={form.qualification}
              onChange={(e) => setField('qualification', e.target.value)}
              placeholder="e.g. B.Tech in Computer Science"
            />
          </FormField>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? 'Saving…' : editId ? 'Update vacancy' : 'Add vacancy'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </SectionCard>
      ) : null}

      <SectionCard title="" contentClassName="p-0 overflow-hidden">
        <DataTableWrapper
          columns={columns}
          data={vacancies}
          loading={loading}
          searchable
          filterText={tableSearch}
          onFilterTextChange={setTableSearch}
          hideSearchInput
          className="border-0 shadow-none"
        />
      </SectionCard>

      {confirmDel ? (
        <ConfirmDialog
          title="Delete vacancy"
          message="Remove this vacancy from the Careers page?"
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={() => void handleDelete()}
          onCancel={() => !deleting && setConfirmDel(null)}
        />
      ) : null}
    </ErrorBoundary>
  );
};
