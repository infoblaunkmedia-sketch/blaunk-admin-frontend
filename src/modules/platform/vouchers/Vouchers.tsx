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
import { SUBSCRIPTION_PLAN_NAMES } from '../platform.types';
import type { Voucher, VoucherStatus } from '../platform.types';
import { fetchVouchers, saveVoucher, deleteVoucher, generateVoucherCode } from '../platform.service';
import { useAuthStore } from '../../../auth/authStore';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const emptyForm = (createdBy: string): Omit<Voucher, 'id' | 'createdAt'> => ({
  code: generateVoucherCode(),
  planTier: 'Bronze',
  discount: 0,
  usageType: 'one-time-individual',
  status: 'Active',
  expiryDate: '',
  createdBy,
});

export const Vouchers: React.FC = () => {
  const [vouchers, setVouchers] = React.useState<Voucher[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState<Omit<Voucher, 'id' | 'createdAt'> | null>(null);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState('');
  const currentUser = useAuthStore((s) => s.user);

  const load = React.useCallback(async () => {
    setLoading(true);
    setVouchers(await fetchVouchers());
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const openNew = () => {
    setForm(emptyForm(currentUser?.code ?? 'system'));
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = (v: Voucher) => {
    setForm({ code: v.code, planTier: v.planTier, discount: v.discount, usageType: v.usageType, status: v.status, expiryDate: v.expiryDate, createdBy: v.createdBy });
    setEditId(v.id);
    setShowForm(true);
  };

  const setField = <K extends keyof NonNullable<typeof form>>(k: K, v: NonNullable<typeof form>[K]) =>
    setForm((p) => p ? { ...p, [k]: v } : p);

  const handleSave = async () => {
    if (!form || !form.code.trim()) { toast.error('Code required'); return; }
    if (form.discount < 0 || form.discount > 100) { toast.error('Discount must be 0–100'); return; }
    setSaving(true);
    try {
      const voucher: Voucher = { ...form, id: editId ?? crypto.randomUUID(), createdAt: new Date().toISOString() };
      await saveVoucher(voucher);
      toast.success(editId ? 'Voucher updated' : 'Voucher created');
      setShowForm(false);
      setForm(null);
      setEditId(null);
      load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    await deleteVoucher(confirmDel);
    setConfirmDel(null);
    load();
    toast.success('Voucher deleted');
  };

  const displayed = statusFilter ? vouchers.filter((v) => v.status === statusFilter) : vouchers;

  const columns: TableColumn<Voucher>[] = [
    { name: 'Code', selector: (r) => r.code, sortable: true, cell: (r) => <span className="font-mono text-xs font-bold">{r.code}</span> },
    { name: 'Plan Tier', selector: (r) => r.planTier, sortable: true, width: '110px' },
    { name: 'Discount', selector: (r) => r.discount, format: (r) => `${r.discount}%`, width: '90px' },
    { name: 'Usage Type', selector: (r) => r.usageType, format: (r) => r.usageType === 'one-time-individual' ? 'Individual' : 'Vendor' },
    { name: 'Expiry', selector: (r) => r.expiryDate, width: '110px' },
    { name: 'Status', cell: (r) => <StatusBadge status={r.status} />, width: '100px' },
    { name: 'Created By', selector: (r) => r.createdBy, width: '110px' },
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
      <PageHeader title="Vouchers" subtitle="Create and manage discount voucher codes."
        actions={[{ label: '+ New Voucher', onClick: openNew }]} />

      <div className="mb-4 flex items-center gap-3">
        <label className="text-sm font-semibold text-slate-600">Filter by Status:</label>
        {['', 'Active', 'Expired', 'Redeemed'].map((s) => (
          <button key={s} type="button" onClick={() => setStatusFilter(s)}
            className={[
              'rounded-lg border px-3 py-1 text-xs font-semibold transition',
              statusFilter === s ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
            ].join(' ')}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {showForm && form && (
        <SectionCard title={editId ? 'Edit Voucher' : 'New Voucher'} className="mb-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FormField label="Code (12 chars)" required>
              <div className="flex gap-2">
                <input className={`${inputClass} font-mono uppercase`} maxLength={12} value={form.code}
                  onChange={(e) => setField('code', e.target.value.toUpperCase())} />
                <button type="button" onClick={() => setField('code', generateVoucherCode())}
                  className="h-9 rounded-lg border border-slate-300 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 whitespace-nowrap">
                  Re-gen
                </button>
              </div>
            </FormField>
            <FormField label="Plan Tier">
              <select className={inputClass} value={form.planTier}
                onChange={(e) => setField('planTier', e.target.value as Voucher['planTier'])}>
                {SUBSCRIPTION_PLAN_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </FormField>
            <FormField label="Discount (0–100%)" required>
              <input type="number" min={0} max={100} className={inputClass} value={form.discount || ''}
                onChange={(e) => setField('discount', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} />
            </FormField>
            <FormField label="Usage Type">
              <select className={inputClass} value={form.usageType}
                onChange={(e) => setField('usageType', e.target.value as Voucher['usageType'])}>
                <option value="one-time-individual">One-time per Individual</option>
                <option value="one-time-vendor">One-time per Vendor</option>
              </select>
            </FormField>
            <FormField label="Status">
              <select className={inputClass} value={form.status}
                onChange={(e) => setField('status', e.target.value as VoucherStatus)}>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Redeemed">Redeemed</option>
              </select>
            </FormField>
            <FormField label="Expiry Date">
              <input type="date" className={`${inputClass} [color-scheme:light]`} value={form.expiryDate}
                onChange={(e) => setField('expiryDate', e.target.value)} />
            </FormField>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="button" disabled={saving} onClick={handleSave}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
              {saving ? 'Saving…' : editId ? 'Update' : 'Create Voucher'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm(null); setEditId(null); }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </SectionCard>
      )}

      <DataTableWrapper columns={columns} data={displayed} loading={loading} searchable />

      {confirmDel && (
        <ConfirmDialog title="Delete Voucher" message="Delete this voucher code permanently?"
          confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />
      )}
    </ErrorBoundary>
  );
};
