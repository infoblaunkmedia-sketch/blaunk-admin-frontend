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
import { BankDetailsFields } from '../shared/BankDetailsFields';
import { COUNTRIES, INDIAN_STATES } from '../../../shared/constants/hrConstants';
import type { VendorRecord, BankDetails } from '../channelPartners.types';
import {
  fetchVendors, saveVendor, deleteVendor, generateVendorCode,
} from '../channelPartners.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const emptyBank = (): BankDetails => ({
  accountHolderName: '', accountNumber: '', ifsc: '', bankName: '', branch: '',
});

const emptyForm = (code: string): VendorRecord => ({
  vendorCode: code, businessName: '', ownerName: '', mobile: '', email: '',
  address: '', city: '', state: '', country: 'India',
  productCategories: '', bank: emptyBank(),
  kycStatus: 'Pending', status: 'Active',
  joiningDate: new Date().toISOString().slice(0, 10),
});

export const Vendors: React.FC = () => {
  const [records, setRecords] = React.useState<VendorRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<'list' | 'form'>('list');
  const [form, setForm] = React.useState<VendorRecord | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setRecords(await fetchVendors());
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleNew = async () => {
    const code = await generateVendorCode(records);
    setForm(emptyForm(code));
    setView('form');
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
      setView('list'); load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    await deleteVendor(confirmDel);
    setConfirmDel(null);
    load();
    toast.success('Vendor deleted');
  };

  const columns: TableColumn<VendorRecord>[] = [
    { name: 'Code', selector: (r) => r.vendorCode, sortable: true, width: '100px' },
    { name: 'Business Name', selector: (r) => r.businessName, sortable: true, grow: 2 },
    { name: 'Owner', selector: (r) => r.ownerName },
    { name: 'Country', selector: (r) => r.country, width: '100px' },
    { name: 'Categories', selector: (r) => r.productCategories },
    { name: 'Status', cell: (r) => <StatusBadge status={r.status} />, width: '100px' },
    { name: 'KYC', cell: (r) => <StatusBadge status={r.kycStatus} />, width: '90px' },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => handleEdit(r)}
            className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10">Edit</button>
          <button type="button" onClick={() => setConfirmDel(r.vendorCode)}
            className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
        </div>
      ),
      width: '120px', ignoreRowClick: true,
    },
  ];

  if (view === 'form' && form) {
    return (
      <ErrorBoundary>
        <PageHeader
          title={form.createdAt ? `Edit Vendor: ${form.vendorCode}` : `New Vendor — ${form.vendorCode}`}
          actions={[
            { label: 'Save', onClick: handleSave, variant: 'primary' },
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
              <FormField label="Status">
                <select className={inputClass} value={form.status}
                  onChange={(e) => setField('status', e.target.value as VendorRecord['status'])}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </FormField>
              <FormField label="KYC Status">
                <select className={inputClass} value={form.kycStatus}
                  onChange={(e) => setField('kycStatus', e.target.value as VendorRecord['kycStatus'])}>
                  <option value="Pending">Pending</option>
                  <option value="Verified">Verified</option>
                  <option value="Rejected">Rejected</option>
                </select>
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
      <PageHeader title="Vendors" subtitle="Manage BGT vendor accounts."
        actions={[{ label: '+ New Vendor', onClick: handleNew }]} />
      <DataTableWrapper columns={columns} data={records} loading={loading} searchable />
      {confirmDel && (
        <ConfirmDialog title="Delete Vendor" message={`Delete vendor ${confirmDel}?`}
          confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />
      )}
    </ErrorBoundary>
  );
};
