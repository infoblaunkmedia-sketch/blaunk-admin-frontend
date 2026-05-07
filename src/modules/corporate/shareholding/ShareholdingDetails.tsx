import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { Shareholder } from '../corporate.types';
import { fetchShareholderByPan } from '../corporate.service';

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

export const ShareholdingDetails: React.FC = () => {
  const { pan } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = React.useState<Shareholder | null>(null);
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
        const res = await fetchShareholderByPan(pan);
        if (mounted) setRecord(res.record);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load record.');
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
        title="Shareholder details"
        subtitle={pan ? `PAN: ${pan}` : 'Shareholding record'}
        actions={[
          { label: 'Back to Shareholders', variant: 'secondary', onClick: () => navigate('/corporate/shareholding') },
        ]}
      />

      {loading ? (
        <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-sm font-semibold text-slate-600">Loading…</p>
        </div>
      ) : error ? (
        <EmptyState message={error} icon={<span className="text-2xl">⚠</span>} />
      ) : !record ? (
        <EmptyState message="No shareholding record found." />
      ) : (
        <div className="flex flex-col gap-5">
          <SectionCard title="Personal Details">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Name" value={record.name} />
              <Field label="Mobile No." value={record.mobile} />
              <Field label="Email" value={record.email} />
              <Field label="PAN Card No." value={record.pan} />
              <Field label="Aadhaar No." value={record.aadhaar} />
              <Field label="Gender" value={record.gender} />
              <Field label="Country" value={record.country} />
              <Field label="City" value={record.city} />
              <Field label="Landmark / Area" value={record.landmark} />
              <Field label="Address" value={record.address} />
            </div>
          </SectionCard>

          <SectionCard title="Share Details">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Holding (%)" value={record.holdingPercent} />
              <Field label="Share Type" value={record.shareType as string} />
              <Field label="Face Value" value={record.faceValue} />
              <Field label="No. of Shares" value={record.numberOfShares} />
              <Field label="Mode" value={record.mode as string} />
              <Field label="ISIN Code" value={record.isinCode} />
              <Field label="DP Number" value={record.dpNumber} />
              <Field label="Folio Number" value={record.folioNumber} />
              <Field label="Distinctive From" value={record.distinctiveFrom} />
              <Field label="Distinctive To" value={record.distinctiveTo} />
              <Field label="Year of Issuance" value={record.yearOfIssuance} />
              <Field label="Stakeholder" value={record.stakeholder as string} />
              <Field label="Date of Allotment" value={record.dateOfAllotment} />
              <Field label="Remarks" value={record.remarks as string} />
              <Field label="Exit Date" value={record.exitDate} />
              <Field label="Year" value={record.year} />
              <Field label="Pledge" value={record.pledge} />
            </div>
          </SectionCard>

          <SectionCard title="Bank Details">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Bank Name" value={record.bankName} />
              <Field label="IFSC Code" value={record.ifscCode} />
              <Field label="Bank Account No." value={record.bankAccountNumber} />
            </div>
          </SectionCard>

          <SectionCard title="Nominees">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {[0, 1, 2].map((idx) => {
                const n = record.nominees?.[idx];
                return (
                  <div key={idx} className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
                    <p className="text-sm font-bold text-primary">Nominee {idx + 1}</p>
                    <div className="mt-3 grid grid-cols-1 gap-3">
                      <Field label="Name" value={n?.name || ''} />
                      <Field label="Mobile No." value={n?.mobile || ''} />
                      <Field label="Relation" value={n?.relation || ''} />
                      <Field label="Percentage" value={n?.percentage || ''} />
                      <Field label="PAN" value={n?.pan || ''} />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      )}
    </ErrorBoundary>
  );
};

