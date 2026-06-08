import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { FormField } from '../../../shared/components/FormField';
import { ImageUploader } from '../../../shared/components/ImageUploader';
import { BankNameInput } from '../../../shared/components/BankNameInput';
import { titleCaseWords } from '../../../utils/inputFormats';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { CountryNameSelect } from '../../../shared/components/CountryNameSelect';
import { useCountries } from '../../../shared/hooks/useCountries';
import { fetchBgtBankAccounts, saveBgtBankAccounts } from '../finance.service';
import type { BgtBankAccounts as BgtBankAccountsType, QrEntry } from '../finance.types';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const DEFAULT: BgtBankAccountsType = {
  neft: { accountHolder: '', accountNumber: '', ifsc: '', bankName: '', branch: '', city: '', country: 'India' },
  qrEntries: [],
  wire: { swiftCode: '', iban: '', bankName: '', beneficiaryName: '', country: '', city: '' },
};

function isValidAccountNumber(v: string): boolean {
  const digits = String(v || '').replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 18;
}

function isValidIfsc(v: string): boolean {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/i.test(String(v || '').trim());
}

function isValidSwift(v: string): boolean {
  const s = String(v || '').trim();
  if (!s) return true;
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(s);
}

function validateForm(data: BgtBankAccountsType): string | null {
  const { neft, wire } = data;
  if (neft.accountHolder.trim() && !neft.accountHolder.trim()) return 'Account holder name is required.';
  if (neft.accountNumber.trim() && !isValidAccountNumber(neft.accountNumber)) {
    return 'Account number must be 9–18 digits.';
  }
  if (neft.ifsc.trim() && !isValidIfsc(neft.ifsc)) return 'Enter a valid IFSC code (e.g. HDFC0001234).';
  if (neft.bankName.trim() && neft.bankName.trim().length < 3) return 'Enter a valid bank name.';
  if (neft.branch.trim() && neft.branch.trim().length < 2) return 'Enter branch (area).';
  if (wire.swiftCode.trim() && !isValidSwift(wire.swiftCode)) return 'Enter a valid SWIFT code.';
  if (wire.bankName.trim() && wire.bankName.trim().length < 3) return 'Enter a valid wire bank name.';
  if (wire.beneficiaryName.trim() && wire.beneficiaryName.trim().length < 2) return 'Enter beneficiary name.';
  return null;
}

export const BgtBankAccounts: React.FC = () => {
  const { countryNames } = useCountries();
  const [data, setData] = React.useState<BgtBankAccountsType>(DEFAULT);
  const [saving, setSaving] = React.useState(false);
  const [newQrCountry, setNewQrCountry] = React.useState('India');

  React.useEffect(() => {
    if (countryNames.length && !countryNames.includes(newQrCountry)) {
      setNewQrCountry(countryNames[0]);
    }
  }, [countryNames, newQrCountry]);

  React.useEffect(() => {
    fetchBgtBankAccounts().then((loaded) => {
      setData({
        neft: { ...DEFAULT.neft, ...loaded.neft },
        qrEntries: loaded.qrEntries || [],
        wire: { ...DEFAULT.wire, ...loaded.wire },
      });
    });
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
    const err = validateForm(data);
    if (err) {
      toast.error(err);
      return;
    }
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

      <SectionCard title="NEFT / RTGS" className="mb-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Account Holder Name">
            <input
              className={inputClass}
              value={data.neft.accountHolder}
              onChange={(e) => setNeft('accountHolder', titleCaseWords(e.target.value))}
            />
          </FormField>
          <FormField label="Account Number">
            <input
              className={inputClass}
              inputMode="numeric"
              value={data.neft.accountNumber}
              onChange={(e) => setNeft('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 18))}
              placeholder="9–18 digits"
            />
          </FormField>
          <FormField label="IFSC Code">
            <input
              className={inputClass}
              value={data.neft.ifsc}
              onChange={(e) => setNeft('ifsc', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))}
              placeholder="e.g. HDFC0001234"
            />
          </FormField>
          <FormField label="Bank Name">
            <BankNameInput value={data.neft.bankName} onChange={(v) => setNeft('bankName', v)} />
          </FormField>
          <FormField label="Branch ( Area )">
            <input
              className={inputClass}
              value={data.neft.branch}
              onChange={(e) => setNeft('branch', titleCaseWords(e.target.value))}
            />
          </FormField>
          <FormField label="City">
            <input
              className={inputClass}
              value={data.neft.city}
              onChange={(e) => setNeft('city', titleCaseWords(e.target.value))}
            />
          </FormField>
          <FormField label="Country">
            <CountryNameSelect
              className={inputClass}
              value={data.neft.country}
              onChange={(v) => setNeft('country', v)}
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="QR Code (per country)" className="mb-5">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Country</label>
            <CountryNameSelect
              className="h-9 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary"
              value={newQrCountry}
              onChange={setNewQrCountry}
            />
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

      <SectionCard title="WIRE / SWIFT">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="SWIFT Code">
            <input
              className={inputClass}
              value={data.wire.swiftCode}
              onChange={(e) => setWire('swiftCode', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))}
            />
          </FormField>
          <FormField label="IBAN">
            <input className={inputClass} value={data.wire.iban} onChange={(e) => setWire('iban', e.target.value.toUpperCase())} />
          </FormField>
          <FormField label="Bank Name">
            <BankNameInput value={data.wire.bankName} onChange={(v) => setWire('bankName', v)} />
          </FormField>
          <FormField label="Beneficiary Name">
            <input
              className={inputClass}
              value={data.wire.beneficiaryName}
              onChange={(e) => setWire('beneficiaryName', titleCaseWords(e.target.value))}
            />
          </FormField>
          <FormField label="City">
            <input
              className={inputClass}
              value={data.wire.city}
              onChange={(e) => setWire('city', titleCaseWords(e.target.value))}
            />
          </FormField>
          <FormField label="Country">
            <CountryNameSelect
              className={inputClass}
              value={data.wire.country}
              onChange={(v) => setWire('country', v)}
              placeholder="Select country"
            />
          </FormField>
        </div>
      </SectionCard>
    </ErrorBoundary>
  );
};
