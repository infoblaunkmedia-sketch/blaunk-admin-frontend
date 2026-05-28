import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import {
  DataTableWrapper,
  LIST_FILTER_FIELD_CLASS,
  ListTableSearchInput,
} from '../../../shared/components/DataTableWrapper';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ImageCropDialog } from '../../../shared/components/ImageCropDialog';
import {
  HOMEPAGE_BANNER_POSITIONS,
  canAddRecordForPosition,
  getPositionConfig,
  type HomepageBannerField,
  type HomepageBannerPosition,
} from './homepageBannerConfig';
import {
  bannerImageUrl,
  createBanner,
  deleteBanner,
  emptyBanner,
  fetchBanners,
  updateBanner,
  uploadBannerImage,
  type Banner,
  type BannerPayload,
} from '../banners.service';
import {
  Testimonials,
  type TestimonialsHandle,
} from '../../adminPersonnel/testimonials/Testimonials';

/** CMS homescreen slot: banner positions or dedicated testimonials manager */
export type HomepageCmsSlot = HomepageBannerPosition | 'testimonials';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

function hasField(fields: HomepageBannerField[], key: HomepageBannerField) {
  return fields.includes(key);
}

function toDateInputValue(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export const Banners: React.FC = () => {
  const [positionFilter, setPositionFilter] = React.useState<HomepageCmsSlot>('hero');
  const testimonialsRef = React.useRef<TestimonialsHandle>(null);
  const isTestimonials = positionFilter === 'testimonials';
  const [rows, setRows] = React.useState<Banner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState<BannerPayload>(emptyBanner('hero'));
  const [showForm, setShowForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [cropSrc, setCropSrc] = React.useState<string | null>(null);
  const [tableSearch, setTableSearch] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const posConfig = isTestimonials ? null : getPositionConfig(positionFilter);
  const canAddMore = isTestimonials ? true : canAddRecordForPosition(positionFilter, rows.length);
  const isSingleSlot = posConfig?.maxRecords === 1;

  const load = React.useCallback(async () => {
    if (isTestimonials) return;
    setLoading(true);
    try {
      setRows(await fetchBanners({ page: 'home', position: positionFilter as HomepageBannerPosition }));
    } catch {
      toast.error('Failed to load homepage banners');
    } finally {
      setLoading(false);
    }
  }, [positionFilter, isTestimonials]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    if (isTestimonials) {
      testimonialsRef.current?.openNew();
      return;
    }
    if (!canAddMore) {
      toast.info('This slot allows only one record. Edit the existing row or delete it first.');
      return;
    }
    setForm(emptyBanner(positionFilter as HomepageBannerPosition));
    setShowForm(true);
  };

  const openEdit = (row: Banner) => {
    setForm({
      ...row,
      startDate: row.startDate ?? null,
      endDate: row.endDate ?? null,
      focalPoint: row.focalPoint ?? { x: 50, y: 50 },
    });
    setShowForm(true);
  };

  const setField = <K extends keyof BannerPayload>(key: K, value: BannerPayload[K]) => {
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
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    e.target.value = '';
  };

  const handleCropComplete = async (file: File, previewUrl: string) => {
    try {
      const path = await uploadBannerImage(file);
      setField('imageUrl', path);
      URL.revokeObjectURL(previewUrl);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  const save = async () => {
    if (!posConfig) return;
    if (posConfig.imageRequired && !String(form.imageUrl || '').trim()) {
      toast.error('Image is required for this slot');
      return;
    }
    setSaving(true);
    try {
      const payload: BannerPayload = {
        ...form,
        page: 'home',
        position: positionFilter as HomepageBannerPosition,
      };
      if (form.id) await updateBanner(form.id, payload);
      else await createBanner(payload);
      toast.success('Saved');
      setShowForm(false);
      setForm(emptyBanner(positionFilter as HomepageBannerPosition));
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
      await deleteBanner(confirmDel);
      toast.success('Deleted');
      setConfirmDel(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const columns: TableColumn<Banner>[] = [
        { name: 'Order', selector: (r) => r.sortOrder, width: '70px', sortable: true },
        {
          name: 'Title',
          selector: (r) => r.title || r.tag || '—',
          grow: 2,
        },
        {
          name: 'Preview',
          width: '90px',
          cell: (r) =>
            r.imageUrl ? (
              <img
                src={bannerImageUrl(r.imageUrl)}
                alt=""
                className="my-1 h-10 w-14 rounded border object-cover"
              />
            ) : (
              <span className="text-xs text-slate-400">—</span>
            ),
        },
        { name: 'Active', selector: (r) => (r.isActive ? 'Yes' : 'No'), width: '70px' },
        {
          name: 'Actions',
          width: '120px',
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

  const fields = posConfig?.fields ?? [];

  return (
    <ErrorBoundary>
      <PageHeader
        title="Homepage Banners"
        subtitle="Manage Homepage"
        toolbarLeft={
          <div className="flex flex-nowrap items-center gap-2">
            <select
              aria-label="Homepage slot"
              className={LIST_FILTER_FIELD_CLASS}
              value={positionFilter}
              onChange={(e) => {
                setPositionFilter(e.target.value as HomepageBannerPosition);
                setTableSearch('');
              }}
            >
              {HOMEPAGE_BANNER_POSITIONS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
              <option value="testimonials">Testimonials</option>
            </select>
            <ListTableSearchInput value={tableSearch} onChange={setTableSearch} />
          </div>
        }
        reserveActionsColumn
        actions={
          canAddMore
            ? [
                {
                  label: isSingleSlot ? '+ Upload slot' : '+ Add record',
                  onClick: openNew,
                },
              ]
            : []
        }
      />

      {isTestimonials ? (
        <Testimonials
          ref={testimonialsRef}
          embedded
          tableSearch={tableSearch}
          onTableSearchChange={setTableSearch}
        />
      ) : (
        <SectionCard>
          <DataTableWrapper
            columns={columns}
            data={rows}
            loading={loading}
            hideSearchInput
            filterText={tableSearch}
            onFilterTextChange={setTableSearch}
          />
        </SectionCard>
      )}

      {showForm && posConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-bold text-primary">
              {form.id ? 'Edit' : 'New'} — {posConfig.label}
            </h3>
            <p className="mt-1 text-xs text-slate-500">page=home · position={positionFilter}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {hasField(fields, 'image') && (
                <div className="sm:col-span-2">
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Image {posConfig.imageRequired ? '(required)' : '(optional)'} · {posConfig.aspectLabel}
                  </p>
                  <div className="flex flex-wrap items-start gap-4">
                    <button type="button" onClick={handlePickImage} className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5">
                      Upload & crop
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    {form.imageUrl && (
                      <img
                        src={bannerImageUrl(String(form.imageUrl))}
                        alt=""
                        className="max-h-28 rounded-lg border object-contain"
                      />
                    )}
                  </div>
                </div>
              )}

              {hasField(fields, 'title') && (
                <FormField label="Title" className="sm:col-span-2">
                  <input className={inputClass} value={form.title || ''} onChange={(e) => setField('title', e.target.value)} />
                </FormField>
              )}
              {hasField(fields, 'tag') && (
                <FormField label="Tag / badge">
                  <input className={inputClass} value={form.tag || ''} onChange={(e) => setField('tag', e.target.value)} />
                </FormField>
              )}
              {hasField(fields, 'subtitle') && (
                <FormField label="Subtitle">
                  <input className={inputClass} value={form.subtitle || ''} onChange={(e) => setField('subtitle', e.target.value)} />
                </FormField>
              )}
              {hasField(fields, 'ctaText') && (
                <FormField label="CTA text">
                  <input className={inputClass} value={form.ctaText || ''} onChange={(e) => setField('ctaText', e.target.value)} />
                </FormField>
              )}
              {hasField(fields, 'titleAccent') && (
                <FormField label="Title accent (script word)">
                  <input className={inputClass} value={form.titleAccent || ''} onChange={(e) => setField('titleAccent', e.target.value)} />
                </FormField>
              )}
              {hasField(fields, 'description') && (
                <FormField label="Description" className="sm:col-span-2">
                  <textarea
                    className={`${inputClass} min-h-[72px] py-2`}
                    value={form.description || ''}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Use | to split into tag pills on site"
                  />
                </FormField>
              )}
              {hasField(fields, 'overlayQuote') && (
                <FormField label="Overlay quote" className="sm:col-span-2">
                  <input className={inputClass} value={form.overlayQuote || ''} onChange={(e) => setField('overlayQuote', e.target.value)} />
                </FormField>
              )}
              {hasField(fields, 'linkUrl') && (
                <FormField label="Link URL" className="sm:col-span-2">
                  <input className={inputClass} value={form.linkUrl || ''} onChange={(e) => setField('linkUrl', e.target.value)} placeholder="https://…" />
                </FormField>
              )}
              {hasField(fields, 'variant') && (
                <FormField label="Variant">
                  <select className={inputClass} value={form.variant || 'blur'} onChange={(e) => setField('variant', e.target.value)}>
                    <option value="blur">blur</option>
                    <option value="yellow">yellow</option>
                    <option value="white">white</option>
                  </select>
                </FormField>
              )}
              {hasField(fields, 'focalPoint') && (
                <>
                  <FormField label="Focal X (0–100)">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className={inputClass}
                      value={form.focalPoint?.x ?? 50}
                      onChange={(e) =>
                        setField('focalPoint', {
                          x: Number(e.target.value),
                          y: form.focalPoint?.y ?? 50,
                        })
                      }
                    />
                  </FormField>
                  <FormField label="Focal Y (0–100)">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className={inputClass}
                      value={form.focalPoint?.y ?? 50}
                      onChange={(e) =>
                        setField('focalPoint', {
                          x: form.focalPoint?.x ?? 50,
                          y: Number(e.target.value),
                        })
                      }
                    />
                  </FormField>
                </>
              )}
              {hasField(fields, 'sortOrder') && (
                <FormField label="Sort order">
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={form.sortOrder ?? 1}
                    onChange={(e) => setField('sortOrder', Number(e.target.value))}
                  />
                </FormField>
              )}
              {hasField(fields, 'isActive') && (
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
              )}
              {hasField(fields, 'schedule') && (
                <>
                  <FormField label="Start date">
                    <input
                      type="date"
                      className={inputClass}
                      value={toDateInputValue(form.startDate as string | null)}
                      onChange={(e) => setField('startDate', e.target.value || null)}
                    />
                  </FormField>
                  <FormField label="End date">
                    <input
                      type="date"
                      className={inputClass}
                      value={toDateInputValue(form.endDate as string | null)}
                      onChange={(e) => setField('endDate', e.target.value || null)}
                    />
                  </FormField>
                </>
              )}
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

      {cropSrc && posConfig && (
        <ImageCropDialog
          open={Boolean(cropSrc)}
          imageSrc={cropSrc}
          aspect={posConfig.aspect}
          title={`Crop — ${posConfig.label}`}
          onClose={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onComplete={handleCropComplete}
        />
      )}

      {confirmDel && (
        <ConfirmDialog
          title="Delete banner"
          message="Remove this record? The public site will stop showing it."
          confirmLabel="Delete"
          onConfirm={() => void handleDelete()}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </ErrorBoundary>
  );
};
