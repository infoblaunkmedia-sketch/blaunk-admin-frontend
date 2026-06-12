import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { FormField } from '../../../shared/components/FormField';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { CroppableImageUploader } from '../../../shared/components/CroppableImageUploader';
import { formatDateDDMMYYYY } from '../../../shared/utils/dateFormat';
import { BankNameInput } from '../../../shared/components/BankNameInput';
import { useCountries } from '../../../shared/hooks/useCountries';
import {
  DEPARTMENTS,
  DESIGNATIONS,
  normalizeThirdPartyDepartment,
  THIRD_PARTY_ENTITY_OPTIONS,
  THIRD_PARTY_REMARK_OPTIONS,
  THIRD_PARTY_STATUS_OPTIONS,
  THIRD_PARTY_VERIFIED_STATUS_OPTIONS,
} from '../../../shared/constants/hrConstants';
import type { ThirdPartyCredential } from './thirdPartyCredentials.types';
import {
  fetchThirdPartyCredentials,
  saveThirdPartyCredential,
  deleteThirdPartyCredential,
  upload3pImage,
} from './thirdPartyCredentials.service';
import {
  digitsOnlyMax,
  INDIAN_PINCODE_DIGITS_MAX,
  isValidIndianPan,
  MOBILE_DIGITS_MAX,
  sanitizePan,
  titleCaseWords,
} from '../../../utils/inputFormats';
import { onIntegerInputKeyDown } from '../../../shared/utils/numericInput';
import {
  applySharingRatioEdit,
  findReferenceContactIssue,
  validateImageFileForUpload,
  validateSharingRatioStrings,
} from '../../../shared/validation/contactFormMessages';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

function isVerifierDepartment(department: string): boolean {
  const d = normalizeThirdPartyDepartment(department).toLowerCase();
  return d === 'verifier' || d === 'verifiers';
}

function IconEdit({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

const emptyForm = (): Omit<ThirdPartyCredential, 'id'> => ({
  department: '',
  name: '',
  aadharNo: '',
  mobileNo: '',
  email: '',
  panNo: '',
  tanNo: '',
  passportNo: '',
  gender: '',
  address1: '',
  address2: '',
  city: '',
  zip: '',
  country: '',
  state: '',
  threePCompanyName: '',
  threePEmplCode: '',
  matchCode: '',
  threePEntity: '',
  businessCode: '',
  branchCode: '',
  gstTaxNo: '',
  bankName: '',
  ifscCode: '',
  bankAccountNumber: '',
  bankCity: '',
  bankCountry: '',
  swiftNo: '',
  ibanNo: '',
  doj: '',
  ira: '',
  remarks: '',
  status: '',
  exitDate: '',
  verifiedStatus: '',
  businessDeposit: '',
  businessDepositCurrency: 'INR',
  verifierFees: '',
  sharingThreeP: '0',
  sharingBlaunk: '100',
  commissionSubscriber: '',
  commissionRenewal: '',
  references: [
    { name: '', mobile: '', designation: '', city: '' },
    { name: '', mobile: '', designation: '', city: '' },
  ],
  employeePhotoUrl: '',
  profileImageUrl: '',
  chqImageUrl: '',
  panImageUrl: '',

  // Legacy
  username: '',
  password: '',
  url: '',
  notes: '',
});

export const ThirdPartyCredentials: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = React.useState<'list' | 'form'>('list');
  const [readOnly, setReadOnly] = React.useState(false);
  const [records, setRecords] = React.useState<ThirdPartyCredential[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [form, setForm] = React.useState(emptyForm());
  const [editId, setEditId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [showPass, setShowPass] = React.useState<Record<string, boolean>>({});
  const [tableSearch, setTableSearch] = React.useState('');
  const { countries, loading: countriesLoading } = useCountries();
  const currencyOptions = React.useMemo(() => {
    const seen = new Set<string>();
    const out: { code: string; icon: string }[] = [];
    for (const c of countries) {
      const code = String(c.currencyCode || '').trim().toUpperCase();
      const icon = String(c.icon || code).trim();
      if (!code || seen.has(code)) continue;
      seen.add(code);
      out.push({ code, icon });
    }
    return out.sort((a, b) => a.code.localeCompare(b.code));
  }, [countries]);
  const verifierDept = isVerifierDepartment(form.department);
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setRecords(await fetchThirdPartyCredentials());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleNew = () => {
    setReadOnly(false);
    setEditId(null);
    setForm(emptyForm());
    setView('form');
  };

  const openForm = (r: ThirdPartyCredential, viewOnly: boolean) => {
    setReadOnly(viewOnly);
    setEditId(r.id);
    setForm({
      ...emptyForm(),
      ...r,
      department: normalizeThirdPartyDepartment(r.department || ''),
      references:
        r.references?.length
          ? [
              r.references[0] ?? { name: '', mobile: '', designation: '', city: '' },
              r.references[1] ?? { name: '', mobile: '', designation: '', city: '' },
            ]
          : emptyForm().references,
    });
    setView('form');
  };

  const handleView = (r: ThirdPartyCredential) => {
    if (!r.id) return;
    navigate(`/people/3p-credentials/${encodeURIComponent(r.id)}`);
  };

  const handleEdit = (r: ThirdPartyCredential) => openForm(r, false);

  const handleSave = async () => {
    const empCode = String(form.threePEmplCode || '').trim().toUpperCase();
    if (!editId && !empCode) {
      toast.error('3P employee code is required.');
      return;
    }
    if (!form.name.trim()) {
      toast.error('Please enter the person’s name.');
      return;
    }
    if (String(form.mobileNo || '').trim() && String(form.mobileNo).length !== MOBILE_DIGITS_MAX) {
      toast.error('Mobile number must be exactly 10 digits.');
      return;
    }
    if (String(form.panNo || '').trim() && !isValidIndianPan(form.panNo)) {
      toast.error('PAN is not valid. Use 5 letters, 4 digits, and 1 letter (e.g. ABCDE1234F).');
      return;
    }
    if (String(form.zip || '').trim() && String(form.zip).length !== INDIAN_PINCODE_DIGITS_MAX) {
      toast.error('PIN code must be exactly 6 digits.');
      return;
    }
    if (form.status === 'Exit' && !String(form.exitDate || '').trim()) {
      toast.error('Exit date is required when status is Exit.');
      return;
    }
    const sharingErr = validateSharingRatioStrings(form.sharingThreeP, form.sharingBlaunk);
    if (sharingErr) {
      toast.error(sharingErr);
      return;
    }
    const refErr = findReferenceContactIssue(form.references);
    if (refErr) {
      toast.error(refErr);
      return;
    }
    setSaving(true);
    try {
      const record: ThirdPartyCredential = {
        ...form,
        threePEmplCode: empCode || form.threePEmplCode,
        id: editId ?? '',
      };
      await saveThirdPartyCredential(record);
      toast.success(editId ? 'Credential updated' : 'Credential added');
      setView('list');
      setForm(emptyForm());
      setEditId(null);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    try {
      await deleteThirdPartyCredential(confirmDel);
      toast.success('Credential deleted');
      setConfirmDel(null);
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  const columns: TableColumn<ThirdPartyCredential>[] = [
    { name: '3PC Code', selector: (r) => r.threePEmplCode, sortable: true, width: '120px' },
    {
      name: 'Match Code',
      selector: (r) => r.matchCode || '—',
      sortable: true,
      width: '130px',
      cell: (r) => (
        <span className="font-mono text-xs text-slate-600" title="Synced from Management → Match Code">
          {r.matchCode || '—'}
        </span>
      ),
    },
    { name: 'Name', selector: (r) => r.name, sortable: true, grow: 2 },
    {
      name: 'Department',
      selector: (r) => normalizeThirdPartyDepartment(r.department || ''),
      sortable: true,
      width: '160px',
    },
    { name: 'Mobile', selector: (r) => r.mobileNo, sortable: true, width: '130px' },
    { name: 'Email', selector: (r) => r.email, sortable: true, grow: 1 },
    {
      name: 'Status',
      selector: (r) => r.status,
      sortable: true,
      width: '120px',
    },
    {
      name: 'Updated',
      selector: (r) => r.updatedAt ?? r.createdAt ?? '',
      format: (r) => formatDateDDMMYYYY(String(r.updatedAt || r.createdAt || '')) || '—',
      width: '110px',
    },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleView(r)}
            disabled={!r.id}
            className="rounded border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            title="View details"
            aria-label="View credential details"
          >
            <IconEye />
          </button>
          <button
            type="button"
            onClick={() => handleEdit(r)}
            className="rounded border border-slate-200 p-1.5 text-primary transition hover:bg-slate-50"
            title="Edit"
            aria-label="Edit credential"
          >
            <IconEdit />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDel(r.id)}
            className="rounded border border-slate-200 p-1.5 text-red-600 transition hover:bg-red-50"
            title="Delete"
            aria-label="Delete credential"
          >
            <IconTrash />
          </button>
        </div>
      ),
      width: '140px',
      ignoreRowClick: true,
    },
  ];

  if (view === 'form') {
    return (
      <ErrorBoundary>
        <PageHeader
          title={
            readOnly
              ? 'Admin Panel DSA / 3P Employee'
              : editId
                ? 'Edit Admin Panel DSA / 3P Employee'
                : 'New Admin Panel DSA / 3P Employee'
          }
          subtitle={
            readOnly
              ? 'View-only details for this admin panel DSA / 3P employee.'
              : 'Add or update onboarding data for admin panel DSA / 3P employees.'
          }
        />
        <div className="flex flex-col gap-5">
        <SectionCard title={readOnly ? 'Credential Details' : editId ? 'Edit Credential' : 'New Credential'}>
          <fieldset disabled={readOnly} className="min-w-0 border-0 p-0 disabled:opacity-95">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Department">
              <select className={inputClass} value={form.department} onChange={(e) => setField('department', e.target.value)}>
                <option value="">Select</option>
                {DEPARTMENTS.map((d) => ( 
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="3P Emp Code" required>
              <input
                className={editId ? `${inputClass} cursor-not-allowed bg-slate-100 text-slate-600` : inputClass}
                value={form.threePEmplCode}
                readOnly={Boolean(editId)}
                maxLength={20}
                placeholder="e.g. 3PC001"
                onChange={(e) =>
                  setField('threePEmplCode', e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase())
                }
              />
            </FormField>
            <FormField label="Name" required>
              <input
                className={inputClass}
                placeholder="Name"
                value={form.name}
                onChange={(e) => setField('name', titleCaseWords(e.target.value))}
              />
            </FormField>
            <FormField label="Mobile No">
              <input
                className={inputClass}
                inputMode="numeric"
                maxLength={MOBILE_DIGITS_MAX}
                onKeyDown={onIntegerInputKeyDown}
                value={form.mobileNo}
                onChange={(e) => setField('mobileNo', digitsOnlyMax(e.target.value, MOBILE_DIGITS_MAX))}
              />
            </FormField>
            <FormField label="Email">
              <input
                className={inputClass}
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
              />
            </FormField>

            <FormField label="Aadhaar No">
              <input className={inputClass} value={form.aadharNo} onChange={(e) => setField('aadharNo', e.target.value)} />
            </FormField>
            <FormField label="Passport No">
              <input className={inputClass} value={form.passportNo} onChange={(e) => setField('passportNo', e.target.value)} />
            </FormField>
            <FormField label="PAN Card No">
              <input
                className={inputClass}
                maxLength={10}
                placeholder="ABCDE1234F"
                value={form.panNo}
                onChange={(e) => setField('panNo', sanitizePan(e.target.value))}
              />
            </FormField>
            <FormField label="TAN No">
              <input className={inputClass} value={form.tanNo} onChange={(e) => setField('tanNo', e.target.value.toUpperCase())} />
            </FormField>

            <FormField label="Gender">
              <select className={inputClass} value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </FormField>
            <FormField label="Address 1">
              <input
                className={inputClass}
                value={form.address1}
                onChange={(e) => setField('address1', titleCaseWords(e.target.value))}
              />
            </FormField>
            <FormField label="Address 2">
              <input
                className={inputClass}
                value={form.address2}
                onChange={(e) => setField('address2', titleCaseWords(e.target.value))}
              />
            </FormField>
            <FormField label="City">
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) => setField('city', titleCaseWords(e.target.value))}
              />
            </FormField>
            <FormField label="PIN Code">
              <input
                className={inputClass}
                inputMode="numeric"
                maxLength={INDIAN_PINCODE_DIGITS_MAX}
                onKeyDown={onIntegerInputKeyDown}
                value={form.zip}
                onChange={(e) => setField('zip', digitsOnlyMax(e.target.value, INDIAN_PINCODE_DIGITS_MAX))}
              />
            </FormField>
            <FormField label="Country">
              <input className={inputClass} value={form.country} onChange={(e) => setField('country', e.target.value)} />
            </FormField>
            <FormField label="State">
              <input className={inputClass} value={form.state} onChange={(e) => setField('state', e.target.value)} />
            </FormField>

            <FormField label="3PC Company Name">
              <input
                className={inputClass}
                value={form.threePCompanyName}
                onChange={(e) => setField('threePCompanyName', titleCaseWords(e.target.value))}
              />
            </FormField>
            <FormField label="3PC Entity">
              <select className={inputClass} value={form.threePEntity} onChange={(e) => setField('threePEntity', e.target.value)}>
                <option value="">Select entity</option>
                {THIRD_PARTY_ENTITY_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Business Code">
              <input className={inputClass} value={form.businessCode} onChange={(e) => setField('businessCode', e.target.value)} />
            </FormField>
            <FormField label="Branch Code">
              <input className={inputClass} value={form.branchCode} onChange={(e) => setField('branchCode', e.target.value)} />
            </FormField>
            <FormField label="GST/TAX No">
              <input className={inputClass} value={form.gstTaxNo} onChange={(e) => setField('gstTaxNo', e.target.value)} />
            </FormField>
          </div>
          </fieldset>
        </SectionCard>

        <SectionCard title="Bank Details">
          <fieldset disabled={readOnly} className="min-w-0 border-0 p-0 disabled:opacity-95">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="Bank Name">
                <BankNameInput
                  className={inputClass}
                  value={form.bankName}
                  onChange={(v) => setField('bankName', v)}
                  disabled={readOnly}
                />
              </FormField>
              <FormField label="IFSC Code">
                <input className={inputClass} value={form.ifscCode} onChange={(e) => setField('ifscCode', e.target.value.toUpperCase())} />
              </FormField>
              <FormField label="Bank Account No">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  onKeyDown={onIntegerInputKeyDown}
                  value={form.bankAccountNumber}
                  onChange={(e) => setField('bankAccountNumber', e.target.value.replace(/\D/g, '').slice(0, 18))}
                />
              </FormField>
              <FormField label="City">
                <input
                  className={inputClass}
                  value={form.bankCity}
                  onChange={(e) => setField('bankCity', titleCaseWords(e.target.value))}
                />
              </FormField>
              <FormField label="Country">
                <input
                  className={inputClass}
                  value={form.bankCountry}
                  onChange={(e) => setField('bankCountry', titleCaseWords(e.target.value))}
                />
              </FormField>
              <FormField label="SWIFT No">
                <input className={inputClass} value={form.swiftNo} onChange={(e) => setField('swiftNo', e.target.value.toUpperCase())} />
              </FormField>
              <FormField label="IBAN No">
                <input className={inputClass} value={form.ibanNo} onChange={(e) => setField('ibanNo', e.target.value.toUpperCase())} />
              </FormField>
            </div>
          </fieldset>
        </SectionCard>

        <SectionCard title="Employment & Agreement">
          <fieldset disabled={readOnly} className="min-w-0 border-0 p-0 disabled:opacity-95">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="DOJ">
              <input type="date" className={inputClass} value={form.doj} onChange={(e) => setField('doj', e.target.value)} />
            </FormField>
            <FormField label="IRA">
              <input className={inputClass} value={form.ira} onChange={(e) => setField('ira', e.target.value)} />
            </FormField>
            <FormField label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => {
                  const next = e.target.value;
                  setForm((p) => ({
                    ...p,
                    status: next,
                    exitDate: next === 'Exit' ? p.exitDate : '',
                  }));
                }}
              >
                <option value="">Select status</option>
                {THIRD_PARTY_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
            {form.status === 'Exit' ? (
              <FormField label="Exit Date" required>
                <input
                  type="date"
                  className={inputClass}
                  value={form.exitDate}
                  onChange={(e) => setField('exitDate', e.target.value)}
                />
              </FormField>
            ) : null}
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Verified Status">
              <select className={inputClass} value={form.verifiedStatus} onChange={(e) => setField('verifiedStatus', e.target.value)}>
                <option value="">Select verified status</option>
                {THIRD_PARTY_VERIFIED_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Remark">
              <select className={inputClass} value={form.remarks} onChange={(e) => setField('remarks', e.target.value)}>
                <option value="">Select remark</option>
                {THIRD_PARTY_REMARK_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Business Deposit">
              <input
                className={inputClass}
                inputMode="decimal"
                placeholder="Business deposit"
                value={form.businessDeposit}
                onChange={(e) => setField('businessDeposit', e.target.value)}
              />
            </FormField>
            <FormField label="Currency">
              <select
                className={inputClass}
                value={form.businessDepositCurrency}
                disabled={countriesLoading}
                onChange={(e) => setField('businessDepositCurrency', e.target.value)}
              >
                {countriesLoading ? <option value="">Loading…</option> : null}
                {currencyOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.icon} ({c.code})
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Sharing Ratio (3P : Blaunk)">
              <div className="grid w-full grid-cols-2 gap-2">
                <input
                  className={`${inputClass} min-w-0 px-2 text-center`}
                  inputMode="numeric"
                  placeholder="0"
                  maxLength={3}
                  onKeyDown={onIntegerInputKeyDown}
                  value={form.sharingThreeP}
                  onChange={(e) => {
                    const next = applySharingRatioEdit('threeP', e.target.value);
                    setForm((p) => ({
                      ...p,
                      sharingThreeP: next.sharingThreeP,
                      sharingBlaunk: next.sharingBlaunk,
                    }));
                  }}
                />
                <input
                  className={`${inputClass} min-w-0 px-2 text-center`}
                  inputMode="numeric"
                  placeholder="100"
                  maxLength={3}
                  onKeyDown={onIntegerInputKeyDown}
                  value={form.sharingBlaunk}
                  onChange={(e) => {
                    const next = applySharingRatioEdit('blaunk', e.target.value);
                    setForm((p) => ({
                      ...p,
                      sharingThreeP: next.sharingThreeP,
                      sharingBlaunk: next.sharingBlaunk,
                    }));
                  }}
                />
              </div>
            </FormField>
            <FormField label="Commission Subscriber">
              <input
                className={inputClass}
                inputMode="decimal"
                placeholder="Commission subscriber"
                value={form.commissionSubscriber}
                onChange={(e) => setField('commissionSubscriber', e.target.value)}
              />
            </FormField>
            <FormField label="Commission Renewal">
              <input
                className={inputClass}
                inputMode="decimal"
                placeholder="Commission renewal"
                value={form.commissionRenewal}
                onChange={(e) => setField('commissionRenewal', e.target.value)}
              />
            </FormField>
            {verifierDept ? (
              <FormField label="Verifier Fees">
                <input
                  className={inputClass}
                  inputMode="decimal"
                  placeholder="Verifier fees"
                  value={form.verifierFees}
                  onChange={(e) => setField('verifierFees', e.target.value)}
                />
              </FormField>
            ) : null}
          </div>
          </fieldset>
        </SectionCard>

        <SectionCard title="References">
          <fieldset disabled={readOnly} className="min-w-0 border-0 p-0 disabled:opacity-95">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              {form.references.slice(0, 2).map((ref, idx) => (
                <React.Fragment key={idx}>
                  <FormField label="Name">
                    <input
                      className={inputClass}
                      value={ref.name}
                      onChange={(e) => {
                        const next = [...form.references];
                        next[idx] = { ...next[idx], name: titleCaseWords(e.target.value) };
                        setField('references', next);
                      }}
                    />
                  </FormField>
                  <FormField label="Mobile No">
                    <input
                      className={inputClass}
                      inputMode="numeric"
                      maxLength={MOBILE_DIGITS_MAX}
                      onKeyDown={onIntegerInputKeyDown}
                      value={ref.mobile}
                      onChange={(e) => {
                        const next = [...form.references];
                        next[idx] = {
                          ...next[idx],
                          mobile: digitsOnlyMax(e.target.value, MOBILE_DIGITS_MAX),
                        };
                        setField('references', next);
                      }}
                    />
                  </FormField>
                  <FormField label="Designation">
                    <select
                      className={inputClass}
                      value={ref.designation}
                      onChange={(e) => {
                        const next = [...form.references];
                        next[idx] = { ...next[idx], designation: e.target.value };
                        setField('references', next);
                      }}
                    >
                      <option value="">Select Designation</option>
                      {DESIGNATIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="City">
                    <input
                      className={inputClass}
                      value={ref.city}
                      onChange={(e) => {
                        const next = [...form.references];
                        next[idx] = { ...next[idx], city: titleCaseWords(e.target.value) };
                        setField('references', next);
                      }}
                    />
                  </FormField>
                </React.Fragment>
              ))}
            </div>
          </fieldset>
        </SectionCard>

        <SectionCard title="Documents">
          <fieldset disabled={readOnly} className="min-w-0 border-0 p-0 disabled:opacity-95">
            <div className="flex flex-wrap gap-6">
              <CroppableImageUploader
                label="Profile Image"
                maxBytes={200 * 1024}
                maxSizeHint="200KB"
                aspect={1}
                aspectLabel="1:1"
                disabled={readOnly}
                currentPreview={form.profileImageUrl}
                onFile={async (file) => {
                  const bad = validateImageFileForUpload(file, 200 * 1024);
                  if (bad) {
                    toast.error(bad);
                    return;
                  }
                  try {
                    const url = await upload3pImage(file);
                    setField('profileImageUrl', url);
                    toast.success('Profile image uploaded');
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Upload failed. Please try again.');
                  }
                }}
              />
              <CroppableImageUploader
                label="Address Proof"
                maxBytes={200 * 1024}
                maxSizeHint="200KB"
                aspect={3 / 4}
                aspectLabel="3:4"
                disabled={readOnly}
                currentPreview={form.employeePhotoUrl}
                onFile={async (file) => {
                  const bad = validateImageFileForUpload(file, 200 * 1024);
                  if (bad) {
                    toast.error(bad);
                    return;
                  }
                  try {
                    const url = await upload3pImage(file);
                    setField('employeePhotoUrl', url);
                    toast.success('Address proof uploaded');
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Upload failed. Please try again.');
                  }
                }}
              />
              <CroppableImageUploader
                label="CHQ Image"
                maxBytes={200 * 1024}
                maxSizeHint="200KB"
                aspect={16 / 9}
                aspectLabel="16:9"
                previewButtonClass="h-28 w-40"
                dialogMaxWidthClass="max-w-5xl"
                cropAreaHeightClass="h-[min(60vh,520px)]"
                disabled={readOnly}
                currentPreview={form.chqImageUrl}
                onFile={async (file) => {
                  const bad = validateImageFileForUpload(file, 200 * 1024);
                  if (bad) {
                    toast.error(bad);
                    return;
                  }
                  try {
                    const url = await upload3pImage(file);
                    setField('chqImageUrl', url);
                    toast.success('CHQ image uploaded');
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Upload failed. Please try again.');
                  }
                }}
              />
              <CroppableImageUploader
                label="PAN Card"
                maxBytes={200 * 1024}
                maxSizeHint="200KB"
                aspect={4 / 3}
                aspectLabel="4:3"
                disabled={readOnly}
                currentPreview={form.panImageUrl}
                onFile={async (file) => {
                  const bad = validateImageFileForUpload(file, 200 * 1024);
                  if (bad) {
                    toast.error(bad);
                    return;
                  }
                  try {
                    const url = await upload3pImage(file);
                    setField('panImageUrl', url);
                    toast.success('PAN image uploaded');
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Upload failed. Please try again.');
                  }
                }}
              />
            </div>
          </fieldset>
        </SectionCard>

          <div className="mt-4 flex gap-3">
            {!readOnly ? (
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {saving ? 'Saving…' : editId ? 'Update' : 'Add Credential'}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setView('list');
                setForm(emptyForm());
                setEditId(null);
                setReadOnly(false);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {readOnly ? 'Back to list' : 'Cancel'}
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <PageHeader
        title="Admin Panel DSA / 3P Employees"
        subtitle="Manage admin panel DSA / 3P employees. Match codes sync automatically from Management."
        beforeActions={<ListTableSearchInput value={tableSearch} onChange={setTableSearch} />}
        actions={[{ label: '+ Add Credential', onClick: handleNew }]}
      />
      <DataTableWrapper columns={columns} data={records} loading={loading} searchable
        filterText={tableSearch} onFilterTextChange={setTableSearch} hideSearchInput />
      {confirmDel && (
        <ConfirmDialog
          title="Delete Credential"
          message="Delete this credential permanently?"
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </ErrorBoundary>
  );
};

