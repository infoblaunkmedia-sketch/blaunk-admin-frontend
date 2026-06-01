import React, { forwardRef, useImperativeHandle } from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ClickableImageThumb } from '../../../shared/components/ImagePreview';
import { ImageCropDialog } from '../../../shared/components/ImageCropDialog';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { StarRatingPicker } from './StarRatingPicker';
import { CountrySelect } from './CountrySelect';
import {
  DESCRIPTION_MAX,
  OCCUPATION_LABELS,
  TESTIMONIAL_OCCUPATIONS,
  emptyTestimonial,
  type Testimonial,
  type TestimonialPayload,
} from './testimonials.types';
import {
  createTestimonial,
  deleteTestimonial,
  fetchTestimonials,
  updateTestimonial,
  uploadTestimonialPhoto,
} from './testimonials.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

const btnClass =
  'inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60';

export type TestimonialsHandle = {
  openNew: () => void;
};

type TestimonialsProps = {
  /** Hide own header when embedded in CMS Homepage Banners toolbar */
  embedded?: boolean;
  tableSearch?: string;
  onTableSearchChange?: (value: string) => void;
};

export const Testimonials = forwardRef<TestimonialsHandle, TestimonialsProps>(function Testimonials(
  { embedded = false, tableSearch: externalSearch, onTableSearchChange },
  ref,
) {
  const [internalSearch, setInternalSearch] = React.useState('');
  const tableSearch = externalSearch ?? internalSearch;
  const setTableSearch = onTableSearchChange ?? setInternalSearch;

  const [rows, setRows] = React.useState<Testimonial[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<TestimonialPayload>(emptyTestimonial());
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [cropSrc, setCropSrc] = React.useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchTestimonials());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  useImperativeHandle(ref, () => ({
    openNew: () => {
      setEditId(null);
      setForm(emptyTestimonial());
      setShowForm(true);
    },
  }));

  const setField = <K extends keyof TestimonialPayload>(key: K, value: TestimonialPayload[K]) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const openEdit = (row: Testimonial) => {
    setEditId(row.id);
    setForm({
      name: row.name,
      occupation: row.occupation,
      country: row.country,
      rating: row.rating,
      description: row.description,
      profilePhotoUrl: row.profilePhotoUrl,
      isActive: row.isActive,
    });
    setShowForm(true);
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return 'Name is required';
    if (!form.country.trim()) return 'Country is required';
    if (!form.description.trim()) return 'Description is required';
    if (form.description.trim().length > DESCRIPTION_MAX) {
      return `Description must be ${DESCRIPTION_MAX} characters or fewer`;
    }
    if (form.rating < 1 || form.rating > 5) return 'Rating must be between 1 and 5';
    return null;
  };

  const save = async () => {
    const err = validateForm();
    if (err) {
      toast.error(err);
      return;
    }
    setSaving(true);
    try {
      const payload: TestimonialPayload = {
        name: form.name.trim(),
        occupation: form.occupation,
        country: form.country.trim(),
        rating: form.rating,
        description: form.description.trim(),
        profilePhotoUrl: form.profilePhotoUrl.trim(),
        isActive: form.isActive,
      };
      if (editId) {
        await updateTestimonial(editId, payload);
        toast.success('Testimonial updated');
      } else {
        await createTestimonial(payload);
        toast.success('Testimonial created');
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyTestimonial());
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
      await deleteTestimonial(confirmDel);
      toast.success('Testimonial deleted');
      setConfirmDel(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const handleFilePick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      e.target.value = '';
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error('Image must be 1 MB or smaller');
      e.target.value = '';
      return;
    }
    setCropSrc(URL.createObjectURL(file));
    e.target.value = '';
  };

  const handleCropComplete = async (file: File, previewUrl: string) => {
    setUploadingPhoto(true);
    try {
      const url = await uploadTestimonialPhoto(file);
      setField('profilePhotoUrl', url);
      URL.revokeObjectURL(previewUrl);
      toast.success('Photo uploaded');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Photo upload failed');
    } finally {
      setUploadingPhoto(false);
      if (cropSrc) URL.revokeObjectURL(cropSrc);
      setCropSrc(null);
    }
  };

  const descLen = form.description.length;
  const displayed = tableSearch
    ? rows.filter((r) => {
        const q = tableSearch.toLowerCase();
        return (
          r.name.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q) ||
          OCCUPATION_LABELS[r.occupation].toLowerCase().includes(q)
        );
      })
    : rows;

  const columns: TableColumn<Testimonial>[] = [
    {
      name: 'Photo',
      width: '72px',
      cell: (r) =>
        r.profilePhotoUrl ? (
          <ClickableImageThumb
            src={r.profilePhotoUrl}
            alt={r.name}
            title={r.name}
            wrapClassName="my-1 block h-10 w-10 overflow-hidden rounded-full border border-slate-200 bg-slate-100"
          />
        ) : null,
    },
    { name: 'Name', selector: (r) => r.name, sortable: true, grow: 1.2 },
    {
      name: 'Occupation',
      selector: (r) => OCCUPATION_LABELS[r.occupation],
      sortable: true,
    },
    { name: 'Country', selector: (r) => r.country, grow: 1 },
    { name: 'Rating', selector: (r) => r.rating, width: '80px', center: true },
    {
      name: 'Description',
      selector: (r) => r.description,
      grow: 2,
      wrap: true,
    },
    {
      name: 'Status',
      cell: (r) => <StatusBadge status={r.isActive ? 'Active' : 'Inactive'} />,
      width: '100px',
    },
    {
      name: 'Actions',
      width: '140px',
      cell: (r) => (
        <div className="flex gap-2">
          <button type="button" className="text-sm font-semibold text-primary" onClick={() => openEdit(r)}>
            Edit
          </button>
          <button
            type="button"
            className="text-sm font-semibold text-red-600"
            onClick={() => setConfirmDel(r.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <ErrorBoundary>
      {!embedded ? (
        <PageHeader
          title="Testimonials"
          subtitle="Homepage customer testimonials"
          actions={[{ label: '+ Add', onClick: () => { setEditId(null); setForm(emptyTestimonial()); setShowForm(true); }}]}
        />
      ) : null}

      <DataTableWrapper
        columns={columns}
        data={displayed}
        loading={loading}
        hideSearchInput={embedded}
        filterText={tableSearch}
        onFilterTextChange={setTableSearch}
        className={embedded ? '' : 'mb-5'}
      />

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-bold text-primary">{editId ? 'Edit testimonial' : 'New testimonial'}</h3>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Name" required>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                />
              </FormField>

              <FormField label="Occupation" required>
                <select
                  className={inputClass}
                  value={form.occupation}
                  onChange={(e) =>
                    setField('occupation', e.target.value as TestimonialPayload['occupation'])
                  }
                >
                  {TESTIMONIAL_OCCUPATIONS.map((occ) => (
                    <option key={occ} value={occ}>
                      {OCCUPATION_LABELS[occ]}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Country" required>
                <CountrySelect
                  value={form.country}
                  onChange={(name) => setField('country', name)}
                  disabled={saving}
                />
              </FormField>

              <FormField label="Rating" required>
                <StarRatingPicker value={form.rating} onChange={(r) => setField('rating', r)} />
              </FormField>

              <FormField label="Active">
                <label className="flex h-9 items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setField('isActive', e.target.checked)}
                  />
                  Show on homepage
                </label>
              </FormField>

              <div className="md:col-span-2">
                <FormField label={`Description (${descLen}/${DESCRIPTION_MAX})`} required>
                  <textarea
                    className="min-h-[72px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-primary"
                    value={form.description}
                    maxLength={DESCRIPTION_MAX}
                    onChange={(e) => setField('description', e.target.value)}
                  />
                  <p className={`mt-1 text-xs ${descLen >= DESCRIPTION_MAX ? 'text-amber-600' : 'text-slate-500'}`}>
                    {DESCRIPTION_MAX - descLen} characters remaining
                  </p>
                </FormField>
              </div>

              <div className="md:col-span-2">
                <FormField label="Profile photo">
                  <div className="flex flex-wrap items-start gap-4">
                    <button
                      type="button"
                      className={btnClass}
                      disabled={uploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadingPhoto
                        ? 'Uploading…'
                        : form.profilePhotoUrl
                          ? 'Replace photo'
                          : 'Upload & crop'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFilePick}
                    />
                    {form.profilePhotoUrl ? (
                      <img
                        src={form.profilePhotoUrl}
                        alt="Profile"
                        className="h-20 w-20 rounded-full border border-slate-200 object-cover"
                      />
                    ) : null}
                  </div>
                </FormField>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button type="button" className={btnClass} disabled={saving} onClick={() => void save()}>
                {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                className={btnClass}
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                  setForm(emptyTestimonial());
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {cropSrc ? (
        <ImageCropDialog
          open
          imageSrc={cropSrc}
          aspect={1}
          title="Crop profile photo"
          onClose={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onComplete={handleCropComplete}
        />
      ) : null}

      {confirmDel ? (
        <ConfirmDialog
          title="Delete testimonial"
          message="Remove this testimonial permanently?"
          confirmLabel="Delete"
          onConfirm={() => void handleDelete()}
          onCancel={() => setConfirmDel(null)}
        />
      ) : null}
    </ErrorBoundary>
  );
});
