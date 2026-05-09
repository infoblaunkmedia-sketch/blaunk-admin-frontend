import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { DataTableWrapper, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { CustomerReview, ReviewStatus } from '../customers.types';
import { fetchReviews, updateReviewStatus } from '../customers.service';

const STARS = ['★', '★★', '★★★', '★★★★', '★★★★★'];

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = React.useState<CustomerReview[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState('');
  const [tableSearch, setTableSearch] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setReviews(await fetchReviews());
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleStatus = async (id: string, status: ReviewStatus) => {
    await updateReviewStatus(id, status);
    toast.success(`Review marked as ${status}`);
    load();
  };

  const displayed = statusFilter ? reviews.filter((r) => r.status === statusFilter) : reviews;

  const columns: TableColumn<CustomerReview>[] = [
    { name: 'Reviewer', selector: (r) => r.reviewerName, sortable: true, grow: 1 },
    { name: 'Product / Service', selector: (r) => r.product, grow: 1 },
    {
      name: 'Rating',
      cell: (r) => (
        <span className="text-amber-400" title={`${r.rating} stars`}>
          {STARS[r.rating - 1] ?? '—'}
        </span>
      ),
      width: '110px',
      sortable: true,
      selector: (r) => r.rating,
    },
    { name: 'Review', selector: (r) => r.reviewText, grow: 3, wrap: true },
    { name: 'Date', selector: (r) => r.date, width: '105px', sortable: true },
    { name: 'Status', cell: (r) => <StatusBadge status={r.status} />, width: '100px' },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.status !== 'Published' && (
            <button type="button" onClick={() => handleStatus(r.id, 'Published')}
              className="rounded px-2 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50">
              Publish
            </button>
          )}
          {r.status !== 'Hidden' && (
            <button type="button" onClick={() => handleStatus(r.id, 'Hidden')}
              className="rounded px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100">
              Hide
            </button>
          )}
          {r.status !== 'Flagged' && (
            <button type="button" onClick={() => handleStatus(r.id, 'Flagged')}
              className="rounded px-2 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50">
              Flag
            </button>
          )}
        </div>
      ),
      width: '170px', ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="Customer Reviews" subtitle="Moderate reviews submitted by customers."
        beforeActions={<ListTableSearchInput value={tableSearch} onChange={setTableSearch} />} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-600">Filter:</span>
        {(['', 'Published', 'Hidden', 'Flagged'] as (ReviewStatus | '')[]).map((s) => (
          <button key={s} type="button" onClick={() => setStatusFilter(s)}
            className={['rounded-lg border px-3 py-1 text-xs font-semibold transition',
              statusFilter === s
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'].join(' ')}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <DataTableWrapper columns={columns} data={displayed} loading={loading} searchable
        filterText={tableSearch} onFilterTextChange={setTableSearch} hideSearchInput />
    </ErrorBoundary>
  );
};
