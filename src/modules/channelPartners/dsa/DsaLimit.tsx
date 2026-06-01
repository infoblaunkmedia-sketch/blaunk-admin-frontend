import React from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../auth/useAuth';
import { fetchSliderSummary } from '../../marketing/marketing.service';
import { fetchDsaPayouts, saveDsaPayout } from '../../finance/finance.service';
import { fetchDsaRecords } from '../channelPartners.service';
import { fetchDsaLimitConfig } from '../../platform/platform.service';
import type { PaymentMode } from '../../finance/finance.types';
import { isPendingPayoutStatus, payoutStatusLabel } from '../../../shared/constants/payoutStatus';

const inputClass =
  'h-9 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';

function formatDisplayDate(iso: string): string {
  const s = String(iso || '').trim();
  if (!s) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return s;
}

function round2(n: number) {
  return Number(n.toFixed(2));
}

type DraftRow = {
  checked: boolean;
  mode: PaymentMode;
  txnRef: string;
  currencyType: 'Rs.' | '$';
  currencyPayin: string;
  currencyInr: string;
  calculatedLimit: string;
};

type HistoryRow = {
  id: string;
  date: string;
  dsaName: string;
  country: string;
  dsaCode: string;
  shareRatio: string;
  mode: string;
  txnRef: string;
  currencyType: string;
  currencyPayin: string;
  currencyInr: string;
  limit: string;
  approval: string;
};

type Props = {
  refreshKey?: number;
  onSaved?: () => void;
};

export const DsaLimit: React.FC<Props> = ({ refreshKey = 0, onSaved }) => {
  const { user } = useAuth();
  const dsaCode = String(user?.code || '').trim().toUpperCase();

  const [payinDate] = React.useState(formatDisplayDate(new Date().toISOString().slice(0, 10)));
  const [payin, setPayin] = React.useState('');
  const [ablBod, setAblBod] = React.useState('0');
  const [marginUsed, setMarginUsed] = React.useState('0');
  const [limitRs, setLimitRs] = React.useState('0');
  const [shareRatio, setShareRatio] = React.useState(30);
  const [dsaName, setDsaName] = React.useState(user?.name || '');
  const [country, setCountry] = React.useState('India');
  const [history, setHistory] = React.useState<HistoryRow[]>([]);
  const [draft, setDraft] = React.useState<DraftRow>({
    checked: true,
    mode: 'Cash',
    txnRef: '',
    currencyType: 'Rs.',
    currencyPayin: '',
    currencyInr: '',
    calculatedLimit: '',
  });
  const [currencyRate, setCurrencyRate] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [hasPending, setHasPending] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!dsaCode) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [summary, payouts, dsaRecords] = await Promise.all([
        fetchSliderSummary({ dsaCode }),
        fetchDsaPayouts({ dsaCode, limit: 50 }),
        fetchDsaRecords(),
      ]);

      const profile = dsaRecords.find((d) => d.dsaCode.toUpperCase() === dsaCode);
      if (profile) {
        setDsaName(profile.companyName || profile.ownerName || '');
        setCountry(profile.country || 'India');
        setShareRatio(Number(profile.shareRatio) || 30);
      }

      setAblBod(String(summary.totalMargin ?? 0));
      setMarginUsed(String(summary.marginUsed ?? 0));

      const pending = payouts.some((p) => isPendingPayoutStatus(p.status));
      setHasPending(pending);

      setHistory(
        payouts.map((p) => {
          const sr = Number(p.shareRatio) || 30;
          return {
            id: p.id,
            date: formatDisplayDate(p.submissionDate) || '',
            dsaName: p.dsaName || profile?.companyName || '-',
            country: p.country || profile?.country || '-',
            dsaCode: p.dsaCode,
            shareRatio: `${sr}:${100 - sr}`,
            mode: p.mode || '-',
            txnRef: p.transactionNumber || '',
            currencyType: p.currency === 'USD' ? '$' : 'Rs.',
            currencyPayin: String(p.submittedAmount || 0),
            currencyInr: String(p.currencyInr || 0),
            limit: String(p.calculatedLimit || 0),
            approval: payoutStatusLabel(p.status),
          };
        }),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load DSA limit data.');
    } finally {
      setLoading(false);
    }
  }, [dsaCode]);

  React.useEffect(() => {
    void load();
  }, [load, refreshKey]);

  React.useEffect(() => {
    const pay = Number(payin) || 0;
    const bod = Number(ablBod) || 0;
    const used = Number(marginUsed) || 0;
    setLimitRs(String(Math.max(0, round2(pay + bod - used))));
  }, [payin, ablBod, marginUsed]);

  React.useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (draft.currencyType === 'Rs.') {
        if (!cancelled) setCurrencyRate(1);
        return;
      }
      const config = await fetchDsaLimitConfig();
      const entry = config.currencyRates.find((r) => r.currency === 'USD');
      if (!cancelled) setCurrencyRate(entry?.rateToInr ?? 1);
    })();
    return () => {
      cancelled = true;
    };
  }, [draft.currencyType]);

  React.useEffect(() => {
    const submitted = Number(draft.currencyPayin) || 0;
    const inr = round2(submitted * currencyRate);
    const calc = round2(inr + (inr * shareRatio) / 100);
    setDraft((d) => ({
      ...d,
      currencyInr: submitted ? String(inr) : '',
      calculatedLimit: submitted ? String(calc) : '',
    }));
  }, [draft.currencyPayin, currencyRate, shareRatio]);

  React.useEffect(() => {
    if (draft.currencyType !== 'Rs.') return;
    setDraft((d) => (d.currencyPayin === payin ? d : { ...d, currencyPayin: payin }));
  }, [payin, draft.currencyType]);

  const updateDraft = (patch: Partial<DraftRow>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      if (next.currencyType === 'Rs.' && patch.currencyPayin !== undefined) {
        setPayin(String(patch.currencyPayin).replace(/\D/g, ''));
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!dsaCode) {
      toast.error('DSA code not found.');
      return;
    }
    if (hasPending) {
      toast.warn('A pending submission already exists. Wait for approval before submitting again.');
      return;
    }
    if (!draft.checked) {
      toast.warn('Select the submission row to save.');
      return;
    }
    const submittedAmount = Number(draft.currencyPayin) || 0;
    if (submittedAmount <= 0) {
      toast.error('Enter pay-in amount.');
      return;
    }
    if (!draft.txnRef.trim()) {
      toast.error('Txn Ref No. is required.');
      return;
    }

    const newAmount = Number(payin) || submittedAmount;
    const bodBalance = Number(ablBod) || 0;
    const usedValue = Number(marginUsed) || 0;
    const currencyInr = Number(draft.currencyInr) || round2(submittedAmount * currencyRate);
    const calculatedLimit = Number(draft.calculatedLimit) || round2(currencyInr + (currencyInr * shareRatio) / 100);

    setSaving(true);
    try {
      await saveDsaPayout({
        id: '',
        dsaCode,
        dsaName,
        country,
        submittedAmount,
        currency: draft.currencyType === '$' ? 'USD' : 'INR',
        currencyInr,
        shareRatio,
        calculatedLimit,
        mode: draft.mode,
        transactionNumber: draft.txnRef.trim(),
        submissionDate: new Date().toISOString().slice(0, 10),
        status: 'PENDING',
        newAmount,
        bodBalance,
        usedValue,
      });
      toast.success('Submission sent for approval. Media Upload margin updates after approval.');
      setPayin('');
      setDraft({
        checked: true,
        mode: 'Cash',
        txnRef: '',
        currencyType: 'Rs.',
        currencyPayin: '',
        currencyInr: '',
        calculatedLimit: '',
      });
      await load();
      onSaved?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const shareLabel = `${shareRatio}:${100 - shareRatio}`;
  const displayRows: Array<{ kind: 'draft' | 'history'; key: string; data: DraftRow | HistoryRow }> = [
    ...(hasPending ? [] : [{ kind: 'draft' as const, key: 'draft', data: draft }]),
    ...history.map((h) => ({ kind: 'history' as const, key: h.id, data: h })),
  ];

  return (
    <>
      <h2 className="text-4xl font-bold text-primary">Limit</h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-700">Date</span>
          <input type="text" readOnly value={payinDate} className={`${inputClass} bg-slate-100`} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-700">Pay-in</span>
          <input
            type="text"
            value={payin}
            onChange={(e) => setPayin(e.target.value.replace(/\D/g, ''))}
            className={inputClass}
            disabled={hasPending || loading}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-700">ABL-BOD</span>
          <input type="text" readOnly value={ablBod} className={`${inputClass} bg-slate-100`} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-700">Margin Used</span>
          <input type="text" readOnly value={marginUsed} className={`${inputClass} bg-slate-100`} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-700">Limit (Rs.)</span>
          <input type="text" readOnly value={limitRs} className={`${inputClass} bg-slate-100`} />
        </label>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <h3 className="text-4xl font-bold text-primary">DSA Details</h3>
        <button
          type="button"
          disabled={saving || loading || hasPending}
          onClick={() => void handleSave()}
          className="rounded-sm bg-primary px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="overflow-x-auto rounded-sm border border-slate-300 bg-white shadow-sm">
        <table className="min-w-[1700px] w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-primary text-white">
              <th className="w-10 min-w-[2.5rem] border border-white/25 px-1 py-2 text-center font-bold">&nbsp;</th>
              <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Date</th>
              <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">DSA Name</th>
              <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Country</th>
              <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">DSA Code</th>
              <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Sharing Ratio</th>
              <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Mode</th>
              <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Txn Ref No.</th>
              <th className="min-w-[8rem] border border-white/25 px-2 py-2 font-bold">Currency-Payin</th>
              <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Currency-INR</th>
              <th className="min-w-[6rem] border border-white/25 px-2 py-2 font-bold">Limit</th>
              <th className="min-w-[7rem] border border-white/25 px-2 py-2 font-bold">Approval</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-sm text-slate-500">
                  Loading…
                </td>
              </tr>
            ) : displayRows.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-8 text-center text-sm text-slate-500">
                  No submissions yet.
                </td>
              </tr>
            ) : (
              displayRows.map(({ kind, key, data }) => {
                if (kind === 'history') {
                  const row = data as HistoryRow;
                  const roClass = `${inputClass} cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500`;
                  return (
                    <tr key={key} className="border-t border-slate-200 bg-white">
                      <td className="border border-slate-200 px-1 py-1.5 text-center">
                        <input type="checkbox" checked={false} disabled className="h-4 w-4 accent-primary" />
                      </td>
                      <td className="border border-slate-200 px-2 py-1.5 font-semibold text-slate-800">{row.date}</td>
                      <td className="border border-slate-200 px-2 py-1.5 text-slate-700">{row.dsaName}</td>
                      <td className="border border-slate-200 px-2 py-1.5 text-slate-700">{row.country}</td>
                      <td className="border border-slate-200 px-2 py-1.5 text-slate-700">{row.dsaCode}</td>
                      <td className="border border-slate-200 px-2 py-1.5 text-slate-700">{row.shareRatio}</td>
                      <td className="border border-slate-200 p-1"><input className={roClass} readOnly value={row.mode} /></td>
                      <td className="border border-slate-200 p-1"><input className={roClass} readOnly value={row.txnRef || '-'} /></td>
                      <td className="border border-slate-200 p-1">
                        <div className="flex gap-1">
                          <input className={`${roClass} w-20`} readOnly value={row.currencyType} />
                          <input className={roClass} readOnly value={row.currencyPayin} />
                        </div>
                      </td>
                      <td className="border border-slate-200 p-1"><input className={roClass} readOnly value={row.currencyInr} /></td>
                      <td className="border border-slate-200 p-1"><input className={roClass} readOnly value={row.limit} /></td>
                      <td className="border border-slate-200 p-1"><input className={roClass} readOnly value={row.approval} /></td>
                    </tr>
                  );
                }

                const row = data as DraftRow;
                const editableRowClass = [
                  inputClass,
                  row.checked ? '' : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500',
                ].join(' ');

                return (
                  <tr key={key} className="border-t border-slate-200 bg-white">
                    <td className="border border-slate-200 px-1 py-1.5 text-center">
                      <input
                        type="checkbox"
                        checked={row.checked}
                        onChange={(e) => updateDraft({ checked: e.target.checked })}
                        className="h-4 w-4 accent-primary"
                      />
                    </td>
                    <td className="border border-slate-200 px-2 py-1.5 font-semibold text-slate-800">{payinDate}</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-700">{dsaName || '-'}</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-700">{country}</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-700">{dsaCode || '-'}</td>
                    <td className="border border-slate-200 px-2 py-1.5 text-slate-700">{shareLabel}</td>
                    <td className="border border-slate-200 p-1">
                      <select
                        className={editableRowClass}
                        value={row.mode}
                        onChange={(e) => updateDraft({ mode: e.target.value as PaymentMode })}
                        disabled={!row.checked}
                      >
                        <option value="Cash">Cash</option>
                        <option value="QR">QR</option>
                        <option value="UPI">UPI</option>
                        <option value="Swift">Swift</option>
                        <option value="RTGS">RTGS</option>
                        <option value="NEFT">NEFT</option>
                      </select>
                    </td>
                    <td className="border border-slate-200 p-1">
                      <input
                        type="text"
                        value={row.txnRef}
                        onChange={(e) => updateDraft({ txnRef: e.target.value })}
                        className={editableRowClass}
                        disabled={!row.checked}
                      />
                    </td>
                    <td className="border border-slate-200 p-1">
                      <div className="flex gap-1">
                        <select
                          className={`${editableRowClass} w-20`}
                          value={row.currencyType}
                          onChange={(e) => updateDraft({ currencyType: e.target.value as 'Rs.' | '$' })}
                          disabled={!row.checked}
                        >
                          <option value="Rs.">Rs.</option>
                          <option value="$">$</option>
                        </select>
                        <input
                          type="text"
                          value={row.currencyPayin}
                          onChange={(e) => updateDraft({ currencyPayin: e.target.value.replace(/[^\d.]/g, '') })}
                          className={editableRowClass}
                          disabled={!row.checked}
                        />
                      </div>
                    </td>
                    <td className="border border-slate-200 p-1">
                      <input type="text" readOnly value={row.currencyInr} className={`${inputClass} bg-slate-100`} />
                    </td>
                    <td className="border border-slate-200 p-1">
                      <input type="text" readOnly value={row.calculatedLimit} className={`${inputClass} bg-slate-100`} />
                    </td>
                    <td className="border border-slate-200 p-1">
                      <input type="text" readOnly value="Pending" className={`${inputClass} bg-slate-100`} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
