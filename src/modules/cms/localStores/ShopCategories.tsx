import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import {
  createShopCategory,
  deleteShopCategory,
  fetchShopCategories,
  updateShopCategory,
  type ShopCategory,
} from './shops.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary';

const empty = (): Omit<ShopCategory, 'id'> => ({ name: '', sortOrder: 1, isActive: true });

export const ShopCategories: React.FC = () => {
  const [rows, setRows] = React.useState<ShopCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState<Partial<ShopCategory>>(empty());
  const [showForm, setShowForm] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchShopCategories());
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void load(); }, [load]);

  const save = async () => {
    if (!form.name?.trim()) {
      toast.error('Name required');
      return;
    }
    try {
      if (form.id) {
        await updateShopCategory(form.id, {
          name: form.name.toUpperCase(),
          sortOrder: form.sortOrder ?? 0,
          isActive: form.isActive !== false,
        });
      } else {
        await createShopCategory({
          name: form.name.toUpperCase(),
          sortOrder: form.sortOrder ?? 0,
          isActive: form.isActive !== false,
        });
      }
      toast.success('Saved');
      setShowForm(false);
      setForm(empty());
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const columns: TableColumn<ShopCategory>[] = [
    { name: 'Order', selector: (r) => r.sortOrder, width: '80px' },
    { name: 'Name', selector: (r) => r.name, grow: 2 },
    { name: 'Active', selector: (r) => (r.isActive ? 'Yes' : 'No'), width: '80px' },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => { setForm(r); setShowForm(true); }} className="text-xs text-primary">Edit</button>
          <button type="button" onClick={() => setConfirmDel(r.id)} className="text-xs text-red-600">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader
        title="B-Store Categories"
        subtitle="Controls left sidebar tab order on the homepage Explore section."
        actions={[{ label: '+ Category', onClick: () => { setForm(empty()); setShowForm(true); } }]}
      />
      <DataTableWrapper columns={columns} data={rows} loading={loading} />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-bold text-primary">{form.id ? 'Edit' : 'New'} category</h3>
            <div className="mt-4 grid gap-3">
              <FormField label="Name (UPPERCASE)">
                <input className={inputClass} value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })} />
              </FormField>
              <FormField label="Sort order">
                <input type="number" className={inputClass} value={form.sortOrder ?? 1} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
              </FormField>
              <FormField label="Active">
                <select className={inputClass} value={form.isActive ? '1' : '0'} onChange={(e) => setForm({ ...form, isActive: e.target.value === '1' })}>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </FormField>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => void save()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <ConfirmDialog
          title="Delete category"
          message="Delete this category? Shops keep their category text."
          confirmLabel="Delete"
          onConfirm={async () => {
            await deleteShopCategory(confirmDel);
            setConfirmDel(null);
            await load();
            toast.success('Deleted');
          }}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </ErrorBoundary>
  );
};
