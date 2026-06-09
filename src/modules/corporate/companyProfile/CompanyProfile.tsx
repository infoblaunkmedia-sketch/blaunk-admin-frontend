import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { ImageUploader } from '../../../shared/components/ImageUploader';
import { ImagePreviewDialog } from '../../../shared/components/ImagePreview';
import { CountryNameSelect } from '../../../shared/components/CountryNameSelect';
import { PanNumberInput } from '../../../shared/components/PanNumberInput';
import {
  AADHAAR_DIGITS_MAX,
  CIN_MAX_LEN,
  digitsOnlyMax,
  INDIAN_PINCODE_DIGITS_MAX,
  MOBILE_DIGITS_MAX,
  sanitizeCin,
} from '../../../utils/inputFormats';
import { onIntegerInputKeyDown } from '../../../shared/utils/numericInput';
import type { CompanyAddressBlock, CompanyProfile as CompanyProfileType } from '../corporate.types';
import { fetchCompanyProfile, saveCompanyProfile } from '../corporate.service';

const emptyAddress = (): CompanyAddressBlock => ({
  address: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
});

const defaultProfile: CompanyProfileType = {
  companyName: '',
  cin: '',
  pan: '',
  aadhaar: '',
  gstin: '',
  email: '',
  contactNumber: '',
  incorporationDate: '',
  authorizedSignatoryName: '',
  designation: '',
  registered: emptyAddress(),
  correspondence: emptyAddress(),
  logoUrl: '',
  signatureUrl: '',
};

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';

const readOnlyClass =
  `${inputClass} cursor-not-allowed border-slate-200 bg-slate-100 text-slate-600`;

const gridClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';

function fieldClass(disabled: boolean) {
  return disabled ? readOnlyClass : inputClass;
}

function StaticImagePreview({
  src,
  alt,
  title,
  emptyLabel,
}: {
  src: string | null;
  alt: string;
  title: string;
  emptyLabel: string;
}) {
  const [open, setOpen] = React.useState(false);
  if (!src) {
    return <p className="text-sm text-slate-400">{emptyLabel}</p>;
  }
  return (
    <>
      <button
        type="button"
        title="Click to preview"
        onClick={() => setOpen(true)}
        className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition hover:ring-2 hover:ring-primary/40"
      >
        <img src={src} alt={alt} className="h-full w-full object-contain p-1" />
      </button>
      {open ? (
        <ImagePreviewDialog open src={src} alt={alt} title={title} onClose={() => setOpen(false)} />
      ) : null}
    </>
  );
}

function AddressFields({
  prefix,
  values,
  disabled,
  onChange,
}: {
  prefix: 'registered' | 'correspondence';
  values: CompanyAddressBlock;
  disabled: boolean;
  onChange: (block: 'registered' | 'correspondence', key: keyof CompanyAddressBlock, value: string) => void;
}) {
  const fc = fieldClass(disabled);
  const set = (key: keyof CompanyAddressBlock) => (value: string) => onChange(prefix, key, value);

  return (
    <div className="flex flex-col gap-4">
      <FormField label="Address">
        <input
          className={fc}
          disabled={disabled}
          value={values.address}
          onChange={(e) => set('address')(e.target.value)}
        />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="City">
          <input
            className={fc}
            disabled={disabled}
            value={values.city}
            onChange={(e) => set('city')(e.target.value)}
          />
        </FormField>
        <FormField label="State">
          <input
            className={fc}
            disabled={disabled}
            value={values.state}
            onChange={(e) => set('state')(e.target.value)}
          />
        </FormField>
        <FormField label="Pincode">
          <input
            className={fc}
            disabled={disabled}
            value={values.pincode}
            maxLength={INDIAN_PINCODE_DIGITS_MAX}
            inputMode="numeric"
            pattern="[0-9]*"
            onKeyDown={onIntegerInputKeyDown}
            onChange={(e) => set('pincode')(digitsOnlyMax(e.target.value, INDIAN_PINCODE_DIGITS_MAX))}
          />
        </FormField>
        <FormField label="Country">
          <CountryNameSelect
            value={values.country}
            onChange={set('country')}
            disabled={disabled}
            className={disabled ? 'cursor-not-allowed bg-slate-100 text-slate-600' : ''}
          />
        </FormField>
      </div>
    </div>
  );
}

export const CompanyProfile: React.FC = () => {
  const [saved, setSaved] = React.useState<CompanyProfileType>(defaultProfile);
  const [draft, setDraft] = React.useState<CompanyProfileType>(defaultProfile);
  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [signatureUrl, setSignatureUrl] = React.useState<string | null>(null);
  const [savedLogoUrl, setSavedLogoUrl] = React.useState<string | null>(null);
  const [savedSignatureUrl, setSavedSignatureUrl] = React.useState<string | null>(null);

  const urlsRef = React.useRef({ logo: null as string | null, sig: null as string | null });
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

  React.useEffect(() => {
    fetchCompanyProfile().then((p) => {
      setSaved(p);
      setDraft(p);
      setLogoUrl(p.logoUrl || null);
      setSignatureUrl(p.signatureUrl || null);
      setSavedLogoUrl(p.logoUrl || null);
      setSavedSignatureUrl(p.signatureUrl || null);
    });
  }, []);

  const values = isEditing ? draft : saved;
  const dis = !isEditing;
  const fc = fieldClass(dis);

  const setField = (key: keyof CompanyProfileType, value: string) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const setAddressField = (
    block: 'registered' | 'correspondence',
    key: keyof CompanyAddressBlock,
    value: string,
  ) => {
    setDraft((d) => ({
      ...d,
      [block]: { ...d[block], [key]: value },
    }));
  };

  const handleEdit = () => {
    setDraft({
      ...saved,
      registered: { ...saved.registered },
      correspondence: { ...saved.correspondence },
    });
    setLogoUrl(savedLogoUrl);
    setSignatureUrl(savedSignatureUrl);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraft({ ...saved });
    if (logoUrl !== savedLogoUrl && logoUrl?.startsWith('blob:')) URL.revokeObjectURL(logoUrl);
    if (signatureUrl !== savedSignatureUrl && signatureUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(signatureUrl);
    }
    setLogoUrl(savedLogoUrl);
    setSignatureUrl(savedSignatureUrl);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!draft.companyName.trim()) {
      toast.error('Company name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...draft,
        logoUrl: logoUrl || '',
        signatureUrl: signatureUrl || '',
      };
      await saveCompanyProfile(payload);
      setSaved(payload);
      if (savedLogoUrl && savedLogoUrl !== logoUrl && savedLogoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(savedLogoUrl);
      }
      if (savedSignatureUrl && savedSignatureUrl !== signatureUrl && savedSignatureUrl.startsWith('blob:')) {
        URL.revokeObjectURL(savedSignatureUrl);
      }
      setSavedLogoUrl(logoUrl);
      setSavedSignatureUrl(signatureUrl);
      setIsEditing(false);
      toast.success('Company profile saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ErrorBoundary>
      <PageHeader
        title="Company Profile"
        subtitle="Referenced in payslip PDF headers and invoice headers."
        actions={
          isEditing
            ? [
                { label: 'Cancel', onClick: handleCancel, variant: 'secondary' },
                { label: saving ? 'Saving…' : 'Save', onClick: handleSave },
              ]
            : [{ label: 'Edit', onClick: handleEdit }]
        }
      />

      <div className="flex flex-col gap-5">
        <SectionCard title="Company Information">
          <div className={gridClass}>
            <FormField label="Company Name" required>
              <input
                className={fc}
                disabled={dis}
                value={values.companyName}
                onChange={(e) => setField('companyName', e.target.value)}
              />
            </FormField>
            <FormField label="CIN Number">
              <input
                className={fc}
                disabled={dis}
                maxLength={CIN_MAX_LEN}
                value={values.cin}
                onChange={(e) => setField('cin', sanitizeCin(e.target.value))}
              />
            </FormField>
            <FormField label="PAN Number">
              <PanNumberInput
                value={values.pan}
                onChange={(v) => setField('pan', v)}
                disabled={dis}
                className={fc}
              />
            </FormField>
            <FormField label="Aadhaar Number">
              <input
                className={fc}
                disabled={dis}
                value={values.aadhaar}
                maxLength={AADHAAR_DIGITS_MAX}
                inputMode="numeric"
                pattern="[0-9]*"
                onKeyDown={onIntegerInputKeyDown}
                onChange={(e) => setField('aadhaar', digitsOnlyMax(e.target.value, AADHAAR_DIGITS_MAX))}
              />
            </FormField>
            <FormField label="GSTIN">
              <input
                className={fc}
                disabled={dis}
                maxLength={15}
                value={values.gstin}
                onChange={(e) => setField('gstin', e.target.value.toUpperCase())}
              />
            </FormField>
            <FormField label="Incorporation Date">
              <input
                type="date"
                className={`${fc} [color-scheme:light]`}
                disabled={dis}
                value={values.incorporationDate}
                onChange={(e) => setField('incorporationDate', e.target.value)}
              />
            </FormField>
            <FormField label="Email ID">
              <input
                type="email"
                className={fc}
                disabled={dis}
                autoComplete="email"
                value={values.email}
                onChange={(e) => setField('email', e.target.value)}
              />
            </FormField>
            <FormField label="Contact Number">
              <input
                type="tel"
                className={fc}
                disabled={dis}
                autoComplete="tel"
                value={values.contactNumber}
                maxLength={MOBILE_DIGITS_MAX}
                inputMode="numeric"
                pattern="[0-9]*"
                onKeyDown={onIntegerInputKeyDown}
                onChange={(e) => setField('contactNumber', digitsOnlyMax(e.target.value, MOBILE_DIGITS_MAX))}
              />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Registered Address">
          <AddressFields
            prefix="registered"
            values={values.registered}
            disabled={dis}
            onChange={setAddressField}
          />
        </SectionCard>

        <SectionCard title="Correspondence Address">
          <AddressFields
            prefix="correspondence"
            values={values.correspondence}
            disabled={dis}
            onChange={setAddressField}
          />
        </SectionCard>

        <SectionCard title="Authorized Signatory">
          <div className={gridClass}>
            <FormField label="Incharge Name">
              <input
                className={fc}
                disabled={dis}
                value={values.authorizedSignatoryName}
                onChange={(e) => setField('authorizedSignatoryName', e.target.value)}
              />
            </FormField>
            <FormField label="Designation">
              <input
                className={fc}
                disabled={dis}
                value={values.designation}
                onChange={(e) => setField('designation', e.target.value)}
              />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Brand Assets">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField label="Company Logo">
              {isEditing ? (
                <ImageUploader
                  currentPreview={logoUrl || ''}
                  label="Click to upload"
                  maxSizeMB={2}
                  onFile={(_file, url) => {
                    setLogoUrl(url);
                    setField('logoUrl', url);
                  }}
                />
              ) : (
                <StaticImagePreview
                  src={logoUrl}
                  alt="Company logo"
                  title="Company Logo"
                  emptyLabel="No logo uploaded"
                />
              )}
            </FormField>
            <FormField label="Signature">
              {isEditing ? (
                <ImageUploader
                  currentPreview={signatureUrl || ''}
                  label="Click to upload"
                  maxSizeMB={2}
                  onFile={(_file, url) => {
                    setSignatureUrl(url);
                    setField('signatureUrl', url);
                  }}
                />
              ) : (
                <StaticImagePreview
                  src={signatureUrl}
                  alt="Authorized signature"
                  title="Signature"
                  emptyLabel="No signature uploaded"
                />
              )}
            </FormField>
          </div>
        </SectionCard>
      </div>
    </ErrorBoundary>
  );
};
