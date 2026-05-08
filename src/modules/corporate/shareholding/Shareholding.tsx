import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper';
import { FormField } from '../../../shared/components/FormField';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { Shareholder, Nominee } from '../corporate.types';
import { fetchShareholders, saveShareholder, deleteShareholder } from '../corporate.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const emptyNominee = (): Nominee => ({ name: '', mobile: '', relation: '', percentage: '', pan: '' });

const emptyForm = (): Omit<Shareholder, 'id'> => ({
  name: '', pan: '', mobile: '', email: '', aadhaar: '',
  address: '', city: '', landmark: '', country: '', gender: '',
  holdingPercent: '', shareType: '', faceValue: '', numberOfShares: '',
  mode: '', isinCode: '', dpNumber: '', folioNumber: '',
  distinctiveFrom: '', distinctiveTo: '', yearOfIssuance: '',
  stakeholder: '', dateOfAllotment: '', remarks: '', exitDate: '',
  year: '', bankName: '', ifscCode: '', bankAccountNumber: '',
  pledge: 'NA',
  nominees: [emptyNominee(), emptyNominee(), emptyNominee()],
});

export const Shareholding: React.FC = () => {
  const [shareholders, setShareholders] = React.useState<Shareholder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm());
  const [editId, setEditId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setShareholders(await fetchShareholders());
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const setNomineeField = (idx: number, key: keyof Nominee, val: string) =>
    setForm((p) => {
      const nominees = [...p.nominees];
      nominees[idx] = { ...nominees[idx], [key]: val };
      return { ...p, nominees };
    });

  const openNew = () => { setForm(emptyForm()); setEditId(null); setShowForm(true); };

  const openEdit = (sh: Shareholder) => {
    const { id, ...rest } = sh;
    setForm({ ...rest, nominees: rest.nominees.length >= 3 ? rest.nominees : [...rest.nominees, ...Array(3 - rest.nominees.length).fill(null).map(emptyNominee)] });
    setEditId(id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Shareholder name required'); return; }
    if (!form.folioNumber.trim()) { toast.error('Folio number required'); return; }
    setSaving(true);
    try {
      await saveShareholder({ id: editId ?? crypto.randomUUID(), ...form });
      toast.success(editId ? 'Shareholder updated' : 'Shareholder added');
      setShowForm(false);
      setEditId(null);
      load();
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    await deleteShareholder(confirmDel);
    setConfirmDel(null);
    load();
    toast.success('Shareholder deleted');
  };

  const columns: TableColumn<Shareholder>[] = [
    { name: 'Name', selector: (r) => r.name, sortable: true, grow: 2 },
    { name: 'Folio No.', selector: (r) => r.folioNumber, width: '130px' },
    { name: 'PAN', selector: (r) => r.pan, width: '120px' },
    { name: 'Share Type', selector: (r) => r.shareType, width: '150px' },
    { name: 'No. of Shares', selector: (r) => r.numberOfShares, width: '120px', sortable: true },
    { name: 'Holding %', selector: (r) => r.holdingPercent, width: '100px' },
    { name: 'Allotment Date', selector: (r) => r.dateOfAllotment, width: '125px' },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex gap-2">
          <button type="button" onClick={() => openEdit(r)}
            className="rounded px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/10">Edit</button>
          <button type="button" onClick={() => setConfirmDel(r.id)}
            className="rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
        </div>
      ),
      width: '130px', ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="Shareholding Register"
        subtitle="Manage company shareholders, share allocations, and nominees."
        actions={[{ label: '+ Add Shareholder', onClick: openNew }]} />

      <DataTableWrapper columns={columns} data={shareholders} loading={loading} searchable />

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
          <div className="mx-auto my-8 w-full max-w-4xl rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-base font-bold text-primary">
                {editId ? 'Edit Shareholder' : 'Add Shareholder'}
              </h3>
              <button type="button" onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-5 p-6">
              <SectionCard title="Personal Details">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField label="Name" required>
                    <input className={inputClass} value={form.name} onChange={(e) => setField('name', e.target.value)} />
                  </FormField>
                  <FormField label="Mobile">
                    <input className={inputClass} maxLength={10} value={form.mobile}
                      onChange={(e) => setField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} />
                  </FormField>
                  <FormField label="Email">
                    <input type="email" className={inputClass} value={form.email}
                      onChange={(e) => setField('email', e.target.value)} />
                  </FormField>
                  <FormField label="PAN">
                    <input className={inputClass} maxLength={10} value={form.pan}
                      onChange={(e) => setField('pan', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))} />
                  </FormField>
                  <FormField label="Aadhaar">
                    <input className={inputClass} maxLength={12} value={form.aadhaar}
                      onChange={(e) => setField('aadhaar', e.target.value.replace(/\D/g, '').slice(0, 12))} />
                  </FormField>
                  <FormField label="Gender">
                    <select className={inputClass} value={form.gender} onChange={(e) => setField('gender', e.target.value)}>
                      <option value="">Select…</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </FormField>
                  <FormField label="Address" className="sm:col-span-2">
                    <input className={inputClass} value={form.address} onChange={(e) => setField('address', e.target.value)} />
                  </FormField>
                  <FormField label="City">
                    <input className={inputClass} value={form.city} onChange={(e) => setField('city', e.target.value)} />
                  </FormField>
                  <FormField label="Landmark">
                    <input className={inputClass} value={form.landmark} onChange={(e) => setField('landmark', e.target.value)} />
                  </FormField>
                  <FormField label="Country">
                    <input className={inputClass} value={form.country} onChange={(e) => setField('country', e.target.value)} />
                  </FormField>
                </div>
              </SectionCard>

              <SectionCard title="Share Details">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <FormField label="Folio Number" required>
                    <input className={inputClass} maxLength={12} value={form.folioNumber}
                      onChange={(e) => setField('folioNumber', e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 12))} />
                  </FormField>
                  <FormField label="Share Type">
                    <select className={inputClass} value={form.shareType} onChange={(e) => setField('shareType', e.target.value as typeof form.shareType)}>
                      <option value="">Select…</option>
                      <option>Fully Paid - EQ</option><option>Partially Paid - EQ</option>
                      <option>Convertible</option><option>Debenture</option><option>Preference Share</option>
                    </select>
                  </FormField>
                  <FormField label="No. of Shares">
                    <input className={inputClass} value={form.numberOfShares}
                      onChange={(e) => setField('numberOfShares', e.target.value.replace(/\D/g, '').slice(0, 7))} />
                  </FormField>
                  <FormField label="Face Value">
                    <input className={inputClass} value={form.faceValue}
                      onChange={(e) => setField('faceValue', e.target.value.replace(/\D/g, ''))} />
                  </FormField>
                  <FormField label="Holding (%)">
                    <input className={inputClass} value={form.holdingPercent}
                      onChange={(e) => setField('holdingPercent', e.target.value)} />
                  </FormField>
                  <FormField label="Mode">
                    <select className={inputClass} value={form.mode} onChange={(e) => setField('mode', e.target.value as typeof form.mode)}>
                      <option value="">Select…</option><option>Physical</option><option>Demat</option>
                    </select>
                  </FormField>
                  <FormField label="ISIN Code">
                    <input className={inputClass} maxLength={12} value={form.isinCode}
                      onChange={(e) => setField('isinCode', e.target.value.replace(/\D/g, '').slice(0, 12))} />
                  </FormField>
                  <FormField label="DP Number">
                    <input className={inputClass} maxLength={16} value={form.dpNumber}
                      onChange={(e) => setField('dpNumber', e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 16))} />
                  </FormField>
                  <FormField label="Distinctive From">
                    <input className={inputClass} value={form.distinctiveFrom}
                      onChange={(e) => setField('distinctiveFrom', e.target.value.replace(/\D/g, '').slice(0, 12))} />
                  </FormField>
                  <FormField label="Distinctive To">
                    <input className={inputClass} value={form.distinctiveTo}
                      onChange={(e) => setField('distinctiveTo', e.target.value.replace(/\D/g, '').slice(0, 12))} />
                  </FormField>
                  <FormField label="Stakeholder">
                    <select className={inputClass} value={form.stakeholder} onChange={(e) => setField('stakeholder', e.target.value as typeof form.stakeholder)}>
                      <option value="">Select…</option>
                      <option>Board Member</option><option>HNI</option>
                      <option>Pledge Lender</option><option>Investors</option><option>Shareholders</option>
                    </select>
                  </FormField>
                  <FormField label="Date of Allotment">
                    <input type="date" className={`${inputClass} [color-scheme:light]`} value={form.dateOfAllotment}
                      onChange={(e) => setField('dateOfAllotment', e.target.value)} />
                  </FormField>
                  <FormField label="Year of Issuance">
                    <select className={inputClass} value={form.yearOfIssuance} onChange={(e) => setField('yearOfIssuance', e.target.value)}>
                      <option value="">Select…</option>
                      <option>2024-2025</option><option>2025-2026</option><option>2026-2027</option><option>2027-2028</option>
                    </select>
                  </FormField>
                  <FormField label="Year">
                    <select className={inputClass} value={form.year} onChange={(e) => setField('year', e.target.value)}>
                      <option value="">Select…</option>
                      <option>2024-2025</option><option>2025-2026</option><option>2026-2027</option><option>2027-2028</option>
                    </select>
                  </FormField>
                  <FormField label="Exit Date">
                    <input type="date" className={`${inputClass} [color-scheme:light]`} value={form.exitDate}
                      onChange={(e) => setField('exitDate', e.target.value)} />
                  </FormField>
                  <FormField label="Remarks">
                    <select className={inputClass} value={form.remarks} onChange={(e) => setField('remarks', e.target.value as typeof form.remarks)}>
                      <option value="">Select…</option>
                      <option>Transferable</option><option>Non-Transferable</option>
                      <option>Partly Paid</option><option>Partly Sold</option><option>Lockin Period</option>
                    </select>
                  </FormField>
                  <FormField label="Pledge">
                    <select className={inputClass} value={form.pledge} onChange={(e) => setField('pledge', e.target.value as typeof form.pledge)}>
                      <option>NA</option><option>Un Pledge</option><option>Pledge</option>
                    </select>
                  </FormField>
                </div>
              </SectionCard>

              <SectionCard title="Bank Details">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField label="Bank Name">
                    <input className={inputClass} value={form.bankName}
                      onChange={(e) => setField('bankName', e.target.value.replace(/[^A-Za-z\s]/g, ''))} />
                  </FormField>
                  <FormField label="IFSC Code">
                    <input className={inputClass} maxLength={11} value={form.ifscCode}
                      onChange={(e) => setField('ifscCode', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))} />
                  </FormField>
                  <FormField label="Account Number">
                    <input className={inputClass} value={form.bankAccountNumber}
                      onChange={(e) => setField('bankAccountNumber', e.target.value)} />
                  </FormField>
                </div>
              </SectionCard>

              <SectionCard title="Nominees">
                {form.nominees.slice(0, 3).map((nom, i) => (
                  <div key={i} className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-5">
                    <FormField label={`Nominee ${i + 1} — Name`}>
                      <input className={inputClass} value={nom.name}
                        onChange={(e) => setNomineeField(i, 'name', e.target.value)} />
                    </FormField>
                    <FormField label="Mobile">
                      <input className={inputClass} maxLength={10} value={nom.mobile}
                        onChange={(e) => setNomineeField(i, 'mobile', e.target.value.replace(/\D/g, '').slice(0, 10))} />
                    </FormField>
                    <FormField label="Relation">
                      <input className={inputClass} value={nom.relation}
                        onChange={(e) => setNomineeField(i, 'relation', e.target.value)} />
                    </FormField>
                    <FormField label="% Share">
                      <input className={inputClass} value={nom.percentage}
                        onChange={(e) => setNomineeField(i, 'percentage', e.target.value)} />
                    </FormField>
                    <FormField label="PAN">
                      <input className={inputClass} maxLength={10} value={nom.pan}
                        onChange={(e) => setNomineeField(i, 'pan', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))} />
                    </FormField>
                  </div>
                ))}
              </SectionCard>
            </div>

            <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
              <button type="button" disabled={saving} onClick={handleSave}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
                {saving ? 'Saving…' : editId ? 'Update' : 'Add Shareholder'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <ConfirmDialog title="Delete Shareholder" message="Delete this shareholder record permanently?"
          confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmDel(null)} />
      )}
    </ErrorBoundary>
  );
};
