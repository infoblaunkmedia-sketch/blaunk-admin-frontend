import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Stepper } from '../../../shared/components/Stepper';
import { SectionCard } from '../../../shared/components/SectionCard';
import { FormField } from '../../../shared/components/FormField';
import { ImageUploader } from '../../../shared/components/ImageUploader';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import {
  COUNTRIES, INDIAN_STATES, DEPARTMENTS, DESIGNATIONS,
  GENDERS, MARITAL_STATUSES, EMPLOYEE_STATUSES,
} from '../../../shared/constants/hrConstants';
import type { Employee } from '../people.types';
import { saveEmployee, uploadEmployeeDocument } from '../people.service';

const DRAFT_KEY = 'blaunk_emp_draft';
const STEPS = [
  { label: 'Personal' },
  { label: 'Employment' },
  { label: 'Salary' },
  { label: 'Bank' },
  { label: 'Documents' },
];

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20';
const selectClass = inputClass;

interface EmployeeFormProps {
  initial?: Partial<Employee>;
  employeeCode: string;
  onSaved: () => void;
  onCancel: () => void;
}

type FormValues = Omit<Employee, 'employeeCode' | 'monthlyCtc' | 'perDayCtc' | 'photoUrl'>;

const SALARY_FIELDS: { key: keyof FormValues; label: string }[] = [
  { key: 'basicSalary', label: 'Basic Salary' },
  { key: 'hra', label: 'HRA' },
  { key: 'lta', label: 'LTA' },
  { key: 'medicalAllowance', label: 'Medical Allowance' },
  { key: 'cea', label: 'CEA' },
  { key: 'foodAllowance', label: 'Food Allowance' },
  { key: 'supplementaryAllowance', label: 'Supplementary' },
  { key: 'mea', label: 'MEA' },
  { key: 'pfEmployee', label: 'PF (Employee)' },
  { key: 'esi', label: 'ESI' },
  { key: 'healthInsurance', label: 'Health Insurance' },
  { key: 'nps', label: 'NPS' },
  { key: 'professionalTax', label: 'Professional Tax' },
  { key: 'gratuity', label: 'Gratuity' },
  { key: 'roundOff', label: 'Round Off' },
];

const SALARY_KEYS = SALARY_FIELDS.map((f) => f.key) as (keyof FormValues)[];

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
function toAbsoluteUrl(urlOrPath: string) {
  const s = String(urlOrPath || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/')) return `${API_BASE}${s}`;
  return s;
}

function calcCtc(vals: Partial<FormValues>) {
  const monthly = SALARY_KEYS.reduce(
    (sum, k) => sum + (Number(vals[k]) || 0), 0,
  );
  return { monthly, perDay: monthly > 0 ? +(monthly / 26).toFixed(2) : 0 };
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initial = {},
  employeeCode,
  onSaved,
  onCancel,
}) => {
  const [step, setStep] = React.useState(0);
  const [photoUrl, setPhotoUrl] = React.useState(initial.photoUrl ?? initial.employeePhotoUrl ?? '');
  const [photoUploading, setPhotoUploading] = React.useState(false);
  const [docUploading, setDocUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: (() => {
      try {
        const draft = sessionStorage.getItem(`${DRAFT_KEY}_${employeeCode}`);
        if (draft) return { ...JSON.parse(draft), ...initial } as FormValues;
      } catch { /* empty */ }
      const base = (initial as FormValues) || ({} as FormValues);
      return {
        ...base,
        doc: base.doc ?? '',
        centreName: base.centreName ?? '',
        confirmationStatus: base.confirmationStatus ?? '',
        monthlyLeaves: base.monthlyLeaves ?? '',
        jobGrade: base.jobGrade ?? '',
        uan: base.uan ?? '',
        pf: base.pf ?? '',
        exitDate: base.exitDate ?? '',
        yearlyCtc: base.yearlyCtc ?? '',
        esiSalary: base.esiSalary ?? '',
        pfContribution: base.pfContribution ?? '',
        npsEmployer: base.npsEmployer ?? '',
        npsEmployee: base.npsEmployee ?? '',
        medicalInsuranceNo: base.medicalInsuranceNo ?? '',
        nps: base.nps ?? '',
        esi: base.esi ?? '',
        pTax: base.pTax ?? '',
        employeeDocumentUrl: base.employeeDocumentUrl ?? '',
        references: base.references ?? [],
      };
    })(),
  });

  // Persist draft on every change
  const values = watch();
  React.useEffect(() => {
    sessionStorage.setItem(`${DRAFT_KEY}_${employeeCode}`, JSON.stringify(values));
  }, [values, employeeCode]);

  const { monthly: monthlyCtc, perDay: perDayCtc } = calcCtc(values);

  const nextStep = async () => {
    const fieldsPerStep: (keyof FormValues)[][] = [
      ['fullName', 'mobile', 'email', 'gender', 'dob', 'panNumber'],
      ['department', 'designation', 'dateOfJoining', 'status'],
      [],
      [],
      [],
    ];
    const valid = await trigger(fieldsPerStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      const emp: Employee = {
        ...data,
        employeeCode,
        photoUrl,
        monthlyCtc,
        perDayCtc,
        pTax: data.pTax || String(Number(data.professionalTax) || 0),
        basicSalary: Number(data.basicSalary) || 0,
        hra: Number(data.hra) || 0,
        lta: Number(data.lta) || 0,
        medicalAllowance: Number(data.medicalAllowance) || 0,
        cea: Number(data.cea) || 0,
        foodAllowance: Number(data.foodAllowance) || 0,
        supplementaryAllowance: Number(data.supplementaryAllowance) || 0,
        mea: Number(data.mea) || 0,
        pfEmployee: Number(data.pfEmployee) || 0,
        esi: Number(data.esi) || 0,
        healthInsurance: Number(data.healthInsurance) || 0,
        nps: Number(data.nps) || 0,
        professionalTax: Number(data.professionalTax) || 0,
        gratuity: Number(data.gratuity) || 0,
        roundOff: Number(data.roundOff) || 0,
      };
      await saveEmployee(emp);
      sessionStorage.removeItem(`${DRAFT_KEY}_${employeeCode}`);
      toast.success(`Employee ${employeeCode} saved`);
      onSaved();
    } catch {
      toast.error('Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  const lastStep = STEPS.length - 1;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // Safety: never save before Documents step (prevents accidental submit on Bank step).
        if (step < lastStep) {
          nextStep();
          return;
        }
        void handleSubmit(onSubmit)(e);
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-primary">
          {initial.fullName ? `Edit: ${initial.fullName}` : `New Employee — ${employeeCode}`}
        </h2>
        <StatusBadge status={watch('status') || 'Active'} />
      </div>

      <Stepper steps={STEPS} currentStep={step} />

      {/* Step 0 — Personal */}
      {step === 0 && (
        <SectionCard title="Personal Information">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Full Name" required error={errors.fullName?.message}>
              <input className={inputClass} {...register('fullName', { required: 'Required' })} />
            </FormField>
            <FormField label="Gender" required error={errors.gender?.message}>
              <select className={selectClass} {...register('gender', { required: 'Required' })}>
                <option value="">Select</option>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </FormField>
            {/* <FormField label="Marital Status">
              <select className={selectClass} {...register('maritalStatus')}>
                <option value="">Select</option>
                {MARITAL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField> */}
            <FormField label="Email" required error={errors.email?.message}>
              <input type="email" className={inputClass} {...register('email', { required: 'Required' })} />
            </FormField>
            <FormField label="Mobile" required error={errors.mobile?.message}>
              <input className={inputClass} maxLength={10} {...register('mobile', { required: 'Required' })} />
            </FormField>
            <FormField label="PAN Number" required error={errors.panNumber?.message}>
              <input
                className={inputClass}
                maxLength={10}
                placeholder="ABCDE1234F"
                {...register('panNumber', {
                  required: 'Required',
                  setValueAs: (v) => String(v || '').trim().toUpperCase(),
                  validate: (v) => PAN_RE.test(String(v || '').trim().toUpperCase()) || 'Invalid PAN format',
                })}
              />
            </FormField>
            <FormField label="Aadhaar Number">
              <input
                className={inputClass}
                maxLength={12}
                inputMode="numeric"
                placeholder="12 digit Aadhaar"
                {...register('aadhaarNumber', {
                  setValueAs: (v) => String(v || '').replace(/\D/g, '').slice(0, 12),
                  validate: (v) =>
                    !v || String(v).length === 12 || 'Aadhaar must be 12 digits',
                })}
              />
            </FormField>
            <FormField label="Address" className="sm:col-span-2">
              <input className={inputClass} {...register('address')} />
            </FormField>
            <FormField label="City">
              <input className={inputClass} {...register('city')} />
            </FormField>
            <FormField label="State">
              <select className={selectClass} {...register('state')}>
                <option value="">Select State</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Country">
              <select className={selectClass} {...register('country')}>
                <option value="">Select Country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="PIN Code">
              <input className={inputClass} maxLength={6} {...register('pincode')} />
            </FormField>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold text-slate-600">
              Employee Photo <span className="text-slate-400">(max: 200KB)</span>
            </p>
            <ImageUploader
              currentPreview={toAbsoluteUrl(photoUrl)}
              onFile={async (file) => {
                setPhotoUploading(true);
                try {
                  const url = await uploadEmployeeDocument(file);
                  setPhotoUrl(url);
                  toast.success('Photo uploaded');
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Photo upload failed');
                } finally {
                  setPhotoUploading(false);
                }
              }}
              maxSizeMB={0.2}
              label={photoUploading ? 'Uploading…' : 'Click to upload'}
            />
          </div>
        </SectionCard>
      )}

      {/* Step 1 — Employment */}
      {step === 1 && (
        <SectionCard title="Employment Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Employee Code">
              <input className={`${inputClass} bg-slate-100 text-slate-500`} value={employeeCode} readOnly />
            </FormField>
            <FormField label="Department" required error={errors.department?.message}>
              <select className={selectClass} {...register('department', { required: 'Required' })}>
                <option value="">Select</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Designation" required error={errors.designation?.message}>
              <select className={selectClass} {...register('designation', { required: 'Required' })}>
                <option value="">Select</option>
                {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Date of Joining" required error={errors.dateOfJoining?.message}>
              <input type="date" className={inputClass} {...register('dateOfJoining', { required: 'Required' })} />
            </FormField>
            <FormField label="Employee Status" required error={errors.status?.message}>
              <select className={selectClass} {...register('status', { required: 'Required' })}>
                <option value="">Select</option>
                {EMPLOYEE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Remarks" className="sm:col-span-2">
              <input className={inputClass} {...register('remarks')} />
            </FormField>

            <FormField label="Centre Name">
              <input className={inputClass} {...register('centreName')} />
            </FormField>
            <FormField label="Confirmation Status">
              <input className={inputClass} {...register('confirmationStatus')} />
            </FormField>
            <FormField label="Date of Confirmation (DOC)">
              <input type="date" className={inputClass} {...register('doc')} />
            </FormField>
            <FormField label="Monthly Leaves">
              <input className={inputClass} {...register('monthlyLeaves')} />
            </FormField>
            <FormField label="Job Grade">
              <input className={inputClass} {...register('jobGrade')} />
            </FormField>
            <FormField label="UAN">
              <input className={inputClass} {...register('uan')} />
            </FormField>
            <FormField label="PF (ID/No.)">
              <input className={inputClass} {...register('pf')} />
            </FormField>
            <FormField label="Exit Date">
              <input type="date" className={inputClass} {...register('exitDate')} />
            </FormField>
          </div>
        </SectionCard>
      )}

      {/* Step 2 — Salary */}
      {step === 2 && (
        <SectionCard title="Salary Components">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SALARY_FIELDS.map(({ key, label }) => (
              <FormField key={key} label={label}>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                  {...register(key)}
                />
              </FormField>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <FormField label="Yearly CTC">
              <input className={inputClass} {...register('yearlyCtc')} />
            </FormField>
            <FormField label="ESI Salary">
              <input className={inputClass} {...register('esiSalary')} />
            </FormField>
            <FormField label="PF Contribution">
              <input className={inputClass} {...register('pfContribution')} />
            </FormField>
            <FormField label="NPS (Employer)">
              <input className={inputClass} {...register('npsEmployer')} />
            </FormField>
            <FormField label="NPS (Employee)">
              <input className={inputClass} {...register('npsEmployee')} />
            </FormField>
            <FormField label="NPS">
              <input className={inputClass} {...register('nps')} />
            </FormField>
            <FormField label="ESI">
              <input className={inputClass} {...register('esi')} />
            </FormField>
          </div>

          <div className="mt-5 flex flex-wrap gap-6 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-3">
            <div>
              <p className="text-xs font-semibold text-emerald-700">Monthly CTC (auto)</p>
              <p className="text-xl font-bold text-emerald-800">₹{monthlyCtc.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700">Per Day CTC (÷ 26)</p>
              <p className="text-xl font-bold text-emerald-800">₹{perDayCtc.toLocaleString()}</p>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Step 3 — Bank */}
      {step === 3 && (
        <SectionCard title="Bank Details">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* <FormField label="Account Holder Name">
              <input className={inputClass} {...register('accountHolderName')} />
            </FormField> */}
            <FormField label="Account Number">
              <input className={inputClass} {...register('accountNumber')} />
            </FormField>
            <FormField label="IFSC Code">
              <input className={inputClass} {...register('ifsc')} />
            </FormField>
            <FormField label="Bank Name">
              <input className={inputClass} {...register('bankName')} />
            </FormField>
            {/* <FormField label="Branch">
              <input className={inputClass} {...register('branch')} />
            </FormField> */}
            <FormField label="Medical Insurance No.">
              <input className={inputClass} {...register('medicalInsuranceNo')} />
            </FormField>
          </div>
        </SectionCard>
      )}

      {/* Step 4 — Documents */}
      {step === 4 && (
        <div className="flex flex-col gap-5">
          <SectionCard title="Documents">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* <FormField label="Passport Number">
                <input className={inputClass} {...register('passportNumber')} />
              </FormField> */}
              <FormField label="Employee Document URL (uploaded)">
                <input className={inputClass} readOnly {...register('employeeDocumentUrl')} />
              </FormField>
              <FormField label="Employee Document">
                <input
                  type="file"
                  className={inputClass}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 200 * 1024) {
                      toast.error('File too large. Max allowed size is 200KB.');
                      e.target.value = '';
                      return;
                    }
                    setDocUploading(true);
                    try {
                      const url = await uploadEmployeeDocument(file);
                      toast.success('Document uploaded');
                      setValue('employeeDocumentUrl', url, { shouldDirty: true });
                      e.target.value = '';
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : 'Upload failed');
                    } finally {
                      setDocUploading(false);
                    }
                  }}
                  disabled={docUploading}
                />
                <p className="mt-1 text-xs font-semibold text-slate-400">Max file size: 200KB</p>
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="References">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="Reference 1 Name">
                <input className={inputClass} {...register('references.0.name')} />
              </FormField>
              <FormField label="Reference 1 Mobile">
                <input className={inputClass} {...register('references.0.mobile')} />
              </FormField>
              <FormField label="Reference 1 Designation">
                <input className={inputClass} {...register('references.0.designation')} />
              </FormField>
              <FormField label="Reference 1 City">
                <input className={inputClass} {...register('references.0.city')} />
              </FormField>

              <FormField label="Reference 2 Name">
                <input className={inputClass} {...register('references.1.name')} />
              </FormField>
              <FormField label="Reference 2 Mobile">
                <input className={inputClass} {...register('references.1.mobile')} />
              </FormField>
              <FormField label="Reference 2 Designation">
                <input className={inputClass} {...register('references.1.designation')} />
              </FormField>
              <FormField label="Reference 2 City">
                <input className={inputClass} {...register('references.1.city')} />
              </FormField>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-4">
        <div className="flex gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Back
            </button>
          )}
          <button type="button" onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50">
            Cancel
          </button>
        </div>

        <div className="flex gap-3">
          {step < lastStep ? (
            <button type="button" onClick={nextStep}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
              Next →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleSubmit(onSubmit)()}
              disabled={saving}
              className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {saving ? 'Saving…' : 'Save Employee'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
};
