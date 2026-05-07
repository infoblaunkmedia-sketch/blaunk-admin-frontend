import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { SubscriptionPlan, AdPlan } from '../platform.types';
import { fetchSubscriptionPlans, saveSubscriptionPlans, fetchAdPlans, saveAdPlans } from '../platform.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export const PlanCharges: React.FC = () => {
  const [subPlans, setSubPlans] = React.useState<SubscriptionPlan[]>([]);
  const [adPlans, setAdPlans] = React.useState<AdPlan[]>([]);
  const [editingSub, setEditingSub] = React.useState(false);
  const [editingAd, setEditingAd] = React.useState(false);
  const [savingSub, setSavingSub] = React.useState(false);
  const [savingAd, setSavingAd] = React.useState(false);

  React.useEffect(() => {
    fetchSubscriptionPlans().then(setSubPlans);
    fetchAdPlans().then(setAdPlans);
  }, []);

  const updateSub = (idx: number, key: 'mrp' | 'offerPrice', val: string) => {
    setSubPlans((p) => p.map((plan, i) =>
      i === idx ? { ...plan, [key]: parseFloat(val) || 0 } : plan,
    ));
  };

  const updateAd = (idx: number, val: string) => {
    setAdPlans((p) => p.map((plan, i) =>
      i === idx ? { ...plan, price: parseFloat(val) || 0 } : plan,
    ));
  };

  const handleSaveSub = async () => {
    setSavingSub(true);
    try {
      await saveSubscriptionPlans(subPlans);
      setEditingSub(false);
      toast.success('Subscription plans saved');
    } catch { toast.error('Save failed'); }
    finally { setSavingSub(false); }
  };

  const handleSaveAd = async () => {
    setSavingAd(true);
    try {
      await saveAdPlans(adPlans);
      setEditingAd(false);
      toast.success('Advertisement plans saved');
    } catch { toast.error('Save failed'); }
    finally { setSavingAd(false); }
  };

  return (
    <ErrorBoundary>
      <PageHeader title="Plan Charges" subtitle="Manage subscription and advertisement pricing." />

      {/* Subscription Plans */}
      <SectionCard
        title="Product Subscription Plans"
        className="mb-5"
        actions={
          editingSub ? (
            <div className="flex gap-2">
              <button type="button" disabled={savingSub} onClick={handleSaveSub}
                className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-60">
                {savingSub ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditingSub(false)}
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-4 py-2.5 text-left font-bold">Plan Name</th>
                <th className="px-4 py-2.5 text-right font-bold">MRP (₹)</th>
                <th className="px-4 py-2.5 text-right font-bold">Offer Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {subPlans.map((plan, i) => (
                <tr key={plan.name} className={i % 2 === 0 ? 'bg-white' : 'bg-surface'}>
                  <td className="border-b border-slate-100 px-4 py-2.5 font-bold text-primary">{plan.name}</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-right">
                    {editingSub ? (
                      <input type="number" min={0} step="0.01" className={`${inputClass} text-right`}
                        value={plan.mrp || ''} onChange={(e) => updateSub(i, 'mrp', e.target.value)} />
                    ) : (
                      <span className="font-semibold">₹{plan.mrp.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="border-b border-slate-100 px-4 py-2 text-right">
                    {editingSub ? (
                      <input type="number" min={0} step="0.01" className={`${inputClass} text-right`}
                        value={plan.offerPrice || ''} onChange={(e) => updateSub(i, 'offerPrice', e.target.value)} />
                    ) : (
                      <span className="font-semibold text-primary">₹{plan.offerPrice.toLocaleString()}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Advertisement Plans */}
      <SectionCard
        title="Advertisement Plans"
        actions={
          editingAd ? (
            <div className="flex gap-2">
              <button type="button" disabled={savingAd} onClick={handleSaveAd}
                className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-60">
                {savingAd ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditingAd(false)}
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
        <div className="overflow-x-auto">
          <table className="w-full min-w-[300px] border-collapse text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-4 py-2.5 text-left font-bold">Ad Type</th>
                <th className="px-4 py-2.5 text-right font-bold">Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {adPlans.map((plan, i) => (
                <tr key={plan.adType} className={i % 2 === 0 ? 'bg-white' : 'bg-surface'}>
                  <td className="border-b border-slate-100 px-4 py-2.5 font-semibold text-slate-800">{plan.adType}</td>
                  <td className="border-b border-slate-100 px-4 py-2 text-right">
                    {editingAd ? (
                      <input type="number" min={0} step="0.01" className={`${inputClass} text-right`}
                        value={plan.price || ''} onChange={(e) => updateAd(i, e.target.value)} />
                    ) : (
                      <span className="font-semibold">₹{plan.price.toLocaleString()}</span>
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
