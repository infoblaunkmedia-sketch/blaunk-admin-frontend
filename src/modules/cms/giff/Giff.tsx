import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import {
  DataTableWrapper,
  LIST_FILTER_FIELD_CLASS,
  ListTableSearchInput,
} from '../../../shared/components/DataTableWrapper';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ImageCropDialog } from '../../../shared/components/ImageCropDialog';
import { ClickableImageThumb, ClickablePreviewImage } from '../../../shared/components/ImagePreview';
import {
  GIFF_ASPECT,
  GIFF_ASPECT_LABEL,
  GIFF_CATEGORIES,
  canAddGiffForCategory,
  getGiffCategory,
  type GiffCategoryId,
} from './giffConfig';
import {
  createGiff,
  deleteGiff,
  emptyGiffForm,
  fetchGiffs,
  giffImageUrl,
  updateGiff,
  uploadGiffImage,
  type GiffPayload,
  type GiffRecord,
} from './giff.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

const FORMATS = ['gif', 'jpg'] as const;

function nextSlot(rows: Array<{ sortOrder?: number }>, maxRecords: number): number {
  const used = new Set(rows.map((r) => r.sortOrder));
  for (let n = 1; n <= maxRecords; n += 1) {
    if (!used.has(n)) return n;
  }
  return 1;
}

function slotLabel(sortOrder: number) {
  return sortOrder === 2 ? 'Right' : 'Left';
}

export const Giff: React.FC = () => {
  const [category, setCategory] = React.useState<GiffCategoryId>('home-page-cake-giff');
  const [rows, setRows] = React.useState<GiffRecord[]>([]);
  const [maxRecords, setMaxRecords] = React.useState(2);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState<GiffPayload & { id?: string }>(emptyGiffForm(category));
  const [showForm, setShowForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [cropSrc, setCropSrc] = React.useState<string | null>(null);
  const [tableSearch, setTableSearch] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const catConfig = getGiffCategory(category);
  const canAddMore = canAddGiffForCategory(category, rows.length);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGiffs(category);
      setRows(res.records);
      setMaxRecords(res.maxRecords);
    } catch {
      toast.error('Failed to load GIFF uploads');
    } finally {
      setLoading(false);
    }
  }, [category]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    if (!canAddMore) {
      toast.info(`Maximum ${maxRecords} upload(s) for this category. Edit or delete an existing row.`);
      return;
    }
    setForm(emptyGiffForm(category));
    setShowForm(true);
  };

  const openEdit = (row: GiffRecord) => {
    const fmt = String(row.format || 'gif').toLowerCase();
    setForm({
      id: row.id,
      category: row.category,
      imageUrl: row.imageUrl || '',
      format: fmt === 'jpg' || fmt === 'jpeg' ? 'jpg' : 'gif',
      isActive: row.isActive !== false,
      sortOrder: row.sortOrder ?? 1,
    });
    setShowForm(true);
  };

  const setField = <K extends keyof GiffPayload>(key: K, value: GiffPayload[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const handlePickImage = () => fileInputRef.current?.click();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      e.target.value = '';
      return;
    }
    const format = String(form.format || 'gif').toLowerCase();
    const ok =
      format === 'gif'
        ? file.type === 'image/gif'
        : file.type === 'image/jpeg' || file.type === 'image/jpg';
    if (!ok) {
      toast.error(format === 'gif' ? 'Please select a GIF file (max 700KB)' : 'Please select a JPG file (max 700KB)');
      e.target.value = '';
      return;
    }
    if (file.size > 700 * 1024) {
      toast.error('Max file size is 700KB');
      e.target.value = '';
      return;
    }
    setCropSrc(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleCropComplete = async (file: File, previewUrl: string) => {
    try {
      const path = await uploadGiffImage(file, category);
      setField('imageUrl', path);
      URL.revokeObjectURL(previewUrl);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const save = async () => {
    if (!String(form.imageUrl || '').trim()) {
      toast.error('Image is required');
      return;
    }
    const format = String(form.format || 'gif').toLowerCase();
    if (!FORMATS.includes(format as (typeof FORMATS)[number])) {
      toast.error('Select GIF or JPG format');
      return;
    }
    setSaving(true);
    try {
      const payload: GiffPayload = {
        category,
        imageUrl: String(form.imageUrl).trim(),
        format,
        isActive: form.isActive !== false,
        sortOrder: form.id ? (form.sortOrder ?? 1) : nextSlot(rows, maxRecords),
      };
      if (form.id) await updateGiff(form.id, payload);
      else await createGiff(payload);
      toast.success('Saved');
      setShowForm(false);
      setForm(emptyGiffForm(category));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      await deleteGiff(confirmDel);
      toast.success('Deleted');
      setConfirmDel(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const columns: TableColumn<GiffRecord>[] = [
    { name: 'Slot', selector: (r) => slotLabel(r.sortOrder), grow: 1, minWidth: '90px' },
    { name: 'Format', selector: (r) => (r.format === 'jpg' ? 'JPG' : 'GIF'), grow: 1, minWidth: '80px' },
    {
      name: 'Preview',
      grow: 2,
      minWidth: '140px',
      cell: (r) =>
        r.imageUrl ? (
          <ClickableImageThumb
            src={giffImageUrl(r.imageUrl)}
            alt={`GIFF ${r.format}`}
            title={`${r.format.toUpperCase()} · slot ${r.sortOrder}`}
          />
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    { name: 'Active', selector: (r) => (r.isActive ? 'Yes' : 'No'), grow: 1, minWidth: '70px' },
    {
      name: 'Actions',
      grow: 1,
      minWidth: '120px',
      cell: (r) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => openEdit(r)} className="text-xs font-semibold text-primary">
            Edit
          </button>
          <button type="button" onClick={() => setConfirmDel(r.id)} className="text-xs font-semibold text-red-600">
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader
        title="GIFF"
        subtitle="Common upload — image + format per page category (max 700KB)"
        toolbarLeft={
          <div className="flex flex-nowrap items-center gap-2">
            <select
              aria-label="GIFF category"
              className={LIST_FILTER_FIELD_CLASS}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as GiffCategoryId);
                setTableSearch('');
              }}
            >
              {GIFF_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} ({c.maxRecords})
                </option>
              ))}
            </select>
            <ListTableSearchInput value={tableSearch} onChange={setTableSearch} />
          </div>
        }
        reserveActionsColumn
        actions={canAddMore ? [{ label: '+ Upload', onClick: openNew }] : []}
      />

      <DataTableWrapper
        columns={columns}
        data={rows}
        loading={loading}
        hideSearchInput
        filterText={tableSearch}
        onFilterTextChange={setTableSearch}
        responsive={false}
        className="w-full"
      />

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-bold text-primary">{form.id ? 'Edit' : 'New'} — {catConfig.label}</h3>
            <p className="mt-1 text-xs text-slate-500">
              category={category} · max {maxRecords} · sortOrder 1=left, 2=right
            </p>
            {!form.id && (
              <p className="mt-1 text-xs text-slate-500">
                Next slot:{' '}
                {rows.length >= maxRecords
                  ? 'Category full'
                  : slotLabel(nextSlot(rows, maxRecords))}
              </p>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="mb-2 text-sm font-semibold text-slate-700">
                  Image (required) · {GIFF_ASPECT_LABEL} · max 700KB
                </p>
                <div className="flex flex-wrap items-start gap-4">
                  <button
                    type="button"
                    onClick={handlePickImage}
                    className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5"
                  >
                    Upload & crop
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={form.format === 'jpg' ? 'image/jpeg,image/jpg' : 'image/gif'}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {form.imageUrl && (
                    <ClickablePreviewImage
                      src={giffImageUrl(form.imageUrl)}
                      alt="GIFF preview"
                    />
                  )}
                </div>
              </div>

              <FormField label="Format">
                <select
                  className={inputClass}
                  value={form.format === 'jpg' ? 'jpg' : 'gif'}
                  onChange={(e) => setField('format', e.target.value)}
                >
                  <option value="gif">GIF</option>
                  <option value="jpg">JPG</option>
                </select>
              </FormField>
              <FormField label="Active">
                <select
                  className={inputClass}
                  value={form.isActive ? '1' : '0'}
                  onChange={(e) => setField('isActive', e.target.value === '1')}
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </FormField>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void save()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {cropSrc && (
        <ImageCropDialog
          open={Boolean(cropSrc)}
          imageSrc={cropSrc}
          aspect={GIFF_ASPECT}
          title={`Crop — ${catConfig.label}`}
          onClose={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onComplete={handleCropComplete}
        />
      )}

      {confirmDel && (
        <ConfirmDialog
          title="Delete GIFF"
          message="Remove this upload? The public site will stop showing it."
          confirmLabel="Delete"
          onConfirm={() => void handleDelete()}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </ErrorBoundary>
  );
};
