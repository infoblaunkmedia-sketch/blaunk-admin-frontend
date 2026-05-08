import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { FormField } from '../../../shared/components/FormField';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { generateExcelReport } from '../../../shared/utils/reportGenerator';
import type { B2BPayment, BankTransferStatus } from '../finance.types';
import { fetchB2BPayments, saveB2BPayment, deleteB2BPayment } from '../finance.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const emptyForm = (): B2BPayment => ({
  id: '',
  orderId: '',
  payinAmount: 0,
  charges: 0,
  tds: 0,
  tcs: 0,
  penalties: 0,
  portalFee: 0,
  netPayout: 0,
  bankTransferStatus: 'Pending',
  transactionNumber: '',
  date: new Date().toISOString().slice(0, 10),
});

function calcNet(f: B2BPayment) {
  return f.payinAmount - f.charges - f.tds - f.tcs - f.penalties - f.portalFee;
}

export const B2BPayments: React.FC = () => {
  const [records, setRecords] = React.useState<B2BPayment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState<B2BPayment>(emptyForm());
  const [editId, setEditId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setRecords(await fetchB2BPayments());
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const setNum = (k: keyof B2BPayment, v: string) => {
    setForm((p) => {
      const updated = { ...p, [k]: parseFloat(v) || 0 };
      updated.netPayout = calcNet(updated);
      return updated;
    });
  };

  const handleEdit = (r: B2BPayment) => {
    setForm({ ...r });
    setEditId(r.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.orderId.trim()) { toast.error('Order ID required'); return; }
    setSaving(true);
    try {
      const record = { ...form, id: editId ?? crypto.randomUUID(), netPayout: calcNet(form) };
      await saveB2BPayment(record);
      toast.success(editId ? 'Payment updated' : 'Payment added');
      setShowForm(false);
      setForm(emptyForm());
      setEditId(null);
      load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    await deleteB2BPayment(confirmDel);
    setConfirmDel(null);
    load();
    toast.success('Record deleted');
  };

  const handleExport = async () => {
    await generateExcelReport(
      {
        title: 'B2B Payments',
        columns: [
          { header: 'Order ID', key: 'orderId', width: 18 },
          { header: 'Payin Amount', key: 'payinAmount', width: 16 },
          { header: 'Charges', key: 'charges', width: 12 },
          { header: 'TDS', key: 'tds', width: 10 },
          { header: 'TCS', key: 'tcs', width: 10 },
          { header: 'Penalties', key: 'penalties', width: 12 },
          { header: 'Portal Fee', key: 'portalFee', width: 12 },
          { header: 'Net Payout', key: 'netPayout', width: 14 },
          { header: 'Transfer Status', key: 'bankTransferStatus', width: 16 },
          { header: 'Txn Number', key: 'transactionNumber', width: 18 },
          { header: 'Date', key: 'date', width: 12 },
        ],
      },
      filteredRecords as unknown as Record<string, unknown>[],
    );
  };

  const filteredRecords = records.filter((r) => {
    if (statusFilter && r.bankTransferStatus !== statusFilter) return false;
    if (dateFrom && r.date < dateFrom) return false;
    if (dateTo && r.date > dateTo) return false;
    return true;
  });

  const columns: TableColumn<B2BPayment>[] = [
    { name: 'Order ID', selector: (r) => r.orderId, sortable: true, width: '130px' },
    { name: 'Payin (₹)', selector: (r) => r.payinAmount, format: (r) => `₹${r.payinAmount.toLocaleString()}`, sortable: true },
    { name: 'Charges', selector: (r) => r.charges, format: (r) => `₹${r.charges.toLocaleString()}` },
    { name: 'TDS', selector: (r) => r.tds, format: (r) => `₹${r.tds.toLocaleString()}` },
    { name: 'Net Payout', selector: (r) => r.netPayout, format: (r) => `₹${r.netPayout.toLocaleString()}`, sortable: true },
    { name: 'Status', cell: (r) => <StatusBadge status={r.bankTransferStatus} />, width: '120px' },
    { name: 'Txn No.', selector: (r) => r.transactionNumber },
    { name: 'Date', selector: (r) => r.date, sortable: true, width: '110px' },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => handleEdit(r)}
            className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10">Edit</button>
          <button type="button" onClick={() => setConfirmDel(r.id)}
            className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
        </div>
      ),
      width: '120px', ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader
        title="B2B Payments"
        subtitle="Track and manage B2B payment records."
        actions={[
          { label: '+ Add Payment', onClick: () => { setShowForm(true); setEditId(null); setForm(emptyForm()); } },
          { label: 'Export Excel', onClick: handleExport, variant: 'secondary' },
        ]}
      />

      {/* Filters */}
      <SectionCard title="Filters" className="mb-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Status</label>
            <select className="h-9 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary"
              value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              {(['Pending', 'Completed', 'Failed'] as BankTransferStatus[]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">From Date</label>
            <input type="date" className="h-9 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary [color-scheme:light]"
              value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">To Date</label>
            <input type="date" className="h-9 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-primary [color-scheme:light]"
              value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <button type="button" onClick={() => { setStatusFilter(''); setDateFrom(''); setDateTo(''); }}
            className="h-9 rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Reset
          </button>
        </div>
      </SectionCard>

      {showForm && (
        <SectionCard title={editId ? 'Edit Payment' : 'New Payment'} className="mb-5">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            <FormField label="Order ID" required>
              <input className={inputClass} value={form.orderId}
                onChange={(e) => setForm((p) => ({ ...p, orderId: e.target.value }))} />
            </FormField>
            {([
              ['payinAmount', 'Payin Amount'],
              ['charges', 'Charges'],
              ['tds', 'TDS'],
              ['tcs', 'TCS'],
              ['penalties', 'Penalties'],
              ['portalFee', 'Portal Fee'],
            ] as [keyof B2BPayment, string][]).map(([key, label]) => (
              <FormField key={key} label={label}>
                <input type="number" min={0} step="0.01" className={inputClass}
                  value={(form[key] as number) || ''}
                  onChange={(e) => setNum(key, e.target.value)} />
              </FormField>
            ))}
            <FormField label="Net Payout">
              <input className={`${inputClass} bg-emerald-50 font-bold text-emerald-700`}
                value={`₹${calcNet(form).toLocaleString()}`} readOnly />
            </FormField>
            <FormField label="Transfer Status">
              <select className={inputClass} value={form.bankTransferStatus}
                onChange={(e) => setForm((p) => ({ ...p, bankTransferStatus: e.target.value as BankTransferStatus }))}>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
            </FormField>
            <FormField label="Transaction No.">
              <input className={inputClass} value={form.transactionNumber}
                onChange={(e) => setForm((p) => ({ ...p, transactionNumber: e.target.value }))} />
            </FormField>
            <FormField label="Date">
              <input type="date" className={`${inputClass} [color-scheme:light]`} value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
            </FormField>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" disabled={saving} onClick={handleSave}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {saving ? 'Saving…' : editId ? 'Update' : 'Add'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm()); setEditId(null); }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </SectionCard>
      )}

      <DataTableWrapper columns={columns} data={filteredRecords} loading={loading} searchable
        exportable onExport={handleExport} />

      {confirmDel && (
        <ConfirmDialog title="Delete Payment" message="Delete this payment record permanently?"
          confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />
      )}
    </ErrorBoundary>
  );
};
