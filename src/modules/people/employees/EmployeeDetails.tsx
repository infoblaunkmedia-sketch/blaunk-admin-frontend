import React from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { Employee } from '../people.types';
import { fetchEmployeeByPan } from '../people.service';

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

export const EmployeeDetails: React.FC = () => {
  const { pan } = useParams();
  const [emp, setEmp] = React.useState<Employee | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    async function run() {
      if (!pan) {
        setLoading(false);
        setError('Missing PAN in URL.');
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEmployeeByPan(pan);
        if (mounted) setEmp(data);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load employee.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [pan]);

  return (
    <ErrorBoundary>
      <PageHeader
        title="Employee details"
        subtitle={pan ? `PAN: ${pan}` : 'Employee record'}
        actions={[
          {
            label: 'Back to Employees',
            variant: 'secondary',
            onClick: () => { window.history.back(); },
          },
        ]}
      />

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
            actions={<StatusBadge status={emp.status} />}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Employee Code" value={emp.employeeCode} />
              <Field label="Name" value={emp.fullName} />
              <Field label="Department" value={emp.department} />
              <Field label="Designation" value={emp.designation} />
              <Field label="Date of Joining" value={emp.dateOfJoining} />
              <Field label="Mobile" value={emp.mobile} />
              <Field label="Email" value={emp.email} />
              <Field label="Aadhaar" value={emp.aadhaarNumber} />
            </div>
          </SectionCard>

          <SectionCard title="Employment">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Centre Name" value={emp.centreName} />
              <Field label="Confirmation Status" value={emp.confirmationStatus} />
              <Field label="DOC" value={emp.doc} />
              <Field label="Monthly Leaves" value={emp.monthlyLeaves} />
              <Field label="Job Grade" value={emp.jobGrade} />
              <Field label="UAN" value={emp.uan} />
              <Field label="PF" value={emp.pf} />
              <Field label="Exit Date" value={emp.exitDate} />
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
              <Field label="Medical Insurance No." value={emp.medicalInsuranceNo} />
              <Field
                label="Employee Photo"
                value={
                  emp.photoUrl ? (
                    <a
                      className="font-semibold text-primary hover:underline"
                      href={toAbsoluteUrl(emp.photoUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View image
                    </a>
                  ) : (
                    ''
                  )
                }
              />
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
                <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <img
                    src={toAbsoluteUrl(emp.photoUrl)}
                    alt="Employee photo"
                    className="h-40 w-40 object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            ) : null}
          </SectionCard>
        </div>
      )}
    </ErrorBoundary>
  );
};

