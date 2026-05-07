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
import type { CustomerIssue, IssueStatus } from '../customers.types';
import { fetchIssues, saveIssue, deleteIssue } from '../customers.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const ISSUE_TYPES = [
  'Product Defect', 'Delivery Issue', 'Billing Error', 'Wrong Item',
  'Refund Request', 'Vendor Misconduct', 'Other',
];

const VENDOR_RESPONSES = [
  'No response on calls and mails',
  'Report management',
  'Report to DSA',
  'Penalty levied and agreed by vendor',
  'Denied the reported issue',
  'Agreed to resolve issue in 48 hours',
  'Ready for settlement',
  'Agreed to refund',
  'Refund initiated',
  'Issue resolved',
  'Other special case',
];

const NEXT_STATUS: Record<IssueStatus, IssueStatus | null> = {
  'Pending': 'In Progress',
  'In Progress': 'Resolved',
  'Resolved': null,
};

const emptyForm = (): Omit<CustomerIssue, 'id' | 'rnNumber'> => ({
  customerName: '',
  customerId: '',
  article: '',
  issueType: '',
  vendorName: '',
  vendorResponse: '',
  penaltyAmount: 0,
  status: 'Pending',
  country: '',
  raisedDate: new Date().toISOString().slice(0, 10),
  resolvedDate: '',
});

export const Issues: React.FC = () => {
  const [issues, setIssues] = React.useState<CustomerIssue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm());
  const [editId, setEditId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setIssues(await fetchIssues());
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const openNew = () => {
    setForm(emptyForm());
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (issue: CustomerIssue) => {
    const { id, rnNumber, ...rest } = issue;
    setForm(rest);
    setEditId(id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.customerName.trim()) { toast.error('Customer name required'); return; }
    if (!form.issueType) { toast.error('Issue type required'); return; }
    setSaving(true);
    try {
      const id = editId ?? crypto.randomUUID();
      const rnNumber = editId
        ? (issues.find((i) => i.id === editId)?.rnNumber ?? `RN-${Date.now()}`)
        : `RN-${Date.now()}`;
      await saveIssue({ id, rnNumber, ...form });
      toast.success(editId ? 'Issue updated' : 'Issue created');
      setShowForm(false);
      setEditId(null);
      load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleAdvanceStatus = async (issue: CustomerIssue) => {
    const next = NEXT_STATUS[issue.status];
    if (!next) return;
    const updated: CustomerIssue = {
      ...issue,
      status: next,
      resolvedDate: next === 'Resolved' ? new Date().toISOString().slice(0, 10) : issue.resolvedDate,
    };
    await saveIssue(updated);
    toast.success(`Status → ${next}`);
    load();
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    await deleteIssue(confirmDel);
    setConfirmDel(null);
    load();
    toast.success('Issue deleted');
  };

  const displayed = statusFilter ? issues.filter((i) => i.status === statusFilter) : issues;

  const columns: TableColumn<CustomerIssue>[] = [
    { name: 'RN No.', selector: (r) => r.rnNumber, width: '130px', sortable: true },
    { name: 'Customer', selector: (r) => r.customerName, sortable: true, grow: 1 },
    { name: 'Issue Type', selector: (r) => r.issueType, width: '140px' },
    { name: 'Vendor', selector: (r) => r.vendorName, grow: 1 },
    { name: 'Penalty (₹)', selector: (r) => r.penaltyAmount, width: '100px', sortable: true },
    { name: 'Country', selector: (r) => r.country, width: '90px' },
    { name: 'Raised', selector: (r) => r.raisedDate, width: '105px', sortable: true },
    { name: 'Status', cell: (r) => <StatusBadge status={r.status} />, width: '110px' },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex gap-1">
          <button type="button" onClick={() => openEdit(r)}
            className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10">Edit</button>
          {NEXT_STATUS[r.status] && (
            <button type="button" onClick={() => handleAdvanceStatus(r)}
              className="rounded px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50">
              → {NEXT_STATUS[r.status]}
            </button>
          )}
          <button type="button" onClick={() => setConfirmDel(r.id)}
            className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Del</button>
        </div>
      ),
      width: '200px', ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="Customer Issues"
        subtitle="Track and resolve customer complaints. Status lifecycle: Pending → In Progress → Resolved."
        actions={[{ label: '+ New Issue', onClick: openNew }]} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-600">Filter:</span>
        {(['', 'Pending', 'In Progress', 'Resolved'] as (IssueStatus | '')[]).map((s) => (
          <button key={s} type="button" onClick={() => setStatusFilter(s)}
            className={['rounded-lg border px-3 py-1 text-xs font-semibold transition',
              statusFilter === s
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'].join(' ')}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {showForm && (
        <SectionCard title={editId ? 'Edit Issue' : 'New Issue'} className="mb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Customer Name" required>
              <input className={inputClass} value={form.customerName}
                onChange={(e) => setField('customerName', e.target.value)} />
            </FormField>
            <FormField label="Customer ID">
              <input className={inputClass} value={form.customerId}
                onChange={(e) => setField('customerId', e.target.value)} />
            </FormField>
            <FormField label="Issue Type" required>
              <select className={inputClass} value={form.issueType}
                onChange={(e) => setField('issueType', e.target.value)}>
                <option value="">Select type…</option>
                {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Article / Product">
              <input className={inputClass} value={form.article}
                onChange={(e) => setField('article', e.target.value)} />
            </FormField>
            <FormField label="Vendor Name">
              <input className={inputClass} value={form.vendorName}
                onChange={(e) => setField('vendorName', e.target.value)} />
            </FormField>
            <FormField label="Vendor Response">
              <select className={inputClass} value={form.vendorResponse}
                onChange={(e) => setField('vendorResponse', e.target.value)}>
                <option value="">Select…</option>
                {VENDOR_RESPONSES.map((r) => <option key={r}>{r}</option>)}
              </select>
            </FormField>
            <FormField label="Penalty Amount (₹)">
              <input type="number" min={0} className={inputClass} value={form.penaltyAmount}
                onChange={(e) => setField('penaltyAmount', Number(e.target.value))} />
            </FormField>
            <FormField label="Country">
              <input className={inputClass} value={form.country}
                onChange={(e) => setField('country', e.target.value)} />
            </FormField>
            <FormField label="Raised Date">
              <input type="date" className={`${inputClass} [color-scheme:light]`} value={form.raisedDate}
                onChange={(e) => setField('raisedDate', e.target.value)} />
            </FormField>
            {editId && (
              <FormField label="Resolved Date">
                <input type="date" className={`${inputClass} [color-scheme:light]`} value={form.resolvedDate}
                  onChange={(e) => setField('resolvedDate', e.target.value)} />
              </FormField>
            )}
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" disabled={saving} onClick={handleSave}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {saving ? 'Saving…' : editId ? 'Update Issue' : 'Create Issue'}
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
        <ConfirmDialog title="Delete Issue" message="Delete this issue record permanently?"
          confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />
      )}
    </ErrorBoundary>
  );
};
