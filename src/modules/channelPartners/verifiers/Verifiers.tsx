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
import { INDIAN_STATES } from '../../../shared/constants/hrConstants';
import type { VerifierRecord, BankDetails } from '../channelPartners.types';
import { onNumericInputKeyDown } from '../../../shared/utils/numericInput';
import {
  fetchVerifiers, saveVerifier, deleteVerifier, generateVerifierCode,
} from '../channelPartners.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const emptyBank = (): BankDetails => ({
  accountHolderName: '', accountNumber: '', ifsc: '', bankName: '', branch: '',
});

const emptyForm = (code: string): VerifierRecord => ({
  verifierCode: code, companyName: '', contactPerson: '', mobile: '', email: '',
  city: '', state: '', productsCovered: '', verificationFee: 0,
  status: 'Active', kycStatus: 'Pending', bank: emptyBank(),
});

export const Verifiers: React.FC = () => {
  const [records, setRecords] = React.useState<VerifierRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<'list' | 'form'>('list');
  const [form, setForm] = React.useState<VerifierRecord | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [tableSearch, setTableSearch] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setRecords(await fetchVerifiers());
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleNew = async () => {
    const code = await generateVerifierCode(records);
    setForm(emptyForm(code));
    setView('form');
  };

  const handleEdit = (r: VerifierRecord) => { setForm({ ...r }); setView('form'); };

  const setField = <K extends keyof VerifierRecord>(k: K, v: VerifierRecord[K]) =>
    setForm((p) => p ? { ...p, [k]: v } : p);

  const handleSave = async () => {
    if (!form) return;
    if (!form.companyName.trim()) { toast.error('Company name required'); return; }
    setSaving(true);
    try {
      await saveVerifier(form);
      toast.success(`Verifier ${form.verifierCode} saved`);
      setView('list'); load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    await deleteVerifier(confirmDel);
    setConfirmDel(null);
    load();
    toast.success('Verifier deleted');
  };

  const columns: TableColumn<VerifierRecord>[] = [
    { name: 'Code', selector: (r) => r.verifierCode, sortable: true, width: '100px' },
    { name: 'Company', selector: (r) => r.companyName, sortable: true, grow: 2 },
    { name: 'Contact', selector: (r) => r.contactPerson },
    { name: 'Mobile', selector: (r) => r.mobile, width: '120px' },
    { name: 'City', selector: (r) => r.city },
    { name: 'Fee (₹)', selector: (r) => r.verificationFee, format: (r) => `₹${r.verificationFee}`, width: '90px' },
    { name: 'Status', cell: (r) => <StatusBadge status={r.status} />, width: '100px' },
    { name: 'KYC', cell: (r) => <StatusBadge status={r.kycStatus} />, width: '90px' },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => handleEdit(r)}
            className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10">Edit</button>
          <button type="button" onClick={() => setConfirmDel(r.verifierCode)}
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
          title={form.createdAt ? `Edit: ${form.verifierCode}` : `New Verifier — ${form.verifierCode}`}
          actions={[
            { label: 'Save', onClick: handleSave, variant: 'primary' },
            { label: 'Cancel', onClick: () => setView('list'), variant: 'secondary' },
          ]}
        />
        <div className="flex flex-col gap-5">
          <SectionCard title="Verifier Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Verifier Code">
                <input className={`${inputClass} bg-slate-100 text-slate-500`} value={form.verifierCode} readOnly />
              </FormField>
              <FormField label="Company Name" required>
                <input className={inputClass} value={form.companyName}
                  onChange={(e) => setField('companyName', e.target.value)} />
              </FormField>
              <FormField label="Contact Person">
                <input className={inputClass} value={form.contactPerson}
                  onChange={(e) => setField('contactPerson', e.target.value)} />
              </FormField>
              <FormField label="Mobile">
                <input className={inputClass} maxLength={15} value={form.mobile}
                  onChange={(e) => setField('mobile', e.target.value)} />
              </FormField>
              <FormField label="Email">
                <input type="email" className={inputClass} value={form.email}
                  onChange={(e) => setField('email', e.target.value)} />
              </FormField>
              <FormField label="City">
                <input className={inputClass} value={form.city}
                  onChange={(e) => setField('city', e.target.value)} />
              </FormField>
              <FormField label="State">
                <select className={inputClass} value={form.state}
                  onChange={(e) => setField('state', e.target.value)}>
                  <option value="">Select</option>
                  {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="Products Covered">
                <input className={inputClass} value={form.productsCovered}
                  onChange={(e) => setField('productsCovered', e.target.value)} />
              </FormField>
              <FormField label="Verification Fee (₹)">
                <input type="number" min={0} className={inputClass} value={form.verificationFee}
                  onKeyDown={onNumericInputKeyDown}
                  onChange={(e) => setField('verificationFee', Number(e.target.value))} />
              </FormField>
              <FormField label="Status">
                <select className={inputClass} value={form.status}
                  onChange={(e) => setField('status', e.target.value as VerifierRecord['status'])}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </FormField>
              <FormField label="KYC Status">
                <select className={inputClass} value={form.kycStatus}
                  onChange={(e) => setField('kycStatus', e.target.value as VerifierRecord['kycStatus'])}>
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
      <PageHeader title="Verifiers" subtitle="Manage verification partners."
        beforeActions={<ListTableSearchInput value={tableSearch} onChange={setTableSearch} />}
        actions={[{ label: '+ New Verifier', onClick: handleNew }]} />
      <DataTableWrapper columns={columns} data={records} loading={loading} searchable
        filterText={tableSearch} onFilterTextChange={setTableSearch} hideSearchInput />
      {confirmDel && (
        <ConfirmDialog title="Delete Verifier" message={`Delete verifier ${confirmDel}?`}
          confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />
      )}
    </ErrorBoundary>
  );
};
