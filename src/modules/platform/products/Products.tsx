import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { DataTableWrapper, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { fetchProducts, patchProductStatus, type Product, type ProductStatus } from '../products.service';

export const Products: React.FC = () => {
  const [rows, setRows] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [statusFilter, setStatusFilter] = React.useState<ProductStatus | ''>('');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState<Product | null>(null);
  const [rejectReason, setRejectReason] = React.useState('');
  const [acting, setActing] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchProducts({ status: statusFilter || undefined, q: search || undefined, limit: 200 });
      setRows(res.records);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  React.useEffect(() => {
    const t = window.setTimeout(load, 300);
    return () => window.clearTimeout(t);
  }, [load]);

  const handleApprove = async () => {
    if (!selected) return;
    setActing(true);
    try {
      await patchProductStatus(selected.id, 'active');
      toast.success('Product approved');
      setSelected(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!selected || !rejectReason.trim()) {
      toast.error('Rejection reason required');
      return;
    }
    setActing(true);
    try {
      await patchProductStatus(selected.id, 'rejected', rejectReason.trim());
      toast.success('Product rejected');
      setSelected(null);
      setRejectReason('');
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setActing(false);
    }
  };

  const columns: TableColumn<Product>[] = [
    { name: 'Title', selector: (r) => r.title, grow: 2 },
    { name: 'Seller', selector: (r) => r.sellerName },
    { name: 'Country', selector: (r) => r.country, width: '100px' },
    { name: 'Price', selector: (r) => `${r.priceMin}–${r.priceMax}`, width: '120px' },
    { name: 'Status', cell: (r) => <StatusBadge status={r.status.charAt(0).toUpperCase() + r.status.slice(1)} />, width: '100px' },
    {
      name: 'Actions',
      cell: (r) => (
        <button type="button" onClick={() => setSelected(r)} className="text-xs font-semibold text-primary hover:underline">
          Review
        </button>
      ),
      width: '90px',
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="Products" subtitle="Seller listings — approve before they appear on the storefront."
        beforeActions={
          <div className="flex gap-2">
            <select className="h-9 rounded-lg border border-slate-300 px-3 text-sm" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProductStatus | '')}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
            </select>
            <ListTableSearchInput value={search} onChange={setSearch} />
          </div>
        } />
      <DataTableWrapper columns={columns} data={rows} loading={loading} hideSearchInput />

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-bold text-primary">{selected.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{selected.description || 'No description'}</p>
            <p className="mt-2 text-xs text-slate-500">Seller: {selected.sellerName} · MOQ {selected.moq}</p>
            {selected.status === 'pending' && (
              <>
                <textarea className="mt-4 w-full rounded-lg border border-slate-300 p-2 text-sm" rows={2}
                  placeholder="Rejection reason (if rejecting)" value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)} />
                <div className="mt-4 flex gap-2">
                  <button type="button" disabled={acting} onClick={handleApprove}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                    Approve
                  </button>
                  <button type="button" disabled={acting} onClick={handleReject}
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                    Reject
                  </button>
                  <button type="button" onClick={() => setSelected(null)} className="ml-auto text-sm text-slate-600">Close</button>
                </div>
              </>
            )}
            {selected.status !== 'pending' && (
              <button type="button" className="mt-4 text-sm text-slate-600" onClick={() => setSelected(null)}>Close</button>
            )}
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};
