import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { FormField } from '../../../shared/components/FormField';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ImageUploader } from '../../../shared/components/ImageUploader';
import { ClickableImageThumb } from '../../../shared/components/ImagePreview';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { CmsImage, ImageStatus } from '../cms.types';
import { fetchCmsImages, saveCmsImage, deleteCmsImage, updateImageStatus } from '../cms.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const SECTION_TAGS = [
  'Homepage Hero', 'Homepage Banner', 'About Us', 'Services',
  'DSA Portal', 'BGT', 'Tour', 'Cake', 'Store', 'Boutique', 'Logistic', 'Other',
];

const emptyForm = () => ({ sectionTag: '', status: 'Active' as ImageStatus });

export const ImageLibrary: React.FC = () => {
  const [images, setImages] = React.useState<CmsImage[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm());
  const [croppedUrl, setCroppedUrl] = React.useState<string>('');
  const [croppedFile, setCroppedFile] = React.useState<File | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = React.useState('');
  const [tableSearch, setTableSearch] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setImages(await fetchCmsImages());
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleFile = (file: File, url: string) => {
    setCroppedUrl(url);
    setCroppedFile(file);
  };

  const handleSave = async () => {
    if (!croppedUrl) { toast.error('Upload and crop an image first'); return; }
    if (!form.sectionTag) { toast.error('Select a section tag'); return; }
    setSaving(true);
    try {
      const image: CmsImage = {
        id: crypto.randomUUID(),
        url: croppedUrl,
        thumbnailUrl: croppedUrl,
        sectionTag: form.sectionTag,
        uploadDate: new Date().toISOString().slice(0, 10),
        status: form.status,
        fileName: croppedFile?.name ?? 'image',
        sizeKb: croppedFile ? Math.round(croppedFile.size / 1024) : 0,
      };
      await saveCmsImage(image);
      toast.success('Image uploaded');
      setShowForm(false);
      setForm(emptyForm());
      setCroppedUrl('');
      setCroppedFile(null);
      load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleToggleStatus = async (img: CmsImage) => {
    const next: ImageStatus = img.status === 'Active' ? 'Inactive' : 'Active';
    await updateImageStatus(img.id, next);
    toast.success(`Image set to ${next}`);
    load();
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    await deleteCmsImage(confirmDel);
    setConfirmDel(null);
    load();
    toast.success('Image deleted');
  };

  const displayed = sectionFilter ? images.filter((i) => i.sectionTag === sectionFilter) : images;

  const columns: TableColumn<CmsImage>[] = [
    {
      name: 'Thumbnail',
      cell: (r) => (
        <ClickableImageThumb
          src={r.thumbnailUrl}
          alt={r.fileName}
          title={r.fileName}
          wrapClassName="my-1 block h-12 w-16 overflow-hidden rounded border border-slate-200 bg-slate-50"
        />
      ),
      width: '90px',
    },
    { name: 'File Name', selector: (r) => r.fileName, sortable: true, grow: 2 },
    { name: 'Section', selector: (r) => r.sectionTag, width: '150px', sortable: true },
    { name: 'Size', selector: (r) => `${r.sizeKb} KB`, width: '90px' },
    { name: 'Uploaded', selector: (r) => r.uploadDate, width: '110px', sortable: true },
    { name: 'Status', cell: (r) => <StatusBadge status={r.status} />, width: '100px' },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => handleToggleStatus(r)}
            className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10">
            {r.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
          <button type="button" onClick={() => setConfirmDel(r.id)}
            className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
        </div>
      ),
      width: '160px', ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="Image Library"
        subtitle="Upload and manage images used across the public website."
        beforeActions={<ListTableSearchInput value={tableSearch} onChange={setTableSearch} />}
        actions={[{ label: '+ Upload Image', onClick: () => { setShowForm(true); setForm(emptyForm()); setCroppedUrl(''); } }]} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-600">Section:</span>
        <button type="button" onClick={() => setSectionFilter('')}
          className={['rounded-lg border px-3 py-1 text-xs font-semibold transition',
            !sectionFilter ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'].join(' ')}>
          All
        </button>
        {SECTION_TAGS.slice(0, 6).map((s) => (
          <button key={s} type="button" onClick={() => setSectionFilter(s)}
            className={['rounded-lg border px-3 py-1 text-xs font-semibold transition',
              sectionFilter === s ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'].join(' ')}>
            {s}
          </button>
        ))}
      </div>

      {showForm && (
        <SectionCard title="Upload Image" className="mb-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-700">Image (crop before upload)</p>
              <ImageUploader onFile={handleFile} maxSizeMB={5} label="Upload CMS Image" />
            </div>
            <div className="space-y-4">
              <FormField label="Section Tag" required>
                <select className={inputClass} value={form.sectionTag}
                  onChange={(e) => setField('sectionTag', e.target.value)}>
                  <option value="">Select section…</option>
                  {SECTION_TAGS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="Status">
                <select className={inputClass} value={form.status}
                  onChange={(e) => setField('status', e.target.value as ImageStatus)}>
                  <option>Active</option><option>Inactive</option>
                </select>
              </FormField>
              {croppedUrl && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-slate-500">Preview</p>
                  <img src={croppedUrl} alt="Preview" className="h-32 w-full rounded-lg object-cover" />
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" disabled={saving} onClick={handleSave}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {saving ? 'Saving…' : 'Upload Image'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setCroppedUrl(''); }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </SectionCard>
      )}

      <DataTableWrapper columns={columns} data={displayed} loading={loading} searchable
        filterText={tableSearch} onFilterTextChange={setTableSearch} hideSearchInput />

      {confirmDel && (
        <ConfirmDialog title="Delete Image" message="Delete this image permanently? It may still be in use on the website."
          confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />
      )}
    </ErrorBoundary>
  );
};
