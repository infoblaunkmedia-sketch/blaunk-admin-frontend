import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { DataTableWrapper, LIST_FILTER_FIELD_CLASS, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { FormField } from '../../../shared/components/FormField';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ImageUploader } from '../../../shared/components/ImageUploader';
import {
  deleteShop,
  fetchShopCategories,
  fetchShops,
  shopImageUrl,
  updateShop,
  uploadShopImage,
  type Shop,
  type ShopStatus,
} from './shops.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

const STATUSES: ShopStatus[] = ['pending', 'approved', 'rejected'];

export const Shops: React.FC = () => {
  const [rows, setRows] = React.useState<Shop[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<ShopStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [form, setForm] = React.useState<Shop | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [pendingFile, setPendingFile] = React.useState<File | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [shops, cats] = await Promise.all([
        fetchShops({
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
          q: search || undefined,
        }),
        fetchShopCategories(),
      ]);
      setRows(shops);
      setCategories(cats.filter((c) => c.isActive).map((c) => c.name));
    } catch {
      toast.error('Failed to load shops');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, search]);

  React.useEffect(() => {
    const t = window.setTimeout(() => void load(), 300);
    return () => window.clearTimeout(t);
  }, [load]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      if (pendingFile) {
        imageUrl = await uploadShopImage(pendingFile);
      }
      await updateShop(form.id, { ...form, imageUrl, coverImage: imageUrl });
      toast.success('Shop saved');
      setForm(null);
      setPendingFile(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const columns: TableColumn<Shop>[] = [
    { name: 'Store', selector: (r) => r.shopName, grow: 2 },
    { name: 'Category', selector: (r) => r.category, width: '120px' },
    { name: 'City', selector: (r) => r.city, width: '100px' },
    { name: 'Rating', selector: (r) => String(r.rating), width: '70px' },
    {
      name: 'Status',
      cell: (r) => <StatusBadge status={r.status.charAt(0).toUpperCase() + r.status.slice(1)} />,
      width: '100px',
    },
    {
      name: 'Actions',
      cell: (r) => (
        <button type="button" onClick={() => { setForm(r); setPendingFile(null); }} className="text-xs font-semibold text-primary">
          Edit
        </button>
      ),
      width: '80px',
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader
        title="B-Store Shops"
        subtitle="Approve and enrich local marketplace cards for the homepage Explore section."
        toolbarLeft={
          <div className="flex flex-nowrap items-center gap-2">
            <select
              className={LIST_FILTER_FIELD_CLASS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ShopStatus | '')}
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              className={LIST_FILTER_FIELD_CLASS}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ListTableSearchInput value={search} onChange={setSearch} />
          </div>
        }
      />

      <DataTableWrapper columns={columns} data={rows} loading={loading} hideSearchInput />

      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-bold text-primary">Edit — {form.shopName}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <FormField label="Cover image" className="sm:col-span-2">
                <div className="flex flex-wrap items-start gap-4">
                  <ImageUploader
                    maxSizeMB={2}
                    label="Upload"
                    currentPreview={form.imageUrl ? shopImageUrl(form.imageUrl) : undefined}
                    onFile={(file, preview) => {
                      setPendingFile(file);
                      setForm((p) => (p ? { ...p, imageUrl: preview } : p));
                    }}
                  />
                </div>
              </FormField>
              <FormField label="Shop name" className="sm:col-span-2">
                <input className={inputClass} value={form.shopName} onChange={(e) => setForm({ ...form, shopName: e.target.value })} />
              </FormField>
              <FormField label="Tagline (gold subtitle)">
                <input className={inputClass} value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
              </FormField>
              <FormField label="Category">
                <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value.toUpperCase() })} />
              </FormField>
              <FormField label="Promo quote" className="sm:col-span-2">
                <textarea className={`${inputClass} min-h-[60px] py-2`} value={form.promoText} onChange={(e) => setForm({ ...form, promoText: e.target.value })} />
              </FormField>
              <FormField label="Rating">
                <input type="number" min={0} max={5} step={0.1} className={inputClass} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} />
              </FormField>
              <FormField label="Sort order">
                <input type="number" className={inputClass} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
              </FormField>
              <FormField label="Link URL" className="sm:col-span-2">
                <input className={inputClass} value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="Optional — else /store/{id}" />
              </FormField>
              <FormField label="Status">
                <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ShopStatus })}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Verified">
                <select className={inputClass} value={form.isVerified ? '1' : '0'} onChange={(e) => setForm({ ...form, isVerified: e.target.value === '1' })}>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </FormField>
              <p className="sm:col-span-2 text-xs text-slate-500">
                Owner: {form.ownerName} · {form.email} · {form.phone} · {form.city} {form.pincode}
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" disabled={saving} onClick={() => void save()} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => { setForm(null); setPendingFile(null); }} className="text-sm text-slate-600">Cancel</button>
              <button type="button" onClick={() => setConfirmDel(form.id)} className="ml-auto text-sm font-semibold text-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <ConfirmDialog
          title="Delete shop"
          message="Remove this listing permanently?"
          confirmLabel="Delete"
          onConfirm={async () => {
            await deleteShop(confirmDel);
            setConfirmDel(null);
            setForm(null);
            await load();
            toast.success('Deleted');
          }}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </ErrorBoundary>
  );
};
