import React from 'react';
import {
  AADHAAR_DIGITS_MAX,
  digitsOnlyMax,
  MOBILE_DIGITS_MAX,
  sanitizePan,
} from '../utils/inputFormats';

const FIELD_CLASSES =
  'w-full rounded-md border border-slate-300 pl-3 pr-10 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30';
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const MOBILE_REGEX = /^[0-9]{10}$/;

type ShareholdingForm = {
  pan: string;
  name: string;
  mobile: string;
  email: string;
  aadhaar: string;
  address: string;
  city: string;
  landmark: string;
  country: string;
  gender: string;
  holdingPercent: string;
  shareType: string;
  faceValue: string;
  numberOfShares: string;
  mode: string;
  isinCode: string;
  dpNumber: string;
  folioNumber: string;
  distinctiveFrom: string;
  distinctiveTo: string;
  yearOfIssuance: string;
  stakeholder: string;
  dateOfAllotment: string;
  remarks: string;
  exitDate: string;
  year: string;
  bankName: string;
  ifscCode: string;
  bankAccountNumber: string;
  pledge: string;
};

type NomineeForm = {
  name: string;
  mobile: string;
  relation: string;
  percentage: string;
  pan: string;
};

const emptyShareholding: ShareholdingForm = {
  pan: '',
  name: '',
  mobile: '',
  email: '',
  aadhaar: '',
  address: '',
  city: '',
  landmark: '',
  country: '',
  gender: '',
  holdingPercent: '',
  shareType: '',
  faceValue: '',
  numberOfShares: '',
  mode: '',
  isinCode: '',
  dpNumber: '',
  folioNumber: '',
  distinctiveFrom: '',
  distinctiveTo: '',
  yearOfIssuance: '',
  stakeholder: '',
  dateOfAllotment: '',
  remarks: '',
  exitDate: '',
  year: '',
  bankName: '',
  ifscCode: '',
  bankAccountNumber: '',
  pledge: 'NA',
};

const emptyNominee: NomineeForm = {
  name: '',
  mobile: '',
  relation: '',
  percentage: '',
  pan: '',
};

const FINANCIAL_YEARS = Array.from({ length: 2100 - 2024 + 1 }, (_, i) => 2024 + i);

export const ShareholdingPage: React.FC = () => {
  const [searchPan, setSearchPan] = React.useState('');
  const [activeInnerTab, setActiveInnerTab] = React.useState<'shareholding' | 'mis'>('shareholding');
  const [isEditing, setIsEditing] = React.useState(false);
  const [form, setForm] = React.useState<ShareholdingForm>(emptyShareholding);
  const [nominees, setNominees] = React.useState<NomineeForm[]>([
    { ...emptyNominee },
    { ...emptyNominee },
    { ...emptyNominee },
  ]);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [loadingRecord, setLoadingRecord] = React.useState(false);
  const [csMisFromDate, setCsMisFromDate] = React.useState('');
  const [csMisToDate, setCsMisToDate] = React.useState('');
  const [csMisDepartment, setCsMisDepartment] = React.useState('');
  const [misExporting, setMisExporting] = React.useState(false);
  const [misMessage, setMisMessage] = React.useState<string | null>(null);

  const csMisReportType =
    csMisDepartment === 'LEGAL' ? 'Agreement' : csMisDepartment === 'CS' ? 'MIS-Shareholding' : '';
  const csMisFormat = csMisDepartment === 'LEGAL' ? 'PDF' : csMisDepartment === 'CS' ? 'Excel' : '';

  const updateField = (key: keyof ShareholdingForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const updateNomineeField = (index: number, key: keyof NomineeForm, value: string) => {
    setNominees((previous) =>
      previous.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    );
  };

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage(null);
    const pan = searchPan.trim();
    if (!pan) {
      setStatusMessage('Please enter a PAN to search.');
      return;
    }
    if (!PAN_REGEX.test(pan)) {
      setStatusMessage('Invalid PAN format. Use 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).');
      return;
    }

    try {
      setLoadingRecord(true);
      setForm({ ...emptyShareholding, pan: pan.toUpperCase() });
      setNominees([{ ...emptyNominee }, { ...emptyNominee }, { ...emptyNominee }]);
      setIsEditing(false);
      setStatusMessage(
        'No server: start with an empty form for this PAN. Click Edit, enter details, then Save (local only).',
      );
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Unexpected error while loading shareholding record.';
      setStatusMessage(message);
    } finally {
      setLoadingRecord(false);
    }
  };

  const handleSave = async () => {
    setStatusMessage(null);
    const normalizedPan = form.pan.trim().toUpperCase();
    if (!normalizedPan) {
      setStatusMessage('PAN Card No. is required before saving.');
      return;
    }
    if (!PAN_REGEX.test(normalizedPan)) {
      setStatusMessage('Invalid PAN format. Use 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).');
      return;
    }
    if (form.mobile && !MOBILE_REGEX.test(form.mobile.trim())) {
      setStatusMessage('Mobile number must be exactly 10 digits.');
      return;
    }

    for (let i = 0; i < nominees.length; i += 1) {
      const nominee = nominees[i];
      const hasAnyNomineeValue =
        Boolean(nominee.name?.trim()) ||
        Boolean(nominee.mobile?.trim()) ||
        Boolean(nominee.relation?.trim()) ||
        Boolean(nominee.pan?.trim()) ||
        Boolean(nominee.percentage?.trim());

      if (!hasAnyNomineeValue) continue;

      if (nominee.mobile?.trim() && !MOBILE_REGEX.test(nominee.mobile.trim())) {
        setStatusMessage(`Nominee ${i + 1} mobile number must be exactly 10 digits.`);
        return;
      }
      if (nominee.pan?.trim() && !PAN_REGEX.test(nominee.pan.trim().toUpperCase())) {
        setStatusMessage(
          `Nominee ${i + 1} PAN format is invalid. Use 5 letters, 4 digits, 1 letter.`,
        );
        return;
      }
    }

    setSaving(true);
    try {
      setForm((prev) => ({ ...prev, pan: normalizedPan }));
      setIsEditing(false);
      setStatusMessage('Shareholding saved locally (no server).');
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : 'Unexpected error while saving shareholding record.';
      setStatusMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const handleMisExport = async (event: React.FormEvent) => {
    event.preventDefault();
    setMisMessage(null);
    if (!csMisFromDate || !csMisToDate) {
      setMisMessage('Select from date and to date.');
      return;
    }
    if (!csMisDepartment) {
      setMisMessage('Select department.');
      return;
    }
    setMisExporting(true);
    try {
      setMisMessage('MIS export requires a server (not connected in this build).');
    } finally {
      setMisExporting(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* Inner tabs */}
      <div className="flex gap-2 w-fit">
        <button
          type="button"
          onClick={() => setActiveInnerTab('shareholding')}
          className={[
            'rounded-md border px-4 py-1.5 text-sm font-semibold shadow-sm transition',
            activeInnerTab === 'shareholding'
              ? 'border-primary bg-primary text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
          ].join(' ')}
        >
          Shareholding
        </button>
        <button
          type="button"
          onClick={() => setActiveInnerTab('mis')}
          className={[
            'rounded-md border px-4 py-1.5 text-sm font-semibold shadow-sm transition',
            activeInnerTab === 'mis'
              ? 'border-primary bg-primary text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
          ].join(' ')}
        >
          MIS
        </button>
      </div>

      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary">
          {activeInnerTab === 'shareholding' ? 'Shareholding' : 'MIS'}
        </h1>
        {activeInnerTab === 'shareholding' ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setStatusMessage(null);
              }}
              className="rounded-md border border-primary px-4 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/10 disabled:opacity-60"
              disabled={isEditing}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isEditing || saving}
              className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        ) : null}
      </div>

      {statusMessage ? (
        <p className="text-sm text-slate-700">{statusMessage}</p>
      ) : null}

      {activeInnerTab === 'shareholding' ? (
      /* Form grid */
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
        <fieldset
          disabled={!isEditing}
          className="space-y-6 [&:disabled_input]:bg-slate-50 [&:disabled_select]:bg-slate-50 [&:disabled_input]:cursor-not-allowed [&:disabled_select]:cursor-not-allowed"
        >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Row 1 */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Name
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Name"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Mobile No.
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Enter Mobile No."
              value={form.mobile}
              onChange={(event) =>
                updateField('mobile', digitsOnlyMax(event.target.value, MOBILE_DIGITS_MAX))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Email
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              PAN Card No.
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="PAN"
              value={form.pan}
              onChange={(event) => updateField('pan', sanitizePan(event.target.value))}
            />
          </div>

          {/* Row 2 */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Aadhaar No.
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Aadhaar"
              value={form.aadhaar}
              onChange={(event) =>
                updateField('aadhaar', digitsOnlyMax(event.target.value, AADHAAR_DIGITS_MAX))
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Address
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Address"
              value={form.address}
              onChange={(event) => updateField('address', event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              City
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="City"
              value={form.city}
              onChange={(event) => updateField('city', event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Landmark / Area
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Landmark"
              value={form.landmark}
              onChange={(event) => updateField('landmark', event.target.value)}
            />
          </div>

          {/* Row 3 */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Country
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Country"
              value={form.country}
              onChange={(event) => updateField('country', event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Gender
            </label>
            <select
              className={FIELD_CLASSES}
              value={form.gender}
              onChange={(event) => updateField('gender', event.target.value)}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Holding (%)
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Holding Percentage"
              value={form.holdingPercent}
              onChange={(event) => updateField('holdingPercent', event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Share Type
            </label>
            <select
              className={FIELD_CLASSES}
              value={form.shareType}
              onChange={(event) => updateField('shareType', event.target.value)}
            >
              <option value="">Select Share Type</option>
              <option value="fully-paid-eq">Fully Paid - EQ</option>
              <option value="partially-paid-eq">Partially Paid - EQ</option>
              <option value="convertible">Convertible</option>
              <option value="debenture">Debenture</option>
              <option value="preference-share">Preference Share</option>
            </select>
          </div>

          {/* Row 4 */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Face Value
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Face Value"
              value={form.faceValue}
              onChange={(event) => updateField('faceValue', event.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              No. of Shares
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="No. of Shares"
              value={form.numberOfShares}
              onChange={(event) => updateField('numberOfShares', digitsOnlyMax(event.target.value, 7))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Mode
            </label>
            <select
              className={FIELD_CLASSES}
              value={form.mode}
              onChange={(event) => updateField('mode', event.target.value)}
            >
              <option value="">Select Mode</option>
              <option value="physical">Physical</option>
              <option value="demat">Demat</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              ISIN Code
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="ISIN Code"
              value={form.isinCode}
              onChange={(event) => updateField('isinCode', digitsOnlyMax(event.target.value, 12))}
            />
          </div>

          {/* Row 5 */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              DP Number
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Enter DP Number"
              value={form.dpNumber}
              maxLength={16}
              onChange={(event) => updateField('dpNumber', event.target.value.replace(/[^A-Za-z0-9]/g, ''))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Folio Number
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Enter Folio Number"
              value={form.folioNumber}
              maxLength={12}
              onChange={(event) => updateField('folioNumber', event.target.value.replace(/[^A-Za-z0-9]/g, ''))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Distinctive No(s) From
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Distinctive No(s) From"
              value={form.distinctiveFrom}
              onChange={(event) => updateField('distinctiveFrom', digitsOnlyMax(event.target.value, 12))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Distinctive No(s) To
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Distinctive No(s) To"
              value={form.distinctiveTo}
              onChange={(event) => updateField('distinctiveTo', digitsOnlyMax(event.target.value, 12))}
            />
          </div>

          {/* Row 6 */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Year of Issuance
            </label>
            <select
              className={FIELD_CLASSES}
              value={form.yearOfIssuance}
              onChange={(event) => updateField('yearOfIssuance', event.target.value)}
            >
              <option value="">Select Year</option>
              <option value="2026-2027">2026 - 2027</option>
              <option value="2027-2028">2027 - 2028</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Stakeholder
            </label>
            <select
              className={FIELD_CLASSES}
              value={form.stakeholder}
              onChange={(event) => updateField('stakeholder', event.target.value)}
            >
              <option value="">Select Stakeholder</option>
              <option value="board-member">Board Member</option>
              <option value="hni">HNI</option>
              <option value="pledge-lender">Pledge Lender</option>
              <option value="investors">Investors</option>
              <option value="shareholders">Shareholders</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Date of Allotment
            </label>
            <input
              type="date"
              className={`${FIELD_CLASSES} [color-scheme:light]`}
              value={form.dateOfAllotment}
              onChange={(event) => updateField('dateOfAllotment', event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Remarks
            </label>
            <select
              className={FIELD_CLASSES}
              value={form.remarks}
              onChange={(event) => updateField('remarks', event.target.value)}
            >
              <option value="">Select Remarks</option>
              <option value="transferable">Transferable</option>
              <option value="non-transferable">Non-Transferable</option>
              <option value="partly-paid">Partly Paid</option>
              <option value="partly-sold">Partly Sold</option>
              <option value="lockin-period">Lockin Period</option>
            </select>
          </div>

          {/* Rows 7 & 8: final sequence */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Exit Date
            </label>
            <input
              type="date"
              className={`${FIELD_CLASSES} [color-scheme:light]`}
              value={form.exitDate}
              onChange={(event) => updateField('exitDate', event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Year
            </label>
            <select
              className={FIELD_CLASSES}
              value={form.year}
              onChange={(event) => updateField('year', event.target.value)}
            >
              <option value="">Select Year</option>
              <option value="2026-2027">2026 - 2027</option>
              <option value="2027-2028">2027 - 2028</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Bank Name
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Enter Bank Name"
              value={form.bankName}
              onChange={(event) => updateField('bankName', event.target.value.replace(/[^A-Za-z\s]/g, ''))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              IFSC Code
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="IFSC Code"
              value={form.ifscCode}
              maxLength={11}
              onChange={(event) => updateField('ifscCode', event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Bank Account No.
            </label>
            <input
              className={FIELD_CLASSES}
              placeholder="Bank Account No."
              value={form.bankAccountNumber}
              onChange={(event) => updateField('bankAccountNumber', event.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Pledge
            </label>
            <select
              className={FIELD_CLASSES}
              value={form.pledge}
              onChange={(event) => updateField('pledge', event.target.value)}
            >
              <option value="NA">NA</option>
              <option value="Un Pledge">Un Pledge</option>
              <option value="Pledge">Pledge</option>
            </select>
          </div>
        </div>

        {/* Nominees section */}
        <div className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold text-primary">Nominees</h2>

          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-3 md:grid-cols-[2fr,2fr,2fr,1fr,2fr]"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Name
                </label>
                <input
                  className={FIELD_CLASSES}
                  placeholder="Nominee Name"
                  value={nominees[index - 1]?.name ?? ''}
                  onChange={(event) =>
                    updateNomineeField(index - 1, 'name', event.target.value)
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Mobile No.
                </label>
                <input
                  className={FIELD_CLASSES}
                  placeholder="Mobile No."
                  value={nominees[index - 1]?.mobile ?? ''}
                  onChange={(event) =>
                    updateNomineeField(
                      index - 1,
                      'mobile',
                      digitsOnlyMax(event.target.value, MOBILE_DIGITS_MAX),
                    )
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Relation
                </label>
                <input
                  className={FIELD_CLASSES}
                  placeholder="Relation"
                  value={nominees[index - 1]?.relation ?? ''}
                  onChange={(event) =>
                    updateNomineeField(index - 1, 'relation', event.target.value)
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  (%)
                </label>
                <input
                  className={FIELD_CLASSES}
                  placeholder="%"
                  value={nominees[index - 1]?.percentage ?? ''}
                  onChange={(event) =>
                    updateNomineeField(index - 1, 'percentage', event.target.value)
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  PAN
                </label>
                <input
                  className={FIELD_CLASSES}
                  placeholder="PAN"
                  value={nominees[index - 1]?.pan ?? ''}
                  onChange={(event) =>
                    updateNomineeField(index - 1, 'pan', sanitizePan(event.target.value))
                  }
                />
              </div>
            </div>
          ))}
        </div>
        </fieldset>
      </section>
      ) : (
        <section className="w-full overflow-x-auto">
          {misMessage ? (
            <p className="mb-4 text-sm text-slate-700" role="status">
              {misMessage}
            </p>
          ) : null}

          <div
            className="overflow-hidden rounded-t-xl bg-primary text-xs font-semibold uppercase tracking-wide text-white sm:text-sm"
            style={{
              display: 'grid',
              gridTemplateColumns:
                'minmax(6rem, 1fr) minmax(6rem, 1fr) minmax(6rem, 1fr) minmax(5rem, 1fr) minmax(7rem, 1.2fr) minmax(6rem, 1fr) auto',
            }}
          >
            <div className="px-3 py-2.5 sm:px-4">From Date</div>
            <div className="px-3 py-2.5 sm:px-4">To Date</div>
            <div className="px-3 py-2.5 sm:px-4">Department</div>
            <div className="px-3 py-2.5 sm:px-4">Code</div>
            <div className="px-3 py-2.5 sm:px-4">Report Type</div>
            <div className="px-3 py-2.5 sm:px-4">Output Format</div>
            <div className="px-3 py-2.5 text-right sm:px-4">Actions</div>
          </div>

          <form
            onSubmit={handleMisExport}
            className="grid gap-3 border border-t-0 border-slate-200 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4"
            style={{
              gridTemplateColumns:
                'minmax(6rem, 1fr) minmax(6rem, 1fr) minmax(6rem, 1fr) minmax(5rem, 1fr) minmax(7rem, 1.2fr) minmax(6rem, 1fr) auto',
            }}
          >
            <input
              type="date"
              value={csMisFromDate}
              onChange={(event) => setCsMisFromDate(event.target.value)}
              className="min-w-0 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />

            <input
              type="date"
              value={csMisToDate}
              onChange={(event) => setCsMisToDate(event.target.value)}
              className="min-w-0 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            />

            <select
              value={csMisDepartment}
              onChange={(event) => setCsMisDepartment(event.target.value)}
              className="min-w-0 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="CS">CS</option>
              <option value="LEGAL">LEGAL</option>
            </select>

            <input
              readOnly
              value="All"
              className="min-w-0 w-full cursor-default rounded-md border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 shadow-sm"
            />

            <input
              readOnly
              value={csMisReportType}
              className="min-w-0 w-full cursor-default rounded-md border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 shadow-sm"
            />

            <input
              readOnly
              value={csMisFormat}
              className="min-w-0 w-full cursor-default rounded-md border border-slate-300 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 shadow-sm"
            />

            <div className="flex min-w-0 justify-end">
              <button
                type="submit"
                disabled={misExporting}
                className="whitespace-nowrap rounded-md bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {misExporting ? 'Generating…' : 'Generate Report'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

