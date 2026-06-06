import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { FormField } from '../../../shared/components/FormField';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { formatDateDDMMYYYY } from '../../../shared/utils/dateFormat';
import { DEPARTMENTS } from '../../../shared/constants/hrConstants';
import type { ThirdPartyCredential } from '../channelPartners.types';
import { fetchCredentials, saveCredential, deleteCredential } from '../channelPartners.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const emptyForm = (): Omit<ThirdPartyCredential, 'id' | 'createdAt'> => ({
  department: '', name: '', username: '', password: '', url: '', notes: '',
});

export const ThirdPartyCredentials: React.FC = () => {
  const [records, setRecords] = React.useState<ThirdPartyCredential[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm());
  const [editId, setEditId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [showPass, setShowPass] = React.useState<Record<string, boolean>>({});
  const [tableSearch, setTableSearch] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setRecords(await fetchCredentials());
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleEdit = (r: ThirdPartyCredential) => {
    setForm({ department: r.department, name: r.name, username: r.username, password: r.password, url: r.url, notes: r.notes });
    setEditId(r.id);
    setShowForm(true);
  };

  const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return; }
    setSaving(true);
    try {
      const record: ThirdPartyCredential = {
        ...form,
        id: editId ?? crypto.randomUUID(),
      };
      await saveCredential(record);
      toast.success(editId ? 'Credential updated' : 'Credential added');
      setShowForm(false);
      setForm(emptyForm());
      setEditId(null);
      load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    await deleteCredential(confirmDel);
    setConfirmDel(null);
    load();
    toast.success('Credential deleted');
  };

  const columns: TableColumn<ThirdPartyCredential>[] = [
    { name: 'Department', selector: (r) => r.department, sortable: true, width: '140px' },
    { name: 'Service Name', selector: (r) => r.name, sortable: true, grow: 2 },
    { name: 'Username', selector: (r) => r.username },
    {
      name: 'Password',
      cell: (r) => (
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs">{showPass[r.id] ? r.password : '••••••••'}</span>
          <button type="button" onClick={() => setShowPass((p) => ({ ...p, [r.id]: !p[r.id] }))}
            className="text-[10px] font-semibold text-slate-400 hover:text-slate-600">
            {showPass[r.id] ? 'Hide' : 'Show'}
          </button>
        </div>
      ),
      width: '160px',
    },
    { name: 'URL', selector: (r) => r.url, cell: (r) => r.url ? <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline truncate max-w-[140px]">{r.url}</a> : '—' },
    { name: 'Added', selector: (r) => r.createdAt ?? '', format: (r) => formatDateDDMMYYYY(String(r.createdAt || '')) || '—', width: '100px' },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => handleEdit(r)}
            className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10">Edit</button>
          <button type="button" onClick={() => setConfirmDel(r.id)}
            className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
        </div>
      ),
      width: '120px', ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="3P Credentials" subtitle="Store and manage third-party service credentials."
        beforeActions={<ListTableSearchInput value={tableSearch} onChange={setTableSearch} />}
        actions={[{ label: '+ Add Credential', onClick: () => { setShowForm(true); setEditId(null); setForm(emptyForm()); } }]} />

      {showForm && (
        <SectionCard title={editId ? 'Edit Credential' : 'New Credential'} className="mb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Department">
              <select className={inputClass} value={form.department} onChange={(e) => setField('department', e.target.value)}>
                <option value="">Select</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Service / Tool Name" required>
              <input className={inputClass} placeholder="e.g. AWS Console, Razorpay" value={form.name}
                onChange={(e) => setField('name', e.target.value)} />
            </FormField>
            <FormField label="Username / Email">
              <input className={inputClass} value={form.username}
                onChange={(e) => setField('username', e.target.value)} />
            </FormField>
            <FormField label="Password">
              <input type="password" className={inputClass} value={form.password}
                onChange={(e) => setField('password', e.target.value)} />
            </FormField>
            <FormField label="URL">
              <input type="url" className={inputClass} placeholder="https://" value={form.url}
                onChange={(e) => setField('url', e.target.value)} />
            </FormField>
            <FormField label="Notes" className="sm:col-span-2">
              <input className={inputClass} value={form.notes}
                onChange={(e) => setField('notes', e.target.value)} />
            </FormField>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" disabled={saving} onClick={handleSave}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {saving ? 'Saving…' : editId ? 'Update' : 'Add Credential'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm()); setEditId(null); }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </SectionCard>
      )}

      <DataTableWrapper columns={columns} data={records} loading={loading} searchable
        filterText={tableSearch} onFilterTextChange={setTableSearch} hideSearchInput />

      {confirmDel && (
        <ConfirmDialog title="Delete Credential" message="Delete this credential permanently?"
          confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />
      )}
    </ErrorBoundary>
  );
};
