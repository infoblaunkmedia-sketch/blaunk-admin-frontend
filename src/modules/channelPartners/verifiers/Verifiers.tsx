import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { DataTableWrapper, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { useAuth } from '../../../auth/useAuth';
import {
  fetchVerifierRecords,
  submitVendorVerification,
  reviewVendorVerification,
  type VendorVerificationRecord,
  type FieldVerificationStatus,
  type ReviewVerificationPayload,
} from './verifiers.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const FIELD_STATUS_OPTIONS: FieldVerificationStatus[] = ['Pending', 'Verified', 'Rejected'];

function FieldStatusPills({ record }: { record: VendorVerificationRecord }) {
  const items: { label: string; status: FieldVerificationStatus }[] = [
    { label: 'Email', status: record.emailStatus },
    { label: 'Mobile', status: record.mobileStatus },
    { label: 'Photo', status: record.photoStatus },
    { label: 'Bank', status: record.bankStatus },
    { label: 'Location', status: record.shopLocationStatus },
  ];
  return (
    <div className="flex flex-wrap gap-1">
      {items.map(({ label, status }) => (
        <span
          key={label}
          className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700"
          title={`${label}: ${status}`}
        >
          {label.slice(0, 1)}:{status === 'Verified' ? '✓' : status === 'Rejected' ? '✗' : '…'}
        </span>
      ))}
    </div>
  );
}

export const Verifiers: React.FC = () => {
  const { user, hasSection } = useAuth();
  const [records, setRecords] = React.useState<VendorVerificationRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tableSearch, setTableSearch] = React.useState('');
  const [reviewRow, setReviewRow] = React.useState<VendorVerificationRecord | null>(null);
  const [reviewDraft, setReviewDraft] = React.useState<ReviewVerificationPayload>({});
  const [actionLoading, setActionLoading] = React.useState(false);

  const canMake =
    user?.role === 'admin' ||
    user?.employeeType === '3pc' ||
    hasSection('channelPartners', 'verifiers');
  const canCheck =
    user?.role === 'admin' || hasSection('adminPersonnel', 'media');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setRecords(await fetchVerifierRecords(tableSearch.trim() || undefined));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load verifiers');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [tableSearch]);

  React.useEffect(() => {
    const t = window.setTimeout(() => { void load(); }, 300);
    return () => window.clearTimeout(t);
  }, [load]);

  const openReview = (row: VendorVerificationRecord) => {
    setReviewRow(row);
    setReviewDraft({
      emailStatus: row.emailStatus,
      mobileStatus: row.mobileStatus,
      photoStatus: row.photoStatus,
      bankStatus: row.bankStatus,
      shopLocationStatus: row.shopLocationStatus,
    });
  };

  const handleSubmit = async (row: VendorVerificationRecord) => {
    setActionLoading(true);
    try {
      await submitVendorVerification(row.vendorId);
      toast.success('Verification submitted for review');
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveReview = async () => {
    if (!reviewRow) return;
    setActionLoading(true);
    try {
      await reviewVendorVerification(reviewRow.vendorId, reviewDraft);
      toast.success('Review saved');
      setReviewRow(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Review failed');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: TableColumn<VendorVerificationRecord>[] = [
    { name: 'Vendor Code', selector: (r) => r.vendorCode, sortable: true, width: '110px' },
    { name: 'Business', selector: (r) => r.businessName, sortable: true, grow: 2 },
    { name: 'Contact', selector: (r) => r.ownerName || '—' },
    { name: 'Mobile', selector: (r) => r.mobile, width: '120px' },
    { name: 'City', selector: (r) => r.city, width: '100px' },
    {
      name: 'Field Status',
      cell: (r) => <FieldStatusPills record={r} />,
      grow: 1.5,
      minWidth: '200px',
    },
    {
      name: 'Overall',
      cell: (r) => <StatusBadge status={r.overallStatus} />,
      width: '100px',
    },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex flex-wrap gap-1">
          {canMake ? (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleSubmit(r)}
              className="rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
            >
              Submit
            </button>
          ) : null}
          {canCheck || canMake ? (
            <button
              type="button"
              onClick={() => openReview(r)}
              className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              Review
            </button>
          ) : null}
        </div>
      ),
      width: '140px',
      ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader
        title="Verifiers"
        subtitle="Vendor verification — maker submits, cheker reviews each field."
        beforeActions={<ListTableSearchInput value={tableSearch} onChange={setTableSearch} />}
      />
      <DataTableWrapper
        columns={columns}
        data={records}
        loading={loading}
        searchable
        filterText={tableSearch}
        onFilterTextChange={setTableSearch}
        hideSearchInput
      />

      {reviewRow ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
            <h3 className="text-base font-bold text-slate-800">Review — {reviewRow.businessName}</h3>
            <p className="mt-1 text-xs text-slate-500">
              {reviewRow.vendorCode} · Submitted by {reviewRow.submittedBy || '—'}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  ['emailStatus', 'Email'],
                  ['mobileStatus', 'Mobile'],
                  ['photoStatus', 'Photo'],
                  ['bankStatus', 'Bank'],
                  ['shopLocationStatus', 'Shop Location'],
                ] as const
              ).map(([key, label]) => (
                <FormField key={key} label={label}>
                  <select
                    className={inputClass}
                    disabled={!canCheck || actionLoading}
                    value={reviewDraft[key] ?? reviewRow[key]}
                    onChange={(e) =>
                      setReviewDraft((p) => ({
                        ...p,
                        [key]: e.target.value as FieldVerificationStatus,
                      }))
                    }
                  >
                    {FIELD_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </FormField>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {canCheck ? (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleSaveReview}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {actionLoading ? 'Saving…' : 'Save review'}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setReviewRow(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Close
              </button>
            </div>
            {!canCheck ? (
              <p className="mt-3 text-xs text-slate-500">
                Only Admin or Admin & Personnel users can save field reviews.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </ErrorBoundary>
  );
};
