import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { Nominee, Shareholder } from '../corporate.types';
import { deleteShareholder, fetchShareholderByPan, saveShareholder } from '../corporate.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

type FormValues = Omit<Shareholder, 'id'>;
type NomineeErrors = { pan?: { message?: string } };

const emptyNominee = (): Nominee => ({ name: '', mobile: '', relation: '', percentage: '', pan: '' });

const defaultValues: FormValues = {
  name: '',
  mobile: '',
  email: '',
  pan: '',
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
  nominees: [emptyNominee(), emptyNominee(), emptyNominee()],
};

export const ShareholdingForm: React.FC = () => {
  const { pan } = useParams();
  const isEdit = !!pan && pan !== 'new';
  const navigate = useNavigate();
  const originalPanRef = React.useRef<string>('');
  const [loading, setLoading] = React.useState(isEdit);
  const [saving, setSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues });

  React.useEffect(() => {
    let mounted = true;
    async function run() {
      if (!isEdit || !pan) return;
      try {
        setLoading(true);
        const res = await fetchShareholderByPan(pan);
        const r = res.record;
        originalPanRef.current = String(r.pan || pan).trim().toUpperCase();
        (Object.keys(defaultValues) as (keyof FormValues)[]).forEach((k) => {
          const map = r as unknown as Record<string, unknown>;
          const fallback = defaultValues as unknown as Record<string, unknown>;
          setValue(k, (map[k] ?? fallback[k]) as any, { shouldDirty: false });
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load shareholder.');
        navigate('/corporate/shareholding', { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [isEdit, pan, navigate, setValue]);

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      const payload: Shareholder = {
        id: isEdit && pan ? pan : data.pan.trim().toUpperCase(),
        ...data,
        pan: data.pan.trim().toUpperCase(),
        mobile: data.mobile.replace(/\D/g, '').slice(0, 10),
        aadhaar: data.aadhaar.replace(/\D/g, '').slice(0, 12),
        email: data.email.trim(),
        nominees: (data.nominees || []).map((n) => ({
          ...n,
          mobile: String(n.mobile || '').replace(/\D/g, '').slice(0, 10),
          pan: String(n.pan || '').trim().toUpperCase(),
          percentage: n.percentage ? String(n.percentage) : '',
        })),
      };
      await saveShareholder(payload);
      // If PAN was changed during edit, migrate the record (avoid "new record" leftover).
      const originalPan = originalPanRef.current;
      if (isEdit && originalPan && originalPan !== payload.pan) {
        await deleteShareholder(originalPan);
      }
      toast.success(isEdit ? 'Shareholder updated' : 'Shareholder added');
      navigate('/corporate/shareholding', { replace: true });
    } catch (e) {
      const raw = e instanceof Error ? e.message : 'Save failed';
      try {
        const parsed = JSON.parse(raw) as { message?: string };
        toast.error(parsed?.message || raw);
      } catch {
        toast.error(raw);
      }
    } finally {
      setSaving(false);
    }
  };

  const nominees = watch('nominees');

  return (
    <ErrorBoundary>
      <PageHeader
        title={isEdit ? 'Edit Shareholder' : 'Add Shareholder'}
        subtitle="Enter shareholder details as per the register."
        actions={[
          { label: 'Back', variant: 'secondary', onClick: () => navigate('/corporate/shareholding') },
        ]}
      />

      {loading ? (
        <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-sm font-semibold text-slate-600">Loading…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <SectionCard title="Personal Details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="Name" required error={errors.name?.message}>
                <input className={inputClass} {...register('name', { required: 'Required' })} />
              </FormField>
              <FormField label="Mobile No." required error={errors.mobile?.message}>
                <input
                  className={inputClass}
                  maxLength={10}
                  inputMode="numeric"
                  {...register('mobile', {
                    required: 'Required',
                    setValueAs: (v) => String(v || '').replace(/\D/g, '').slice(0, 10),
                    validate: (v) => String(v || '').length === 10 || 'Mobile must be 10 digits',
                  })}
                />
              </FormField>
              <FormField label="Email" error={errors.email?.message}>
                <input type="email" className={inputClass} {...register('email')} />
              </FormField>
              <FormField label="PAN Card No." required error={errors.pan?.message}>
                <input
                  className={inputClass}
                  maxLength={10}
                  placeholder="ABCDE1234F"
                  {...register('pan', {
                    required: 'Required',
                    setValueAs: (v) => String(v || '').trim().toUpperCase(),
                    validate: (v) => PAN_RE.test(String(v || '').trim().toUpperCase()) || 'Invalid PAN format',
                  })}
                />
              </FormField>
              <FormField label="Aadhaar No." error={errors.aadhaar?.message}>
                <input
                  className={inputClass}
                  maxLength={12}
                  inputMode="numeric"
                  {...register('aadhaar', {
                    setValueAs: (v) => String(v || '').replace(/\D/g, '').slice(0, 12),
                    validate: (v) => !v || String(v).length === 12 || 'Aadhaar must be 12 digits',
                  })}
                />
              </FormField>
              <FormField label="Address" className="sm:col-span-2">
                <input className={inputClass} {...register('address')} />
              </FormField>
              <FormField label="City">
                <input className={inputClass} {...register('city')} />
              </FormField>
              <FormField label="Landmark / Area">
                <input className={inputClass} {...register('landmark')} />
              </FormField>
              <FormField label="Country">
                <input className={inputClass} {...register('country')} />
              </FormField>
              <FormField label="Gender">
                <select className={inputClass} {...register('gender')}>
                  <option value="">Select…</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Share Details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="Holding (%)">
                <input
                  className={inputClass}
                  {...register('holdingPercent', {
                    setValueAs: (v) => String(v || '').replace(/[^\d.]/g, ''),
                    validate: (v) => {
                      if (!v) return true;
                      const x = Number(v);
                      if (!Number.isFinite(x)) return 'Invalid %';
                      if (x < 0 || x > 100) return 'Must be between 0 and 100';
                      return true;
                    },
                  })}
                />
              </FormField>
              <FormField label="Share Type">
                <select className={inputClass} {...register('shareType')}>
                  <option value="">Select…</option>
                  <option>Fully Paid - EQ</option>
                  <option>Partially Paid - EQ</option>
                  <option>Convertible</option>
                  <option>Debenture</option>
                  <option>Preference Share</option>
                </select>
              </FormField>
              <FormField label="Face Value">
                <input className={inputClass} {...register('faceValue', { setValueAs: (v) => String(v || '').replace(/[^\d.]/g, '') })} />
              </FormField>
              <FormField label="No. of Shares">
                <input className={inputClass} {...register('numberOfShares', { setValueAs: (v) => String(v || '').replace(/\D/g, '').slice(0, 12) })} />
              </FormField>
              <FormField label="Mode">
                <select className={inputClass} {...register('mode')}>
                  <option value="">Select…</option>
                  <option>Physical</option>
                  <option>Demat</option>
                </select>
              </FormField>
              <FormField label="ISIN Code">
                <input className={inputClass} {...register('isinCode')} />
              </FormField>
              <FormField label="DP Number">
                <input className={inputClass} {...register('dpNumber')} />
              </FormField>
              <FormField label="Folio Number" required error={errors.folioNumber?.message}>
                <input className={inputClass} {...register('folioNumber', { required: 'Required' })} />
              </FormField>
              <FormField label="Distinctive No(s) From">
                <input className={inputClass} {...register('distinctiveFrom')} />
              </FormField>
              <FormField label="Distinctive No(s) To">
                <input className={inputClass} {...register('distinctiveTo')} />
              </FormField>
              <FormField label="Year of Issuance">
                <input className={inputClass} {...register('yearOfIssuance')} />
              </FormField>
              <FormField label="Stakeholder">
                <select className={inputClass} {...register('stakeholder')}>
                  <option value="">Select…</option>
                  <option>Board Member</option>
                  <option>HNI</option>
                  <option>Pledge Lender</option>
                  <option>Investors</option>
                  <option>Shareholders</option>
                </select>
              </FormField>
              <FormField label="Date of Allotment">
                <input type="date" className={inputClass} {...register('dateOfAllotment')} />
              </FormField>
              <FormField label="Remarks">
                <select className={inputClass} {...register('remarks')}>
                  <option value="">Select…</option>
                  <option>Transferable</option>
                  <option>Non-Transferable</option>
                  <option>Partly Paid</option>
                  <option>Partly Sold</option>
                  <option>Lockin Period</option>
                </select>
              </FormField>
              <FormField label="Exit Date">
                <input type="date" className={inputClass} {...register('exitDate')} />
              </FormField>
              <FormField label="Year">
                <input className={inputClass} {...register('year')} />
              </FormField>
              <FormField label="Pledge">
                <select className={inputClass} {...register('pledge')}>
                  <option>NA</option>
                  <option>Un Pledge</option>
                  <option>Pledge</option>
                </select>
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Bank Details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="Bank Name">
                <input className={inputClass} {...register('bankName')} />
              </FormField>
              <FormField label="IFSC Code">
                <input className={inputClass} {...register('ifscCode')} />
              </FormField>
              <FormField label="Bank Account No.">
                <input className={inputClass} {...register('bankAccountNumber')} />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Nominees">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
                  <p className="text-sm font-bold text-primary">Nominee {idx + 1}</p>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <FormField label={`Nominee ${idx + 1} Name`}>
                      <input className={inputClass} {...register(`nominees.${idx}.name` as const)} />
                    </FormField>
                    <FormField label={`Nominee ${idx + 1} Mobile No.`}>
                      <input
                        className={inputClass}
                        maxLength={10}
                        inputMode="numeric"
                        {...register(`nominees.${idx}.mobile` as const, {
                          setValueAs: (v) => String(v || '').replace(/\D/g, '').slice(0, 10),
                        })}
                      />
                    </FormField>
                    <FormField label={`Nominee ${idx + 1} Relation`}>
                      <input className={inputClass} {...register(`nominees.${idx}.relation` as const)} />
                    </FormField>
                    <FormField label={`Nominee ${idx + 1} Percentage`}>
                      <input
                        className={inputClass}
                        {...register(`nominees.${idx}.percentage` as const, {
                          setValueAs: (v) => String(v || '').replace(/[^\d.]/g, ''),
                          validate: (v) => {
                            if (!v) return true;
                            const x = Number(v);
                            if (!Number.isFinite(x)) return 'Invalid %';
                            if (x < 0 || x > 100) return 'Must be between 0 and 100';
                            return true;
                          },
                        })}
                      />
                    </FormField>
                    <FormField
                      label={`Nominee ${idx + 1} PAN`}
                      error={((errors.nominees as unknown as NomineeErrors[])?.[idx]?.pan?.message) as string | undefined}
                    >
                      <input
                        className={inputClass}
                        maxLength={10}
                        placeholder="ABCDE1234F"
                        {...register(`nominees.${idx}.pan` as const, {
                          setValueAs: (v) => String(v || '').trim().toUpperCase(),
                          validate: (v) => !v || PAN_RE.test(String(v || '').trim().toUpperCase()) || 'Invalid PAN',
                        })}
                      />
                    </FormField>
                  </div>
                </div>
              ))}
            </div>

            {/* quick summary to ensure form is dynamic */}
            {nominees?.length ? (
              <p className="mt-3 text-xs font-semibold text-slate-500">
                Tip: Fill only the nominees you have; empty nominee rows are allowed.
              </p>
            ) : null}
          </SectionCard>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/corporate/shareholding')}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save Shareholder'}
            </button>
          </div>
        </form>
      )}
    </ErrorBoundary>
  );
};

