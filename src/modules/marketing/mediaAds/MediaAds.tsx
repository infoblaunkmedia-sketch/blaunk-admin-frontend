import React from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { SectionCard } from '../../../shared/components/SectionCard';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ImageCropDialog } from '../../../shared/components/ImageCropDialog';
import { ImagePreviewDialog } from '../../../shared/components/ImagePreview';
import { PlacementImageUpload } from '../../../shared/components/PlacementImageUpload';
import { FormField } from '../../../shared/components/FormField';
import { useAuth } from '../../../auth/useAuth';
import type { DsaSlider, DsaSlotStatus, SliderStatus, DsaPayoutHistory } from '../marketing.types';
import {
  createDsaSlider,
  fetchDsaPayoutHistory,
  fetchDsaSliderById,
  fetchDsaSlotStatus,
  fetchSliderSummary,
  updateDsaSlider,
  validateMatchDoe,
} from '../marketing.service';
import { parseApiErrorBody } from '../../../shared/utils/apiErrorMessage';
import { formatDateDDMMYYYY } from '../../../shared/utils/dateFormat';
import { onNumericInputKeyDown } from '../../../shared/utils/numericInput';
import { resolveAdPlanFees } from '../../platform/platform.service';
import { MEDIA_PLAN_TIERS } from '../../../shared/constants/adPlanTiers';
import { uploadGiffImage } from '../../cms/giff/giff.service';
import { StatusBadge } from '../../../shared/components/StatusBadge';
import { isNegativePayoutStatus, payoutStatusLabel } from '../../../shared/constants/payoutStatus';
import { CountryNameSelect } from '../../../shared/components/CountryNameSelect';
import { planOptionLabel, toAbsoluteMediaUrl } from './constants';
import {
  BANNER_CMS_PAGES,
  defaultSlotForPage,
  dsaPlacementSlotOptions,
  pageLabel,
  placementImageCrop,
  placementImageMaxSize,
  slotLabel,
  type BannerCmsPage,
  type BannerCmsSlot,
} from '../../../shared/placements/cmsBannerPlacements';

const DEFAULT_MEDIA_TAB = 'Slider';
const DEFAULT_CATEGORY = 'Banner';
const GIFF_FORMATS = ['gif', 'jpg'] as const;

function isGiffPage(page: BannerCmsPage) {
  return page === 'giff';
}

function mediaTabForPage(page: BannerCmsPage) {
  return isGiffPage(page) ? 'GIFF' : DEFAULT_MEDIA_TAB;
}

const emptyForm = (cmsPage: BannerCmsPage = 'home', cmsPosition?: BannerCmsSlot) => ({
  cmsPage,
  cmsPosition: cmsPosition ?? defaultSlotForPage(cmsPage),
  section: '',
  country: 'India',
  category: DEFAULT_CATEGORY,
  plan: 'Bronze',
  matchCode: '',
  planCharge: 0,
  luxuryFees: 0,
  discount: 0,
  toPay: 0,
  imageUrl: '',
  status: 'Active' as SliderStatus,
  giffFormat: 'gif' as 'gif' | 'jpg',
  giffSortOrder: 1,
});

const inputClass = 'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

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
  const [form, setForm] = React.useState(emptyForm());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [initialEditToPay, setInitialEditToPay] = React.useState(0);
  const editingIdRef = React.useRef<string | null>(null);
  const [summary, setSummary] = React.useState({ totalMargin: 50000, marginUsed: 0, availableMargin: 50000 });
  const [slotStatus, setSlotStatus] = React.useState<DsaSlotStatus | null>(null);
  const [financeHistory, setFinanceHistory] = React.useState<DsaPayoutHistory[]>([]);
  const [imageUploading, setImageUploading] = React.useState(false);
  const [cropSrc, setCropSrc] = React.useState<string | null>(null);
  const [imagePreviewOpen, setImagePreviewOpen] = React.useState(false);
  const [confirmEditSave, setConfirmEditSave] = React.useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const placementCrop = React.useMemo(
    () => placementImageCrop(form.cmsPage, form.cmsPosition),
    [form.cmsPage, form.cmsPosition],
  );
  const placementMaxSize = React.useMemo(() => placementImageMaxSize(form.cmsPage), [form.cmsPage]);
  const cropSubtitle = `${placementCrop.label} · Crop ${placementCrop.aspectLabel} · Max ${placementMaxSize.hint} · JPG, PNG, WebP · Drag to reposition · scroll to zoom`;
  const allowedPlanOptions = React.useMemo(() => [...MEDIA_PLAN_TIERS], []);

  React.useEffect(() => {
    setForm((prev) => {
      if (allowedPlanOptions.includes(prev.plan)) return prev;
      return { ...prev, plan: allowedPlanOptions[0] || 'Bronze' };
    });
  }, [allowedPlanOptions, form.cmsPage]);

  React.useEffect(() => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset crop when placement changes
  }, [form.cmsPage, form.cmsPosition]);
  const load = React.useCallback(
    async (slotCtx?: { cmsPage: BannerCmsPage; cmsPosition: BannerCmsSlot; country: string }) => {
      const cmsPage = slotCtx?.cmsPage ?? form.cmsPage;
      const cmsPosition = slotCtx?.cmsPosition ?? form.cmsPosition;
      const country = slotCtx?.country ?? form.country;
      setLoading(true);
      const mt = mediaTabForPage(cmsPage);
      try {
        const [sum, slot, payouts] = await Promise.all([
          fetchSliderSummary({ dsaCode }),
          fetchDsaSlotStatus({
            mediaTab: mt,
            cmsPage,
            cmsPosition,
            country,
          }),
          fetchDsaPayoutHistory({ dsaCode }),
        ]);
        setSummary(sum);
        setSlotStatus(slot);
        setFinanceHistory(payouts);
      } catch (e) {
        toast.error(getErrorMessage(e, 'Failed to load sliders'));
      } finally {
        setLoading(false);
      }
    },
    [dsaCode, form.cmsPage, form.cmsPosition, form.country],
  );

  React.useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const applySliderToForm = React.useCallback((payload: DsaSlider) => {
    editingIdRef.current = payload.id;
    setEditingId(payload.id);
    setInitialEditToPay(Number(payload.toPay || 0));
    setForm({
      cmsPage: (payload.cmsPage || 'home') as BannerCmsPage,
      cmsPosition: (payload.cmsPosition || defaultSlotForPage((payload.cmsPage || 'home') as BannerCmsPage)) as BannerCmsSlot,
      section: payload.section,
      country: payload.country,
      category: payload.category || DEFAULT_CATEGORY,
      plan: payload.plan,
      matchCode: '',
      planCharge: Number(payload.planCharge || 0),
      luxuryFees: Number(payload.luxuryFees || 0),
      discount: Number(payload.discount || 0),
      toPay: Number(payload.toPay || 0),
      imageUrl: payload.imageUrl,
      status: payload.status,
      giffFormat: (payload.giffFormat === 'jpg' ? 'jpg' : 'gif') as 'gif' | 'jpg',
      giffSortOrder: Number(payload.giffSortOrder) || 1,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  React.useEffect(() => {
    editingIdRef.current = editingId;
  }, [editingId]);

  React.useEffect(() => {
    const payload = (location.state as { editSlider?: DsaSlider } | null)?.editSlider;
    if (!payload?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const record = await fetchDsaSliderById(payload.id);
        if (!cancelled) applySliderToForm(record);
      } catch {
        if (!cancelled) applySliderToForm(payload);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [location.state, applySliderToForm]);

  const slotsFull = Boolean(
    !editingId && slotStatus && slotStatus.usedSlots >= slotStatus.maxSlots,
  );
  const limitAmount = Number(summary.totalMargin || 0);
  const marginPreviewDelta = editingId
    ? Number(form.toPay || 0) - initialEditToPay
    : Number(form.toPay || 0);
  const displayMarginUsed = Number(summary.marginUsed || 0) + marginPreviewDelta;
  const availableLimit = Math.max(0, limitAmount - displayMarginUsed);

  React.useEffect(() => {
    if (!form.plan || editingIdRef.current) return;
    let cancelled = false;
    (async () => {
      const fees = await resolveAdPlanFees(mediaTabForPage(form.cmsPage), form.plan);
      if (cancelled || editingIdRef.current) return;
      setForm((p) => ({
        ...p,
        planCharge: fees.basicFees,
        luxuryFees: 0,
      }));
    })();
    return () => { cancelled = true; };
  }, [form.plan, form.cmsPage]);

  React.useEffect(() => {
    setForm((p) => ({ ...p, toPay: Number((Number(p.planCharge || 0) + Number(p.luxuryFees || 0) - Number(p.discount || 0)).toFixed(2)) }));
  }, [form.planCharge, form.luxuryFees, form.discount]);

  const handlePickImage = () => imageInputRef.current?.click();

  const handleImageFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      e.target.value = '';
      return;
    }
    const maxBytes = placementMaxSize.maxBytes;
    if (file.size > maxBytes) {
      toast.error(`Image must be ${placementMaxSize.hint} or smaller`);
      e.target.value = '';
      return;
    }
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    e.target.value = '';
  };

  const closeCropDialog = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  const handleCropComplete = async (file: File, previewUrl: string) => {
    setImageUploading(true);
    try {
      const url = isGiffPage(form.cmsPage)
        ? await uploadGiffImage(file, String(form.cmsPosition))
        : await uploadSliderImage(file);
      setForm((p) => ({ ...p, imageUrl: url }));
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setImageUploading(false);
    }
  };

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
    const placementLabel = `${pageLabel(form.cmsPage)} · ${slotLabel(form.cmsPage, form.cmsPosition)}`;
    if (!editingId && availableLimit <= 0) {
      toast.error(`No approved limit available for ${placementLabel}. Save blocked.`);
      return;
    }
    if (!editingId && slotStatus && slotStatus.usedSlots >= slotStatus.maxSlots) {
      toast.error('All slots are full for this placement.');
      return;
    }
    if (!form.country) return toast.error('Country is required');
    if (!form.plan) return toast.error('Plan is required');
    const matchDigits = String(form.matchCode || '').replace(/\D/g, '').trim();
    if (matchDigits.length !== 5) return toast.error('Enter the 5-digit active Match Code.');
    const isValidCode = await validateMatchDoe(matchDigits);
    if (!isValidCode) {
      return toast.error('Match Code does not match the current active code.');
    }
    if (!form.imageUrl) return toast.error('Image is required');
    setSaving(true);
    try {
      const payload = {
        ...form,
        status: 'Active' as SliderStatus,
        productId: '',
        mediaTab: mediaTabForPage(form.cmsPage),
        category: form.category || DEFAULT_CATEGORY,
        giffFormat: isGiffPage(form.cmsPage) ? form.giffFormat : undefined,
        giffSortOrder: isGiffPage(form.cmsPage) ? form.giffSortOrder : undefined,
        dsaCode,
      };
      if (editingId) await updateDsaSlider(editingId, payload);
      else await createDsaSlider(payload);
      toast.success(`${editingId ? 'Slider updated' : 'Slider created'}. ${placementLabel}`);
      setConfirmEditSave(false);
      editingIdRef.current = null;
      setEditingId(null);
      setInitialEditToPay(0);
      const next = emptyForm();
      setForm(next);
      await load({ cmsPage: next.cmsPage, cmsPosition: next.cmsPosition, country: next.country });
    } catch (e) {
      toast.error(getErrorMessage(e, 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const requestSave = () => {
    if (editingId) {
      setConfirmEditSave(true);
      return;
    }
    void handleSave();
  };

  return (
    <ErrorBoundary>
      <SectionCard title="" className="mb-3 min-w-0" contentClassName="min-w-0 p-0">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-600 break-words">
                {slotStatus
                  ? `${slotStatus.usedSlots} / ${slotStatus.maxSlots} Slots Used · ${slotStatus.pageLabel || pageLabel(slotStatus.cmsPage as BannerCmsPage)} · ${slotStatus.slotLabel || slotLabel(slotStatus.cmsPage as BannerCmsPage, slotStatus.cmsPosition as BannerCmsSlot)} · ${slotStatus.country}`
                  : 'Slot status…'}
              </p>
            </div>
            <div className="flex w-full min-w-0 flex-col gap-1.5 text-xs font-semibold text-slate-600 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end sm:gap-3 md:gap-4">
              <div className="flex flex-wrap items-center gap-3 sm:contents">
                <span className="whitespace-nowrap">
                  Approved Limit:{' '}
                  <span className="font-bold text-slate-800">₹{limitAmount.toLocaleString()}</span>
                </span>
                <span className="whitespace-nowrap">
                  Margin Used:{' '}
                  <span className="font-bold text-slate-800">₹{displayMarginUsed.toLocaleString()}</span>
                </span>
              </div>
              <span className="w-full whitespace-nowrap font-semibold text-emerald-700 sm:w-auto">
                Available Balance:{' '}
                <span className="font-bold">₹{availableLimit.toLocaleString()}</span>
              </span>
            </div>
          </div>
          {limitAmount <= 0 ? (
            <div className="border-b border-amber-100 bg-amber-50 px-4 py-1.5 text-center text-xs font-semibold text-amber-800">
              No approved limit yet.
            </div>
          ) : null}

          {slotsFull ? (
            <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-center text-sm font-semibold text-amber-900">
              All slots are full for this placement.
            </div>
          ) : null}

          <div className="space-y-3 px-4 py-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <FormField label="Page" required>
                <select
                  className={inputClass}
                  value={form.cmsPage}
                  onChange={(e) => {
                    const cmsPage = e.target.value as BannerCmsPage;
                    const cmsPosition = defaultSlotForPage(cmsPage);
                    setForm((p) => ({ ...p, cmsPage, cmsPosition }));
                    void load({ cmsPage, cmsPosition, country: form.country });
                  }}
                >
                  {BANNER_CMS_PAGES.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </FormField>
              <FormField label={isGiffPage(form.cmsPage) ? 'Category' : 'Slot / Position'} required>
                <select
                  className={inputClass}
                  value={form.cmsPosition}
                  onChange={(e) => {
                    const cmsPosition = e.target.value as BannerCmsSlot;
                    setForm((p) => ({ ...p, cmsPosition }));
                    void load({ cmsPage: form.cmsPage, cmsPosition, country: form.country });
                  }}
                >
                  {dsaPlacementSlotOptions(form.cmsPage).map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </FormField>
              {isGiffPage(form.cmsPage) ? (
                <FormField label="Format" required>
                  <select
                    className={inputClass}
                    value={form.giffFormat}
                    onChange={(e) => setForm((p) => ({ ...p, giffFormat: e.target.value as 'gif' | 'jpg' }))}
                  >
                    {GIFF_FORMATS.map((f) => (
                      <option key={f} value={f}>{f.toUpperCase()}</option>
                    ))}
                  </select>
                </FormField>
              ) : null}
              <FormField label="Country" required>
                <CountryNameSelect
                  className={inputClass}
                  value={form.country}
                  onChange={(country) => {
                    setForm((p) => ({ ...p, country }));
                    void load({ cmsPage: form.cmsPage, cmsPosition: form.cmsPosition, country });
                  }}
                />
              </FormField>
              <FormField label="Plan" required>
                <select className={inputClass} value={form.plan} onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value }))}>
                  {allowedPlanOptions.map((p1) => (
                    <option key={p1} value={p1}>{planOptionLabel(p1)}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Match Code" required>
                <input
                  className={inputClass}
                  value={form.matchCode}
                  onChange={(e) => setForm((p) => ({ ...p, matchCode: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                  autoComplete="off"
                />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <FormField label="Plan Charge">
                <input
                  type="number"
                  min={0}
                  className={`${inputClass} bg-slate-50`}
                  value={form.planCharge}
                  readOnly
                  title="From Management → Plan Charges (Adv plan)"
                />
              </FormField>
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
              <FormField label="To Pay">
                <input className={`${inputClass} bg-slate-50`} value={form.toPay} readOnly />
              </FormField>
              <div className="hidden lg:block" aria-hidden />
            </div>
          </div>

          <div className="px-4 py-4">
            <PlacementImageUpload
              placementLabel={placementCrop.label}
              aspectLabel={placementCrop.aspectLabel}
              aspect={placementCrop.aspect}
              maxSizeHint={placementMaxSize.hint}
              imageUrl={form.imageUrl}
              uploading={imageUploading}
              disabled={Boolean(slotsFull && !editingId)}
              resolveImageUrl={toAbsoluteMediaUrl}
              onPickImage={handlePickImage}
              onPreviewClick={() => setImagePreviewOpen(true)}
              fileInputRef={imageInputRef}
              onFileChange={handleImageFileChange}
              accept={
                isGiffPage(form.cmsPage) && form.giffFormat === 'jpg'
                  ? 'image/jpeg,image/jpg'
                  : isGiffPage(form.cmsPage)
                    ? 'image/gif'
                    : 'image/*'
              }
              headerActions={
                <>
                  <button
                    type="button"
                    onClick={() => {
                      editingIdRef.current = null;
                      setEditingId(null);
                      const base = emptyForm();
                      setForm(base);
                      void load({ cmsPage: base.cmsPage, cmsPosition: base.cmsPosition, country: base.country });
                    }}
                    className="rounded bg-slate-500 px-4 py-2 text-xs font-bold text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={saving || imageUploading || (slotsFull && !editingId) || loading}
                    onClick={requestSave}
                    className="rounded bg-emerald-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                  >
                    {saving ? 'Saving...' : 'Apply'}
                  </button>
                </>
              }
              footnote={
                slotsFull && !editingId ? (
                  <p className="mt-2 text-xs font-semibold text-amber-800">All slots are full for this section.</p>
                ) : null
              }
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Finance History (DSA)" className="mt-2" contentClassName="p-0 overflow-hidden">
        {financeHistory.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">No finance history found for this DSA.</p>
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
                    <td className="border-b px-3 py-2">{formatDateDDMMYYYY(String(row.submissionDate || row.createdAt || '')) || '-'}</td>
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
                        ? `Approved by ${row.approvedBy || '-'}${row.approvedAt ? ` on ${formatDateDDMMYYYY(String(row.approvedAt))}` : ''}${row.approvalNote ? ` • ${row.approvalNote}` : ''}`
                        : isNegativePayoutStatus(row.status)
                          ? `${payoutStatusLabel(row.status)} by ${row.rejectedBy || '-'}${row.rejectedAt ? ` on ${formatDateDDMMYYYY(String(row.rejectedAt))}` : ''}${row.rejectionReason ? ` • ${row.rejectionReason}` : ''}`
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

      {cropSrc ? (
        <ImageCropDialog
          open
          imageSrc={cropSrc}
          aspect={placementCrop.aspect}
          subtitle={cropSubtitle}
          onClose={closeCropDialog}
          onComplete={handleCropComplete}
        />
      ) : null}

      {form.imageUrl ? (
        <ImagePreviewDialog
          open={imagePreviewOpen}
          src={toAbsoluteMediaUrl(form.imageUrl)}
          alt={placementCrop.label}
          title={`${placementCrop.label} · ${placementCrop.aspectLabel}`}
          aspectRatio={placementCrop.aspect}
          onClose={() => setImagePreviewOpen(false)}
        />
      ) : null}

      {confirmEditSave ? (
        <ConfirmDialog
          title="Save advertisement"
          message="Are you sure you want to save changes to this advertisement? This cannot be undone."
          confirmLabel="Confirm"
          variant="primary"
          loading={saving}
          onConfirm={() => void handleSave()}
          onCancel={() => setConfirmEditSave(false)}
        />
      ) : null}
    </ErrorBoundary>
  );
};
