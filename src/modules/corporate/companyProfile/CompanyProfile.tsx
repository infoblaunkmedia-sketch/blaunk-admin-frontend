import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { CompanyProfile as CompanyProfileType } from '../corporate.types';
import { fetchCompanyProfile, saveCompanyProfile } from '../corporate.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500';

const defaultProfile: CompanyProfileType = {
  companyName: '', cin: '', pan: '', gstin: '',
  registeredAddress: '', correspondenceAddress: '',
  city: '', state: '', pincode: '', country: '',
  email: '', contactNumber: '', incorporationDate: '',
  authorizedSignatoryName: '', designation: '',
  logoUrl: '', signatureUrl: '',
};

export const CompanyProfile: React.FC = () => {
  const [saved, setSaved] = React.useState<CompanyProfileType>(defaultProfile);
  const [draft, setDraft] = React.useState<CompanyProfileType>(defaultProfile);
  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [logoPreview, setLogoPreview] = React.useState<string>('');
  const [sigPreview, setSigPreview] = React.useState<string>('');

  React.useEffect(() => {
    fetchCompanyProfile().then((p) => { setSaved(p); setDraft(p); setLogoPreview(p.logoUrl); setSigPreview(p.signatureUrl); });
  }, []);

  const values = isEditing ? draft : saved;

  const setField = (k: keyof CompanyProfileType, v: string) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const handleFile = (field: 'logoUrl' | 'signatureUrl', setter: (s: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file?.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      setter(url);
      setField(field, url);
    };

  const handleEdit = () => { setDraft({ ...saved }); setLogoPreview(saved.logoUrl); setSigPreview(saved.signatureUrl); setIsEditing(true); };

  const handleCancel = () => { setDraft({ ...saved }); setLogoPreview(saved.logoUrl); setSigPreview(saved.signatureUrl); setIsEditing(false); };

  const handleSave = async () => {
    if (!draft.companyName.trim()) { toast.error('Company name required'); return; }
    setSaving(true);
    try {
      await saveCompanyProfile(draft);
      setSaved(draft);
      setIsEditing(false);
      toast.success('Company profile saved');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const dis = !isEditing;

  return (
    <ErrorBoundary>
      <PageHeader title="Company Profile"
        subtitle="Referenced in payslip PDF headers and invoice headers."
        actions={isEditing
          ? [
              { label: 'Cancel', onClick: handleCancel },
              { label: saving ? 'Saving…' : 'Save', onClick: handleSave },
            ]
          : [{ label: 'Edit', onClick: handleEdit }]
        }
      />

      <div className="space-y-5">
        <SectionCard title="Company Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Legal Company Name" required>
              <input className={inputClass} disabled={dis} value={values.companyName}
                onChange={(e) => setField('companyName', e.target.value)} />
            </FormField>
            <FormField label="CIN">
              <input className={inputClass} disabled={dis} maxLength={21} value={values.cin}
                onChange={(e) => setField('cin', e.target.value.toUpperCase())} />
            </FormField>
            <FormField label="PAN">
              <input className={inputClass} disabled={dis} maxLength={10} value={values.pan}
                onChange={(e) => setField('pan', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))} />
            </FormField>
            <FormField label="GSTIN">
              <input className={inputClass} disabled={dis} maxLength={15} value={values.gstin}
                onChange={(e) => setField('gstin', e.target.value.toUpperCase())} />
            </FormField>
            <FormField label="Email">
              <input type="email" className={inputClass} disabled={dis} value={values.email}
                onChange={(e) => setField('email', e.target.value)} />
            </FormField>
            <FormField label="Contact Number">
              <input className={inputClass} disabled={dis} maxLength={15} value={values.contactNumber}
                onChange={(e) => setField('contactNumber', e.target.value.replace(/\D/g, '').slice(0, 15))} />
            </FormField>
            <FormField label="Incorporation Date">
              <input type="date" className={`${inputClass} [color-scheme:light]`} disabled={dis}
                value={values.incorporationDate} onChange={(e) => setField('incorporationDate', e.target.value)} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Address">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Registered Address">
              <textarea className={`${inputClass} h-auto py-2`} rows={2} disabled={dis}
                value={values.registeredAddress} onChange={(e) => setField('registeredAddress', e.target.value)} />
            </FormField>
            <FormField label="Correspondence Address">
              <textarea className={`${inputClass} h-auto py-2`} rows={2} disabled={dis}
                value={values.correspondenceAddress} onChange={(e) => setField('correspondenceAddress', e.target.value)} />
            </FormField>
            <FormField label="City">
              <input className={inputClass} disabled={dis} value={values.city}
                onChange={(e) => setField('city', e.target.value)} />
            </FormField>
            <FormField label="State">
              <input className={inputClass} disabled={dis} value={values.state}
                onChange={(e) => setField('state', e.target.value)} />
            </FormField>
            <FormField label="Pincode">
              <input className={inputClass} disabled={dis} maxLength={6} value={values.pincode}
                onChange={(e) => setField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} />
            </FormField>
            <FormField label="Country">
              <input className={inputClass} disabled={dis} value={values.country}
                onChange={(e) => setField('country', e.target.value)} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Authorized Signatory">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Signatory Name">
              <input className={inputClass} disabled={dis} value={values.authorizedSignatoryName}
                onChange={(e) => setField('authorizedSignatoryName', e.target.value)} />
            </FormField>
            <FormField label="Designation">
              <input className={inputClass} disabled={dis} value={values.designation}
                onChange={(e) => setField('designation', e.target.value)} />
            </FormField>
          </div>
        </SectionCard>

        <SectionCard title="Brand Assets">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Logo */}
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-700">Company Logo</p>
              <div className="mb-2 flex h-20 w-40 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {logoPreview
                  ? <img src={logoPreview} alt="Company logo" className="max-h-full max-w-full object-contain p-1" />
                  : <span className="text-xs text-slate-400">No logo</span>}
              </div>
              {isEditing && (
                <input type="file" accept="image/*" className="text-xs text-slate-600"
                  onChange={handleFile('logoUrl', setLogoPreview)} />
              )}
            </div>
            {/* Signature */}
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-700">Authorized Signature</p>
              <div className="mb-2 flex h-20 w-40 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                {sigPreview
                  ? <img src={sigPreview} alt="Signature" className="max-h-full max-w-full object-contain p-1" />
                  : <span className="text-xs text-slate-400">No signature</span>}
              </div>
              {isEditing && (
                <input type="file" accept="image/*" className="text-xs text-slate-600"
                  onChange={handleFile('signatureUrl', setSigPreview)} />
              )}
            </div>
          </div>
        </SectionCard>
      </div>
    </ErrorBoundary>
  );
};
