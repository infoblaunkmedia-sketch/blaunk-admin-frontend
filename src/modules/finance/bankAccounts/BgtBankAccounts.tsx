import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { FormField } from '../../../shared/components/FormField';
import { ImageUploader } from '../../../shared/components/ImageUploader';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { COUNTRIES } from '../../../shared/constants/hrConstants';
import { fetchBgtBankAccounts, saveBgtBankAccounts } from '../finance.service';
import type { BgtBankAccounts as BgtBankAccountsType, QrEntry } from '../finance.types';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const DEFAULT: BgtBankAccountsType = {
  neft: { accountHolder: '', accountNumber: '', ifsc: '', bankName: '', branch: '' },
  qrEntries: [],
  wire: { swiftCode: '', iban: '', bankName: '', beneficiaryName: '', country: '' },
};

export const BgtBankAccounts: React.FC = () => {
  const [data, setData] = React.useState<BgtBankAccountsType>(DEFAULT);
  const [saving, setSaving] = React.useState(false);
  const [newQrCountry, setNewQrCountry] = React.useState('India');

  React.useEffect(() => {
    fetchBgtBankAccounts().then(setData);
  }, []);

  const setNeft = <K extends keyof BgtBankAccountsType['neft']>(k: K, v: string) =>
    setData((p) => ({ ...p, neft: { ...p.neft, [k]: v } }));

  const setWire = <K extends keyof BgtBankAccountsType['wire']>(k: K, v: string) =>
    setData((p) => ({ ...p, wire: { ...p.wire, [k]: v } }));

  const addQrEntry = () => {
    if (data.qrEntries.some((e) => e.country === newQrCountry)) {
      toast.info(`QR for ${newQrCountry} already exists`); return;
    }
    setData((p) => ({ ...p, qrEntries: [...p.qrEntries, { country: newQrCountry, imageUrl: '' }] }));
  };

  const removeQrEntry = (country: string) =>
    setData((p) => ({ ...p, qrEntries: p.qrEntries.filter((e) => e.country !== country) }));

  const setQrImage = (country: string, imageUrl: string) =>
    setData((p) => ({
      ...p,
      qrEntries: p.qrEntries.map((e) => e.country === country ? { ...e, imageUrl } : e),
    }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveBgtBankAccounts(data);
      toast.success('BGT bank accounts saved');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <ErrorBoundary>
      <PageHeader
        title="BGT Bank Accounts"
        subtitle="Payment methods shown to BGT vendors when they choose to pay."
        actions={[{ label: saving ? 'Saving…' : 'Save All', onClick: handleSave }]}
      />

      {/* NEFT / RTGS */}
      <SectionCard title="NEFT / RTGS" className="mb-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ['accountHolder', 'Account Holder Name'],
            ['accountNumber', 'Account Number'],
            ['ifsc', 'IFSC Code'],
            ['bankName', 'Bank Name'],
            ['branch', 'Branch'],
          ] as [keyof BgtBankAccountsType['neft'], string][]).map(([key, label]) => (
            <FormField key={key} label={label}>
              <input className={inputClass} value={data.neft[key]}
                onChange={(e) => setNeft(key, e.target.value)} />
            </FormField>
          ))}
        </div>
      </SectionCard>

      {/* QR Codes */}
      <SectionCard title="QR Code (per country)" className="mb-5">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Country</label>
            <select className="h-9 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary"
              value={newQrCountry} onChange={(e) => setNewQrCountry(e.target.value)}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button type="button" onClick={addQrEntry}
            className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">
            + Add Country QR
          </button>
        </div>
        {data.qrEntries.length === 0 ? (
          <p className="text-sm text-slate-400">No QR entries yet. Add a country above.</p>
        ) : (
          <div className="flex flex-wrap gap-5">
            {data.qrEntries.map((entry: QrEntry) => (
              <div key={entry.country} className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-bold text-slate-700">{entry.country}</p>
                <ImageUploader
                  currentPreview={entry.imageUrl}
                  onFile={(_, url) => setQrImage(entry.country, url)}
                  maxSizeMB={1}
                  label="Upload QR"
                />
                <button type="button" onClick={() => removeQrEntry(entry.country)}
                  className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* WIRE / SWIFT */}
      <SectionCard title="WIRE / SWIFT">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {([
            ['swiftCode', 'SWIFT Code'],
            ['iban', 'IBAN'],
            ['bankName', 'Bank Name'],
            ['beneficiaryName', 'Beneficiary Name'],
            ['country', 'Country'],
          ] as [keyof BgtBankAccountsType['wire'], string][]).map(([key, label]) => (
            <FormField key={key} label={label}>
              <input className={inputClass} value={data.wire[key]}
                onChange={(e) => setWire(key, e.target.value)} />
            </FormField>
          ))}
        </div>
      </SectionCard>
    </ErrorBoundary>
  );
};
