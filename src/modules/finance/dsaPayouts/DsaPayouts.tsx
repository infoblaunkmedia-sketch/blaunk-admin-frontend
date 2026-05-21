import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { useAuth } from '../../../auth/useAuth';
import { fetchDsaRecords } from '../../channelPartners/channelPartners.service';
import { fetchEmployees } from '../../people/people.service';
import { fetchThirdPartyCredentials } from '../../people/thirdPartyCredentials/thirdPartyCredentials.service';
import { fetchDsaLimitConfig } from '../../platform/platform.service';
import { fetchDsaPayouts, saveDsaPayout, updatePayoutStatusById } from '../finance.service';
import type { DsaPayoutSubmission, PaymentMode } from '../finance.types';
import { PayoutStatusSelect } from '../../../shared/components/PayoutStatusSelect';
import {
  PAYOUT_STATUS_OPTIONS,
  isPendingPayoutStatus,
  isNegativePayoutStatus,
  normalizePayoutStatus,
  type PayoutStatus,
} from '../../../shared/constants/payoutStatus';
import { onNumericInputKeyDown } from '../../../shared/utils/numericInput';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const CURRENCIES = ['INR', 'USD', 'AED', 'GBP', 'SGD', 'MYR', 'QAR', 'KWD', 'BHD'];

const emptyForm = (): Omit<DsaPayoutSubmission, 'id' | 'status' | 'calculatedLimit' | 'currencyInr'> => ({
  dsaCode: '',
  dsaName: '',
  country: '',
  submittedAmount: 0,
  currency: 'INR',
  shareRatio: 30,
  mode: 'NEFT',
  transactionNumber: '',
  submissionDate: new Date().toISOString().slice(0, 10),
  newAmount: 0,
  bodBalance: 0,
  usedValue: 0,
});

export const DsaPayouts: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin';
  const ownDsaCode = String(user?.code || '').trim().toUpperCase();
  const [records, setRecords] = React.useState<DsaPayoutSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm());
  const [currencyRate, setCurrencyRate] = React.useState(1);
  const [saving, setSaving] = React.useState(false);
  const [tableSearch, setTableSearch] = React.useState('');
  const [dsaCodeFilter, setDsaCodeFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [actioningId, setActioningId] = React.useState<string | null>(null);
  const dsaLookupGen = React.useRef(0);
  const dsaLookupTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setRecords(await fetchDsaPayouts({
      dsaCode: isAdmin && dsaCodeFilter.trim() ? dsaCodeFilter.trim() : undefined,
      status: statusFilter || undefined,
      limit: isAdmin ? 2000 : 1000,
    }));
    setLoading(false);
  }, [dsaCodeFilter, isAdmin, statusFilter]);

  React.useEffect(() => { load(); }, [load]);

  const resolveDsaProfile = React.useCallback(async (code: string, gen: number) => {
    const c = code.trim();
    if (!c) return;

    const fromChannel = (await fetchDsaRecords()).find((d) => d.dsaCode.toLowerCase() === c.toLowerCase());
    if (gen !== dsaLookupGen.current) return;
    if (fromChannel) {
      setForm((p) => ({
        ...p,
        dsaCode: fromChannel.dsaCode,
        dsaName: fromChannel.companyName,
        country: fromChannel.country || '',
        shareRatio: fromChannel.shareRatio,
      }));
      return;
    }

    let employees: Awaited<ReturnType<typeof fetchEmployees>> = [];
    try {
      employees = await fetchEmployees();
    } catch {
      employees = [];
    }
    if (gen !== dsaLookupGen.current) return;
    const emp = employees.find((e) => e.employeeCode.toLowerCase() === c.toLowerCase());    
    if (emp) {
      setForm((p) => ({
        ...p,
        dsaCode: emp.employeeCode,
        dsaName: emp.fullName || '',
        country: emp.country || '',
      }));
      return;
    }

    let third: Awaited<ReturnType<typeof fetchThirdPartyCredentials>> = [];
    try {
      third = await fetchThirdPartyCredentials();
    } catch {
      third = [];
    }
    if (gen !== dsaLookupGen.current) return;
    const tp = third.find((t) => t.threePEmplCode.toLowerCase() === c.toLowerCase());
    if (tp) {      
      setForm((p) => ({
        ...p,
        dsaCode: tp.threePEmplCode,
        dsaName: tp.name,
        country: tp.country || '',
      }));
      return;
    }

    setForm((p) => ({ ...p, dsaName: '', country: '' }));
  }, []);

  const handleDsaCodeChange = React.useCallback((raw: string) => {
    const code = raw.trim().toUpperCase();
    setForm((p) => ({
      ...p,
      dsaCode: code,
      ...(code ? {} : { dsaName: '', country: '' }),
    }));
    if (!code) {
      dsaLookupGen.current += 1;
      if (dsaLookupTimer.current) clearTimeout(dsaLookupTimer.current);
      return;
    }

    void (async () => {
      const fromChannel = (await fetchDsaRecords()).find((d) => d.dsaCode.toLowerCase() === code.toLowerCase());
      if (fromChannel) {
        dsaLookupGen.current += 1;
        if (dsaLookupTimer.current) clearTimeout(dsaLookupTimer.current);
        setForm((p) => ({
          ...p,
          dsaCode: fromChannel.dsaCode,
          dsaName: fromChannel.companyName,
          country: fromChannel.country || '',
          shareRatio: fromChannel.shareRatio,
        }));
        return;
      }

      if (dsaLookupTimer.current) clearTimeout(dsaLookupTimer.current);
      const gen = ++dsaLookupGen.current;
      dsaLookupTimer.current = setTimeout(() => {
        void resolveDsaProfile(code, gen);
      }, 350);
    })();
  }, [resolveDsaProfile]);

  React.useEffect(() => {
    if (!showForm || isAdmin || !ownDsaCode) return;
    handleDsaCodeChange(ownDsaCode);
    setForm((p) => ({
      ...p,
      submissionDate: new Date().toISOString().slice(0, 10),
    }));
  }, [handleDsaCodeChange, isAdmin, ownDsaCode, showForm]);

  React.useEffect(() => () => {
    if (dsaLookupTimer.current) clearTimeout(dsaLookupTimer.current);
  }, []);

  const summary = React.useMemo(() => {
    const totals = {
      pending: 0,
      approved: 0,
      rejected: 0,
      approvedLimit: 0,
      approvedAvailable: 0,
    };
    for (const row of records) {
      if (isPendingPayoutStatus(row.status)) totals.pending += 1;
      if (normalizePayoutStatus(row.status) === 'APPROVED') {
        totals.approved += 1;
        totals.approvedLimit += Number(row.calculatedLimit || 0);
        totals.approvedAvailable += Number(row.availableBalance || 0);
      }
      if (isNegativePayoutStatus(row.status)) totals.rejected += 1;
    }
    return totals;
  }, [records]);

  const handleCurrencyChange = async (currency: string) => {
    setForm((p) => ({ ...p, currency }));
    if (currency === 'INR') { setCurrencyRate(1); return; }
    const config = await fetchDsaLimitConfig();
    const entry = config.currencyRates.find((r) => r.currency === currency);
    setCurrencyRate(entry?.rateToInr ?? 1);
  };

  const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const currencyInr = form.submittedAmount * currencyRate;
  const calculatedLimit = currencyInr + (currencyInr * form.shareRatio) / 100;
  const availableBalance = (form.newAmount ?? 0) + (form.bodBalance ?? 0) - (form.usedValue ?? 0);

  const handleSubmit = async () => {
    if (!form.dsaCode.trim()) { toast.error('DSA code required'); return; }
    if (form.submittedAmount <= 0) { toast.error('Amount must be > 0'); return; }
    setSaving(true);
    try {
      const record: DsaPayoutSubmission = {
        ...form,
        id: crypto.randomUUID(),
        currencyInr,
        calculatedLimit,
        status: 'PENDING',
      };
      await saveDsaPayout(record);
      toast.success('Submission sent for approval');
      setShowForm(false);
      setForm(emptyForm());
      load();
    } catch { toast.error('Submit failed'); }
    finally { setSaving(false); }
  };

  const exportCsv = () => {
    const header = [
      'Entry Date',
      'DSA Code',
      'DSA Name',
      'Country',
      'Mode',
      'Curr',
      'Amount Pay-in',
      'INR',
      'Calculated Limit',
      'Available Balance',
      'Status',
      'Approval Note',
      'Rejection Reason',
      'Approved By',
      'Approved At',
      'Rejected By',
      'Rejected At',
    ];
    const rows = records.map((r) => ([
      r.submissionDate || '',
      r.dsaCode || '',
      r.dsaName || '',
      r.country || '',
      r.mode || '',
      r.currency || '',
      String(r.submittedAmount ?? 0),
      String(r.currencyInr ?? 0),
      String(r.calculatedLimit ?? 0),
      String(r.availableBalance ?? 0),
      r.status || '',
      r.approvalNote || '',
      r.rejectionReason || '',
      r.approvedBy || '',
      r.approvedAt || '',
      r.rejectedBy || '',
      r.rejectedAt || '',
    ]));
    const csv = [header, ...rows]
      .map((line) => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsa-payout-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAdminStatusChange = async (row: DsaPayoutSubmission, nextStatus: PayoutStatus) => {
    const current = normalizePayoutStatus(row.status);
    if (nextStatus === current) return;

    let note = '';
    if (isNegativePayoutStatus(nextStatus)) {
      const reason = window.prompt('Note / reason (required):', row.rejectionReason || '');
      if (!reason || !reason.trim()) {
        toast.error('Note / reason is required for this status.');
        return;
      }
      note = reason.trim();
    } else if (nextStatus === 'APPROVED') {
      note = window.prompt('Approval note (optional):', row.approvalNote || '') ?? '';
    } else {
      note = window.prompt('Note (optional):', row.approvalNote || '') ?? '';
    }

    try {
      setActioningId(row.id);
      await updatePayoutStatusById(row.id, nextStatus, note);
      toast.success('Status updated');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update status');
    } finally {
      setActioningId(null);
    }
  };

  const columns: TableColumn<DsaPayoutSubmission>[] = [
    { name: 'Entry Date', selector: (r) => r.submissionDate, sortable: true, width: '110px' },
    { name: 'DSA Code', selector: (r) => r.dsaCode, sortable: true, width: '110px' },
    { name: 'Country', selector: (r) => r.country, sortable: true, width: '100px' },
    { name: 'Mode', selector: (r) => r.mode, sortable: true, width: '90px' },
    { name: 'Curr', selector: (r) => r.currency, sortable: true, width: '70px' },
    { name: 'Amount Pay-in', selector: (r) => r.submittedAmount, format: (r) => r.submittedAmount.toLocaleString(), width: '120px' },
    { name: 'Share %', selector: (r) => r.shareRatio, format: (r) => `${r.shareRatio}:${100 - r.shareRatio}`, width: '90px' },
    { name: 'Limit (₹)', selector: (r) => r.calculatedLimit, format: (r) => `₹${r.calculatedLimit.toLocaleString()}` },
    { name: 'Available (₹)', selector: (r) => Number(r.availableBalance || 0), format: (r) => `₹${Number(r.availableBalance || 0).toLocaleString()}` },
    { name: 'Status', cell: (r) => <StatusBadge status={r.status} />, width: '150px' },
    { name: 'Approval Note', selector: (r) => r.approvalNote || '-', grow: 2 },
    { name: 'Rejection Reason', selector: (r) => r.rejectionReason || '-', grow: 2 },
    { name: 'Approved By', selector: (r) => r.approvedBy || '-', width: '130px' },
    { name: 'Rejected By', selector: (r) => r.rejectedBy || '-', width: '130px' },
    ...(isAdmin
      ? [{
          name: 'Actions',
          width: '200px',
          cell: (r: DsaPayoutSubmission) => (
            <PayoutStatusSelect
              value={r.status}
              disabled={actioningId === r.id}
              onChange={(status) => handleAdminStatusChange(r, status)}
            />
          ),
          ignoreRowClick: true,
        }]
      : []),
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="DSA Payouts" subtitle="Maker stage: submit DSA payment requests for approval."
        beforeActions={<ListTableSearchInput value={tableSearch} onChange={setTableSearch} />}
        actions={[
          ...(isAdmin ? [{ label: 'Export CSV Report', onClick: exportCsv }] : []),
          { label: '+ New Submission', onClick: () => setShowForm(true) },
        ]} />

      <SectionCard title="DSA Limit Summary" className="mb-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">
            Pending: {summary.pending}
          </div>
          <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            Approved: {summary.approved}
          </div>
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
            Rejected: {summary.rejected}
          </div>
          <div className="rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800">
            Approved Limit: ₹{summary.approvedLimit.toLocaleString()}
          </div>
          <div className="rounded border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800">
            Available Balance: ₹{summary.approvedAvailable.toLocaleString()}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {isAdmin ? (
            <FormField label="Filter by DSA Code">
              <input
                className={inputClass}
                value={dsaCodeFilter}
                onChange={(e) => setDsaCodeFilter(e.target.value.toUpperCase())}
                placeholder="All DSAs"
              />
            </FormField>
          ) : null}
          <FormField label="Filter by Status">
            <select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              {PAYOUT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </FormField>
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => { setStatusFilter(''); setDsaCodeFilter(''); }}
              className="h-9 rounded border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() => { void load(); }}
              className="h-9 rounded border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary/5"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </SectionCard>

      {showForm && (
        <SectionCard title="New DSA Payout Submission" className="mb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="DSA Code" required>
              <input
                className={`${inputClass}${!isAdmin ? ' bg-slate-50 text-slate-700' : ''}`}
                value={form.dsaCode}
                placeholder="Type DSA code"
                readOnly={!isAdmin}
                onChange={(e) => handleDsaCodeChange(e.target.value)}
              />
            </FormField>
            <FormField label="DSA Name">
              <input
                className={`${inputClass}${!isAdmin ? ' bg-slate-50 text-slate-700' : ''}`}
                value={form.dsaName}
                readOnly={!isAdmin}
                onChange={(e) => setField('dsaName', e.target.value)}
              />
            </FormField>
            <FormField label="Country">
              <input
                className={`${inputClass}${!isAdmin ? ' bg-slate-50 text-slate-700' : ''}`}
                value={form.country}
                readOnly={!isAdmin}
                onChange={(e) => setField('country', e.target.value)}
              />
            </FormField>
            <FormField label="Sharing Ratio">
              <input
                type="number"
                min={0}
                max={100}
                className={inputClass}
                value={form.shareRatio}
                onKeyDown={onNumericInputKeyDown}
                onChange={(e) => {
                  const n = Number(e.target.value || 0);
                  const safe = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0;
                  setField('shareRatio', safe);
                }}
              />
            </FormField>
            <FormField label="Currency">
              <select className={inputClass} value={form.currency} onChange={(e) => handleCurrencyChange(e.target.value)}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Amount" required>
              <input type="number" min={0} step="0.01" className={inputClass} value={form.submittedAmount || ''}
                onKeyDown={onNumericInputKeyDown}
                onChange={(e) => setField('submittedAmount', parseFloat(e.target.value) || 0)} />
            </FormField>
            <FormField label="Mode">
              <select className={inputClass} value={form.mode}
                onChange={(e) => setField('mode', e.target.value as PaymentMode)}>
                {['Cash', 'QR', 'UPI', 'Swift', 'RTGS', 'NEFT'].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormField>
            <FormField label="Transaction Reference">
              <input
                className={`${inputClass} uppercase`}
                autoComplete="off"
                value={form.transactionNumber}
                onChange={(e) => setField('transactionNumber', e.target.value.toUpperCase())}
                onBlur={(e) => setField('transactionNumber', e.target.value.trim().toUpperCase())}
              />
            </FormField>
            <FormField label="Submission Date">
              <input
                type="date"
                className={`${inputClass}${!isAdmin ? ' bg-slate-50 text-slate-700' : ''}`}
                value={form.submissionDate}
                readOnly={!isAdmin}
                onChange={(e) => setField('submissionDate', e.target.value)}
              />
            </FormField>
          </div>

          {/* PAY-IN Formula */}
          <div className="mt-5 grid grid-cols-2 gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-slate-500">New Amount (INR)</p>
              <p className="text-lg font-bold text-primary">₹{currencyInr.toLocaleString()}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-slate-500">BOD Balance</p>
              <input
                type="number"
                min={0}
                className={`${inputClass} font-bold`}
                value={form.bodBalance || ''}
                onKeyDown={onNumericInputKeyDown}
                onChange={(e) => setField('bodBalance', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-slate-500">Used Value</p>
              <input
                type="number"
                min={0}
                className={`${inputClass} font-bold`}
                value={form.usedValue || ''}
                onKeyDown={onNumericInputKeyDown}
                onChange={(e) => setField('usedValue', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-slate-500">Available Balance</p>
              <p className="text-lg font-bold text-emerald-600">₹{availableBalance.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button type="button" disabled={saving} onClick={handleSubmit}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {saving ? 'Submitting…' : 'Submit for Approval'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm()); }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </SectionCard>
      )}

      <DataTableWrapper columns={columns} data={records} loading={loading} searchable
        filterText={tableSearch} onFilterTextChange={setTableSearch} hideSearchInput />
    </ErrorBoundary>
  );
};
