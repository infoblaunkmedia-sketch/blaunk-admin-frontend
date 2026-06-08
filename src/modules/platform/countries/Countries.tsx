import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import {
  fetchAllCountries,
  createCountry,
  updateCountry,
  deleteCountry,
  type CountryRecord,
} from '../../../shared/services/countries.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/25';

const statusSelectClass =
  'h-8 min-w-[6.5rem] rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-primary';

type FormState = {
  country: string;
  currencyCode: string;
  currencyName: string;
  icon: string;
};

const emptyForm: FormState = {
  country: '',
  currencyCode: '',
  currencyName: '',
  icon: '',
};

function IconEdit({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export const Countries: React.FC = () => {
  const [rows, setRows] = React.useState<CountryRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchAllCountries());
    } catch {
      toast.error('Failed to load countries');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (row: CountryRecord) => {
    setEditingId(row.id);
    setForm({
      country: row.country,
      currencyCode: row.currencyCode,
      currencyName: row.currencyName,
      icon: row.icon,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.country.trim()) return toast.error('Country name is required');
    if (!form.currencyCode.trim()) return toast.error('Currency code is required');
    if (!form.currencyName.trim()) return toast.error('Currency name is required');
    setSaving(true);
    try {
      const payload = {
        country: form.country.trim(),
        currencyCode: form.currencyCode.trim().toUpperCase(),
        currencyName: form.currencyName.trim(),
        icon: form.icon.trim(),
      };
      if (editingId) {
        await updateCountry(editingId, payload);
        toast.success('Country updated');
      } else {
        await createCountry({ ...payload, isActive: true });
        toast.success('Country added');
      }
      closeModal();
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteCountry(confirmDeleteId);
      toast.success('Deleted');
      if (editingId === confirmDeleteId) closeModal();
      setConfirmDeleteId(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const handleStatusChange = async (row: CountryRecord, isActive: boolean) => {
    if (row.isActive === isActive) return;
    setStatusUpdatingId(row.id);
    try {
      await updateCountry(row.id, { isActive });
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, isActive } : r)));
    } catch {
      toast.error('Status update failed');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  React.useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen, saving]);

  return (
    <ErrorBoundary>
      <PageHeader
        title="Countries"
        actions={[{ label: '+ Add', onClick: openAdd, variant: 'primary' }]}
      />

      <SectionCard>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-2.5">Country</th>
                  <th className="px-3 py-2.5">Code</th>
                  <th className="px-3 py-2.5">Currency</th>
                  <th className="px-3 py-2.5">Icon</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-2.5 font-medium text-slate-900">{row.country}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.currencyCode}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.currencyName}</td>
                    <td className="px-3 py-2.5 text-slate-700">{row.icon || '—'}</td>
                    <td className="px-3 py-2.5">
                      <select
                        className={statusSelectClass}
                        value={row.isActive ? 'active' : 'inactive'}
                        disabled={statusUpdatingId === row.id}
                        onChange={(e) => handleStatusChange(row, e.target.value === 'active')}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          className="rounded border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50"
                          title="Edit"
                          aria-label={`Edit ${row.country}`}
                        >
                          <IconEdit />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(row.id)}
                          className="rounded border border-slate-200 p-1.5 text-red-600 transition hover:bg-red-50"
                          title="Delete"
                          aria-label={`Delete ${row.country}`}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!rows.length ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-slate-500">
                      No countries yet. Click + Add to create one.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="country-modal-title"
          onClick={() => {
            if (!saving) closeModal();
          }}
        >
          <div
            className="w-full max-w-md rounded-card bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <h3 id="country-modal-title" className="text-base font-bold text-slate-900">
                {editingId ? 'Edit country' : 'Add country'}
              </h3>
            </div>
            <div className="space-y-3 px-5 py-4">
              <FormField label="Country" required>
                <input
                  className={inputClass}
                  value={form.country}
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                  autoFocus
                />
              </FormField>
              <FormField label="Currency code" required>
                <input
                  className={inputClass}
                  value={form.currencyCode}
                  onChange={(e) => setForm((p) => ({ ...p, currencyCode: e.target.value.toUpperCase() }))}
                  placeholder="e.g. AED"
                />
              </FormField>
              <FormField label="Currency name" required>
                <input
                  className={inputClass}
                  value={form.currencyName}
                  onChange={(e) => setForm((p) => ({ ...p, currencyName: e.target.value }))}
                />
              </FormField>
              <FormField label="Icon / symbol">
                <input
                  className={inputClass}
                  value={form.icon}
                  onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="e.g. ₹"
                />
              </FormField>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                disabled={saving}
                onClick={closeModal}
                className="h-9 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmDeleteId ? (
        <ConfirmDialog
          title="Delete country"
          message="This country will be removed from all dropdowns. Continue?"
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      ) : null}
    </ErrorBoundary>
  );
};
