import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { ApprovalWorkflow } from '../../../shared/components/ApprovalWorkflow';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { fetchDsaLimitConfig, saveDsaLimitConfig } from '../platform.service';
import { fetchPendingPayouts, updatePayoutStatusById } from '../../finance/finance.service';
import type { PayoutStatus } from '../../../shared/constants/payoutStatus';
import type { DsaLimitConfig, CurrencyRate } from '../platform.types';
import type { DsaPayoutSubmission } from '../../finance/finance.types';
import { onNumericInputKeyDown } from '../../../shared/utils/numericInput';
import { formatDateDDMMYYYY } from '../../../shared/utils/dateFormat';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

type ActiveView = 'config' | 'queue';

export const DsaLimits: React.FC = () => {
  const [view, setView] = React.useState<ActiveView>('queue');
  const [config, setConfig] = React.useState<DsaLimitConfig>({ globalCreditLimit: 0, currencyRates: [] });
  const [pending, setPending] = React.useState<DsaPayoutSubmission[]>([]);
  const [loadingQueue, setLoadingQueue] = React.useState(true);
  const [savingConfig, setSavingConfig] = React.useState(false);

  React.useEffect(() => {
    fetchDsaLimitConfig().then(setConfig);
  }, []);

  const loadQueue = React.useCallback(async () => {
    setLoadingQueue(true);
    setPending(await fetchPendingPayouts());
    setLoadingQueue(false);
  }, []);

  React.useEffect(() => { loadQueue(); }, [loadQueue]);

  const handleStatusChange = async (id: string, status: PayoutStatus, note: string) => {
    await updatePayoutStatusById(id, status, note);
    loadQueue();
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await saveDsaLimitConfig(config);
      toast.success('DSA limit config saved');
    } catch { toast.error('Save failed'); }
    finally { setSavingConfig(false); }
  };

  const updateRate = (idx: number, key: keyof CurrencyRate, val: string) => {
    setConfig((p) => {
      const rates = [...p.currencyRates];
      rates[idx] = { ...rates[idx], [key]: key === 'rateToInr' ? parseFloat(val) || 0 : val };
      return { ...p, currencyRates: rates };
    });
  };

  const approvalColumns = [
    { header: 'Entry Date', render: (r: DsaPayoutSubmission) => formatDateDDMMYYYY(r.submissionDate) || '—' },
    { header: 'DSA Code', render: (r: DsaPayoutSubmission) => <span className="font-bold text-primary">{r.dsaCode}</span> },
    { header: 'Country', render: (r: DsaPayoutSubmission) => r.country },
    { header: 'Mode', render: (r: DsaPayoutSubmission) => r.mode },
    { header: 'Curr', render: (r: DsaPayoutSubmission) => r.currency },
    { header: 'Amount Pay-in', render: (r: DsaPayoutSubmission) => r.submittedAmount.toLocaleString() },
    { header: 'Share %', render: (r: DsaPayoutSubmission) => `${r.shareRatio}:${100 - r.shareRatio}` },
    { header: 'Limit (₹)', render: (r: DsaPayoutSubmission) => <span className="font-bold text-amber-700">₹{r.calculatedLimit.toLocaleString()}</span> },
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="DSA Limits" subtitle="Cheker: approve pending DSA payout submissions and configure limit parameters." />

      {/* Tab toggle */}
      <div className="mb-5 flex gap-2">
        {(['queue', 'config'] as ActiveView[]).map((v) => (
          <button key={v} type="button" onClick={() => setView(v)}
            className={[
              'rounded-lg border px-4 py-1.5 text-sm font-semibold transition',
              view === v ? 'border-primary bg-primary text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
            ].join(' ')}>
            {v === 'queue' ? `Approval Queue${pending.length > 0 ? ` (${pending.length})` : ''}` : 'Config'}
          </button>
        ))}
      </div>

      {view === 'queue' && (
        <ApprovalWorkflow
          items={pending as (DsaPayoutSubmission & { id: string; status: string })[]}
          columns={approvalColumns as Parameters<typeof ApprovalWorkflow>[0]['columns']}
          onStatusChange={handleStatusChange}
          loading={loadingQueue}
        />
      )}

      {view === 'config' && (
        <div className="flex flex-col gap-5">
          <SectionCard title="Global Credit Limit">
            <FormField label="Global Credit Limit (₹)">
              <input type="number" min={0} className={`${inputClass} max-w-xs`}
                value={config.globalCreditLimit || ''}
                onKeyDown={onNumericInputKeyDown}
                onChange={(e) => setConfig((p) => ({ ...p, globalCreditLimit: parseFloat(e.target.value) || 0 }))} />
            </FormField>
          </SectionCard>

          <SectionCard title="Currency Conversion Rates"
            actions={
              <button type="button" disabled={savingConfig} onClick={handleSaveConfig}
                className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary-dark disabled:opacity-60">
                {savingConfig ? 'Saving…' : 'Save Rates'}
              </button>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] border-collapse text-sm">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="px-4 py-2.5 text-left font-bold">Country</th>
                    <th className="px-4 py-2.5 text-left font-bold">Currency Code</th>
                    <th className="px-4 py-2.5 text-left font-bold">1 Unit = ₹ (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {config.currencyRates.map((rate, i) => (
                    <tr key={rate.country} className={i % 2 === 0 ? 'bg-white' : 'bg-surface'}>
                      <td className="border-b border-slate-100 px-4 py-2.5 font-semibold text-slate-800">{rate.country}</td>
                      <td className="border-b border-slate-100 px-4 py-2">
                        <input className={inputClass} value={rate.currency}
                          onChange={(e) => updateRate(i, 'currency', e.target.value)} />
                      </td>
                      <td className="border-b border-slate-100 px-4 py-2">
                        <input type="number" min={0} step="0.01" className={inputClass}
                          value={rate.rateToInr || ''}
                          onKeyDown={onNumericInputKeyDown}
                          onChange={(e) => updateRate(i, 'rateToInr', e.target.value)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}
    </ErrorBoundary>
  );
};
