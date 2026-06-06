import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { FormField } from '../../../shared/components/FormField';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { BankDetailsFields } from '../shared/BankDetailsFields';
import { COUNTRIES, INDIAN_STATES } from '../../../shared/constants/hrConstants';
import type { VendorRecord, BankDetails, ApprovalStatus } from '../channelPartners.types';
import {
  fetchVendors,
  fetchVendorById,
  fetchVendorDocuments,
  saveVendor,
  deleteVendor,
  generateVendorCode,
  approveVendor,
  rejectVendor,
  updateVendorStatus,
  uploadKycDocument,
  kycDocumentUrl,
  type KycDocument,
} from '../../customers/vendors.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const APPROVAL_LABEL: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

const emptyBank = (): BankDetails => ({
  accountHolderName: '', accountNumber: '', ifsc: '', bankName: '', branch: '',
});

const emptyForm = (code: string): VendorRecord => ({
  vendorCode: code, businessName: '', ownerName: '', mobile: '', email: '',
  address: '', city: '', state: '', country: 'India',
  productCategories: '', bank: emptyBank(),
  kycStatus: 'Pending', status: 'Approved', approvalStatus: 'pending',
  joiningDate: new Date().toISOString().slice(0, 10),
});

export const Vendors: React.FC = () => {
  const [records, setRecords] = React.useState<VendorRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<'list' | 'form'>('list');
  const [form, setForm] = React.useState<VendorRecord | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<VendorRecord | null>(null);
  const [tableSearch, setTableSearch] = React.useState('');
  const [approvalFilter, setApprovalFilter] = React.useState<ApprovalStatus | ''>('');
  const [total, setTotal] = React.useState(0);

  const [detail, setDetail] = React.useState<VendorRecord | null>(null);
  const [documents, setDocuments] = React.useState<KycDocument[]>([]);
  const [docsLoading, setDocsLoading] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [rejectReason, setRejectReason] = React.useState('');
  const [actionLoading, setActionLoading] = React.useState(false);
  const [kycUploading, setKycUploading] = React.useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = React.useState<string | null>(null);
  const [pendingConfirm, setPendingConfirm] = React.useState<
    | { type: 'status'; row: VendorRecord; status: VendorRecord['status'] }
    | { type: 'approve' }
    | { type: 'reject' }
    | null
  >(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const VENDOR_STATUS_OPTIONS: VendorRecord['status'][] = ['Approved', 'Suspended', 'Deleted'];

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { records: rows, pagination } = await fetchVendors({
        q: tableSearch.trim() || undefined,
        status: approvalFilter || undefined,
        limit: 200,
      });
      setRecords(rows);
      setTotal(pagination.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load vendors');
      setRecords([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [tableSearch, approvalFilter]);

  React.useEffect(() => {
    const t = window.setTimeout(() => { load(); }, 300);
    return () => window.clearTimeout(t);
  }, [load]);

  const openDetail = async (row: VendorRecord) => {
    if (!row.id) return;
    setDocsLoading(true);
    setDetail(row);
    try {
      const [fresh, docs] = await Promise.all([
        fetchVendorById(row.id),
        fetchVendorDocuments(row.id),
      ]);
      setDetail(fresh);
      setDocuments(docs);
    } catch {
      toast.error('Failed to load vendor detail');
      setDetail(null);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleNew = async () => {
    try {
      const code = await generateVendorCode();
      setForm(emptyForm(code));
      setView('form');
    } catch {
      toast.error('Failed to generate vendor code');
    }
  };

  const handleEdit = (r: VendorRecord) => { setForm({ ...r }); setView('form'); };

  const setField = <K extends keyof VendorRecord>(k: K, v: VendorRecord[K]) =>
    setForm((p) => p ? { ...p, [k]: v } : p);

  const handleSave = async () => {
    if (!form) return;
    if (!form.businessName.trim()) { toast.error('Business name required'); return; }
    setSaving(true);
    try {
      await saveVendor(form);
      toast.success(`Vendor ${form.vendorCode} saved`);
      setView('list');
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel?.id) return;
    try {
      await deleteVendor(confirmDel.id);
      setConfirmDel(null);
      load();
      toast.success('Vendor deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleStatusChange = (row: VendorRecord, status: VendorRecord['status']) => {
    if (!row.id || row.status === status) return;
    setPendingConfirm({ type: 'status', row, status });
  };

  const runPendingConfirm = async () => {
    if (!pendingConfirm) return;
    if (pendingConfirm.type === 'status') {
      const { row, status } = pendingConfirm;
      setStatusUpdatingId(row.id);
      try {
        await updateVendorStatus(row.id, status);
        setRecords((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
        if (detail?.id === row.id) setDetail((d) => (d ? { ...d, status } : d));
        toast.success(`Vendor status set to ${status}`);
        setPendingConfirm(null);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Status update failed');
      } finally {
        setStatusUpdatingId(null);
      }
      return;
    }
    if (pendingConfirm.type === 'approve') {
      if (!detail?.id) return;
      setActionLoading(true);
      try {
        const { email } = await approveVendor(detail.id);
        toast.success(email.sent ? 'Vendor approved — email sent' : 'Vendor approved (email stub — configure SMTP)');
        setDetail(null);
        setPendingConfirm(null);
        load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Approve failed');
      } finally {
        setActionLoading(false);
      }
      return;
    }
    if (pendingConfirm.type === 'reject') {
      if (!detail?.id || !rejectReason.trim()) {
        toast.error('Rejection reason is required');
        return;
      }
      setActionLoading(true);
      try {
        const { email } = await rejectVendor(detail.id, rejectReason.trim());
        toast.success(email.sent ? 'Vendor rejected — email sent' : 'Vendor rejected (email stub — configure SMTP)');
        setRejectOpen(false);
        setRejectReason('');
        setDetail(null);
        setPendingConfirm(null);
        load();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Reject failed');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleKycUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !detail?.id) return;
    setKycUploading(true);
    try {
      await uploadKycDocument(detail.id, file);
      const docs = await fetchVendorDocuments(detail.id);
      setDocuments(docs);
      toast.success('KYC document uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setKycUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const columns: TableColumn<VendorRecord>[] = [
    { name: 'Code', selector: (r) => r.vendorCode, sortable: true, width: '100px' },
    { name: 'Business Name', selector: (r) => r.businessName, sortable: true, grow: 2 },
    { name: 'Owner', selector: (r) => r.ownerName },
    { name: 'Country', selector: (r) => r.country, width: '100px' },
    { name: 'Categories', selector: (r) => r.productCategories },
    {
      name: 'Approval',
      cell: (r) => <StatusBadge status={APPROVAL_LABEL[r.approvalStatus || 'pending']} />,
      width: '110px',
    },
    { name: 'KYC', cell: (r) => <StatusBadge status={r.kycStatus} />, width: '90px' },
    {
      name: 'Status',
      cell: (r) => (
        <select
          className="h-8 min-w-[7.5rem] rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-800 outline-none focus:border-primary disabled:opacity-60"
          value={r.status || 'Approved'}
          disabled={!r.id || statusUpdatingId === r.id}
          onChange={(e) => handleStatusChange(r, e.target.value as VendorRecord['status'])}
          aria-label={`Status for ${r.vendorCode}`}
        >
          {VENDOR_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
      width: '130px',
      ignoreRowClick: true,
    },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex flex-wrap gap-1">
          <button type="button" onClick={() => openDetail(r)}
            className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10">
            Review
          </button>
          <button type="button" onClick={() => handleEdit(r)}
            className="rounded px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100">Edit</button>
          {r.id ? (
            <button type="button" onClick={() => setConfirmDel(r)}
              className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
          ) : null}
        </div>
      ),
      width: '160px', ignoreRowClick: true,
    },
  ];

  if (view === 'form' && form) {
    return (
      <ErrorBoundary>
        <PageHeader
          title={form.id ? `Edit Vendor: ${form.vendorCode}` : `New Vendor — ${form.vendorCode}`}
          actions={[
            { label: saving ? 'Saving…' : 'Save', onClick: handleSave, variant: 'primary' },
            { label: 'Cancel', onClick: () => setView('list'), variant: 'secondary' },
          ]}
        />
        <div className="flex flex-col gap-5">
          <SectionCard title="Business Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Vendor Code">
                <input className={`${inputClass} bg-slate-100 text-slate-500`} value={form.vendorCode} readOnly />
              </FormField>
              <FormField label="Business Name" required>
                <input className={inputClass} value={form.businessName}
                  onChange={(e) => setField('businessName', e.target.value)} />
              </FormField>
              <FormField label="Owner Name">
                <input className={inputClass} value={form.ownerName}
                  onChange={(e) => setField('ownerName', e.target.value)} />
              </FormField>
              <FormField label="Mobile">
                <input className={inputClass} maxLength={15} value={form.mobile}
                  onChange={(e) => setField('mobile', e.target.value)} />
              </FormField>
              <FormField label="Email">
                <input type="email" className={inputClass} value={form.email}
                  onChange={(e) => setField('email', e.target.value)} />
              </FormField>
              <FormField label="Joining Date">
                <input type="date" className={inputClass} value={form.joiningDate}
                  onChange={(e) => setField('joiningDate', e.target.value)} />
              </FormField>
              <FormField label="Address" className="sm:col-span-2">
                <input className={inputClass} value={form.address}
                  onChange={(e) => setField('address', e.target.value)} />
              </FormField>
              <FormField label="Country">
                <select className={inputClass} value={form.country}
                  onChange={(e) => setField('country', e.target.value)}>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="State">
                <select className={inputClass} value={form.state}
                  onChange={(e) => setField('state', e.target.value)}>
                  <option value="">Select</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="City">
                <input className={inputClass} value={form.city}
                  onChange={(e) => setField('city', e.target.value)} />
              </FormField>
              <FormField label="Product Categories">
                <input className={inputClass} placeholder="e.g. Tour, Cake, Store" value={form.productCategories}
                  onChange={(e) => setField('productCategories', e.target.value)} />
              </FormField>
            </div>
          </SectionCard>
          <SectionCard title="Bank Details">
            <BankDetailsFields value={form.bank} onChange={(bank) => setField('bank', bank)} />
          </SectionCard>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <PageHeader title="Vendors" subtitle={`BGT vendor onboarding — ${total} total.`}
        beforeActions={
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary"
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value as ApprovalStatus | '')}
            >
              <option value="">All approvals</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ListTableSearchInput value={tableSearch} onChange={setTableSearch} />
          </div>
        }
        actions={[{ label: '+ New Vendor', onClick: handleNew }]} />

      <DataTableWrapper columns={columns} data={records} loading={loading} searchable
        filterText={tableSearch} onFilterTextChange={setTableSearch} hideSearchInput />

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-primary">{detail.businessName}</h3>
                <p className="text-xs text-slate-500">{detail.vendorCode} · {detail.email}</p>
              </div>
              <button type="button" onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={APPROVAL_LABEL[detail.approvalStatus || 'pending']} />
                <StatusBadge status={detail.kycStatus} />
                {detail.id ? (
                  <select
                    className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-800 outline-none focus:border-primary disabled:opacity-60"
                    value={detail.status || 'Approved'}
                    disabled={statusUpdatingId === detail.id}
                    onChange={(e) => handleStatusChange(detail, e.target.value as VendorRecord['status'])}
                    aria-label="Vendor status"
                  >
                    {VENDOR_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
              {detail.rejectionReason ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  Rejection: {detail.rejectionReason}
                </p>
              ) : null}
              <SectionCard title="KYC Documents">
                {docsLoading ? (
                  <p className="text-sm text-slate-500">Loading documents…</p>
                ) : documents.length === 0 ? (
                  <p className="text-sm text-slate-500">No KYC documents uploaded yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {documents.map((doc) => (
                      <li key={doc.id} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2 text-sm">
                        <span>{doc.originalName || doc.fileName} <span className="text-slate-400">({doc.docType})</span></span>
                        <a href={kycDocumentUrl(doc.url)} target="_blank" rel="noreferrer"
                          className="font-semibold text-primary hover:underline">View</a>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-3">
                  <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden"
                    onChange={handleKycUpload} />
                  <button type="button" disabled={kycUploading} onClick={() => fileRef.current?.click()}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                    {kycUploading ? 'Uploading…' : '+ Upload KYC document'}
                  </button>
                </div>
              </SectionCard>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4">
              {detail.approvalStatus === 'pending' ? (
                <>
                  <button type="button" disabled={actionLoading} onClick={() => setPendingConfirm({ type: 'approve' })}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">
                    Approve
                  </button>
                  <button type="button" disabled={actionLoading} onClick={() => setRejectOpen(true)}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                    Reject
                  </button>
                </>
              ) : null}
              <button type="button" onClick={() => { handleEdit(detail); setDetail(null); }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Edit details
              </button>
              <button type="button" onClick={() => setDetail(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {rejectOpen && detail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h4 className="font-bold text-slate-800">Reject vendor</h4>
            <p className="mt-1 text-sm text-slate-500">Provide a reason — sent to the vendor by email when SMTP is configured.</p>
            <textarea className={`${inputClass} mt-3 h-24 py-2`} value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)} placeholder="Reason for rejection…" />
            <div className="mt-4 flex gap-2">
              <button type="button" disabled={actionLoading} onClick={() => { setRejectOpen(false); setPendingConfirm({ type: 'reject' }); }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                Confirm reject
              </button>
              <button type="button" onClick={() => { setRejectOpen(false); setRejectReason(''); }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <ConfirmDialog title="Delete Vendor" message={`Are you sure you want to delete vendor ${confirmDel.vendorCode}? This cannot be undone.`}
          confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />
      )}

      {pendingConfirm ? (
        <ConfirmDialog
          title="Confirm vendor action"
          message={
            pendingConfirm.type === 'status'
              ? `Are you sure you want to change ${pendingConfirm.row.vendorCode} status to ${pendingConfirm.status}? This cannot be undone.`
              : pendingConfirm.type === 'approve'
                ? `Are you sure you want to approve vendor ${detail?.vendorCode}? This cannot be undone.`
                : `Are you sure you want to reject vendor ${detail?.vendorCode}? This cannot be undone.`
          }
          confirmLabel="Confirm"
          variant="primary"
          loading={actionLoading || Boolean(statusUpdatingId)}
          onConfirm={() => void runPendingConfirm()}
          onCancel={() => setPendingConfirm(null)}
        />
      ) : null}
    </ErrorBoundary>
  );
};
