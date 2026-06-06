import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { Nominee, Shareholder } from '../corporate.types';
import { SHARE_REMARK_OPTIONS, PLEDGE_OPTIONS, SHARE_STATUS_OPTIONS } from '../corporate.types';
import { fetchShareholderByPan, saveShareholder } from '../corporate.service';
import { onIntegerInputKeyDown, onNumericInputKeyDown } from '../../../shared/utils/numericInput';
import { toDateInputValue } from '../../../shared/utils/dateFormat';
import { BankNameInput } from '../../../shared/components/BankNameInput';
import { PanNumberInput } from '../../../shared/components/PanNumberInput';
import { isValidIndianPan } from '../../../utils/inputFormats';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const disabledFieldClass =
  'h-9 w-full min-w-[5rem] cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-400 outline-none';

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
  beneficiaryDpId: '',
  folioNumber: '',
  distinctiveFrom: '',
  distinctiveTo: '',
  yearOfIssuance: '',
  stakeholder: '',
  dateOfAllotment: '',
  remarks: '',
  exitDate: '',
  year: '',
  projectKey: '',

  bankName: '',
  ifscCode: '',
  bankAccountNumber: '',
  bankCity: '',
  bankCountry: '',

  pledge: '',
  shareStatus: '',
  historyId: '',
  nominees: [emptyNominee(), emptyNominee(), emptyNominee()],
};

function pickPeriodForm(
  identity: Shareholder | null,
  historyRows: Shareholder[],
  record: Shareholder | null,
  historyIdParam: string | null,
): Shareholder {
  const idNominees = identity?.nominees?.length ? identity.nominees : defaultValues.nominees;
  const personal = (): Partial<FormValues> =>
    identity
      ? {
          name: identity.name,
          pan: identity.pan,
          mobile: identity.mobile,
          email: identity.email,
          aadhaar: identity.aadhaar,
          address: identity.address,
          city: identity.city,
          landmark: identity.landmark,
          country: identity.country,
          gender: identity.gender,
          nominees: idNominees,
        }
      : {};

  if (historyIdParam === '__new__') {
    return {
      ...defaultValues,
      ...personal(),
      year: '',
      projectKey: '',
      historyId: '',
    } as Shareholder;
  }

  if (historyIdParam) {
    const row = historyRows.find((h) => h.historyId === historyIdParam);
    if (row) {
      return {
        ...defaultValues,
        ...personal(),
        ...row,
        ...personal(),
        nominees: row.nominees?.length ? row.nominees : idNominees,
      } as Shareholder;
    }
  }

  if (record) {
    return {
      ...defaultValues,
      ...personal(),
      ...record,
      nominees: record.nominees?.length ? record.nominees : idNominees,
    } as Shareholder;
  }

  return { ...defaultValues, ...personal() } as Shareholder;
}

export const ShareholdingForm: React.FC = () => {
  const { pan } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = !!pan && pan !== 'new';
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(isEdit);
  const [saving, setSaving] = React.useState(false);
  const [identityPan, setIdentityPan] = React.useState('');
  const [historyOptions, setHistoryOptions] = React.useState<Shareholder[]>([]);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues });
  const prevModeRef = React.useRef('');

  React.useEffect(() => {
    let mounted = true;
    async function run() {
      if (!isEdit || !pan) return;
      try {
        setLoading(true);
        const res = await fetchShareholderByPan(pan);
        const idPan = String(res.identity?.pan || res.record?.pan || pan).trim().toUpperCase();
        setIdentityPan(idPan);
        setHistoryOptions(res.history);
        const hid = searchParams.get('historyId');
        const merged = pickPeriodForm(res.identity, res.history, res.record, hid);
        (Object.keys(defaultValues) as (keyof FormValues)[]).forEach((k) => {
          const map = merged as unknown as Record<string, unknown>;
          const fallback = defaultValues as unknown as Record<string, unknown>;
          let val = (map[k] ?? fallback[k]) as FormValues[keyof FormValues];
          if (k === 'yearOfIssuance' && val) {
            val = toDateInputValue(String(val)) as FormValues[keyof FormValues];
          }
          if (k === 'dateOfAllotment' && val) {
            val = toDateInputValue(String(val)) as FormValues[keyof FormValues];
          }
          if (k === 'exitDate' && val) {
            val = toDateInputValue(String(val)) as FormValues[keyof FormValues];
          }
          setValue(k, val as any, { shouldDirty: false });
        });
        prevModeRef.current = String(merged.mode || '');
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load shareholder.');
        navigate('/corporate/shareholding', { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [isEdit, pan, navigate, setValue, searchParams]);

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      const panNorm = data.pan.trim().toUpperCase();
      if (isEdit && identityPan && panNorm !== identityPan) {
        toast.error('PAN cannot be changed while editing an existing shareholder.');
        return;
      }
      const hid = searchParams.get('historyId');
      const isNewPeriod = hid === '__new__';
      const resolvedHistoryId = isNewPeriod
        ? undefined
        : hid && hid !== '__new__'
          ? hid
          : data.historyId || undefined;
      const payload: Shareholder = {
        ...data,
        id: isEdit && pan ? pan : panNorm,
        pan: panNorm,
        historyId: resolvedHistoryId,
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
      toast.success(isEdit ? 'Saved' : 'Shareholder added');
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
  const mode = watch('mode');
  const isPhysical = mode === 'Physical';
  const isDemat = mode === 'Demat';

  React.useEffect(() => {
    if (!mode || mode === prevModeRef.current) return;
    if (prevModeRef.current) {
      if (mode === 'Physical') {
        setValue('isinCode', '');
        setValue('dpNumber', '');
        setValue('beneficiaryDpId', '');
      } else if (mode === 'Demat') {
        setValue('folioNumber', '');
        setValue('distinctiveFrom', '');
        setValue('distinctiveTo', '');
      }
    }
    prevModeRef.current = mode;
  }, [mode, setValue]);

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
                <input
                  className={inputClass}
                  {...register('name', { required: 'Please enter the shareholder’s name.' })}
                />
              </FormField>
              <FormField label="Mobile No." required error={errors.mobile?.message}>
                <input
                  className={inputClass}
                  maxLength={10}
                  inputMode="numeric"
                  onKeyDown={onIntegerInputKeyDown}
                  {...register('mobile', {
                    required: 'Please enter a 10-digit mobile number.',
                    setValueAs: (v) => String(v || '').replace(/\D/g, '').slice(0, 10),
                    validate: (v) => String(v || '').length === 10 || 'Mobile number must be exactly 10 digits.',
                  })}
                />
              </FormField>
              <FormField label="Email" error={errors.email?.message}>
                <input type="email" className={inputClass} {...register('email')} />
              </FormField>
              <FormField label="PAN Card No." required error={errors.pan?.message}>
                <Controller
                  name="pan"
                  control={control}
                  rules={{
                    required: 'Please enter the PAN.',
                    validate: (v) =>
                      isValidIndianPan(String(v || '')) ||
                      'PAN is not valid. Use 5 letters, 4 digits, and 1 letter (e.g. ABCDE1234F).',
                  }}
                  render={({ field }) => (
                    <PanNumberInput
                      value={field.value ?? ''}
                      onBlur={field.onBlur}
                      inputRef={field.ref}
                      name={field.name}
                      onChange={field.onChange}
                      disabled={isEdit}
                      className={isEdit ? `${inputClass} cursor-not-allowed bg-slate-50` : inputClass}
                    />
                  )}
                />
              </FormField>
              <FormField label="Aadhaar No." error={errors.aadhaar?.message}>
                <input
                  className={inputClass}
                  maxLength={12}
                  inputMode="numeric"
                  onKeyDown={onIntegerInputKeyDown}
                  {...register('aadhaar', {
                    setValueAs: (v) => String(v || '').replace(/\D/g, '').slice(0, 12),
                    validate: (v) => !v || String(v).length === 12 || 'Aadhaar number must be exactly 12 digits.',
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

          <SectionCard title="Shareholding period (year / project)">
            <p className="mb-3 text-xs font-semibold text-slate-600">
              Same PAN re-used: set a different <strong>Year</strong> or <strong>Project reference</strong> to add another history row without duplicating the shareholder.
            </p>
            {isEdit && historyOptions.length > 0 ? (
              <div className="mb-4">
                <FormField label="Editing snapshot">
                  <select
                    className={inputClass}
                    value={searchParams.get('historyId') || (historyOptions[0]?.historyId ?? '')}
                    onChange={(e) => {
                      const v = e.target.value;
                      navigate(
                        v
                          ? `/corporate/shareholding/${encodeURIComponent(pan!)}/edit?historyId=${encodeURIComponent(v)}`
                          : `/corporate/shareholding/${encodeURIComponent(pan!)}/edit`,
                        { replace: true },
                      );
                    }}
                  >
                    {historyOptions.map((h) => (
                      <option key={h.historyId} value={h.historyId}>
                        {h.year || '—'} {h.projectKey ? `· ${h.projectKey}` : ''} ({h.folioNumber || 'folio —'})
                      </option>
                    ))}
                    <option value="__new__">+ New year / project…</option>
                  </select>
                </FormField>
              </div>
            ) : null}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="Year (FY / label)" required={!!isEdit} error={errors.year?.message}>
                <input
                  className={inputClass}
                  placeholder="e.g. 2025-2026"
                  {...register('year', {
                    validate: (v) => {
                      if (!isEdit) return true;
                      if (searchParams.get('historyId') === '__new__' && !String(v || '').trim()) {
                        return 'Enter year for the new snapshot';
                      }
                      return true;
                    },
                  })}
                />
              </FormField>
              <FormField label="Project / scheme ref (optional)">
                <input
                  className={inputClass}
                  placeholder="Distinguishes same year"
                  {...register('projectKey')}
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Share Details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="Holding ( % )">
                <input
                  className={inputClass}
                  inputMode="decimal"
                  onKeyDown={onNumericInputKeyDown}
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
                <input
                  className={inputClass}
                  inputMode="decimal"
                  onKeyDown={onNumericInputKeyDown}
                  {...register('faceValue', { setValueAs: (v) => String(v || '').replace(/[^\d.]/g, '') })}
                />
              </FormField>
              <FormField label="No. of Shares">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  onKeyDown={onIntegerInputKeyDown}
                  {...register('numberOfShares', { setValueAs: (v) => String(v || '').replace(/\D/g, '').slice(0, 12) })}
                />
              </FormField>
              <FormField label="Mode">
                <select className={inputClass} {...register('mode')}>
                  <option value="">Select…</option>
                  <option>Physical</option>
                  <option>Demat</option>
                </select>
              </FormField>
              <FormField label="ISIN Code">
                <input
                  {...register('isinCode')}
                  className={isPhysical ? disabledFieldClass : inputClass}
                  disabled={isPhysical}
                />
              </FormField>
              <FormField label="DP Number">
                <input
                  {...register('dpNumber')}
                  className={isPhysical ? disabledFieldClass : inputClass}
                  disabled={isPhysical}
                />
              </FormField>
              <FormField label="Beneficiary DP ID">
                <input
                  {...register('beneficiaryDpId')}
                  className={isPhysical ? disabledFieldClass : inputClass}
                  disabled={isPhysical}
                />
              </FormField>
              <FormField label="Folio Number">
                <input
                  {...register('folioNumber')}
                  className={isDemat ? disabledFieldClass : inputClass}
                  disabled={isDemat}
                />
              </FormField>
              <FormField label="Distinctive No(s) From" error={errors.distinctiveFrom?.message}>
                <input
                  {...register('distinctiveFrom', {
                    setValueAs: (v) => String(v || '').replace(/\D/g, ''),
                    validate: (v) => {
                      if (isDemat || !v) return true;
                      return /^\d+$/.test(String(v)) || 'Enter numbers only.';
                    },
                  })}
                  className={isDemat ? disabledFieldClass : inputClass}
                  disabled={isDemat}
                  inputMode="numeric"
                  onKeyDown={onIntegerInputKeyDown}
                />
              </FormField>
              <FormField label="Distinctive No(s) To" error={errors.distinctiveTo?.message}>
                <input
                  {...register('distinctiveTo', {
                    setValueAs: (v) => String(v || '').replace(/\D/g, ''),
                    validate: (v) => {
                      if (isDemat || !v) return true;
                      return /^\d+$/.test(String(v)) || 'Enter numbers only.';
                    },
                  })}
                  className={isDemat ? disabledFieldClass : inputClass}
                  disabled={isDemat}
                  inputMode="numeric"
                  onKeyDown={onIntegerInputKeyDown}
                />
              </FormField>
              <FormField label="Year of Issuance">
                <input
                  type="date"
                  className={`${inputClass} [color-scheme:light]`}
                  {...register('yearOfIssuance')}
                />
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
                <input type="date" className={`${inputClass} [color-scheme:light]`} {...register('dateOfAllotment')} />
              </FormField>
              <FormField label="Remarks">
                <select className={inputClass} {...register('remarks')}>
                  <option value="">Select…</option>
                  {SHARE_REMARK_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Exit Date">
                <input type="date" className={`${inputClass} [color-scheme:light]`} {...register('exitDate')} />
              </FormField>
              <FormField label="Pledge">
                <select className={inputClass} {...register('pledge')}>
                  <option value="">Select…</option>
                  {PLEDGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Status">
                <select className={inputClass} {...register('shareStatus')}>
                  <option value="">Select…</option>
                  {SHARE_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </FormField>
              <input type="hidden" {...register('historyId')} />
            </div>
          </SectionCard>

          <SectionCard title="Bank Details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="Bank Name">
                <BankNameInput
                  value={watch('bankName') ?? ''}
                  onChange={(v) => setValue('bankName', v, { shouldDirty: true })}
                />
              </FormField>
              <FormField label="IFSC Code">
                <input className={inputClass} {...register('ifscCode')} />
              </FormField>
              <FormField label="Bank Account No.">
                <input
                  className={inputClass}
                  inputMode="numeric"
                  autoComplete="off"
                  onKeyDown={onIntegerInputKeyDown}
                  {...register('bankAccountNumber', {
                    setValueAs: (v) => String(v || '').replace(/\D/g, '').slice(0, 18),
                  })}
                />
              </FormField>
              <FormField label="City">
                <input className={inputClass} {...register('bankCity')} />
              </FormField>
              <FormField label="Country">
                <input className={inputClass} {...register('bankCountry')} />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Nominees">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {[0, 1, 2].map((idx) => (
                <div key={idx} className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
                  <p className="text-sm font-bold text-primary">Nominee {idx + 1}</p>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <FormField label="Name">
                      <input className={inputClass} {...register(`nominees.${idx}.name` as const)} />
                    </FormField>
                    <FormField label="Mobile No.">
                      <input
                        className={inputClass}
                        maxLength={10}
                        inputMode="numeric"
                        onKeyDown={onIntegerInputKeyDown}
                        {...register(`nominees.${idx}.mobile` as const, {
                          setValueAs: (v) => String(v || '').replace(/\D/g, '').slice(0, 10),
                        })}
                      />
                    </FormField>
                    <FormField label="Relation">
                      <input className={inputClass} {...register(`nominees.${idx}.relation` as const)} />
                    </FormField>
                    <FormField label="Percentage ( % )">
                      <input
                        className={inputClass}
                        inputMode="numeric"
                        maxLength={3}
                        onKeyDown={onIntegerInputKeyDown}
                        {...register(`nominees.${idx}.percentage` as const, {
                          setValueAs: (v) => String(v || '').replace(/\D/g, '').slice(0, 3),
                          validate: (v) => {
                            if (!v) return true;
                            const x = Number(v);
                            if (!Number.isFinite(x)) return 'Enter a valid percentage.';
                            if (x < 0 || x > 100) return 'Nominee percentage must be between 0 and 100.';
                            return true;
                          },
                        })}
                      />
                    </FormField>
                    <FormField
                      label="PAN"
                      error={((errors.nominees as unknown as NomineeErrors[])?.[idx]?.pan?.message) as string | undefined}
                    >
                      <Controller
                        name={`nominees.${idx}.pan`}
                        control={control}
                        rules={{
                          validate: (v) =>
                            !String(v || '').trim() ||
                            isValidIndianPan(String(v)) ||
                            'Nominee PAN is not valid. Use 5 letters, 4 digits, and 1 letter (e.g. ABCDE1234F).',
                        }}
                        render={({ field }) => (
                          <PanNumberInput
                            value={field.value ?? ''}
                            onBlur={field.onBlur}
                            inputRef={field.ref}
                            name={field.name}
                            onChange={field.onChange}
                          />
                        )}
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

