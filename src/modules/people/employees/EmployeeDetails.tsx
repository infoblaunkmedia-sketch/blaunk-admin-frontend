import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { FormBackLink } from '../../../shared/components/FormBackLink';
import { SectionCard } from '../../../shared/components/SectionCard';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { Employee } from '../people.types';
import { fetchEmployeeByPan } from '../people.service';
import { formatDateDDMMYYYY, toDisplayDDMMYYYY } from '../../../shared/utils/dateFormat';
import { ImagePreviewDialog } from '../../../shared/components/ImagePreview';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

function toAbsoluteUrl(urlOrPath: string) {
  const s = String(urlOrPath || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/')) return `${API_BASE}${s}`;
  return s;
}

const fieldLabelClass = 'text-[11px] font-bold uppercase tracking-wide text-slate-500';
const fieldValueClass = 'mt-1 text-sm font-semibold text-slate-800';

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  const empty = value == null || value === '';
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
      <div className={fieldLabelClass}>{label}</div>
      <div className={fieldValueClass}>{empty ? <span className="text-slate-400">—</span> : value}</div>
    </div>
  );
}

const RESERVED_PAN_SLUGS = new Set(['new', 'add', 'create']);

export const EmployeeDetails: React.FC = () => {
  const navigate = useNavigate();
  const { pan } = useParams();
  const panNorm = String(pan || '').trim();
  const isReservedSlug = RESERVED_PAN_SLUGS.has(panNorm.toLowerCase());

  const [emp, setEmp] = React.useState<Employee | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [photoPreviewOpen, setPhotoPreviewOpen] = React.useState(false);

  React.useEffect(() => {
    if (isReservedSlug) return;
    let mounted = true;
    async function run() {
      if (!panNorm) {
        setLoading(false);
        setError('Missing PAN in URL.');
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEmployeeByPan(panNorm);
        if (mounted) setEmp(data);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load employee.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [panNorm, isReservedSlug]);

  if (isReservedSlug) {
    return <Navigate to="/people/employees/new" replace />;
  }

  return (
    <ErrorBoundary>
      {loading ? (
        <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-sm font-semibold text-slate-600">Loading…</p>
        </div>
      ) : error ? (
        <EmptyState
          message={error}
          icon={<span className="text-2xl">⚠</span>}
        />
      ) : !emp ? (
        <EmptyState message="No employee record found." />
      ) : (
        <div className="flex flex-col gap-5">
          <SectionCard
            title="Overview"
            actions={
              <div className="flex items-center gap-3">
                <StatusBadge status={emp.status} />
                <FormBackLink
                  label="Back to Employees"
                  onClick={() => navigate('/people/employees')}
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Employee Code" value={emp.employeeCode} />
              <Field label="Name" value={emp.fullName} />
              <Field label="Department" value={emp.department} />
              <Field label="Designation" value={emp.designation} />
              <Field label="Date of Joining" value={toDisplayDDMMYYYY(String(emp.dateOfJoining || ''))} />
              <Field label="Mobile" value={emp.mobile} />
              <Field label="Email" value={emp.email} />
              <Field label="Aadhaar" value={emp.aadhaarNumber} />
            </div>
          </SectionCard>

          <SectionCard title="Employment">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Centre Name" value={emp.centreName} />
              <Field label="Confirmation Status" value={emp.confirmationStatus} />
              <Field label="DOC" value={toDisplayDDMMYYYY(String(emp.doc || ''))} />
              <Field label="Monthly Leaves" value={emp.monthlyLeaves} />
              <Field label="Job Grade" value={emp.jobGrade} />
              <Field label="UAN" value={emp.uan} />
              <Field label="PF" value={emp.pf} />
              <Field label="Exit Date" value={toDisplayDDMMYYYY(String(emp.exitDate || ''))} />
              <Field label="Remarks" value={emp.remarks} />
            </div>
          </SectionCard>

          <SectionCard title="Salary">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Monthly CTC" value={`₹${(emp.monthlyCtc || 0).toLocaleString()}`} />
              <Field label="Per Day CTC" value={`₹${(emp.perDayCtc || 0).toLocaleString()}`} />
              <Field label="Yearly CTC" value={emp.yearlyCtc} />
              <Field label="Basic Salary" value={emp.basicSalary} />
              <Field label="HRA" value={emp.hra} />
              <Field label="LTA" value={emp.lta} />
              <Field label="Medical Allowance" value={emp.medicalAllowance} />
              <Field label="CEA" value={emp.cea} />
              <Field label="Food Allowance" value={emp.foodAllowance} />
              <Field label="Supplementary" value={emp.supplementaryAllowance} />
              <Field label="MEA" value={emp.mea} />
              <Field label="Professional Tax" value={emp.professionalTax} />
              <Field label="Health Insurance" value={emp.healthInsurance} />
              <Field label="ESI Salary" value={emp.esiSalary} />
              <Field label="PF Contribution" value={emp.pfContribution} />
              <Field label="NPS (Employer)" value={emp.npsEmployer} />
              <Field label="NPS (Employee)" value={emp.npsEmployee} />
              <Field label="Round Off" value={emp.roundOff} />
              <Field label="Gratuity" value={emp.gratuity} />
            </div>
          </SectionCard>

          <SectionCard title="Bank & Documents">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Bank Name" value={emp.bankName} />
              <Field label="Account No." value={emp.accountNumber} />
              <Field label="IFSC" value={emp.ifsc} />
              <Field label="MICR code" value={emp.micrCode} />
              <Field label="Medical Insurance No." value={emp.medicalInsuranceNo} />
              <Field label="Employee Photo" value={emp.photoUrl ? 'Uploaded' : ''} />
              <Field
                label="Employee Document"
                value={
                  emp.employeeDocumentUrl ? (
                    <a
                      className="font-semibold text-primary hover:underline"
                      href={toAbsoluteUrl(emp.employeeDocumentUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View document
                    </a>
                  ) : (
                    ''
                  )
                }
              />
            </div>

            {emp.photoUrl ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Employee Photo</p>
                <button
                  type="button"
                  title="Click to preview"
                  onClick={() => setPhotoPreviewOpen(true)}
                  className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white transition hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <img
                    src={toAbsoluteUrl(emp.photoUrl)}
                    alt="Employee photo"
                    className="h-40 w-40 object-cover"
                    loading="lazy"
                  />
                </button>
              </div>
            ) : null}

            {photoPreviewOpen && emp.photoUrl ? (
              <ImagePreviewDialog
                open
                src={toAbsoluteUrl(emp.photoUrl)}
                alt={`${emp.name || 'Employee'} photo`}
                title="Employee photo"
                onClose={() => setPhotoPreviewOpen(false)}
              />
            ) : null}
          </SectionCard>
        </div>
      )}
    </ErrorBoundary>
  );
};

