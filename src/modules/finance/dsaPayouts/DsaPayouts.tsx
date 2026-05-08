import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { fetchDsaRecords } from '../../channelPartners/channelPartners.service';
import { fetchDsaLimitConfig } from '../../platform/platform.service';
import { fetchDsaPayouts, saveDsaPayout } from '../finance.service';
import type { DsaPayoutSubmission, PaymentMode } from '../finance.types';

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
  const [records, setRecords] = React.useState<DsaPayoutSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm());
  const [currencyRate, setCurrencyRate] = React.useState(1);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setRecords(await fetchDsaPayouts());
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleDsaCodeChange = async (code: string) => {
    setForm((p) => ({ ...p, dsaCode: code }));
    if (code.length >= 3) {
      const dsaList = await fetchDsaRecords();
      const dsa = dsaList.find((d) => d.dsaCode.toLowerCase() === code.toLowerCase());
      if (dsa) {
        setForm((p) => ({
          ...p, dsaCode: dsa.dsaCode, dsaName: dsa.companyName,
          country: dsa.country, shareRatio: dsa.shareRatio,
        }));
      }
    }
  };

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
        status: 'PENDING_APPROVAL',
      };
      await saveDsaPayout(record);
      toast.success('Submission sent for approval');
      setShowForm(false);
      setForm(emptyForm());
      load();
    } catch { toast.error('Submit failed'); }
    finally { setSaving(false); }
  };

  const columns: TableColumn<DsaPayoutSubmission>[] = [
    { name: 'DSA Code', selector: (r) => r.dsaCode, sortable: true, width: '110px' },
    { name: 'DSA Name', selector: (r) => r.dsaName, sortable: true, grow: 2 },
    { name: 'Amount', selector: (r) => r.submittedAmount, format: (r) => `${r.currency} ${r.submittedAmount.toLocaleString()}` },
    { name: 'INR', selector: (r) => r.currencyInr, format: (r) => `₹${r.currencyInr.toLocaleString()}` },
    { name: 'Share %', selector: (r) => r.shareRatio, format: (r) => `${r.shareRatio}:${100 - r.shareRatio}`, width: '90px' },
    { name: 'Limit (₹)', selector: (r) => r.calculatedLimit, format: (r) => `₹${r.calculatedLimit.toLocaleString()}` },
    { name: 'Date', selector: (r) => r.submissionDate, width: '110px' },
    { name: 'Status', cell: (r) => <StatusBadge status={r.status} />, width: '150px' },
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="DSA Payouts" subtitle="Maker stage: submit DSA payment requests for approval."
        actions={[{ label: '+ New Submission', onClick: () => setShowForm(true) }]} />

      {showForm && (
        <SectionCard title="New DSA Payout Submission" className="mb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="DSA Code" required>
              <input className={inputClass} value={form.dsaCode} placeholder="Type DSA code"
                onChange={(e) => handleDsaCodeChange(e.target.value)} />
            </FormField>
            <FormField label="DSA Name">
              <input className={`${inputClass} bg-slate-50`} value={form.dsaName} readOnly />
            </FormField>
            <FormField label="Country">
              <input className={`${inputClass} bg-slate-50`} value={form.country} readOnly />
            </FormField>
            <FormField label="Sharing Ratio">
              <input className={`${inputClass} bg-slate-50`} value={`${form.shareRatio}:${100 - form.shareRatio}`} readOnly />
            </FormField>
            <FormField label="Currency">
              <select className={inputClass} value={form.currency} onChange={(e) => handleCurrencyChange(e.target.value)}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Amount" required>
              <input type="number" min={0} step="0.01" className={inputClass} value={form.submittedAmount || ''}
                onChange={(e) => setField('submittedAmount', parseFloat(e.target.value) || 0)} />
            </FormField>
            <FormField label="Mode">
              <select className={inputClass} value={form.mode}
                onChange={(e) => setField('mode', e.target.value as PaymentMode)}>
                {['Cash', 'QR', 'Swift', 'RTGS', 'NEFT'].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormField>
            <FormField label="Transaction Reference">
              <input className={inputClass} value={form.transactionNumber}
                onChange={(e) => setField('transactionNumber', e.target.value)} />
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
              <input type="number" min={0} className={`${inputClass} font-bold`}
                value={form.bodBalance || ''} onChange={(e) => setField('bodBalance', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-slate-500">Used Value</p>
              <input type="number" min={0} className={`${inputClass} font-bold`}
                value={form.usedValue || ''} onChange={(e) => setField('usedValue', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-slate-500">Available Balance</p>
              <p className="text-lg font-bold text-emerald-600">₹{availableBalance.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-700">Calculated Limit</p>
            <p className="text-xl font-bold text-amber-800">
              ₹{calculatedLimit.toLocaleString()}
              <span className="ml-2 text-xs font-normal text-amber-600">
                = INR {currencyInr.toLocaleString()} + ({form.shareRatio}% × {currencyInr.toLocaleString()})
              </span>
            </p>
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

      <DataTableWrapper columns={columns} data={records} loading={loading} searchable />
    </ErrorBoundary>
  );
};
