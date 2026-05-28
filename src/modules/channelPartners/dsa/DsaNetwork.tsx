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
import type { DsaRecord, BankDetails } from '../channelPartners.types';
import { onIntegerInputKeyDown } from '../../../shared/utils/numericInput';
import {
  fetchDsaRecords, saveDsaRecord, deleteDsaRecord, generateDsaCode,
} from '../channelPartners.service';
import {
  fetchReferrals, fetchCommissionLedger, referralLink, type Referral, type LedgerRow,
} from '../referrals.service';
import { useAuth } from '../../../auth/useAuth';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const emptyBank = (): BankDetails => ({
  accountHolderName: '', accountNumber: '', ifsc: '', bankName: '', branch: '',
});

const emptyForm = (code: string): DsaRecord => ({
  dsaCode: code,
  companyName: '', ownerName: '', mobile: '', email: '',
  country: 'India', city: '', state: '',
  productsCovered: '',
  shareRatio: 30,
  status: 'Active', kycStatus: 'Pending',
  bank: emptyBank(),
  joiningDate: new Date().toISOString().slice(0, 10),
});

export const DsaNetwork: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = React.useState<DsaRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [view, setView] = React.useState<'list' | 'form' | 'referrals'>('referrals');
  const [referrals, setReferrals] = React.useState<Referral[]>([]);
  const [ledger, setLedger] = React.useState<LedgerRow[]>([]);
  const [refLoading, setRefLoading] = React.useState(true);
  const [linkCode, setLinkCode] = React.useState(user?.code || 'DSA0001');
  const [form, setForm] = React.useState<DsaRecord | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [tableSearch, setTableSearch] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setRecords(await fetchDsaRecords());
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const loadReferrals = React.useCallback(async () => {
    setRefLoading(true);
    try {
      const code = user?.role === 'admin' ? undefined : user?.code;
      const [refRes, ledRes] = await Promise.all([
        fetchReferrals({ dsaCode: code, limit: 200 }),
        fetchCommissionLedger(code),
      ]);
      setReferrals(refRes.records);
      setLedger(ledRes.ledger);
    } catch {
      toast.error('Failed to load referrals');
    } finally {
      setRefLoading(false);
    }
  }, [user?.code, user?.role]);

  React.useEffect(() => {
    if (view === 'referrals') loadReferrals();
  }, [view, loadReferrals]);

  const handleNew = async () => {
    const code = await generateDsaCode(records);
    setForm(emptyForm(code));
    setView('form');
  };

  const handleEdit = (r: DsaRecord) => { setForm({ ...r }); setView('form'); };

  const setField = <K extends keyof DsaRecord>(k: K, v: DsaRecord[K]) =>
    setForm((p) => p ? { ...p, [k]: v } : p);

  const handleSave = async () => {
    if (!form) return;
    if (!form.companyName.trim()) { toast.error('Company name required'); return; }
    setSaving(true);
    try {
      await saveDsaRecord(form);
      toast.success(`DSA ${form.dsaCode} saved`);
      setView('list');
      load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    await deleteDsaRecord(confirmDel);
    setConfirmDel(null);
    load();
    toast.success('DSA record deleted');
  };

  const columns: TableColumn<DsaRecord>[] = [
    { name: 'DSA Code', selector: (r) => r.dsaCode, sortable: true, width: '110px' },
    { name: 'Company', selector: (r) => r.companyName, sortable: true, grow: 2 },
    { name: 'Owner', selector: (r) => r.ownerName, sortable: true },
    { name: 'Country', selector: (r) => r.country, width: '100px' },
    { name: 'Share %', selector: (r) => r.shareRatio, format: (r) => `${r.shareRatio}:${100 - r.shareRatio}`, width: '90px' },
    { name: 'Status', cell: (r) => <StatusBadge status={r.status} />, width: '100px' },
    { name: 'KYC', cell: (r) => <StatusBadge status={r.kycStatus} />, width: '90px' },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => handleEdit(r)}
            className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10">Edit</button>
          <button type="button" onClick={() => setConfirmDel(r.dsaCode)}
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
          title={form.createdAt ? `Edit DSA: ${form.dsaCode}` : `New DSA — ${form.dsaCode}`}
          actions={[
            { label: 'Save', onClick: handleSave, variant: 'primary' },
            { label: 'Cancel', onClick: () => setView('list'), variant: 'secondary' },
          ]}
        />

        <div className="flex flex-col gap-5">
          <SectionCard title="Business Information">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="DSA Code">
                <input className={`${inputClass} bg-slate-100 text-slate-500`} value={form.dsaCode} readOnly />
              </FormField>
              <FormField label="Company Name" required>
                <input className={inputClass} value={form.companyName}
                  onChange={(e) => setField('companyName', e.target.value)} />
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
              <FormField label="Products Covered">
                <input className={inputClass} placeholder="e.g. Tour, Store, BGT" value={form.productsCovered}
                  onChange={(e) => setField('productsCovered', e.target.value)} />
              </FormField>
              <FormField label="Sharing Ratio (DSA %)" hint="DSA's share out of 100. e.g. 30 means 30:70">
                <input type="number" min={0} max={100} className={inputClass} value={form.shareRatio}
                  onKeyDown={onIntegerInputKeyDown}
                  onChange={(e) => setField('shareRatio', Number(e.target.value))} />
              </FormField>
              <FormField label="Status">
                <select className={inputClass} value={form.status}
                  onChange={(e) => setField('status', e.target.value as DsaRecord['status'])}>
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </FormField>
              <FormField label="KYC Status">
                <select className={inputClass} value={form.kycStatus}
                  onChange={(e) => setField('kycStatus', e.target.value as DsaRecord['kycStatus'])}>
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

  if (view === 'referrals') {
    return (
      <ErrorBoundary>
        <PageHeader title="DSA Network" subtitle="Referral tracking and commission ledger (API)."
          actions={[
            { label: 'DSA Registry', onClick: () => setView('list'), variant: 'secondary' },
            { label: '+ New DSA', onClick: handleNew },
          ]} />
        <SectionCard title="Referral link" className="mb-4">
          <div className="flex flex-wrap items-end gap-2">
            <FormField label="DSA Code" className="min-w-[140px]">
              <input className={inputClass} value={linkCode} onChange={(e) => setLinkCode(e.target.value.toUpperCase())} />
            </FormField>
            <p className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-700">
              {referralLink(linkCode || 'DSA0001')}
            </p>
          </div>
        </SectionCard>
        {ledger.length > 0 && (
          <SectionCard title="Commission ledger" className="mb-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {ledger.map((l) => (
                <div key={l.dsaCode} className="rounded-lg border border-slate-200 p-3 text-sm">
                  <p className="font-bold text-primary">{l.dsaCode}</p>
                  <p>Referrals: {l.referralCount}</p>
                  <p>Commission: ₹{l.totalCommission.toLocaleString()}</p>
                  <p>Pending: ₹{l.pendingCommission.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
        <SectionCard title="Referrals">
          {refLoading ? <p className="text-sm text-slate-500">Loading…</p> : (
            <table className="w-full text-sm">
              <thead><tr className="bg-primary text-white">
                {['DSA', 'User', 'Event', 'Commission', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-3 py-2 text-left">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{r.dsaCode}</td>
                    <td className="px-3 py-2">{r.referredUserName || r.referredUserId}</td>
                    <td className="px-3 py-2">{r.eventType}</td>
                    <td className="px-3 py-2">₹{r.commissionAmount}</td>
                    <td className="px-3 py-2">{r.payoutStatus}</td>
                    <td className="px-3 py-2">{(r.createdAt || '').toString().slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </SectionCard>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <PageHeader title="DSA Network" subtitle="Manage DSA partner records and sharing ratios."
        beforeActions={<ListTableSearchInput value={tableSearch} onChange={setTableSearch} />}
        actions={[
          { label: 'Referrals', onClick: () => setView('referrals'), variant: 'secondary' },
          { label: '+ New DSA', onClick: handleNew },
        ]} />
      <DataTableWrapper columns={columns} data={records} loading={loading} searchable
        filterText={tableSearch} onFilterTextChange={setTableSearch} hideSearchInput />
      {confirmDel && (
        <ConfirmDialog title="Delete DSA" message={`Delete DSA ${confirmDel}?`}
          confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />
      )}
    </ErrorBoundary>
  );
};
