import React from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { ImageUploader } from '../../../shared/components/ImageUploader';
import { FormField } from '../../../shared/components/FormField';
import { useAuth } from '../../../auth/useAuth';
import type { DsaSlider, DsaSlotStatus, SliderStatus, DsaPayoutHistory } from '../marketing.types';
import {
  createDsaSlider,
  fetchDsaPayoutHistory,
  fetchDsaUploadLimitStatus,
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
import {
  CATEGORIES,
  COUNTRIES,
  MEDIA_TABS,
  PLANS,
  SECTIONS,
  STATUSES,
  PLAN_MONTHS,
  addMonths,
  toAbsoluteMediaUrl,
} from './constants';

const inputClass = 'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

const emptyForm = (section = 'HOMEPAGE') => ({
  section,
  country: 'India',
  category: CATEGORIES[0],
  plan: 'Bronze',
  matchCode: '',
  planCharge: 0,
  luxuryFees: 0,
  discount: 0,
  toPay: 0,
  imageUrl: '',
  status: 'Active' as SliderStatus,
});

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

export const MediaAds: React.FC<{ refreshKey?: number }> = ({ refreshKey = 0 }) => {
  const { user } = useAuth();
  const location = useLocation();
  const dsaCode = user?.code || user?.name || 'UNKNOWN';
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('Slider');
  const [form, setForm] = React.useState(emptyForm());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState({ totalMargin: 50000, marginUsed: 0, availableMargin: 50000 });
  const [slotStatus, setSlotStatus] = React.useState<DsaSlotStatus | null>(null);
  const [activeMatchDoeCode, setActiveMatchDoeCode] = React.useState('');
  const [financeHistory, setFinanceHistory] = React.useState<DsaPayoutHistory[]>([]);
  const [dsaUploadLimit, setDsaUploadLimit] = React.useState({
    maxSlots: 0,
    activeUploads: 0,
    remainingSlots: null as number | null,
  });
  const [matchCodeStatus, setMatchCodeStatus] = React.useState<'idle' | 'valid' | 'invalid'>('idle');

  const switchTab = React.useCallback((tab: string) => {
    setActiveTab(tab);
    setEditingId(null);
    setForm(emptyForm('HOMEPAGE'));
  }, []);

  const load = React.useCallback(
    async (slotCtx?: { section: string; country: string }) => {
      const section = slotCtx?.section ?? form.section;
      const country = slotCtx?.country ?? form.country;
      setLoading(true);
      try {
        const [sum, slot, payouts, uploadLimit] = await Promise.all([
          fetchSliderSummary({ mediaTab: activeTab, dsaCode }),
          fetchDsaSlotStatus({
            mediaTab: activeTab,
            section,
            country,
          }),
          fetchDsaPayoutHistory({ dsaCode }),
          fetchDsaUploadLimitStatus(dsaCode),
        ]);
        setSummary(sum);
        setSlotStatus(slot);
        setFinanceHistory(payouts);
        setDsaUploadLimit({
          maxSlots: uploadLimit.maxSlots,
          activeUploads: uploadLimit.activeUploads,
          remainingSlots: uploadLimit.remainingSlots,
        });
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
  }, [load, refreshKey]);

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

  React.useEffect(() => {
    const payload = (location.state as { editSlider?: DsaSlider } | null)?.editSlider;
    if (!payload) return;
    if (payload.mediaTab) setActiveTab(payload.mediaTab);
    setEditingId(payload.id);
    setForm({
      section: payload.section,
      country: payload.country,
      category: payload.category || CATEGORIES[0],
      plan: payload.plan,
      matchCode: payload.matchCode || '',
      planCharge: Number(payload.planCharge || 0),
      luxuryFees: Number(payload.luxuryFees || 0),
      discount: Number(payload.discount || 0),
      toPay: Number(payload.toPay || 0),
      imageUrl: payload.imageUrl,
      status: payload.status,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.state]);

  const slotsFull = Boolean(
    !editingId && slotStatus && slotStatus.usedSlots >= slotStatus.maxSlots,
  );
  const dsaUploadLimitReached = Boolean(
    !editingId
      && dsaUploadLimit.maxSlots > 0
      && dsaUploadLimit.remainingSlots != null
      && dsaUploadLimit.remainingSlots <= 0,
  );
  const calculatedExpiry = form.plan
    ? addMonths(new Date().toISOString().slice(0, 10), PLAN_MONTHS[form.plan] || 0)
    : '';

  React.useEffect(() => {
    const code = String(form.matchCode || '').trim();
    if (code.length !== 5) {
      setMatchCodeStatus('idle');
      return;
    }
    let cancelled = false;
    void validateMatchDoe(code).then((ok) => {
      if (!cancelled) setMatchCodeStatus(ok ? 'valid' : 'invalid');
    });
    return () => {
      cancelled = true;
    };
  }, [form.matchCode]);

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
    if (dsaUploadLimitReached) {
      toast.error('Upload limit reached for this DSA.');
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
              {dsaUploadLimit.maxSlots > 0 ? (
                <span>
                  Ad Slot: {dsaUploadLimit.activeUploads}/{dsaUploadLimit.maxSlots}
                </span>
              ) : null}
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

          {dsaUploadLimitReached ? (
            <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-center text-sm font-semibold text-red-800">
              Upload limit reached for this DSA. Increase limit or wait for ads to expire.
            </div>
          ) : null}

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
              <FormField label="Expiry Date">
                <input className={`${inputClass} bg-slate-50`} readOnly value={calculatedExpiry || '—'} />
              </FormField>
              <FormField label="Plan Charge"><input type="number" min={0} className={`${inputClass} bg-slate-50`} value={form.planCharge} readOnly title="From Platform & Products → Plan Charges" /></FormField>
              <FormField label="Luxury Fees">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.luxuryFees}
                  onKeyDown={onNumericInputKeyDown}
                  onChange={(e) => setForm((p) => ({ ...p, luxuryFees: Number(e.target.value || 0) }))}
                />
              </FormField>
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
                  {matchCodeStatus === 'valid' ? (
                    <p className="text-xs font-semibold text-emerald-600">Successful</p>
                  ) : null}
                  {matchCodeStatus === 'invalid' ? (
                    <p className="text-xs font-semibold text-red-600">Invalid</p>
                  ) : null}
                </FormField>
              </div>
          </div>

          <div className="px-4 py-4">
            <p className="mb-3 text-2xl font-bold text-slate-800">Upload Image</p>
            <div className="flex flex-wrap items-end gap-6">
              <div className={slotsFull && !editingId ? 'pointer-events-none opacity-50' : ''}>
                <ImageUploader
                  label="Image"
                  currentPreview={toAbsoluteMediaUrl(form.imageUrl)}
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
                    disabled={saving || (slotsFull && !editingId) || dsaUploadLimitReached || loading}
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

      <SectionCard title="Finance History (DSA)" className="mt-2">
        {financeHistory.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No finance history found for this DSA.</p>
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
    </ErrorBoundary>
  );
};
