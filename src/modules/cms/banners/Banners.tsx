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
  BANNER_CMS_PAGES,
  apiPageForCmsPage,
  canAddRecordForSlot,
  defaultSlotForPage,
  getSlotConfig,
  pageLabel,
  positionOptionsForPage,
  type BannerCmsPage,
  type BannerCmsSlot,
} from './bannerPageConfig';
import type { DiscoveryHubConfig, HomepageBannerField } from './homepageBannerConfig';
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

/** CMS banner slot: page-specific positions or homepage testimonials manager */
export type { BannerCmsSlot };

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

function hasField(fields: HomepageBannerField[], key: HomepageBannerField) {
  return fields.includes(key);
}

const FULL_WIDTH_FORM_FIELDS = new Set<HomepageBannerField>([
  'description',
  'overlayQuote',
  'linkUrl',
]);

const HALF_WIDTH_FORM_FIELDS = new Set<HomepageBannerField>([
  'title',
  'tag',
  'subtitle',
  'ctaText',
  'titleAccent',
  'variant',
  'isActive',
  'slideSlot',
  'chipSlot',
]);

function layoutFieldsForForm(
  fields: HomepageBannerField[],
  slotPicker: boolean,
  chipPicker = false,
): HomepageBannerField[] {
  let result = fields;
  if (slotPicker && !result.includes('slideSlot')) {
    result = [...result, 'slideSlot'];
  }
  if (chipPicker && !result.includes('chipSlot')) {
    result = [...result, 'chipSlot'];
  }
  return result;
}

function formFieldColClass(field: HomepageBannerField, fields: HomepageBannerField[]): string {
  if (field === 'image' || FULL_WIDTH_FORM_FIELDS.has(field)) {
    return 'sm:col-span-2';
  }
  if (!HALF_WIDTH_FORM_FIELDS.has(field)) {
    return 'sm:col-span-2';
  }
  const halfFields = fields.filter((f) => HALF_WIDTH_FORM_FIELDS.has(f));
  if (halfFields.length === 1) return 'sm:col-span-2';
  if (halfFields.length === 2) return '';
  const idx = halfFields.indexOf(field);
  if (idx === halfFields.length - 1 && halfFields.length % 2 === 1) {
    return 'sm:col-span-2';
  }
  return '';
}

function nextAvailableSlot(
  rows: Banner[],
  max: number,
  start = 1,
  excludeId?: string,
): number {
  const used = new Set(rows.filter((r) => r.id !== excludeId).map((r) => r.sortOrder));
  for (let n = start; n < start + max; n += 1) {
    if (!used.has(n)) return n;
  }
  return start;
}

function nextAutoSortOrder(rows: Banner[], excludeId?: string): number {
  const orders = rows.filter((r) => r.id !== excludeId).map((r) => Number(r.sortOrder) || 0);
  if (orders.length === 0) return 1;
  return Math.max(...orders, 0) + 1;
}

function nextChipSlot(rows: Banner[], max: number, excludeId?: string): number {
  const used = new Set(
    rows.filter((r) => r.id !== excludeId && Number(r.sortOrder) > 0).map((r) => r.sortOrder),
  );
  for (let n = 1; n <= max; n += 1) {
    if (!used.has(n)) return n;
  }
  return 1;
}

function resolveSortOrder(
  rows: Banner[],
  form: BannerPayload,
  maxRecords: number | undefined,
  slotPicker: boolean,
  discoveryHub?: DiscoveryHubConfig,
  sortOrderStart = 1,
): number {
  if (discoveryHub) {
    if (Number(form.sortOrder) === 0) return 0;
    return Number(form.sortOrder) || nextChipSlot(rows, discoveryHub.chipCount, form.id);
  }
  if (maxRecords === 1 && sortOrderStart === 1) return 1;
  if (maxRecords === 1) return sortOrderStart;
  if (slotPicker) {
    return Number.isFinite(Number(form.sortOrder))
      ? Number(form.sortOrder)
      : nextAvailableSlot(rows, maxRecords ?? 3, sortOrderStart, form.id);
  }
  if (form.id) return Number(form.sortOrder) ?? sortOrderStart;
  if (sortOrderStart === 0) {
    const orders = rows.filter((r) => r.id !== form.id).map((r) => Number(r.sortOrder));
    if (orders.length === 0) return 0;
    return Math.max(...orders, -1) + 1;
  }
  return nextAutoSortOrder(rows, form.id);
}

function slideSlotLabel(n: number) {
  return `Slide ${n}`;
}

function chipSlotLabel(n: number) {
  return `Chip ${n}`;
}

function discoveryRoleLabel(sortOrder: number, cardStyle = false) {
  if (sortOrder === 0) return 'Header';
  return cardStyle ? `Card ${sortOrder}` : chipSlotLabel(sortOrder);
}

export const Banners: React.FC = () => {
  const [pageFilter, setPageFilter] = React.useState<BannerCmsPage>('home');
  const [positionFilter, setPositionFilter] = React.useState<BannerCmsSlot>('hero');
  const testimonialsRef = React.useRef<TestimonialsHandle>(null);
  const apiPage = apiPageForCmsPage(pageFilter);
  const isTestimonials = pageFilter === 'home' && positionFilter === 'testimonials';
  const [rows, setRows] = React.useState<Banner[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState<BannerPayload>(emptyBanner('home', 'hero'));
  const [showForm, setShowForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [cropSrc, setCropSrc] = React.useState<string | null>(null);
  const [tableSearch, setTableSearch] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const posConfig = isTestimonials ? null : getSlotConfig(pageFilter, positionFilter);
  const canAddMore = isTestimonials ? true : canAddRecordForSlot(pageFilter, positionFilter, rows.length);
  const discoveryHub = posConfig?.discoveryHub;
  const isDiscovery = Boolean(discoveryHub);
  const isSingleSlot = posConfig?.maxRecords === 1 && !isDiscovery;
  const slotPicker = Boolean(posConfig?.slotPicker && (posConfig.maxRecords ?? 0) > 1);
  const slotOptions = positionOptionsForPage(pageFilter);
  const formIsHeader = isDiscovery && Number(form.sortOrder) === 0;
  const activeFormFields = isDiscovery
    ? (formIsHeader ? discoveryHub!.headerFields : discoveryHub!.chipFields)
    : (posConfig?.fields ?? []);
  const chipPicker = isDiscovery && !formIsHeader;
  const discoveryHasTag = Boolean(
    discoveryHub
    && (discoveryHub.headerFields.includes('tag') || discoveryHub.chipFields.includes('tag')),
  );
  const discoveryHasCardImages = Boolean(discoveryHub?.chipFields.includes('image'));
  const sortOrderStart = posConfig?.sortOrderStart ?? 1;

  const handlePageChange = (nextPage: BannerCmsPage) => {
    setPageFilter(nextPage);
    setPositionFilter(defaultSlotForPage(nextPage));
    setTableSearch('');
  };

  const load = React.useCallback(async () => {
    if (isTestimonials) return;
    setLoading(true);
    try {
      setRows(
        await fetchBanners({
          page: apiPage,
          position: positionFilter === 'testimonials' ? undefined : positionFilter,
        }),
      );
    } catch {
      toast.error(`Failed to load ${pageLabel(pageFilter)} banners`);
    } finally {
      setLoading(false);
    }
  }, [apiPage, positionFilter, isTestimonials, pageFilter]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    if (isTestimonials) {
      testimonialsRef.current?.openNew();
      return;
    }
    if (!canAddMore) {
      toast.info(
        isDiscovery
          ? 'This discovery card is full. Edit or delete an existing row first.'
          : 'This slot allows only one record. Edit the existing row or delete it first.',
      );
      return;
    }
    const slot = positionFilter === 'testimonials' ? 'hero' : positionFilter;
    const base = emptyBanner(apiPage, slot);
    if (discoveryHub) {
      const hasHeader = rows.some((r) => Number(r.sortOrder) === 0);
      if (!hasHeader) {
        setForm({ ...base, sortOrder: 0 });
      } else {
        setForm({ ...base, sortOrder: nextChipSlot(rows, discoveryHub.chipCount) });
      }
      setShowForm(true);
      return;
    }
    setForm(
      slotPicker && posConfig?.maxRecords
        ? { ...base, sortOrder: nextAvailableSlot(rows, posConfig.maxRecords, sortOrderStart) }
        : base,
    );
    setShowForm(true);
  };

  const openEdit = (row: Banner) => {
    setForm({ ...row, sortOrder: row.sortOrder ?? 1 });
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
    setUploading(true);
    try {
      const path = await uploadBannerImage(file, {
        page: apiPage,
        position: positionFilter === 'testimonials' ? 'hero' : positionFilter,
      });
      setField('imageUrl', path);
      URL.revokeObjectURL(previewUrl);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!posConfig) return;
    if (discoveryHub && !formIsHeader && discoveryHasCardImages && !String(form.imageUrl || '').trim()) {
      toast.error('Image is required for carousel slides');
      return;
    }
    if (posConfig.imageRequired && !String(form.imageUrl || '').trim()) {
      toast.error('Image is required for this slot');
      return;
    }

    const sortOrder = resolveSortOrder(
      rows,
      form,
      posConfig.maxRecords,
      slotPicker,
      discoveryHub,
      sortOrderStart,
    );

    if (discoveryHub) {
      if (sortOrder === 0) {
        const headerConflict = rows.find((r) => Number(r.sortOrder) === 0 && r.id !== form.id);
        if (headerConflict) {
          toast.error('Header already exists for this card.');
          return;
        }
      } else {
        const chipConflict = rows.find((r) => r.sortOrder === sortOrder && r.id !== form.id);
        if (chipConflict) {
          toast.error(
            `${discoveryHasCardImages ? `Card ${sortOrder}` : chipSlotLabel(sortOrder)} is already in use. Pick another slot.`,
          );
          return;
        }
      }
    } else if (slotPicker) {
      const conflict = rows.find((r) => r.sortOrder === sortOrder && r.id !== form.id);
      if (conflict) {
        toast.error(`${slideSlotLabel(sortOrder)} is already in use. Pick another slide.`);
        return;
      }
    }

    setSaving(true);
    try {
      const payload: BannerPayload = {
        ...form,
        page: apiPage,
        position: positionFilter === 'testimonials' ? 'hero' : positionFilter,
        sortOrder,
        linkUrl: hasField(activeFormFields, 'linkUrl') ? String(form.linkUrl || '').trim() : '',
        focalPoint: { x: 50, y: 50 },
        startDate: null,
        endDate: null,
      };
      if (form.id) await updateBanner(form.id, payload);
      else await createBanner(payload);
      toast.success('Saved');
      setShowForm(false);
      setForm(emptyBanner(apiPage, positionFilter === 'testimonials' ? 'hero' : positionFilter));
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

  const columns: TableColumn<Banner>[] = isDiscovery
    ? [
        {
          name: 'Role',
          selector: (r) => discoveryRoleLabel(Number(r.sortOrder) || 0, discoveryHasCardImages),
          width: '90px',
          sortable: true,
        },
        ...(discoveryHasTag
          ? [{ name: 'Tag', selector: (r: Banner) => r.tag || '—', width: '100px' } as TableColumn<Banner>]
          : []),
        { name: 'Title', selector: (r) => r.title || '—', grow: 1.5 },
        ...(discoveryHasCardImages
          ? [
              {
                name: 'Preview',
                width: '90px',
                cell: (r: Banner) =>
                  Number(r.sortOrder) > 0 && r.imageUrl ? (
                    <ClickableImageThumb
                      src={bannerImageUrl(r.imageUrl)}
                      alt={r.title || 'Card'}
                      title={r.title || undefined}
                    />
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  ),
              } as TableColumn<Banner>,
            ]
          : []),
        {
          name: 'Detail',
          selector: (r) => {
            if (Number(r.sortOrder) === 0) {
              if (discoveryHub?.headerFields.includes('description')) {
                const d = r.description || '';
                return d.length > 72 ? `${d.slice(0, 72)}…` : d || '—';
              }
              return r.subtitle || '—';
            }
            return r.linkUrl || '—';
          },
          grow: 2,
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
      ]
    : [
        ...(slotPicker
          ? [
              {
                name: 'Slide',
                selector: (r: Banner) => slideSlotLabel(r.sortOrder),
                width: '90px',
                sortable: true,
              } as TableColumn<Banner>,
            ]
          : []),
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
              <ClickableImageThumb
                src={bannerImageUrl(r.imageUrl)}
                alt={r.title || r.tag || 'Banner'}
                title={r.title || r.tag || undefined}
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

  const formLayoutFields = layoutFieldsForForm(activeFormFields, slotPicker, chipPicker);
  const fieldCol = (key: HomepageBannerField) => formFieldColClass(key, formLayoutFields);

  return (
    <ErrorBoundary>
      <PageHeader
        title="Upload"
        subtitle={`Manage ${pageLabel(pageFilter)} content slots`}
        toolbarLeft={
          <div className="flex flex-nowrap items-center gap-2">
            <select
              aria-label="Page"
              className={LIST_FILTER_FIELD_CLASS}
              value={pageFilter}
              onChange={(e) => handlePageChange(e.target.value as BannerCmsPage)}
            >
              {BANNER_CMS_PAGES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <select
              aria-label="Banner slot"
              className={LIST_FILTER_FIELD_CLASS}
              value={positionFilter}
              onChange={(e) => {
                setPositionFilter(e.target.value as BannerCmsSlot);
                setTableSearch('');
              }}
            >
              {slotOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
              {pageFilter === 'home' && <option value="testimonials">Testimonials</option>}
            </select>
            <ListTableSearchInput value={tableSearch} onChange={setTableSearch} />
          </div>
        }
        reserveActionsColumn
        actions={
          canAddMore
            ? [
                {
                  label: isDiscovery
                    ? rows.some((r) => r.sortOrder === 0)
                      ? discoveryHasCardImages
                        ? '+ Add card'
                        : '+ Add chip'
                      : '+ Add header'
                    : isSingleSlot
                      ? '+ Upload slot'
                      : '+ Add record',
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
        <DataTableWrapper
          columns={columns}
          data={rows}
          loading={loading}
          hideSearchInput
          filterText={tableSearch}
          onFilterTextChange={setTableSearch}
        />
      )}

      {showForm && posConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-bold text-primary">
              {form.id ? 'Edit' : 'New'} — {posConfig.label}
              {isDiscovery
                ? formIsHeader
                  ? ' · Header'
                  : ` · ${discoveryHasCardImages ? `Card ${form.sortOrder ?? 1}` : chipSlotLabel(form.sortOrder ?? 1)}`
                : ''}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              page={apiPage} · position={positionFilter}
              {slotPicker && !form.id ? (
                <>
                  {' '}
                  · assigning{' '}
                  {slideSlotLabel(
                    form.sortOrder ?? nextAvailableSlot(rows, posConfig.maxRecords ?? 3, sortOrderStart),
                  )}
                </>
              ) : null}
              {chipPicker && !form.id && discoveryHub ? (
                <>
                  {' '}
                  · assigning{' '}
                  {discoveryHasCardImages
                    ? `Card ${form.sortOrder ?? nextChipSlot(rows, discoveryHub.chipCount)}`
                    : chipSlotLabel(form.sortOrder ?? nextChipSlot(rows, discoveryHub.chipCount))}
                </>
              ) : null}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {hasField(activeFormFields, 'image') && (
                <div className="sm:col-span-2">
                  <p className="mb-2 text-sm font-semibold text-slate-700">
                    Image{' '}
                    {posConfig.imageRequired || (discoveryHasCardImages && !formIsHeader)
                      ? '(required)'
                      : '(optional)'}{' '}
                    · {posConfig.aspectLabel}
                  </p>
                  <div className="flex flex-wrap items-start gap-4">
                    <button
                      type="button"
                      onClick={handlePickImage}
                      disabled={uploading}
                      className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {uploading ? 'Uploading…' : 'Upload & crop'}
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    {form.imageUrl && (
                      <ClickablePreviewImage
                        src={bannerImageUrl(String(form.imageUrl))}
                        alt={form.title || 'Banner preview'}
                        title={`${posConfig.label} · ${posConfig.aspectLabel}`}
                        aspectRatio={posConfig.aspect}
                      />
                    )}
                  </div>
                </div>
              )}

              {hasField(activeFormFields, 'title') && (
                <FormField
                  label={
                    isDiscovery
                      ? formIsHeader
                        ? 'Main title'
                        : discoveryHasCardImages
                          ? 'Card title'
                          : 'Chip label'
                      : 'Title'
                  }
                  className={fieldCol('title')}
                >
                  <input className={inputClass} value={form.title || ''} onChange={(e) => setField('title', e.target.value)} />
                </FormField>
              )}
              {hasField(activeFormFields, 'tag') && (
                <FormField
                  label={isDiscovery ? (formIsHeader ? 'Eyebrow' : 'Emoji icon') : 'Tag / badge'}
                  className={fieldCol('tag')}
                >
                  <input className={inputClass} value={form.tag || ''} onChange={(e) => setField('tag', e.target.value)} placeholder={formIsHeader ? 'Discovery' : '💎'} />
                </FormField>
              )}
              {hasField(activeFormFields, 'subtitle') && (
                <FormField label={isDiscovery && formIsHeader ? 'Accent text' : 'Subtitle'} className={fieldCol('subtitle')}>
                  <input className={inputClass} value={form.subtitle || ''} onChange={(e) => setField('subtitle', e.target.value)} />
                </FormField>
              )}
              {hasField(activeFormFields, 'ctaText') && (
                <FormField label="CTA text" className={fieldCol('ctaText')}>
                  <input className={inputClass} value={form.ctaText || ''} onChange={(e) => setField('ctaText', e.target.value)} />
                </FormField>
              )}
              {hasField(activeFormFields, 'titleAccent') && (
                <FormField label="Title accent (script word)" className={fieldCol('titleAccent')}>
                  <input className={inputClass} value={form.titleAccent || ''} onChange={(e) => setField('titleAccent', e.target.value)} />
                </FormField>
              )}
              {hasField(activeFormFields, 'description') && (
                <FormField
                  label={formIsHeader && isDiscovery ? 'Directory intro' : 'Description'}
                  className={fieldCol('description')}
                >
                  <textarea
                    className={`${inputClass} min-h-[88px] py-2`}
                    value={form.description || ''}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder={
                      formIsHeader && isDiscovery
                        ? 'Intro text shown above the advantage cards'
                        : 'Use | to split into tag pills on site'
                    }
                  />
                </FormField>
              )}
              {hasField(activeFormFields, 'overlayQuote') && (
                <FormField label="Overlay quote" className={fieldCol('overlayQuote')}>
                  <input className={inputClass} value={form.overlayQuote || ''} onChange={(e) => setField('overlayQuote', e.target.value)} />
                </FormField>
              )}
              {hasField(activeFormFields, 'linkUrl') && (
                <FormField
                  label={
                    isDiscovery
                      ? 'Navigation path'
                      : hasField(activeFormFields, 'ctaText')
                        ? 'Button link'
                        : 'Link'
                  }
                  className={fieldCol('linkUrl')}
                >
                  <input
                    className={inputClass}
                    value={form.linkUrl || ''}
                    onChange={(e) => setField('linkUrl', e.target.value)}
                    placeholder={isDiscovery ? '/section/BGT Trading' : '/path or https://…'}
                  />
                </FormField>
              )}
              {hasField(activeFormFields, 'variant') && (
                <FormField label="Variant" className={fieldCol('variant')}>
                  <select className={inputClass} value={form.variant || 'blur'} onChange={(e) => setField('variant', e.target.value)}>
                    <option value="blur">blur</option>
                    <option value="yellow">yellow</option>
                    <option value="white">white</option>
                  </select>
                </FormField>
              )}
              {(hasField(activeFormFields, 'slideSlot') || slotPicker) && posConfig.maxRecords && (
                <FormField label="Slide slot" className={fieldCol('slideSlot')}>
                  <select
                    className={inputClass}
                    value={form.sortOrder ?? sortOrderStart}
                    onChange={(e) => setField('sortOrder', Number(e.target.value))}
                  >
                    {Array.from({ length: posConfig.maxRecords }, (_, i) => sortOrderStart + i).map((n) => {
                      const taken = rows.some((r) => r.sortOrder === n && r.id !== form.id);
                      return (
                        <option key={n} value={n} disabled={taken && form.sortOrder !== n}>
                          {slideSlotLabel(n)}
                          {taken && form.sortOrder !== n ? ' (in use)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </FormField>
              )}
              {(hasField(activeFormFields, 'chipSlot') || chipPicker) && discoveryHub && (
                <FormField
                  label={discoveryHasCardImages ? 'Card slot' : 'Chip slot'}
                  className={fieldCol('chipSlot')}
                >
                  <select
                    className={inputClass}
                    value={form.sortOrder ?? 1}
                    onChange={(e) => setField('sortOrder', Number(e.target.value))}
                  >
                    {Array.from({ length: discoveryHub.chipCount }, (_, i) => i + 1).map((n) => {
                      const taken = rows.some(
                        (r) => Number(r.sortOrder) === n && r.id !== form.id,
                      );
                      return (
                        <option key={n} value={n} disabled={taken && form.sortOrder !== n}>
                          {discoveryHasCardImages ? `Card ${n}` : chipSlotLabel(n)}
                          {taken && form.sortOrder !== n ? ' (in use)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </FormField>
              )}
              {hasField(activeFormFields, 'isActive') && (
                <FormField label="Active" className={fieldCol('isActive')}>
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
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                disabled={saving || uploading}
                onClick={() => void save()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => setShowForm(false)}
                className="text-sm text-slate-600 disabled:opacity-60"
              >
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
          subtitle={`${posConfig.label} · Crop ${posConfig.aspectLabel} · Max 5MB · JPG, PNG, WebP · Drag to reposition · scroll to zoom`}
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
