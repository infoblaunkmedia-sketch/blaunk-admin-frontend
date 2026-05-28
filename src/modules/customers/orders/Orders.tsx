import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { DataTableWrapper, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { fetchOrders, updateOrderStatus, type Order } from '../orders.service';

const ORDER_STATUSES = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const inputClass = 'h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary';

export const Orders: React.FC = () => {
  const [rows, setRows] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('');
  const [selected, setSelected] = React.useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = React.useState('');
  const [trackingNo, setTrackingNo] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOrders({ orderStatus: statusFilter || undefined, q: search || undefined, limit: 200 });
      setRows(res.records);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  React.useEffect(() => {
    const t = window.setTimeout(load, 300);
    return () => window.clearTimeout(t);
  }, [load]);

  const open = (o: Order) => {
    setSelected(o);
    setOrderStatus(o.orderStatus);
    setTrackingNo(o.trackingNo);
  };

  const save = async () => {
    if (!selected) return;
    try {
      await updateOrderStatus(selected.id, { orderStatus, trackingNo });
      toast.success('Order updated');
      setSelected(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const columns: TableColumn<Order>[] = [
    { name: 'Order #', selector: (r) => r.orderNumber, width: '110px' },
    { name: 'Buyer', selector: (r) => r.buyerName },
    { name: 'Seller', selector: (r) => r.sellerName },
    { name: 'Product', selector: (r) => r.productTitle, grow: 2 },
    { name: 'Amount', selector: (r) => `₹${r.amount.toLocaleString()}`, width: '100px' },
    { name: 'Status', cell: (r) => <StatusBadge status={r.orderStatus} />, width: '110px' },
    {
      name: '',
      cell: (r) => (
        <button type="button" onClick={() => open(r)} className="text-xs font-semibold text-primary">Update</button>
      ),
      width: '80px',
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="Orders" subtitle="Platform orders from MongoDB."
        beforeActions={
          <div className="flex gap-2">
            <select className="h-9 rounded-lg border border-slate-300 px-3 text-sm" value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <ListTableSearchInput value={search} onChange={setSearch} />
          </div>
        } />
      <DataTableWrapper columns={columns} data={rows} loading={loading} hideSearchInput />
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-bold">{selected.orderNumber}</h3>
            <FormField label="Order status" className="mt-3">
              <select className={inputClass} value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <FormField label="Tracking #" className="mt-3">
              <input className={inputClass} value={trackingNo} onChange={(e) => setTrackingNo(e.target.value)} />
            </FormField>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={save} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Save</button>
              <button type="button" onClick={() => setSelected(null)} className="text-sm text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};
