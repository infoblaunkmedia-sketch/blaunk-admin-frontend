import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FormBackLink } from '../../../shared/components/FormBackLink';
import { SectionCard } from '../../../shared/components/SectionCard';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { toDisplayDDMMYYYY } from '../../../shared/utils/dateFormat';
import type { Shareholder } from '../corporate.types';
import { deleteShareholdingHistory, fetchShareholderByPan } from '../corporate.service';

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

export const ShareholdingDetails: React.FC = () => {
  const { pan } = useParams();
  const navigate = useNavigate();
  const [identity, setIdentity] = React.useState<Shareholder | null>(null);
  const [history, setHistory] = React.useState<Shareholder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!pan) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchShareholderByPan(pan);
      setIdentity(res.identity || res.record);
      setHistory(res.history);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load record.');
    } finally {
      setLoading(false);
    }
  }, [pan]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handleDeletePeriod = async (historyId: string) => {
    if (!pan) return;
    try {
      await deleteShareholdingHistory(pan, historyId);
      toast.success('History entry removed');
      setDeletingId(null);
      load();
    } catch {
      toast.error('Could not delete history entry');
    }
  };

  const person = identity;
  const chronologicalHistory = sortHistoryChronological(history);

  const goBack = () => navigate('/corporate/shareholding');

  const cardHeaderActions = (
    <div className="flex items-center gap-3">
      {pan ? (
        <button
          type="button"
          onClick={() => navigate(`/corporate/shareholding/${encodeURIComponent(pan)}/edit`)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
        >
          Edit latest
        </button>
      ) : null}
      <FormBackLink onClick={goBack} />
    </div>
  );

  return (
    <ErrorBoundary>
      {loading ? (
        <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
          <p className="text-sm font-semibold text-slate-600">Loading…</p>
        </div>
      ) : error ? (
        <EmptyState message={error} icon={<span className="text-2xl">⚠</span>} />
      ) : !person && history.length === 0 ? (
        <EmptyState message="No shareholding record found." />
      ) : (
        <div className="flex flex-col gap-5">
          {person ? (
            <SectionCard title="Personal Details" actions={cardHeaderActions}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Name" value={person.name} />
                <Field label="Mobile No." value={person.mobile} />
                <Field label="Email" value={person.email} />
                <Field label="PAN Card No." value={person.pan} />
                <Field label="Aadhaar No." value={person.aadhaar} />
                <Field label="Gender" value={person.gender} />
                <Field label="Country" value={person.country} />
                <Field label="City" value={person.city} />
                <Field label="Landmark / Area" value={person.landmark} />
                <Field label="Address" value={person.address} />
              </div>
            </SectionCard>
          ) : null}

          <SectionCard
            title={`Shareholding history (${chronologicalHistory.length} entr${chronologicalHistory.length === 1 ? 'y' : 'ies'})`}
            actions={!person ? cardHeaderActions : undefined}
          >
            {chronologicalHistory.length === 0 ? (
              <p className="text-sm text-slate-600">No shareholding entries yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      <th className="py-2 pr-3">Entry</th>
                      <th className="py-2 pr-3">Saved on</th>
                      <th className="py-2 pr-3">Share Type</th>
                      <th className="py-2 pr-3">Face Value</th>
                      <th className="py-2 pr-3">Folio</th>
                      <th className="py-2 pr-3">Shares</th>
                      <th className="py-2 pr-3">Holding %</th>
                      <th className="py-2 pr-3">Allotment</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chronologicalHistory.map((row, index) => (
                      <tr key={row.historyId} className="border-b border-slate-100">
                        <td className="py-2 pr-3 font-semibold text-slate-800">Entry {index + 1}</td>
                        <td className="py-2 pr-3 text-slate-700">{formatHistorySavedAt(row)}</td>
                        <td className="py-2 pr-3 text-slate-700">{row.shareType || '—'}</td>
                        <td className="py-2 pr-3">{row.faceValue || '—'}</td>
                        <td className="py-2 pr-3">{row.folioNumber || '—'}</td>
                        <td className="py-2 pr-3">{row.numberOfShares || '—'}</td>
                        <td className="py-2 pr-3">{row.holdingPercent || '—'}</td>
                        <td className="py-2 pr-3">
                          {toDisplayDDMMYYYY(row.dateOfAllotment) || row.dateOfAllotment || '—'}
                        </td>
                        <td className="py-2 pr-3">{row.shareStatus || '—'}</td>
                        <td className="py-2 text-right">
                          <button
                            type="button"
                            className="mr-2 text-xs font-semibold text-primary hover:underline"
                            onClick={() =>
                              navigate(
                                `/corporate/shareholding/${encodeURIComponent(pan!)}/edit?historyId=${encodeURIComponent(row.historyId!)}`,
                              )
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-xs font-semibold text-red-600 hover:underline"
                            onClick={() => setDeletingId(row.historyId!)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {deletingId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-sm font-semibold text-slate-800">Remove this shareholding entry?</p>
            <p className="mt-2 text-xs text-slate-600">The shareholder (PAN) is kept if other entries exist.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={() => setDeletingId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                onClick={() => handleDeletePeriod(deletingId)}
              >
                Delete entry
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ErrorBoundary>
  );
};
