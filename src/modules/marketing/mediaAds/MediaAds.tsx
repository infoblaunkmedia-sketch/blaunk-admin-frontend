import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { EmptyState } from '../../../shared/components/EmptyState';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ImageUploader } from '../../../shared/components/ImageUploader';
import { FormField } from '../../../shared/components/FormField';
import { useAuth } from '../../../auth/useAuth';
import type { DsaSlider, DsaSlotStatus, SliderStatus, DsaPayoutHistory } from '../marketing.types';
import {
  createDsaSlider,
  deleteDsaSlider,
  fetchDsaPayoutHistory,
  fetchDsaSliders,
  fetchDsaSlotStatus,
  fetchSliderSummary,
  getActiveMatchDoe,
  updateDsaSlider,
  validateMatchDoe,
} from '../marketing.service';
import { parseApiErrorBody } from '../../../shared/utils/apiErrorMessage';
import { onNumericInputKeyDown } from '../../../shared/utils/numericInput';
import { resolveAdPlanFees } from '../../platform/platform.service';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { isNegativePayoutStatus, payoutStatusLabel } from '../../../shared/constants/payoutStatus';

const SECTIONS = ['HOMEPAGE', 'BGT', 'TOUR', 'STORE', 'CAKE', 'BOUTIQUE', 'LOGISTIC'];
const MEDIA_TABS = ['Slider', 'Explore', 'Trendy Star', 'Global Store', 'Exclusive', 'New Launch', 'GIFF', 'Tour Package'];
const COUNTRIES = ['India', 'Bahrain', 'Bhutan', 'Indonesia', 'Jordan', 'Malaysia', 'Maldives', 'Philippines', 'Singapore', 'Sri Lanka', 'Qatar', 'Thailand', 'UAE-Dubai', 'Vietnam'];
const CATEGORIES = ['Banner', 'Product', 'Service', 'Offer', 'Event'];
const PLANS = ['Standard (2M)', 'Silver (3M)', 'Gold (6M)', 'Platinum (1YR)', 'Premium (1YR)', 'Diamond (1YR)'];
const PLAN_MONTHS: Record<string, number> = {
  'Standard (2M)': 2,
  'Silver (3M)': 3,
  'Gold (6M)': 6,
  'Platinum (1YR)': 12,
  'Premium (1YR)': 12,
  'Diamond (1YR)': 12,
};
const STATUSES: SliderStatus[] = ['Draft', 'Active', 'Inactive'];

const inputClass = 'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

const emptyForm = (section = 'HOMEPAGE') => ({
  section,
  country: 'India',
  category: CATEGORIES[0],
  plan: 'Standard (2M)',
  matchCode: '',
  planCharge: 0,
  luxuryFees: 0,
  discount: 0,
  toPay: 0,
  imageUrl: '',
  status: 'Active' as SliderStatus,
});

function addMonths(dateISO: string, months: number) {
  const d = new Date(dateISO);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function getErrorMessage(error: unknown, fallback: string) {
  const raw = error instanceof Error ? error.message : '';
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw) as { message?: string };
    return parsed?.message || raw;
  } catch {
    return raw;
  }
}

export const MediaAds: React.FC = () => {
  const { user } = useAuth();
  const dsaCode = user?.code || user?.name || 'UNKNOWN';
  const [records, setRecords] = React.useState<DsaSlider[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('Slider');
  const [form, setForm] = React.useState(emptyForm());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<DsaSlider | null>(null);
  const [advSectionFilter, setAdvSectionFilter] = React.useState('');
  const [countryFilter, setCountryFilter] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<SliderStatus | ''>('');
  const [summary, setSummary] = React.useState({ totalMargin: 50000, marginUsed: 0, availableMargin: 50000 });
  const [slotStatus, setSlotStatus] = React.useState<DsaSlotStatus | null>(null);
  const [activeMatchDoeCode, setActiveMatchDoeCode] = React.useState('');
  const [financeHistory, setFinanceHistory] = React.useState<DsaPayoutHistory[]>([]);

  const switchTab = React.useCallback((tab: string) => {
    setActiveTab(tab);
    setEditingId(null);
    setForm(emptyForm('HOMEPAGE'));
    setAdvSectionFilter('');
    setCountryFilter('');
    setStatusFilter('');
  }, []);

  const load = React.useCallback(
    async (slotCtx?: { section: string; country: string }) => {
      const section = slotCtx?.section ?? form.section;
      const country = slotCtx?.country ?? form.country;
      setLoading(true);
      try {
        const [list, sum, slot, payouts] = await Promise.all([
          fetchDsaSliders({ mediaTab: activeTab }),
          fetchSliderSummary({ mediaTab: activeTab, dsaCode }),
          fetchDsaSlotStatus({
            mediaTab: activeTab,
            section,
            country,
          }),
          fetchDsaPayoutHistory({ dsaCode }),
        ]);
        setRecords(list);
        setSummary(sum);
        setSlotStatus(slot);
        setFinanceHistory(payouts);
      } catch (e) {
        toast.error(getErrorMessage(e, 'Failed to load sliders'));
      } finally {
        setLoading(false);
      }
    },
    [activeTab, dsaCode, form.section, form.country],
  );

  React.useEffect(() => {
    void load();
  }, [load]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const active = await getActiveMatchDoe();
      if (!mounted) return;
      setActiveMatchDoeCode(String(active?.code || '').trim());
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const slotsFull = Boolean(
    !editingId && slotStatus && slotStatus.usedSlots >= slotStatus.maxSlots,
  );

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const fees = await resolveAdPlanFees(activeTab, form.plan);
      if (cancelled) return;
      setForm((p) => ({
        ...p,
        planCharge: fees.basicFees,
        luxuryFees: 0,
      }));
    })();
    return () => { cancelled = true; };
  }, [activeTab, form.plan]);

  React.useEffect(() => {
    setForm((p) => ({ ...p, toPay: Number((Number(p.planCharge || 0) + Number(p.luxuryFees || 0) - Number(p.discount || 0)).toFixed(2)) }));
  }, [form.planCharge, form.luxuryFees, form.discount]);

  const uploadSliderImage = async (file: File) => {
    const base = import.meta.env.VITE_API_BASE_URL ?? '';
    if (!base) throw new Error('VITE_API_BASE_URL is not configured');
    const token = sessionStorage.getItem('authToken');
    const payload = new FormData();
    payload.append('image', file);
    const res = await fetch(`${base}/api/upload/image`, { method: 'POST', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: payload });
    if (!res.ok) {
      const t = await res.text().catch(() => res.statusText);
      throw new Error(parseApiErrorBody(t, res.status));
    }
    const json = (await res.json()) as { url?: string };
    if (!json.url) throw new Error('Upload failed');
    return String(json.url);
  };

  const handleSave = async () => {
    if (!editingId && slotStatus && slotStatus.usedSlots >= slotStatus.maxSlots) {
      toast.error('All slots are full for this section.');
      return;
    }
    if (!form.country) return toast.error('Country is required');
    if (!form.category) return toast.error('Category is required');
    if (!form.plan) return toast.error('Plan is required');
    if (!String(form.matchCode || '').trim()) return toast.error('Match Code is required');
    if (!activeMatchDoeCode) return toast.error('Match Code is not matching active code.');
    const isValidCode = await validateMatchDoe(String(form.matchCode || '').trim());
    if (!isValidCode) return toast.error('Match Code is not matching active code.');
    if (!form.imageUrl) return toast.error('Image is required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        productId: '',
        mediaTab: activeTab,
        dsaCode,
      };
      if (editingId) await updateDsaSlider(editingId, payload);
      else await createDsaSlider(payload);
      toast.success(editingId ? 'Slider updated' : 'Slider created');
      setEditingId(null);
      const next = emptyForm('HOMEPAGE');
      setForm(next);
      await load({ section: next.section, country: next.country });
    } catch (e) {
      toast.error(getErrorMessage(e, 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteDsaSlider(confirmDelete.id);
      toast.success('Slider deleted');
      setConfirmDelete(null);
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e, 'Delete failed'));
    }
  };

  const filtered = records.filter((r) =>
    (!advSectionFilter || r.section === advSectionFilter) &&
    (!countryFilter || r.country === countryFilter) &&
    (!statusFilter || r.status === statusFilter),
  );

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
  const toAbsoluteUrl = (urlOrPath: string) => {
    const s = String(urlOrPath || '').trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith('/')) return `${API_BASE}${s}`;
    return s;
  };

  return (
    <ErrorBoundary>
      <PageHeader title={`Media Upload - ${activeTab}`} subtitle="Advertisement" />

      <SectionCard title="" className="mb-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {MEDIA_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => switchTab(tab)}
              className={[
                'rounded-md border px-3 py-1 text-xs font-semibold',
                activeTab === tab ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-700',
              ].join(' ')}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
            <h3 className="text-2xl font-bold text-slate-800">{activeTab}</h3>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
              <span>DSA Code: {dsaCode}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
            <span className="text-slate-800">
              {slotStatus
                ? `${slotStatus.usedSlots} / ${slotStatus.maxSlots} Slots Used · ${slotStatus.section} · ${slotStatus.country}`
                : 'Slot status…'}
            </span>
            <span className="text-right">
              Available Margin: {summary.availableMargin.toFixed(2)} &nbsp;&nbsp; Margin Used: {summary.marginUsed.toFixed(2)}
            </span>
          </div>

          {slotsFull ? (
            <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-center text-sm font-semibold text-amber-900">
              All slots are full for this section.
            </div>
          ) : null}

          <div className="px-3 py-3 text-white">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
              <FormField label="Section" required>
                <select className={inputClass} value={form.section} onChange={(e) => setForm((p) => ({ ...p, section: e.target.value }))}>
                  {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="Country" required><select className={inputClass} value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}>{COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></FormField>
              <FormField label="Category" required>
                <select className={inputClass} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormField>
              <FormField label="Plan" required><select className={inputClass} value={form.plan} onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value }))}>{PLANS.map((p1) => <option key={p1} value={p1}>{p1}</option>)}</select></FormField>
              <FormField label="Plan Charge"><input type="number" min={0} className={`${inputClass} bg-slate-50`} value={form.planCharge} readOnly title="From Platform & Products → Plan Charges" /></FormField>
              <FormField label="Luxury Fees"><input type="number" min={0} className={`${inputClass} bg-slate-50`} value={form.luxuryFees} readOnly title="Defaults to 0; optional assurance fees are not auto-applied" /></FormField>
            </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
                <FormField label="To Pay">
                  <input
                    className={inputClass}
                    value={form.toPay}
                    disabled
                  />
                </FormField>

                <FormField label="Status">
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        status: e.target.value as SliderStatus,
                      }))
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Discount">
                  <input
                    type="number"
                    min={0}
                    className={inputClass}
                    value={form.discount}
                    onKeyDown={onNumericInputKeyDown}
                    onChange={(e) => setForm((p) => ({ ...p, discount: Number(e.target.value || 0) }))}
                  />
                </FormField>
                <FormField label="Match Code" required>
                  <input
                    className={inputClass}
                    value={form.matchCode}
                    onChange={(e) => setForm((p) => ({ ...p, matchCode: e.target.value.toUpperCase().replace(/\D/g, '').slice(0, 5) }))}
                  />
                </FormField>
              </div>
          </div>

          <div className="px-4 py-4">
            <p className="mb-3 text-2xl font-bold text-slate-800">Upload Image</p>
            <div className="flex flex-wrap items-end gap-6">
              <div className={slotsFull && !editingId ? 'pointer-events-none opacity-50' : ''}>
                <ImageUploader
                  label="Image"
                  currentPreview={toAbsoluteUrl(form.imageUrl)}
                  onFile={async (file) => {
                    try {
                      const url = await uploadSliderImage(file);
                      setForm((p) => ({ ...p, imageUrl: url }));
                      toast.success('Image uploaded');
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Upload failed');
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      const base = emptyForm('HOMEPAGE');
                      setForm(base);
                      void load({ section: base.section, country: base.country });
                    }}
                    className="rounded bg-slate-500 px-4 py-2 text-xs font-bold text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving || (slotsFull && !editingId)}
                    onClick={handleSave}
                    className="rounded bg-emerald-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Apply'}
                  </button>
                </div>
                {slotsFull && !editingId ? (
                  <p className="max-w-xs text-xs font-semibold text-amber-800">All slots are full for this section.</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Sales Advertisement" className="mt-2">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Section</label>
            <select className={inputClass} value={advSectionFilter} onChange={(e) => setAdvSectionFilter(e.target.value)}>
              <option value="">All Sections</option>
              {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="min-w-[220px] flex-1"><label className="mb-1 block text-xs font-semibold text-slate-600">Country</label><select className={inputClass} value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}><option value="">Select Country</option>{COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="min-w-[220px] flex-1"><label className="mb-1 block text-xs font-semibold text-slate-600">Status</label><select className={inputClass} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as SliderStatus | '')}><option value="">All</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          <button
            type="button"
            onClick={() => {
              setAdvSectionFilter('');
              setCountryFilter('');
              setStatusFilter('');
            }}
            className="h-9 rounded border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reset
          </button>
        </div>

        {!loading && filtered.length === 0 ? (
          <EmptyState message="No sliders found for selected filters." />
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {filtered.map((r) => (
              <div key={r.id} className="rounded border border-slate-200 bg-white p-3">
                <div className="flex gap-3">
                  <img src={toAbsoluteUrl(r.imageUrl)} alt={r.plan} className="h-20 w-24 rounded bg-slate-100 object-cover" />
                  <div className="text-sm font-semibold text-slate-700">
                    <p>Plan: {r.plan}</p>
                    <p>Upload Date: {(r.uploadDate || r.createdAt || '').slice(0, 10) || '-'}</p>
                    <p>Expiry Date: {(r.expiryDate || addMonths(String(r.uploadDate || r.createdAt || new Date()), PLAN_MONTHS[r.plan] || 2)).slice(0, 10)}</p>
                    <p>Amount: {Number(r.toPay || 0).toFixed(2)}</p>
                    <p>DSA ID: {r.dsaCode || '-'}</p>
                    <p>Category: {r.category || '-'}</p>
                    <p>Match Code: {r.matchCode || '-'}</p>
                    <p>Status: {r.status}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(r.id);
                      setForm({
                        section: r.section,
                        country: r.country,
                        category: r.category || CATEGORIES[0],
                        plan: r.plan,
                        matchCode: r.matchCode || '',
                        planCharge: Number(r.planCharge || 0),
                        luxuryFees: Number(r.luxuryFees || 0),
                        discount: Number(r.discount || 0),
                        toPay: Number(r.toPay || 0),
                        imageUrl: r.imageUrl,
                        status: r.status,
                      });
                    }}
                    className="rounded border border-primary px-3 py-1 text-xs font-semibold text-primary"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(r)}
                    className="rounded border border-red-300 px-3 py-1 text-xs font-semibold text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Finance History (DSA)" className="mt-2">
        {financeHistory.length === 0 ? (
          <EmptyState message="No finance history found for this DSA." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">DSA</th>
                  <th className="px-3 py-2 text-left">Mode</th>
                  <th className="px-3 py-2 text-left">Curr</th>
                  <th className="px-3 py-2 text-left">Amount Pay-in</th>
                  <th className="px-3 py-2 text-left">Calculated Limit</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Approval/Rejection Log</th>
                </tr>
              </thead>
              <tbody>
                {financeHistory.map((row, idx) => (
                  <tr key={row.id} className={idx % 2 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="border-b px-3 py-2">{row.submissionDate || (row.createdAt || '').slice(0, 10) || '-'}</td>
                    <td className="border-b px-3 py-2 font-semibold">{row.dsaCode}</td>
                    <td className="border-b px-3 py-2">{row.mode || '-'}</td>
                    <td className="border-b px-3 py-2">{row.currency}</td>
                    <td className="border-b px-3 py-2">{Number(row.submittedAmount || 0).toLocaleString()}</td>
                    <td className="border-b px-3 py-2">₹{Number(row.calculatedLimit || 0).toLocaleString()}</td>
                    <td className="border-b px-3 py-2">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="border-b px-3 py-2 text-xs text-slate-700">
                      {row.status === 'APPROVED'
                        ? `Approved by ${row.approvedBy || '-'}${row.approvedAt ? ` on ${String(row.approvedAt).slice(0, 10)}` : ''}${row.approvalNote ? ` • ${row.approvalNote}` : ''}`
                        : isNegativePayoutStatus(row.status)
                          ? `${payoutStatusLabel(row.status)} by ${row.rejectedBy || '-'}${row.rejectedAt ? ` on ${String(row.rejectedAt).slice(0, 10)}` : ''}${row.rejectionReason ? ` • ${row.rejectionReason}` : ''}`
                          : row.approvalNote
                            ? `${payoutStatusLabel(row.status)} • ${row.approvalNote}`
                            : payoutStatusLabel(row.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {confirmDelete ? (
        <ConfirmDialog
          title="Delete Slider"
          message={`Delete ${confirmDelete.plan} slider?`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      ) : null}
    </ErrorBoundary>
  );
};
