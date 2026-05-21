import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { ThirdPartyCredential } from './thirdPartyCredentials.types';
import { fetchThirdPartyCredentialById } from './thirdPartyCredentials.service';

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

function DocLink({ url, label }: { url?: string; label: string }) {
  if (!url) return '';
  return (
    <a
      className="font-semibold text-primary hover:underline"
      href={toAbsoluteUrl(url)}
      target="_blank"
      rel="noreferrer"
    >
      {label}
    </a>
  );
}

const RESERVED_ID_SLUGS = new Set(['new', 'add', 'create']);

export const ThirdPartyCredentialDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const idNorm = String(id || '').trim();
  const isReservedSlug = RESERVED_ID_SLUGS.has(idNorm.toLowerCase());

  const [record, setRecord] = React.useState<ThirdPartyCredential | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isReservedSlug) return;
    let mounted = true;
    async function run() {
      if (!idNorm) {
        setLoading(false);
        setError('Missing record id in URL.');
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await fetchThirdPartyCredentialById(idNorm);
        if (mounted) setRecord(data);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load 3P credential.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [idNorm, isReservedSlug]);

  if (isReservedSlug) {
    return <Navigate to="/people/3p-credentials" replace />;
  }

  const sharing =
    record?.sharingThreeP || record?.sharingBlaunk
      ? `${record.sharingThreeP || '0'} : ${record.sharingBlaunk || '0'}`
      : '';
  const address = [record?.address1, record?.address2].filter(Boolean).join(', ');

  return (
    <ErrorBoundary>
      <PageHeader
        title="3P credential details"
        subtitle={
          record?.threePEmplCode
            ? `3PC Code: ${record.threePEmplCode}`
            : idNorm
              ? `Record: ${idNorm}`
              : '3P credential record'
        }
        actions={[
          {
            label: 'Back to 3P Credentials',
            variant: 'secondary',
            onClick: () => navigate('/people/3p-credentials'),
          },
        ]}
      />

      {loading ? (
        <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-sm font-semibold text-slate-600">Loading…</p>
        </div>
      ) : error ? (
        <EmptyState message={error} icon={<span className="text-2xl">⚠</span>} />
      ) : !record ? (
        <EmptyState message="No 3P credential record found." />
      ) : (
        <div className="flex flex-col gap-5">
          <SectionCard
            title="Overview"
            actions={
              <div className="flex flex-wrap gap-2">
                {record.status ? <StatusBadge status={record.status} /> : null}
                {record.verifiedStatus ? (
                  <StatusBadge status={record.verifiedStatus} />
                ) : null}
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="3PC Code" value={record.threePEmplCode} />
              <Field label="Name" value={record.name} />
              <Field label="Department" value={record.department} />
              <Field label="3PC Company" value={record.threePCompanyName} />
              <Field label="3PC Entity" value={record.threePEntity} />
              <Field label="Date of Joining" value={record.doj} />
              <Field label="Exit Date" value={record.exitDate} />
              <Field label="Remark" value={record.remarks} />
            </div>
          </SectionCard>

          <SectionCard title="Personal & Contact">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Mobile" value={record.mobileNo} />
              <Field label="Email" value={record.email} />
              <Field label="Gender" value={record.gender} />
              <Field label="Aadhaar" value={record.aadharNo} />
              <Field label="PAN" value={record.panNo} />
              <Field label="TAN" value={record.tanNo} />
              <Field label="Passport" value={record.passportNo} />
              <Field label="Address" value={address || record.address1} />
              <Field label="City" value={record.city} />
              <Field label="PIN Code" value={record.zip} />
              <Field label="State" value={record.state} />
              <Field label="Country" value={record.country} />
            </div>
          </SectionCard>

          <SectionCard title="Business & Agreement">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Business Code" value={record.businessCode} />
              <Field label="Branch Code" value={record.branchCode} />
              <Field label="GST / TAX No." value={record.gstTaxNo} />
              <Field label="IRA" value={record.ira} />
              <Field label="Business Deposit" value={record.businessDeposit} />
              <Field label="Sharing Ratio (3P : Blaunk)" value={sharing} />
            </div>
          </SectionCard>

          <SectionCard title="Bank Details">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Bank Name" value={record.bankName} />
              <Field label="Account No." value={record.bankAccountNumber} />
              <Field label="IFSC" value={record.ifscCode} />
              <Field label="SWIFT" value={record.swiftNo} />
              <Field label="IBAN" value={record.ibanNo} />
            </div>
          </SectionCard>

          {record.references?.some((r) => r.name || r.mobile || r.designation || r.city) ? (
            <SectionCard title="References">
              <div className="flex flex-col gap-4">
                {record.references.map((ref, idx) => {
                  const hasData = ref.name || ref.mobile || ref.designation || ref.city;
                  if (!hasData) return null;
                  return (
                    <div
                      key={idx}
                      className="grid grid-cols-1 gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 sm:grid-cols-2 lg:grid-cols-4"
                    >
                      <Field label={`Reference ${idx + 1} — Name`} value={ref.name} />
                      <Field label="Mobile" value={ref.mobile} />
                      <Field label="Designation" value={ref.designation} />
                      <Field label="City" value={ref.city} />
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title="Documents">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field
                label="Address Proof"
                value={<DocLink url={record.employeePhotoUrl} label="View image" />}
              />
              <Field label="CHQ Image" value={<DocLink url={record.chqImageUrl} label="View image" />} />
              <Field label="PAN Card" value={<DocLink url={record.panImageUrl} label="View image" />} />
            </div>

            {record.employeePhotoUrl || record.chqImageUrl || record.panImageUrl ? (
              <div className="mt-4 flex flex-wrap gap-6">
                {record.employeePhotoUrl ? (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Address Proof
                    </p>
                    <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <img
                        src={toAbsoluteUrl(record.employeePhotoUrl)}
                        alt="Address proof"
                        className="h-40 max-w-xs object-contain"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ) : null}
                {record.chqImageUrl ? (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      CHQ Image
                    </p>
                    <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <img
                        src={toAbsoluteUrl(record.chqImageUrl)}
                        alt="CHQ"
                        className="h-40 max-w-xs object-contain"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ) : null}
                {record.panImageUrl ? (
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      PAN Card
                    </p>
                    <div className="inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <img
                        src={toAbsoluteUrl(record.panImageUrl)}
                        alt="PAN card"
                        className="h-40 max-w-xs object-contain"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </SectionCard>
        </div>
      )}
    </ErrorBoundary>
  );
};
