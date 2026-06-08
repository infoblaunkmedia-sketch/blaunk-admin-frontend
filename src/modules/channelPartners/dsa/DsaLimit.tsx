import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { useAuth } from '../../../auth/useAuth';
import { fetchSliderSummary } from '../../marketing/marketing.service';
import { fetchDsaPayouts, saveDsaPayout } from '../../finance/finance.service';
import { fetchDsaRecords } from '../channelPartners.service';
import type { DsaPayoutSubmission, PaymentMode } from '../../finance/finance.types';
import {
  isPendingPayoutStatus,
  normalizePayoutStatus,
  payoutStatusLabel,
  type PayoutStatus,
} from '../../../shared/constants/payoutStatus';
import { formatDateDDMMYYYY } from '../../../shared/utils/dateFormat';
import { CurrencySelect } from '../../../shared/components/CurrencySelect';
import { useCountries } from '../../../shared/hooks/useCountries';
import { formatDsaPayinAmount, formatInrAmount, normalizeStoredCurrency } from '../../../shared/utils/dsaCurrencyFormat';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper';
import { SectionCard } from '../../../shared/components/SectionCard';
import { payoutCheckerDate, payoutCheckerId } from '../../finance/dsaPayouts/payoutChecker';

const inputClass =
  'h-9 w-full min-w-[5rem] rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';

const disabledFieldClass =
  `${inputClass} cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500`;

function rowLimitDisplay(limit: string): string {
  const lim = Number(limit) || 0;
  if (lim <= 0) return '';
  return String(lim);
}

function payoutInrDisplay(p: DsaPayoutSubmission): string {
  if (p.currencyInr != null && p.currencyInr > 0) return formatInrAmount(p.currencyInr);
  return isPendingPayoutStatus(p.status) ? '' : formatInrAmount(p.currencyInr ?? 0);
}

type DraftRow = {
  checked: boolean;
  mode: PaymentMode;
  txnRef: string;
  currencyCode: string;
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
  currencyCode: string;
  currencyPayin: string;
  currencyInr: string;
  limit: string;
  approval: string;
  status: PayoutStatus;
  remark: string;
  checkerDate: string;
  checkerId: string;
  draft?: DraftRow;
};

type StatusTab = 'new' | 'approved' | 'rejected';

const STATUS_TABS: Array<{ id: StatusTab; label: string }> = [
  { id: 'new', label: 'New' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
];

type Props = {
  refreshKey?: number;
  onSaved?: () => void;
};

export const DsaLimit: React.FC<Props> = ({ refreshKey = 0, onSaved }) => {
  const { user } = useAuth();
  const { countries } = useCountries();
  const dsaCode = String(user?.code || '').trim().toUpperCase();

  const [availableBalance, setAvailableBalance] = React.useState('0');
  const [marginUsed, setMarginUsed] = React.useState('0');
  const [statusTab, setStatusTab] = React.useState<StatusTab>('new');
  const [shareRatio, setShareRatio] = React.useState(30);
  const [dsaName, setDsaName] = React.useState(user?.name || '');
  const [country, setCountry] = React.useState('India');
  const [tableRows, setTableRows] = React.useState<DsaLimitTableRow[]>([]);
  const [draft, setDraft] = React.useState<DraftRow>({
    checked: true,
    mode: 'Cash',
    txnRef: '',
    currencyCode: 'INR',
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

      setAvailableBalance(String(Number(summary.availableMargin ?? 0)));
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
          currencyCode: normalizeStoredCurrency(p.currency || 'INR'),
          currencyPayin: String(p.submittedAmount || 0),
          currencyInr: payoutInrDisplay(p),
          limit: isPendingPayoutStatus(p.status)
            ? (p.calculatedLimit == null || Number(p.calculatedLimit) <= 0 ? '' : formatInrAmount(p.calculatedLimit))
            : formatInrAmount(p.calculatedLimit ?? 0),
          approval: payoutStatusLabel(p.status),
          status: normalizePayoutStatus(p.status),
          remark: p.rejectionReason || '',
          checkerDate: payoutCheckerDate(p),
          checkerId: payoutCheckerId(p),
        };
      });

      setTableRows((prev) => {
        const rows = [...historyRows];
        if (!pending) {
          const currentDraft = prev.find((r) => r.isDraft)?.draft ?? draft;
          const draftRow: DsaLimitTableRow = {
            id: 'draft',
            isDraft: true,
            date: formatDateDDMMYYYY(new Date().toISOString().slice(0, 10)),
            dsaName: dsaName || profile?.companyName || '-',
            country: profile?.country || country,
            dsaCode,
            shareRatio: srLabel,
            mode: currentDraft.mode,
            txnRef: currentDraft.txnRef,
            currencyCode: currentDraft.currencyCode,
            currencyPayin: currentDraft.currencyPayin,
            currencyInr: currentDraft.currencyInr,
            limit: currentDraft.calculatedLimit,
            approval: 'Pending',
            status: 'PENDING',
            remark: '',
            checkerDate: '-',
            checkerId: '-',
            draft: currentDraft,
          };
          rows.unshift(draftRow);
        }
        return rows;
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

  const rowMatchesTab = React.useCallback((row: DsaLimitTableRow, tab: StatusTab): boolean => {
    if (tab === 'new') return row.isDraft || isPendingPayoutStatus(row.status);
    if (tab === 'approved') return !row.isDraft && row.status === 'APPROVED';
    if (tab === 'rejected') return !row.isDraft && row.status === 'REJECTED';
    return false;
  }, []);

  const filteredTableRows = React.useMemo(
    () => tableRows.filter((row) => rowMatchesTab(row, statusTab)),
    [rowMatchesTab, statusTab, tableRows],
  );

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
                currencyCode: next.currencyCode,
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
      toast.error('Transaction Ref No. is required.');
      return;
    }

    const newAmount = submittedAmount;
    const bodBalance = Number(availableBalance) || 0;
    const usedValue = Number(marginUsed) || 0;

    setSaving(true);
    try {
      await saveDsaPayout({
        id: '',
        dsaCode,
        dsaName,
        country,
        submittedAmount,
        currency: draft.currencyCode || 'INR',
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
      setDraft({
        checked: true,
        mode: 'Cash',
        txnRef: '',
        currencyCode: 'INR',
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
      name: 'Sharing Ratio',
      selector: (row) => row.shareRatio,
      minWidth: '7.5rem',
      width: '7.5rem',
    },
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
      name: 'Transaction Ref No.',
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
      minWidth: '10rem',
      width: '10rem',
    },
    {
      name: 'Payin Currency',
      cell: (row) => {
        if (!row.isDraft) {
          return (
            <input
              className={`${disabledFieldClass} max-w-[6.5rem]`}
              readOnly
              value={row.currencyCode}
            />
          );
        }
        const d = row.draft!;
        return (
          <CurrencySelect
            className={d.checked ? undefined : disabledFieldClass}
            value={d.currencyCode}
            onChange={(code) => updateDraft({ currencyCode: code })}
            disabled={!d.checked}
          />
        );
      },
      minWidth: '8.5rem',
      width: '8.5rem',
    },
    {
      name: 'Currency-Payin',
      cell: (row) => {
        if (!row.isDraft) {
          return (
            <input
              className={disabledFieldClass}
              readOnly
              value={formatDsaPayinAmount(row.currencyPayin, row.currencyCode, countries)}
            />
          );
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
      minWidth: '8.5rem',
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
      minWidth: '8.5rem',
      width: '8.5rem',
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
      name: 'Available Balance',
      cell: (row) => {
        const limit = row.isDraft ? row.draft?.calculatedLimit ?? '' : row.limit;
        return (
          <input
            className={disabledFieldClass}
            readOnly
            disabled
            value={rowLimitDisplay(limit) ? formatInrAmount(rowLimitDisplay(limit)) : ''}
          />
        );
      },
      minWidth: '9.5rem',
      width: '9.5rem',
    },
    {
      name: 'Approval',
      cell: (row) => (
        <input className={disabledFieldClass} readOnly value={row.approval} />
      ),
      minWidth: '8rem',
    },
    {
      name: 'Remark',
      cell: (row) => (
        <input
          className={disabledFieldClass}
          readOnly
          value={row.remark || '—'}
          title={row.remark || undefined}
        />
      ),
      minWidth: '10rem',
    },
    {
      name: 'Checker Date',
      selector: (row) => row.checkerDate,
      cell: (row) => (
        <span className="whitespace-nowrap text-sm font-semibold text-slate-800">{row.checkerDate}</span>
      ),
      sortable: true,
      minWidth: '9rem',
      width: '9rem',
    },
    {
      name: 'Checker Id',
      selector: (row) => row.checkerId,
      cell: (row) => (
        <span className="whitespace-nowrap font-semibold uppercase text-slate-800">{row.checkerId}</span>
      ),
      sortable: true,
      minWidth: '8.5rem',
      width: '8.5rem',
    },
  ], [updateDraft]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusTab(tab.id)}
            className={[
              'rounded-lg border px-4 py-1.5 text-sm font-semibold transition',
              statusTab === tab.id
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-700">
          <span className="whitespace-nowrap">
            Margin Used: <span className="font-bold text-slate-900">{formatInrAmount(marginUsed)}</span>
          </span>
          <span className="whitespace-nowrap">
            Available Balance: <span className="font-bold text-slate-900">{formatInrAmount(availableBalance)}</span>
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <p className="text-2xl font-bold text-primary">DSA Details</p>
        <button
          type="button"
          disabled={saving || loading || hasPending || statusTab !== 'new'}
          onClick={() => void handleSave()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <SectionCard title="" contentClassName="p-0 overflow-hidden">
        <DataTableWrapper
          columns={columns}
          data={filteredTableRows}
          loading={loading}
          searchable={false}
          className="!rounded-none !border-0 !shadow-none"
        />
      </SectionCard>
    </div>
  );
};
