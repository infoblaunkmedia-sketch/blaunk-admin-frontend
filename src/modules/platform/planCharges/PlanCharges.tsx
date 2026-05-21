import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { ProductPlanChargeRow, AdPlanChargeRow } from '../platform.types';
import { AD_PLAN_TYPES } from '../platform.types';
import { MARKETING_AD_PLAN_OPTIONS } from '../../../shared/constants/marketingAdPlans';
import {
  fetchProductPlanCharges,
  saveProductPlanCharges,
  fetchAdPlanCharges,
  saveAdPlanCharges,
} from '../platform.service';
import { onNumericInputKeyDown } from '../../../shared/utils/numericInput';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

const PRODUCT_PLAN_OPTIONS = [
  'Select',
  'Tour',
  'Cake',
  'Bgt',
  'Advertisement',
  'Boutique',
  'Garments',
  'Housing',
  'Computer',
  'Logistic',
  'Dial',
] as const;

type AdPlanOption = typeof AD_PLAN_TYPES[number] | 'Select';

function updateProductRow(
  rows: ProductPlanChargeRow[],
  idx: number,
  key: keyof ProductPlanChargeRow,
  val: string,
) {
  return rows.map((row, i) => {
    if (i !== idx) return row;
    if (key === 'name' || key === 'duration' || key === 'offer') return { ...row, [key]: val };
    return { ...row, [key]: parseFloat(val) || 0 };
  });
}

function updateAdRow(
  rows: AdPlanChargeRow[],
  idx: number,
  key: keyof AdPlanChargeRow,
  val: string,
) {
  return rows.map((row, i) => {
    if (i !== idx) return row;
    if (key === 'name' || key === 'duration') return { ...row, [key]: val };
    return { ...row, [key]: parseFloat(val) || 0 };
  });
}

export const PlanCharges: React.FC = () => {
  const [productConfig, setProductConfig] = React.useState({ productPlan: '', rows: [] as ProductPlanChargeRow[] });
  const [adConfig, setAdConfig] = React.useState({ adPlan: '', rows: [] as AdPlanChargeRow[] });
  const [editingSub, setEditingSub] = React.useState(false);
  const [editingAd, setEditingAd] = React.useState(false);
  const [savingSub, setSavingSub] = React.useState(false);
  const [savingAd, setSavingAd] = React.useState(false);

  React.useEffect(() => {
    fetchProductPlanCharges().then(setProductConfig);
    fetchAdPlanCharges().then(setAdConfig);
  }, []);

  const handleSaveSub = async () => {
    setSavingSub(true);
    try {
      await saveProductPlanCharges(productConfig);
      setEditingSub(false);
      toast.success('Product plan charges saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSavingSub(false);
    }
  };

  const handleSaveAd = async () => {
    setSavingAd(true);
    try {
      await saveAdPlanCharges(adConfig);
      setEditingAd(false);
      toast.success('Advertisement plan charges saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSavingAd(false);
    }
  };

  return (
    <ErrorBoundary>
      <PageHeader title="Plan Charges" subtitle="Manage subscription and advertisement pricing." />

      <SectionCard
        title="Plan Charges"
        className="mb-5"
        actions={
          editingSub ? (
            <div className="flex gap-2">
              <button type="button" disabled={savingSub} onClick={handleSaveSub}
                className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-60">
                {savingSub ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => { setEditingSub(false); fetchProductPlanCharges().then(setProductConfig); }}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setEditingSub(true)}
              className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              Edit
            </button>
          )
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Product Plan :</label>
          <select
            className={`${inputClass} max-w-[200px]`}
            value={productConfig.productPlan || 'Select'}
            disabled={!editingSub}
            onChange={(e) => setProductConfig((p) => ({ ...p, productPlan: e.target.value === 'Select' ? '' : e.target.value }))}
          >
            {PRODUCT_PLAN_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="w-10 px-3 py-2.5" />
                <th className="px-4 py-2.5 text-left font-bold">Plan</th>
                <th className="px-4 py-2.5 text-left font-bold">Duration</th>
                <th className="px-4 py-2.5 text-right font-bold">Subscription (in Rs.)</th>
                <th className="px-4 py-2.5 text-right font-bold">Renewal Fees (in Rs.)</th>
                <th className="px-4 py-2.5 text-right font-bold">Max. MRP (in Rs.)</th>
                <th className="px-4 py-2.5 text-left font-bold">Offer</th>
              </tr>
            </thead>
            <tbody>
              {productConfig.rows.map((plan, i) => (
                <tr key={plan.name} className={i % 2 === 0 ? 'bg-white' : 'bg-surface'}>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input type="checkbox" className="h-4 w-4 accent-primary" disabled={!editingSub} aria-label={`Select ${plan.name}`} />
                  </td>
                  <td className="border-b border-slate-100 px-4 py-2.5 font-bold text-primary">{plan.name}</td>
                  <td className="border-b border-slate-100 px-4 py-2.5 text-slate-700">{plan.duration}</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-right">
                    {editingSub ? (
                      <input type="number" min={0} className={`${inputClass} text-right`}
                        value={plan.subscription || ''} onKeyDown={onNumericInputKeyDown}
                        onChange={(e) => setProductConfig((p) => ({ ...p, rows: updateProductRow(p.rows, i, 'subscription', e.target.value) }))} />
                    ) : (
                      <span className="font-semibold">{plan.subscription.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-2 text-right">
                    {editingSub ? (
                      <input type="number" min={0} className={`${inputClass} text-right`}
                        value={plan.renewalFees || ''} onKeyDown={onNumericInputKeyDown}
                        onChange={(e) => setProductConfig((p) => ({ ...p, rows: updateProductRow(p.rows, i, 'renewalFees', e.target.value) }))} />
                    ) : (
                      <span className="font-semibold">{plan.renewalFees.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-2 text-right">
                    {editingSub ? (
                      <input type="number" min={0} className={`${inputClass} text-right`}
                        value={plan.maxMrp || ''} onKeyDown={onNumericInputKeyDown}
                        onChange={(e) => setProductConfig((p) => ({ ...p, rows: updateProductRow(p.rows, i, 'maxMrp', e.target.value) }))} />
                    ) : (
                      <span className="font-semibold">{plan.maxMrp.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-2.5 text-slate-700">
                    {editingSub ? (
                      <input className={inputClass} value={plan.offer}
                        onChange={(e) => setProductConfig((p) => ({ ...p, rows: updateProductRow(p.rows, i, 'offer', e.target.value) }))} />
                    ) : (
                      plan.offer
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="Advertisement Plan"
        actions={
          editingAd ? (
            <div className="flex gap-2">
              <button type="button" disabled={savingAd} onClick={handleSaveAd}
                className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-60">
                {savingAd ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => { setEditingAd(false); fetchAdPlanCharges().then(setAdConfig); }}
                className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setEditingAd(true)}
              className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              Edit
            </button>
          )
        }
      >
        <div className="mb-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
          {MARKETING_AD_PLAN_OPTIONS.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Advertisement Plan :</label>
          <select
            className={`${inputClass} max-w-[220px]`}
            value={adConfig.adPlan || 'Select'}
            disabled={!editingAd}
            onChange={(e) => {
              const v = e.target.value as AdPlanOption;
              setAdConfig((p) => ({ ...p, adPlan: v === 'Select' ? '' : v }));
            }}
          >
            <option value="Select">Select</option>
            {AD_PLAN_TYPES.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="w-10 px-3 py-2.5" />
                <th className="px-4 py-2.5 text-left font-bold">Plan</th>
                <th className="px-4 py-2.5 text-left font-bold">Duration</th>
                <th className="px-4 py-2.5 text-right font-bold">Basic Fees (in Rs.)</th>
                <th className="px-4 py-2.5 text-right font-bold">
                  <span className="block text-[10px] font-normal leading-tight">Blaunk Assurance Verified</span>
                  Basic Fees (in Rs.)
                </th>
              </tr>
            </thead>
            <tbody>
              {adConfig.rows.map((plan, i) => (
                <tr key={plan.name} className={i % 2 === 0 ? 'bg-white' : 'bg-surface'}>
                  <td className="border-b border-slate-100 px-3 py-2">
                    <input type="checkbox" className="h-4 w-4 accent-primary" disabled={!editingAd} aria-label={`Select ${plan.name}`} />
                  </td>
                  <td className="border-b border-slate-100 px-4 py-2.5 font-semibold text-slate-800">{plan.name}</td>
                  <td className="border-b border-slate-100 px-4 py-2.5 text-slate-700">{plan.duration}</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-right">
                    {editingAd ? (
                      <input type="number" min={0} className={`${inputClass} text-right`}
                        value={plan.basicFees || ''} onKeyDown={onNumericInputKeyDown}
                        onChange={(e) => setAdConfig((p) => ({ ...p, rows: updateAdRow(p.rows, i, 'basicFees', e.target.value) }))} />
                    ) : (
                      <span className="font-semibold">{plan.basicFees.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-2 text-right">
                    {editingAd ? (
                      <input type="number" min={0} className={`${inputClass} text-right`}
                        value={plan.assuranceFees || ''} onKeyDown={onNumericInputKeyDown}
                        onChange={(e) => setAdConfig((p) => ({ ...p, rows: updateAdRow(p.rows, i, 'assuranceFees', e.target.value) }))} />
                    ) : (
                      <span className="font-semibold">{plan.assuranceFees.toLocaleString()}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </ErrorBoundary>
  );
};
