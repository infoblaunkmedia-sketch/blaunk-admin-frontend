import React from 'react';
import { Controller, useForm, type UseFormReset } from 'react-hook-form';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FormBackLink } from '../../../shared/components/FormBackLink';
import { SectionCard } from '../../../shared/components/SectionCard';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { Nominee, Shareholder } from '../corporate.types';
import { SHARE_REMARK_OPTIONS, PLEDGE_OPTIONS, SHARE_STATUS_OPTIONS } from '../corporate.types';
import {
  fetchShareholderByPan,
  fetchShareholders,
  resolveShareholderIdentity,
  saveShareholder,
} from '../corporate.service';
import { onIntegerInputKeyDown, onNumericInputKeyDown } from '../../../shared/utils/numericInput';
import { toDateInputValue, toDisplayDDMMYYYY } from '../../../shared/utils/dateFormat';
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

function isMongoObjectId(value: string | undefined | null): boolean {
  if (!value) return false;
  return /^[a-f\d]{24}$/i.test(String(value).trim());
}

const defaultValues: FormValues = {
  name: '',
  mobile: '',
  email: '',
  pan: '',
  aadhaar: '',
  address: '',
  addressLine2: '',
  city: '',
  area: '',
  landmark: '',
  pincode: '',
  state: '',
  country: '',
  gender: '',
  formSubmission: '',

  holdingPercent: '',
  shareType: '',
  faceValue: '',
  numberOfShares: '',
  mode: '',
  isinCode: '',
  dpNumber: '',
  dp: '',
  beneficiaryDpId: '',
  folioNumber: '',
  certificateNumber: '',
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

function pickNonEmpty(...values: (string | undefined | null)[]): string {
  for (const value of values) {
    const s = String(value ?? '').trim();
    if (s) return s;
  }
  return '';
}

function personalFields(identity: Shareholder | null, record: Shareholder | null): Partial<FormValues> {
  if (!identity && !record) return {};
  return {
    name: pickNonEmpty(identity?.name, record?.name),
    pan: pickNonEmpty(identity?.pan, record?.pan),
    mobile: pickNonEmpty(identity?.mobile, record?.mobile),
    email: pickNonEmpty(identity?.email, record?.email),
    aadhaar: pickNonEmpty(identity?.aadhaar, record?.aadhaar),
    address: pickNonEmpty(identity?.address, record?.address),
    addressLine2: pickNonEmpty(identity?.addressLine2, record?.addressLine2),
    city: pickNonEmpty(identity?.city, record?.city),
    area: pickNonEmpty(identity?.area, record?.area),
    landmark: pickNonEmpty(identity?.landmark, record?.landmark),
    pincode: pickNonEmpty(identity?.pincode, record?.pincode),
    state: pickNonEmpty(identity?.state, record?.state),
    country: pickNonEmpty(identity?.country, record?.country),
    gender: pickNonEmpty(identity?.gender, record?.gender),
    formSubmission: pickNonEmpty(identity?.formSubmission, record?.formSubmission),
  };
}

function pickPeriodForm(
  identity: Shareholder | null,
  historyRows: Shareholder[],
  record: Shareholder | null,
  historyIdParam: string | null,
  newShareEntry = false,
): Shareholder {
  const personal = personalFields(identity, record);

  if (newShareEntry) {
    return {
      ...defaultValues,
      ...personal,
      historyId: '',
      year: '',
      projectKey: '',
      nominees: defaultValues.nominees,
    } as Shareholder;
  }

  if (historyIdParam) {
    const row = historyRows.find((h) => h.historyId === historyIdParam);
    if (row) {
      return {
        ...defaultValues,
        ...row,
        ...personal,
        historyId: row.historyId || '',
        nominees: row.nominees?.length ? row.nominees : defaultValues.nominees,
      } as Shareholder;
    }
  }

  if (record) {
    return {
      ...defaultValues,
      ...record,
      ...personal,
      historyId: record.historyId || '',
      nominees: record.nominees?.length ? record.nominees : defaultValues.nominees,
    } as Shareholder;
  }

  return { ...defaultValues, ...personal } as Shareholder;
}

function historySortTime(row: Shareholder): number {
  const raw = row.createdAt || row.updatedAt || '';
  const t = raw ? new Date(raw).getTime() : 0;
  return Number.isNaN(t) ? 0 : t;
}

function sortHistoryChronological(rows: Shareholder[]): Shareholder[] {
  return [...rows].sort((a, b) => historySortTime(a) - historySortTime(b));
}

function formatHistorySavedAt(row: Shareholder): string {
  const raw = row.updatedAt || row.createdAt || '';
  return raw ? toDisplayDDMMYYYY(raw) || raw : '—';
}

function ShareholdingPreviousEntries({ rows }: { rows: Shareholder[] }) {
  const ordered = sortHistoryChronological(rows);
  if (!ordered.length) return null;
  return (
    <SectionCard title={`Previous shareholding entries (${ordered.length})`}>
      <p className="mb-3 text-xs font-semibold text-slate-600">
        Saved records for this PAN. Fill the form below to add a new entry.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-3">Entry</th>
              <th className="py-2 pr-3">Saved on</th>
              <th className="py-2 pr-3">Share Type</th>
              <th className="py-2 pr-3">Shares</th>
              <th className="py-2 pr-3">Holding %</th>
              <th className="py-2 pr-3">Folio</th>
              <th className="py-2 pr-3">Allotment</th>
              <th className="py-2 pr-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((row, index) => (
              <tr key={row.historyId || `${row.pan}-${index}`} className="border-b border-slate-100">
                <td className="py-2 pr-3 font-semibold text-slate-800">Entry {index + 1}</td>
                <td className="py-2 pr-3 text-slate-700">{formatHistorySavedAt(row)}</td>
                <td className="py-2 pr-3 text-slate-700">{row.shareType || '—'}</td>
                <td className="py-2 pr-3">{row.numberOfShares || '—'}</td>
                <td className="py-2 pr-3">{row.holdingPercent || '—'}</td>
                <td className="py-2 pr-3">{row.folioNumber || '—'}</td>
                <td className="py-2 pr-3">{toDisplayDDMMYYYY(row.dateOfAllotment) || row.dateOfAllotment || '—'}</td>
                <td className="py-2 pr-3">{row.shareStatus || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

type PanOption = { pan: string; name: string };

function formValuesFromShareholder(merged: Shareholder): FormValues {
  const vals = { ...defaultValues };
  (Object.keys(defaultValues) as (keyof FormValues)[]).forEach((k) => {
    const map = merged as unknown as Record<string, unknown>;
    let val = map[k];
    if (val === undefined || val === null) return;
    if (k === 'yearOfIssuance' || k === 'dateOfAllotment' || k === 'exitDate') {
      val = toDateInputValue(String(val));
    }
    if (k === 'nominees') {
      const arr = Array.isArray(val) ? [...(val as Nominee[])] : [];
      while (arr.length < 3) arr.push(emptyNominee());
      vals.nominees = arr.slice(0, 3);
      return;
    }
    (vals as unknown as Record<string, unknown>)[k] = val;
  });
  return vals;
}

function applyShareholderToForm(merged: Shareholder, reset: UseFormReset<FormValues>) {
  reset(formValuesFromShareholder(merged));
}

function isAddShareholdingPath(pathname: string): boolean {
  return /\/shareholding\/new\/?$/i.test(pathname);
}

export const ShareholdingForm: React.FC = () => {
  const { pan } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isNew = isAddShareholdingPath(location.pathname) || pan === 'new';
  const isEdit = Boolean(pan) && !isNew;
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(isEdit);
  const [saving, setSaving] = React.useState(false);
  const [identityPan, setIdentityPan] = React.useState('');
  const [previousEntries, setPreviousEntries] = React.useState<Shareholder[]>([]);
  const [setupStep, setSetupStep] = React.useState<'pan' | 'form'>(isNew ? 'pan' : 'form');
  const [panOptions, setPanOptions] = React.useState<PanOption[]>([]);
  const [pickerPan, setPickerPan] = React.useState('');
  const [reusedPan, setReusedPan] = React.useState(false);
  const [loadingPanOptions, setLoadingPanOptions] = React.useState(isNew);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues });
  const prevModeRef = React.useRef('');

  React.useEffect(() => {
    if (!isNew) return;
    let mounted = true;
    (async () => {
      setLoadingPanOptions(true);
      try {
        const rows = await fetchShareholders();
        if (!mounted) return;
        const seen = new Set<string>();
        const opts: PanOption[] = [];
        for (const r of rows) {
          const p = String(r.pan || '').trim().toUpperCase();
          if (!p || seen.has(p)) continue;
          seen.add(p);
          opts.push({ pan: p, name: String(r.name || '').trim() || p });
        }
        opts.sort((a, b) => a.pan.localeCompare(b.pan));
        setPanOptions(opts);
      } catch (e) {
        if (mounted) toast.error(e instanceof Error ? e.message : 'Failed to load PAN list.');
      } finally {
        if (mounted) setLoadingPanOptions(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isNew]);

  React.useEffect(() => {
    let mounted = true;
    async function run() {
      if (!isEdit || !pan) return;
      try {
        setLoading(true);
        const res = await fetchShareholderByPan(pan);
        const identity = resolveShareholderIdentity(res.identity, res.record, res.credential, pan);
        const idPan = String(identity?.pan || res.record?.pan || pan).trim().toUpperCase();
        setIdentityPan(idPan);
        const hid = searchParams.get('historyId');
        const merged = pickPeriodForm(identity, res.history, res.record, hid);
        applyShareholderToForm(merged, reset);
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
  }, [isEdit, pan, navigate, reset, searchParams]);

  const handleContinueExistingPan = async () => {
    const selected = String(pickerPan || '').trim().toUpperCase();
    if (!selected) {
      toast.error('Please select a PAN from the list.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetchShareholderByPan(selected);
      const identity = resolveShareholderIdentity(res.identity, res.record, res.credential, selected);
      if (!identity?.pan) {
        toast.error('No shareholder data found for this PAN.');
        return;
      }
      const merged = pickPeriodForm(identity, res.history, res.record, null, true);
      applyShareholderToForm(merged, reset);
      setIdentityPan(selected);
      setPreviousEntries(res.history);
      setReusedPan(true);
      setSetupStep('form');
      prevModeRef.current = '';
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load shareholder.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewPan = () => {
    applyShareholderToForm({ ...defaultValues } as Shareholder, reset);
    setIdentityPan('');
    setPreviousEntries([]);
    setReusedPan(false);
    setPickerPan('');
    setSetupStep('form');
    prevModeRef.current = '';
  };

  const handleChangePanSelection = () => {
    setSetupStep('pan');
    setReusedPan(false);
    setIdentityPan('');
    setPreviousEntries([]);
  };

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      const panNorm = data.pan.trim().toUpperCase();
      if (isEdit && identityPan && panNorm !== identityPan) {
        toast.error('PAN cannot be changed while editing an existing shareholder.');
        return;
      }
      const hid = searchParams.get('historyId');
      const resolvedHistoryId =
        isEdit && isMongoObjectId(hid)
          ? hid!.trim()
          : isEdit && isMongoObjectId(data.historyId)
            ? String(data.historyId).trim()
            : undefined;
      const payload: Shareholder = {
        ...data,
        id: isEdit && pan ? pan : panNorm,
        pan: panNorm,
        historyId: resolvedHistoryId,
        mobile: String(data.mobile || '').replace(/\D/g, '').slice(0, 10),
        aadhaar: String(data.aadhaar || '').replace(/\D/g, '').slice(0, 12),
        email: String(data.email || '').trim(),
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
  const shareStatus = watch('shareStatus');
  const isExitStatus = shareStatus === 'Exit';

  React.useEffect(() => {
    if (!isExitStatus) {
      setValue('exitDate', '');
    }
  }, [isExitStatus, setValue]);
  const isPhysical = mode === 'Physical';
  const isDemat = mode === 'Demat';

  React.useEffect(() => {
    if (!mode || mode === prevModeRef.current) return;
    if (prevModeRef.current) {
      if (mode === 'Physical') {
        setValue('isinCode', '');
        setValue('dpNumber', '');
        setValue('dp', '');
        setValue('beneficiaryDpId', '');
      } else if (mode === 'Demat') {
        setValue('folioNumber', '');
        setValue('certificateNumber', '');
        setValue('distinctiveFrom', '');
        setValue('distinctiveTo', '');
      }
    }
    prevModeRef.current = mode;
  }, [mode, setValue]);

  const goBack = () => navigate('/corporate/shareholding');
  const showForm = isEdit || setupStep === 'form';
  const panLocked = isEdit || reusedPan;
  const selectedPanOption = panOptions.find((o) => o.pan === pickerPan);

  return (
    <ErrorBoundary>
      {isNew && setupStep === 'pan' ? (
        <SectionCard title="Select PAN Card" actions={<FormBackLink onClick={goBack} />}>
          <div className="flex max-w-md flex-col gap-2 sm:flex-row sm:items-end">
            <FormField label="PAN Card" className="min-w-0 flex-[1.4] sm:min-w-[10.5rem]">
              <select
                className={`${inputClass} w-full min-w-0`}
                value={pickerPan}
                disabled={loadingPanOptions}
                title={
                  selectedPanOption
                    ? `${selectedPanOption.pan} — ${selectedPanOption.name}`
                    : 'Select existing PAN'
                }
                onChange={(e) => setPickerPan(e.target.value)}
              >
                <option value="">
                  {loadingPanOptions ? 'Loading…' : 'Select existing PAN'}
                </option>
                {panOptions.map((o) => (
                  <option key={o.pan} value={o.pan} title={`${o.pan} — ${o.name}`}>
                    {o.pan} — {o.name}
                  </option>
                ))}
              </select>
            </FormField>
            <button
              type="button"
              onClick={handleContinueExistingPan}
              disabled={!pickerPan || loading}
              className="h-9 shrink-0 whitespace-nowrap rounded-lg bg-primary px-2 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-60 sm:text-sm"
            >
              {loading ? 'Loading…' : 'Continue'}
            </button>
            <button
              type="button"
              onClick={handleCreateNewPan}
              className="h-9 shrink-0 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:text-sm"
            >
              Create New
            </button>
          </div>
        </SectionCard>
      ) : null}

      {loading && isEdit ? (
        <div className="rounded-card border border-slate-200 bg-white shadow-card">
          <div className="flex justify-end border-b border-slate-100 px-5 py-3">
            <FormBackLink onClick={goBack} />
          </div>
          <p className="p-6 text-sm font-semibold text-slate-600">Loading…</p>
        </div>
      ) : showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {isNew && reusedPan ? (
            <p className="text-sm text-slate-600">
              Personal details loaded from PAN <strong className="text-slate-900">{identityPan}</strong>.
              Fill share details below to add a new entry.{' '}
              <button
                type="button"
                onClick={handleChangePanSelection}
                className="font-semibold text-primary hover:underline"
              >
                Change PAN
              </button>
            </p>
          ) : null}
          {isNew && reusedPan && previousEntries.length > 0 ? (
            <ShareholdingPreviousEntries rows={previousEntries} />
          ) : null}
          <SectionCard title="Personal Details" actions={<FormBackLink onClick={goBack} />}>
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
                      disabled={panLocked}
                      className={panLocked ? `${inputClass} cursor-not-allowed bg-slate-50` : inputClass}
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
              <FormField label="Address 1">
                <input className={inputClass} {...register('address')} />
              </FormField>
              <FormField label="Address 2">
                <input className={inputClass} {...register('addressLine2')} />
              </FormField>
              <FormField label="Landmark / Area">
                <input className={inputClass} {...register('landmark')} />
              </FormField>
              <FormField label="Area">
                <input className={inputClass} {...register('area')} />
              </FormField>
              <FormField label="City">
                <input className={inputClass} {...register('city')} />
              </FormField>
              <FormField label="Pincode">
                <input
                  className={inputClass}
                  maxLength={6}
                  inputMode="numeric"
                  onKeyDown={onIntegerInputKeyDown}
                  {...register('pincode', {
                    setValueAs: (v) => String(v || '').replace(/\D/g, '').slice(0, 6),
                  })}
                />
              </FormField>
              <FormField label="State">
                <input className={inputClass} {...register('state')} />
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
              <FormField label="Form Submission">
                <input className={inputClass} {...register('formSubmission')} />
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
              <FormField label="DP">
                <select
                  {...register('dp')}
                  className={isPhysical ? disabledFieldClass : inputClass}
                  disabled={isPhysical}
                >
                  <option value="">Select…</option>
                  <option value="NSDL">NSDL</option>
                  <option value="CDSL">CDSL</option>
                </select>
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
              <FormField label="Certificate No.">
                <input
                  {...register('certificateNumber')}
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
                  <option value="">Select status</option>
                  {SHARE_STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </FormField>
              {isExitStatus ? (
                <FormField label="Exit Date" required error={errors.exitDate?.message}>
                  <input
                    type="date"
                    className={`${inputClass} [color-scheme:light]`}
                    {...register('exitDate', {
                      validate: (v) =>
                        isExitStatus && !String(v || '').trim()
                          ? 'Exit date is required when status is Exit.'
                          : true,
                    })}
                  />
                </FormField>
              ) : null}
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
                Note: Fill only the nominees you have. Empty nominee rows are allowed.
              </p>
            ) : null}
          </SectionCard>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={goBack}
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
      ) : null}
    </ErrorBoundary>
  );
};

