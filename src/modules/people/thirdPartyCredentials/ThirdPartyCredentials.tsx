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
import { ImageUploader } from '../../../shared/components/ImageUploader';
import { BankNameInput } from '../../../shared/components/BankNameInput';
import {
  DEPARTMENTS,
  DESIGNATIONS,
  THIRD_PARTY_ENTITY_OPTIONS,
  THIRD_PARTY_REMARK_OPTIONS,
  THIRD_PARTY_STATUS_OPTIONS,
  THIRD_PARTY_VERIFIED_STATUS_OPTIONS,
} from '../../../shared/constants/hrConstants';
import type { ThirdPartyCredential } from './thirdPartyCredentials.types';
import {
  fetchThirdPartyCredentials,
  fetchNextThreePcEmployeeCode,
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
  threePEntity: '',
  businessCode: '',
  branchCode: '',
  gstTaxNo: '',
  bankName: '',
  ifscCode: '',
  bankAccountNumber: '',
  swiftNo: '',
  ibanNo: '',
  doj: '',
  ira: '',
  remarks: '',
  status: '',
  exitDate: '',
  verifiedStatus: '',
  businessDeposit: '',
  sharingThreeP: '0',
  sharingBlaunk: '100',
  references: [
    { name: '', mobile: '', designation: '', city: '' },
    { name: '', mobile: '', designation: '', city: '' },
  ],
  employeePhotoUrl: '',
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

  const handleNew = async () => {
    try {
      setReadOnly(false);
      setEditId(null);
      const nextCode = await fetchNextThreePcEmployeeCode();
      setForm({ ...emptyForm(), threePEmplCode: nextCode });
      setView('form');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to generate 3PC employee code';
      toast.error(msg);
    }
  };

  const openForm = (r: ThirdPartyCredential, viewOnly: boolean) => {
    setReadOnly(viewOnly);
    setEditId(r.id);
    setForm({
      ...emptyForm(),
      ...r,
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
    { name: 'Name', selector: (r) => r.name, sortable: true, grow: 2 },
    { name: 'Department', selector: (r) => r.department, sortable: true, width: '160px' },
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
      format: (r) => (r.updatedAt || r.createdAt ? new Date(r.updatedAt || r.createdAt || '').toLocaleDateString() : '—'),
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
          title={readOnly ? '3P Credential Details' : editId ? 'Edit 3P Credential' : 'New 3P Credential'}
          subtitle={readOnly ? 'View-only details for this 3PC record.' : 'Add or update 3P credential details.'}
        />
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
              <input className={inputClass} value={form.address1} onChange={(e) => setField('address1', e.target.value)} />
            </FormField>
            <FormField label="Address 2">
              <input className={inputClass} value={form.address2} onChange={(e) => setField('address2', e.target.value)} />
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
              <input className={inputClass} value={form.threePCompanyName} onChange={(e) => setField('threePCompanyName', e.target.value)} />
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
              <input className={inputClass} value={form.bankAccountNumber} onChange={(e) => setField('bankAccountNumber', e.target.value)} />
            </FormField>
            <FormField label="SWIFT No">
              <input className={inputClass} value={form.swiftNo} onChange={(e) => setField('swiftNo', e.target.value)} />
            </FormField>
            <FormField label="IBAN No">
              <input className={inputClass} value={form.ibanNo} onChange={(e) => setField('ibanNo', e.target.value)} />
            </FormField>

            <FormField label="DOJ">
              <input type="date" className={inputClass} value={form.doj} onChange={(e) => setField('doj', e.target.value)} />
            </FormField>
            <FormField label="IRA">
              <input className={inputClass} value={form.ira} onChange={(e) => setField('ira', e.target.value)} />
            </FormField>
            <FormField label="Exit Date">
              <input type="date" className={inputClass} value={form.exitDate} onChange={(e) => setField('exitDate', e.target.value)} />
            </FormField>
            <FormField label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => setField('status', e.target.value)}>
                <option value="">Select status</option>
                {THIRD_PARTY_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </FormField>
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
            <FormField label="Sharing Ratio (3P : Blaunk)" className="sm:col-span-2 lg:col-span-2">
              <div className="grid grid-cols-[minmax(0,1fr),auto,minmax(0,1fr)] items-center gap-2">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  placeholder="3P"
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
                <span className="px-1 text-center text-sm font-semibold text-slate-600">:</span>
                <input
                  className={inputClass}
                  inputMode="numeric"
                  placeholder="Blaunk"
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
              <p className="mt-1 text-[11px] text-slate-500">Numbers only. The two values must add up to 100.</p>
            </FormField>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-800">References</h3>
            <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-4">
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
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-800">Documents</h3>
            <div className="mt-3 flex flex-wrap gap-6">
              <ImageUploader
                label="Address Proof"
                maxSizeMB={200 / 1024}
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
              <ImageUploader
                label="CHQ Image"
                maxSizeMB={200 / 1024}
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
              <ImageUploader
                label="PAN Card"
                maxSizeMB={200 / 1024}
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
          </div>
          </fieldset>

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
        </SectionCard>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <PageHeader
        title="3P Credentials"
        subtitle="Manage 3PC employees (non-regular employees) and their onboarding data."
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

