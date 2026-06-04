import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { useAuth } from '../../../auth/useAuth';
import { fetchSliderSummary } from '../../marketing/marketing.service';
import { fetchDsaPayouts, saveDsaPayout } from '../../finance/finance.service';
import { fetchDsaRecords } from '../channelPartners.service';
import type { DsaPayoutSubmission, PaymentMode } from '../../finance/finance.types';
import { isPendingPayoutStatus, payoutStatusLabel } from '../../../shared/constants/payoutStatus';
import { formatDateDDMMYYYY } from '../../../shared/utils/dateFormat';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper';
import { SectionCard } from '../../../shared/components/SectionCard';
import { payoutCheckerLabel } from '../../finance/dsaPayouts/payoutChecker';

const inputClass =
  'h-9 w-full min-w-[5rem] rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';

const disabledFieldClass =
  `${inputClass} cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500`;

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

type DsaLimitTableRow = {
  id: string;
  isDraft: boolean;
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
  checker: string;
  draft?: DraftRow;
};

type Props = {
  refreshKey?: number;
  onSaved?: () => void;
};

export const DsaLimit: React.FC<Props> = ({ refreshKey = 0, onSaved }) => {
  const { user } = useAuth();
  const dsaCode = String(user?.code || '').trim().toUpperCase();

  const [payinDate] = React.useState(formatDateDDMMYYYY(new Date().toISOString().slice(0, 10)));
  const [payin, setPayin] = React.useState('');
  const [ablBod, setAblBod] = React.useState('0');
  const [marginUsed, setMarginUsed] = React.useState('0');
  const [limitRs, setLimitRs] = React.useState('0');
  const [shareRatio, setShareRatio] = React.useState(30);
  const [dsaName, setDsaName] = React.useState(user?.name || '');
  const [country, setCountry] = React.useState('India');
  const [tableRows, setTableRows] = React.useState<DsaLimitTableRow[]>([]);
  const [draft, setDraft] = React.useState<DraftRow>({
    checked: true,
    mode: 'Cash',
    txnRef: '',
    currencyType: 'Rs.',
    currencyPayin: '',
    currencyInr: '',
    calculatedLimit: '',
  });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [hasPending, setHasPending] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!dsaCode) {
      setLoading(false);
      setTableRows([]);
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
      const srLabel = `${Number(profile?.shareRatio) || shareRatio}:${100 - (Number(profile?.shareRatio) || shareRatio)}`;

      const historyRows: DsaLimitTableRow[] = payouts.map((p) => {
        const sr = Number(p.shareRatio) || 30;
        return {
          id: p.id,
          isDraft: false,
          date: formatDateDDMMYYYY(p.submissionDate) || '',
          dsaName: p.dsaName || profile?.companyName || '-',
          country: p.country || profile?.country || '-',
          dsaCode: p.dsaCode,
          shareRatio: `${sr}:${100 - sr}`,
          mode: p.mode || '-',
          txnRef: p.transactionNumber || '',
          currencyType: p.currency === 'USD' ? '$' : 'Rs.',
          currencyPayin: String(p.submittedAmount || 0),
          currencyInr: isPendingPayoutStatus(p.status) && p.currencyInr == null ? '' : String(p.currencyInr ?? 0),
          limit: isPendingPayoutStatus(p.status) && p.calculatedLimit == null ? '' : String(p.calculatedLimit ?? 0),
          approval: payoutStatusLabel(p.status),
          checker: payoutCheckerLabel(p),
        };
      });

      setTableRows((prev) => {
        if (pending) return historyRows;
        const currentDraft = prev.find((r) => r.isDraft)?.draft ?? draft;
        const draftRow: DsaLimitTableRow = {
          id: 'draft',
          isDraft: true,
          date: payinDate,
          dsaName: dsaName || profile?.companyName || '-',
          country: profile?.country || country,
          dsaCode,
          shareRatio: srLabel,
          mode: currentDraft.mode,
          txnRef: currentDraft.txnRef,
          currencyType: currentDraft.currencyType,
          currencyPayin: currentDraft.currencyPayin,
          currencyInr: currentDraft.currencyInr,
          limit: currentDraft.calculatedLimit,
          approval: 'Pending',
          checker: '-',
          draft: currentDraft,
        };
        return [draftRow, ...historyRows];
      });
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

  const updateDraft = React.useCallback((patch: Partial<DraftRow>) => {
    setDraft((d) => {
      const next = { ...d, ...patch };
      setTableRows((rows) =>
        rows.map((r) =>
          r.isDraft
            ? {
                ...r,
                draft: next,
                mode: next.mode,
                txnRef: next.txnRef,
                currencyType: next.currencyType,
                currencyPayin: next.currencyPayin,
                currencyInr: next.currencyInr,
                limit: next.calculatedLimit,
              }
            : r,
        ),
      );
      return next;
    });
  }, []);

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

    setSaving(true);
    try {
      await saveDsaPayout({
        id: '',
        dsaCode,
        dsaName,
        country,
        submittedAmount,
        currency: draft.currencyType === '$' ? 'USD' : 'INR',
        currencyInr: 0,
        shareRatio,
        calculatedLimit: 0,
        mode: draft.mode,
        transactionNumber: draft.txnRef.trim(),
        submissionDate: new Date().toISOString().slice(0, 10),
        status: 'PENDING',
        newAmount,
        bodBalance,
        usedValue,
      } as DsaPayoutSubmission);
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

  const columns = React.useMemo((): TableColumn<DsaLimitTableRow>[] => [
    {
      name: '',
      width: '48px',
      cell: (row) => (
        <input
          type="checkbox"
          checked={row.isDraft ? !!row.draft?.checked : false}
          disabled={!row.isDraft}
          onChange={(e) => row.isDraft && updateDraft({ checked: e.target.checked })}
          className="h-4 w-4 accent-primary"
        />
      ),
    },
    {
      name: 'Date',
      selector: (row) => row.date,
      cell: (row) => <span className="whitespace-nowrap font-semibold text-slate-800">{row.date}</span>,
      sortable: true,
      minWidth: '6.5rem',
    },
    { name: 'DSA Name', selector: (row) => row.dsaName, sortable: true, minWidth: '7rem' },
    { name: 'Country', selector: (row) => row.country, sortable: true, minWidth: '5.5rem' },
    {
      name: 'DSA Code',
      selector: (row) => row.dsaCode,
      cell: (row) => <span className="uppercase">{row.dsaCode}</span>,
      sortable: true,
      minWidth: '6rem',
    },
    { name: 'Sharing Ratio', selector: (row) => row.shareRatio, minWidth: '6.5rem' },
    {
      name: 'Mode',
      cell: (row) => {
        if (!row.isDraft) {
          return <input className={disabledFieldClass} readOnly value={row.mode} />;
        }
        const d = row.draft!;
        const editableClass = [
          inputClass,
          d.checked ? '' : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500',
        ].join(' ');
        return (
          <select
            className={editableClass}
            value={d.mode}
            onChange={(e) => updateDraft({ mode: e.target.value as PaymentMode })}
            disabled={!d.checked}
          >
            <option value="Cash">Cash</option>
            <option value="QR">QR</option>
            <option value="UPI">UPI</option>
            <option value="Swift">Swift</option>
            <option value="RTGS">RTGS</option>
            <option value="NEFT">NEFT</option>
          </select>
        );
      },
      minWidth: '6.5rem',
    },
    {
      name: 'Txn Ref No.',
      cell: (row) => {
        if (!row.isDraft) {
          return <input className={disabledFieldClass} readOnly value={row.txnRef || '-'} />;
        }
        const d = row.draft!;
        return (
          <input
            type="text"
            value={d.txnRef}
            onChange={(e) => updateDraft({ txnRef: e.target.value })}
            className={d.checked ? inputClass : disabledFieldClass}
            disabled={!d.checked}
          />
        );
      },
      minWidth: '7.5rem',
    },
    {
      name: 'Currency',
      cell: (row) => {
        if (!row.isDraft) {
          return <input className={`${disabledFieldClass} max-w-[5rem]`} readOnly value={row.currencyType} />;
        }
        const d = row.draft!;
        return (
          <select
            className={d.checked ? inputClass : disabledFieldClass}
            value={d.currencyType}
            onChange={(e) => updateDraft({ currencyType: e.target.value as 'Rs.' | '$' })}
            disabled={!d.checked}
          >
            <option value="Rs.">Rs.</option>
            <option value="$">$</option>
          </select>
        );
      },
      minWidth: '5.5rem',
    },
    {
      name: 'Amount-payin',
      cell: (row) => {
        if (!row.isDraft) {
          return <input className={disabledFieldClass} readOnly value={row.currencyPayin} />;
        }
        const d = row.draft!;
        return (
          <input
            type="text"
            value={d.currencyPayin}
            onChange={(e) => updateDraft({ currencyPayin: e.target.value.replace(/[^\d.]/g, '') })}
            className={d.checked ? inputClass : disabledFieldClass}
            disabled={!d.checked}
          />
        );
      },
      minWidth: '7.5rem',
    },
    {
      name: 'Currency-INR',
      cell: (row) => (
        <input
          className={disabledFieldClass}
          readOnly
          disabled
          value={row.isDraft ? row.draft?.currencyInr ?? '' : row.currencyInr}
        />
      ),
      minWidth: '7.5rem',
    },
    {
      name: 'Limit',
      cell: (row) => (
        <input
          className={disabledFieldClass}
          readOnly
          disabled
          value={row.isDraft ? row.draft?.calculatedLimit ?? '' : row.limit}
        />
      ),
      minWidth: '7rem',
    },
    {
      name: 'Approval',
      cell: (row) => (
        <input className={disabledFieldClass} readOnly value={row.approval} />
      ),
      minWidth: '8rem',
    },
    {
      name: 'Checker',
      selector: (row) => row.checker,
      cell: (row) => <span className="font-semibold text-slate-800">{row.checker}</span>,
      sortable: true,
      minWidth: '6rem',
    },
  ], [updateDraft]);

  return (
    <div className="flex flex-col gap-4">
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
          <input
            type="text"
            value={ablBod}
            onChange={(e) => setAblBod(e.target.value.replace(/[^\d.]/g, ''))}
            className={inputClass}
            disabled={hasPending || loading}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-700">Margin Used</span>
          <input
            type="text"
            value={marginUsed}
            onChange={(e) => setMarginUsed(e.target.value.replace(/[^\d.]/g, ''))}
            className={inputClass}
            disabled={hasPending || loading}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-slate-700">Limit (Rs.)</span>
          <input type="text" readOnly value={limitRs} className={`${inputClass} bg-slate-100`} />
        </label>
      </div>

      <div className="flex items-end justify-between gap-3">
        <h2 className="text-4xl font-bold text-primary">DSA Details</h2>
        <button
          type="button"
          disabled={saving || loading || hasPending}
          onClick={() => void handleSave()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <SectionCard title="" contentClassName="p-0 overflow-hidden">
        <DataTableWrapper
          columns={columns}
          data={tableRows}
          loading={loading}
          searchable={false}
          className="!rounded-none !border-0 !shadow-none"
        />
      </SectionCard>
    </div>
  );
};
