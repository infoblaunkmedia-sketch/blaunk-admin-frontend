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
import type { PageContentBlock, PageContentStatus } from '../cms.types';
import { fetchPageContent, savePageContent, deletePageContent, updatePageContentStatus } from '../cms.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const PAGES = ['Homepage', 'About Us', 'Services', 'DSA Portal', 'BGT', 'Tour', 'Cake', 'Store', 'Boutique', 'Contact'];
const SECTIONS = ['Hero', 'Banner', 'Text Block', 'Card', 'Footer', 'CTA', 'FAQ', 'Testimonials'];

const emptyForm = (): Omit<PageContentBlock, 'id' | 'updatedAt' | 'updatedBy'> => ({
  page: '', section: '', title: '', body: '', status: 'Active',
});

export const PageContent: React.FC = () => {
  const [blocks, setBlocks] = React.useState<PageContentBlock[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm());
  const [editId, setEditId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [pageFilter, setPageFilter] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setBlocks(await fetchPageContent());
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const openNew = () => { setForm(emptyForm()); setEditId(null); setShowForm(true); };

  const openEdit = (b: PageContentBlock) => {
    setForm({ page: b.page, section: b.section, title: b.title, body: b.body, status: b.status });
    setEditId(b.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.page) { toast.error('Select a page'); return; }
    if (!form.title.trim()) { toast.error('Title required'); return; }
    setSaving(true);
    try {
      await savePageContent({
        id: editId ?? crypto.randomUUID(),
        ...form,
        updatedAt: new Date().toISOString(),
        updatedBy: 'Admin',
      });
      toast.success(editId ? 'Content block updated' : 'Content block created');
      setShowForm(false);
      setEditId(null);
      load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleToggleStatus = async (b: PageContentBlock) => {
    const next: PageContentStatus = b.status === 'Active' ? 'Inactive' : 'Active';
    await updatePageContentStatus(b.id, next);
    toast.success(`Block set to ${next}`);
    load();
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    await deletePageContent(confirmDel);
    setConfirmDel(null);
    load();
    toast.success('Content block deleted');
  };

  const displayed = pageFilter ? blocks.filter((b) => b.page === pageFilter) : blocks;

  const columns: TableColumn<PageContentBlock>[] = [
    { name: 'Page', selector: (r) => r.page, width: '130px', sortable: true },
    { name: 'Section', selector: (r) => r.section, width: '120px' },
    { name: 'Title', selector: (r) => r.title, sortable: true, grow: 2 },
    { name: 'Last Updated', selector: (r) => r.updatedAt.slice(0, 10), width: '120px', sortable: true },
    { name: 'Updated By', selector: (r) => r.updatedBy, width: '110px' },
    { name: 'Status', cell: (r) => <StatusBadge status={r.status} />, width: '100px' },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => openEdit(r)}
            className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10">Edit</button>
          <button type="button" onClick={() => handleToggleStatus(r)}
            className="rounded px-2 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50">
            {r.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
          <button type="button" onClick={() => setConfirmDel(r.id)}
            className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Del</button>
        </div>
      ),
      width: '200px', ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="Page Content"
        subtitle="Manage text blocks, banners, and content sections per page."
        actions={[{ label: '+ New Block', onClick: openNew }]} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-600">Page:</span>
        <button type="button" onClick={() => setPageFilter('')}
          className={['rounded-lg border px-3 py-1 text-xs font-semibold transition',
            !pageFilter ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'].join(' ')}>
          All
        </button>
        {PAGES.slice(0, 6).map((p) => (
          <button key={p} type="button" onClick={() => setPageFilter(p)}
            className={['rounded-lg border px-3 py-1 text-xs font-semibold transition',
              pageFilter === p ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'].join(' ')}>
            {p}
          </button>
        ))}
      </div>

      {showForm && (
        <SectionCard title={editId ? 'Edit Content Block' : 'New Content Block'} className="mb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Page" required>
              <select className={inputClass} value={form.page}
                onChange={(e) => setField('page', e.target.value)}>
                <option value="">Select page…</option>
                {PAGES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </FormField>
            <FormField label="Section">
              <select className={inputClass} value={form.section}
                onChange={(e) => setField('section', e.target.value)}>
                <option value="">Select section…</option>
                {SECTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select className={inputClass} value={form.status}
                onChange={(e) => setField('status', e.target.value as PageContentStatus)}>
                <option>Active</option><option>Inactive</option>
              </select>
            </FormField>
            <FormField label="Title" required className="sm:col-span-2">
              <input className={inputClass} value={form.title}
                onChange={(e) => setField('title', e.target.value)} />
            </FormField>
            <FormField label="Body Content" className="sm:col-span-3">
              <textarea className={`${inputClass} h-auto py-2`} rows={5} value={form.body}
                onChange={(e) => setField('body', e.target.value)}
                placeholder="Enter the page content, banner text, or description…" />
            </FormField>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" disabled={saving} onClick={handleSave}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {saving ? 'Saving…' : editId ? 'Update Block' : 'Create Block'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </SectionCard>
      )}

      <DataTableWrapper columns={columns} data={displayed} loading={loading} searchable />

      {confirmDel && (
        <ConfirmDialog title="Delete Content Block" message="Delete this content block permanently?"
          confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />
      )}
    </ErrorBoundary>
  );
};
