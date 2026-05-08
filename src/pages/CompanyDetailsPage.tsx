import React from 'react';
import {
  AADHAAR_DIGITS_MAX,
  CIN_MAX_LEN,
  digitsOnlyMax,
  INDIAN_PINCODE_DIGITS_MAX,
  MOBILE_DIGITS_MAX,
  sanitizeCin,
  sanitizePan,
} from '../utils/inputFormats';

type CompanyForm = {
  companyName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  cinNumber: string;
  panNumber: string;
  aadhaarNumber: string;
  emailId: string;
  contactNumber: string;
  inchargeName: string;
  designation: string;
};

const emptyForm = (): CompanyForm => ({
  companyName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  country: '',
  cinNumber: '',
  panNumber: '',
  aadhaarNumber: '',
  emailId: '',
  contactNumber: '',
  inchargeName: '',
  designation: '',
});

/** Light grey fill, primary blue border — matches reference. */
const inputClass =
  'h-11 w-full rounded border border-primary bg-slate-100 px-3 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-700';

const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-800 sm:text-sm';

const rowGridClass =
  'grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-12 sm:gap-y-0 lg:gap-x-20';

const fileInputClass =
  'mt-1.5 block w-full max-w-[220px] text-xs text-slate-600 sm:max-w-[260px] file:mr-2 file:rounded file:border-0 file:bg-primary file:px-2 file:py-1 file:text-xs file:font-medium file:text-white hover:file:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50';

function TextField({
  id,
  label,
  value,
  disabled,
  onChange,
  type = 'text',
  autoComplete,
  sanitize,
  inputMode,
  maxLength,
  pattern,
}: {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  /** Applied on change (e.g. digits-only caps), same pattern as Voucher / DSA sanitizers. */
  sanitize?: (v: string) => string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
  pattern?: string;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        pattern={pattern}
        className={inputClass}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(sanitize ? sanitize(e.target.value) : e.target.value)}
      />
    </div>
  );
}

function ImageUploadField({
  label,
  inputId,
  imageUrl,
  disabled,
  onSelectFile,
}: {
  label: string;
  inputId: string;
  imageUrl: string | null;
  disabled: boolean;
  onSelectFile: (file: File | undefined) => void;
}) {
  return (
    <div className="min-w-0">
      <p className={labelClass}>{label}</p>
      <p className="mb-1 text-xs text-slate-500">Image</p>
      <div className="flex h-16 w-full max-w-[220px] items-center justify-center overflow-hidden rounded border border-primary bg-amber-50 sm:h-20 sm:max-w-[260px]">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="max-h-full max-w-full object-contain p-0.5" />
        ) : (
          <span className="text-xs font-medium text-amber-900/60 sm:text-sm">Image</span>
        )}
      </div>
      <input
        id={inputId}
        type="file"
        accept="image/*"
        disabled={disabled}
        onChange={(e) => {
          onSelectFile(e.target.files?.[0]);
          e.target.value = '';
        }}
        className={fileInputClass}
      />
    </div>
  );
}

export const CompanyDetailsPage: React.FC = () => {
  const [saved, setSaved] = React.useState<CompanyForm>(emptyForm);
  const [draft, setDraft] = React.useState<CompanyForm>(emptyForm);
  const [isEditing, setIsEditing] = React.useState(false);

  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = React.useState<string | null>(null);
  const [savedLogoUrl, setSavedLogoUrl] = React.useState<string | null>(null);
  const [savedSignatureUrl, setSavedSignatureUrl] = React.useState<string | null>(null);

  const urlsRef = React.useRef({
    logo: null as string | null,
    sig: null as string | null,
  });
  urlsRef.current = { logo: logoUrl, sig: signatureUrl };

  const savedImgRef = React.useRef({ logo: null as string | null, sig: null as string | null });
  savedImgRef.current = { logo: savedLogoUrl, sig: savedSignatureUrl };

  React.useEffect(
    () => () => {
      const { logo, sig } = urlsRef.current;
      if (logo?.startsWith('blob:')) URL.revokeObjectURL(logo);
      if (sig?.startsWith('blob:')) URL.revokeObjectURL(sig);
    },
    [],
  );

  const values = isEditing ? draft : saved;

  const setField = (key: keyof CompanyForm, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const handleLogoFile = (file: File | undefined) => {
    if (!file?.type.startsWith('image/')) return;
    setLogoUrl((prev) => {
      const next = URL.createObjectURL(file);
      const committed = savedImgRef.current.logo;
      if (prev && prev.startsWith('blob:') && prev !== committed) {
        URL.revokeObjectURL(prev);
      }
      return next;
    });
  };

  const handleSignatureFile = (file: File | undefined) => {
    if (!file?.type.startsWith('image/')) return;
    setSignatureUrl((prev) => {
      const next = URL.createObjectURL(file);
      const committed = savedImgRef.current.sig;
      if (prev && prev.startsWith('blob:') && prev !== committed) {
        URL.revokeObjectURL(prev);
      }
      return next;
    });
  };

  const handleEdit = () => {
    setDraft({ ...saved });
    setIsEditing(true);
  };

  const handleSave = () => {
    setSaved({ ...draft });
    if (savedLogoUrl && savedLogoUrl !== logoUrl && savedLogoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(savedLogoUrl);
    }
    if (savedSignatureUrl && savedSignatureUrl !== signatureUrl && savedSignatureUrl.startsWith('blob:')) {
      URL.revokeObjectURL(savedSignatureUrl);
    }
    setSavedLogoUrl(logoUrl);
    setSavedSignatureUrl(signatureUrl);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraft({ ...saved });
    if (logoUrl !== savedLogoUrl && logoUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(logoUrl);
    }
    if (signatureUrl !== savedSignatureUrl && signatureUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(signatureUrl);
    }
    setLogoUrl(savedLogoUrl);
    setSignatureUrl(savedSignatureUrl);
    setIsEditing(false);
  };

  const dis = !isEditing;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 bg-primary px-4 py-3 sm:px-5">
        <h2 className="text-lg font-bold text-white sm:text-xl">Company Details</h2>
        <div className="flex flex-wrap items-center gap-2">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleEdit}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border border-white/80 bg-transparent px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-8">
        <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
          <div className={rowGridClass}>
            <TextField
              id="company-companyName"
              label="Company Name"
              value={values.companyName}
              disabled={dis}
              onChange={(v) => setField('companyName', v)}
            />
            <TextField
              id="company-addressLine1"
              label="Address Line 1"
              value={values.addressLine1}
              disabled={dis}
              onChange={(v) => setField('addressLine1', v)}
            />
          </div>

          <div className={rowGridClass}>
            <TextField
              id="company-addressLine2"
              label="Address Line 2"
              value={values.addressLine2}
              disabled={dis}
              onChange={(v) => setField('addressLine2', v)}
            />
            <TextField
              id="company-city"
              label="City"
              value={values.city}
              disabled={dis}
              onChange={(v) => setField('city', v)}
            />
          </div>

          <div className={rowGridClass}>
            <TextField
              id="company-state"
              label="State"
              value={values.state}
              disabled={dis}
              onChange={(v) => setField('state', v)}
            />
            <TextField
              id="company-pincode"
              label="Pincode"
              value={values.pincode}
              disabled={dis}
              onChange={(v) => setField('pincode', v)}
              sanitize={(v) => digitsOnlyMax(v, INDIAN_PINCODE_DIGITS_MAX)}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={INDIAN_PINCODE_DIGITS_MAX}
            />
          </div>

          <div className={rowGridClass}>
            <TextField
              id="company-country"
              label="Country"
              value={values.country}
              disabled={dis}
              onChange={(v) => setField('country', v)}
            />
            <TextField
              id="company-cinNumber"
              label="CIN Number"
              value={values.cinNumber}
              disabled={dis}
              onChange={(v) => setField('cinNumber', v)}
              sanitize={sanitizeCin}
              maxLength={CIN_MAX_LEN}
            />
          </div>

          <div className={rowGridClass}>
            <TextField
              id="company-panNumber"
              label="PAN Number"
              value={values.panNumber}
              disabled={dis}
              onChange={(v) => setField('panNumber', v)}
              sanitize={sanitizePan}
              maxLength={10}
            />
            <TextField
              id="company-aadhaarNumber"
              label="Aadhaar Number"
              value={values.aadhaarNumber}
              disabled={dis}
              onChange={(v) => setField('aadhaarNumber', v)}
              sanitize={(v) => digitsOnlyMax(v, AADHAAR_DIGITS_MAX)}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={AADHAAR_DIGITS_MAX}
            />
          </div>

          <div className={rowGridClass}>
            <TextField
              id="company-emailId"
              label="Email ID"
              type="email"
              autoComplete="email"
              value={values.emailId}
              disabled={dis}
              onChange={(v) => setField('emailId', v)}
            />
            <TextField
              id="company-contactNumber"
              label="Contact Number"
              type="tel"
              autoComplete="tel"
              value={values.contactNumber}
              disabled={dis}
              onChange={(v) => setField('contactNumber', v)}
              sanitize={(v) => digitsOnlyMax(v, MOBILE_DIGITS_MAX)}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={MOBILE_DIGITS_MAX}
            />
          </div>

          <div className={rowGridClass}>
            <TextField
              id="company-inchargeName"
              label="Incharge Name"
              value={values.inchargeName}
              disabled={dis}
              onChange={(v) => setField('inchargeName', v)}
            />
            <TextField
              id="company-designation"
              label="Designation"
              value={values.designation}
              disabled={dis}
              onChange={(v) => setField('designation', v)}
            />
          </div>

          <div className={rowGridClass}>
            <ImageUploadField
              label="Company Logo"
              inputId="company-logo-file"
              imageUrl={logoUrl}
              disabled={dis}
              onSelectFile={handleLogoFile}
            />
            <ImageUploadField
              label="Signature"
              inputId="company-signature-file"
              imageUrl={signatureUrl}
              disabled={dis}
              onSelectFile={handleSignatureFile}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
