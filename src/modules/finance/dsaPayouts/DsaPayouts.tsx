import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper, LIST_FILTER_FIELD_CLASS, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { formatDateDDMMYYYY } from '../../../shared/utils/dateFormat';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { useAuth } from '../../../auth/useAuth';
import { fetchDsaPayouts, updatePayoutFieldsById, updatePayoutStatusById } from '../finance.service';
import type { DsaPayoutSubmission } from '../finance.types';
import { PayoutStatusSelect } from '../../../shared/components/PayoutStatusSelect';
import { PayoutRemarkSelect } from '../../../shared/components/PayoutRemarkSelect';
import {
  isPendingPayoutStatus,
  isPayoutRemark,
  normalizePayoutStatus,
  payoutStatusLabel,
  type PayoutStatus,
} from '../../../shared/constants/payoutStatus';
import { onNumericInputKeyDown } from '../../../shared/utils/numericInput';
import { useCountries } from '../../../shared/hooks/useCountries';
import { formatDsaPayinAmount, formatInrAmount } from '../../../shared/utils/dsaCurrencyFormat';
import { payoutCheckerDate, payoutCheckerId } from './payoutChecker';

const inputClass =
  'h-9 w-full min-w-[5rem] rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';

const readOnlyClass =
  `${inputClass} cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500`;

function formatCurrencyPayin(
  row: DsaPayoutSubmission,
  countries: Parameters<typeof formatDsaPayinAmount>[2],
): string {
  return formatDsaPayinAmount(row.submittedAmount || 0, row.currency, countries);
}

function shareRatioLabel(shareRatio: number | undefined): string {
  const sr = Number(shareRatio);
  if (!Number.isFinite(sr)) return '-';
  return `${sr}:${100 - sr}`;
}

function payoutStatusToastMessage(status: PayoutStatus): string {
  if (status === 'APPROVED') return 'Submission approved successfully.';
  if (status === 'REJECTED') return 'Submission rejected.';
  return 'Submission set to pending.';
}

function calcLimitFromInr(currencyInr: number, shareRatio: number): string {
  const inr = Number(currencyInr);
  const sr = Number(shareRatio);
  if (!Number.isFinite(inr) || inr <= 0 || !Number.isFinite(sr) || sr <= 0) return '';
  return String(Number((inr * sr / 100).toFixed(2)));
}

/** Display total = Currency-INR entered + share portion (stored calculatedLimit is share only). */
function formatTotalLimit(
  currencyInr: string | number,
  shareRatio: number,
  calculatedLimit?: string | number,
): string {
  const inr = Number(currencyInr) || 0;
  const share = Number(calculatedLimit) || (inr > 0 ? Number(calcLimitFromInr(inr, shareRatio)) : 0);
  const total = inr + share;
  if (total <= 0) return '';
  return formatInrAmount(total);
}

function totalLimitTitle(
  currencyInr: string | number,
  shareRatio: number,
  calculatedLimit?: string | number,
): string {
  const inr = Number(currencyInr) || 0;
  const share = Number(calculatedLimit) || (inr > 0 ? Number(calcLimitFromInr(inr, shareRatio)) : 0);
  if (inr <= 0 && share <= 0) return 'Total limit';
  return `Total: ${formatInrAmount(inr)} + ${shareRatioLabel(shareRatio)} share ${formatInrAmount(share)}`;
}

function seedFieldEdits(row: DsaPayoutSubmission) {
  const currencyInr = row.currencyInr != null ? String(row.currencyInr) : '';
  const calculatedLimit = row.calculatedLimit != null && row.calculatedLimit > 0
    ? String(row.calculatedLimit)
    : (currencyInr ? calcLimitFromInr(Number(currencyInr), row.shareRatio) : '');
  return { currencyInr, calculatedLimit };
}

export const DsaPayouts: React.FC = () => {
  const { user } = useAuth();
  const { countries } = useCountries();
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin';
  const [records, setRecords] = React.useState<DsaPayoutSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tableSearch, setTableSearch] = React.useState('');
  const [filterDate, setFilterDate] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'' | PayoutStatus>('');
  const [actioningId, setActioningId] = React.useState<string | null>(null);
  const [fieldEdits, setFieldEdits] = React.useState<Record<string, { currencyInr: string; calculatedLimit: string }>>({});
  const [pendingApprovalById, setPendingApprovalById] = React.useState<Record<string, PayoutStatus>>({});
  const [pendingRemarkById, setPendingRemarkById] = React.useState<Record<string, string>>({});
  const [focusRowId, setFocusRowId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchDsaPayouts({ limit: 2000 });
      setRecords(rows);
      setFieldEdits((prev) => {
        const next: Record<string, { currencyInr: string; calculatedLimit: string }> = {};
        const nextApproval: Record<string, PayoutStatus> = {};
        for (const row of rows) {
          if (!isPendingPayoutStatus(row.status)) continue;
          next[row.id] = prev[row.id] ?? seedFieldEdits(row);
          nextApproval[row.id] = normalizePayoutStatus(row.status);
        }
        setPendingApprovalById(nextApproval);
        setPendingRemarkById({});
        return next;
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const getFieldEdit = React.useCallback((row: DsaPayoutSubmission) => {
    if (isPendingPayoutStatus(row.status)) {
      return {
        currencyInr: fieldEdits[row.id]?.currencyInr ?? '',
        calculatedLimit: fieldEdits[row.id]?.calculatedLimit ?? '',
      };
    }
    return {
      currencyInr: row.currencyInr != null ? String(row.currencyInr) : '',
      calculatedLimit: row.calculatedLimit != null ? String(row.calculatedLimit) : '',
    };
  }, [fieldEdits]);

  const setFieldEdit = React.useCallback((
    row: DsaPayoutSubmission,
    patch: Partial<{ currencyInr: string; calculatedLimit: string }>,
  ) => {
    if (isPendingPayoutStatus(row.status)) setFocusRowId(row.id);
    setFieldEdits((p) => {
      const current = p[row.id] ?? seedFieldEdits(row);
      const next = { ...current, ...patch };
      if ('currencyInr' in patch) {
        const inr = parseFloat(patch.currencyInr || '') || 0;
        next.calculatedLimit = calcLimitFromInr(inr, row.shareRatio);
      }
      return { ...p, [row.id]: next };
    });
  }, []);

  const saveFieldEdits = React.useCallback(async (
    row: DsaPayoutSubmission,
    only?: Array<'currencyInr' | 'calculatedLimit'>,
  ) => {
    const edit = getFieldEdit(row);
    const payload: { currencyInr?: number; calculatedLimit?: number } = {};

    if (!only || only.includes('currencyInr')) {
      const raw = edit.currencyInr.trim();
      if (raw) payload.currencyInr = parseFloat(raw) || 0;
    }
    if (!only || only.includes('calculatedLimit')) {
      const raw = edit.calculatedLimit.trim();
      if (raw) payload.calculatedLimit = parseFloat(raw) || 0;
    }
    if (!Object.keys(payload).length) return;

    await updatePayoutFieldsById(row.id, payload);
    setRecords((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, ...payload } : r)),
    );
  }, [getFieldEdit]);

  const submitApproval = React.useCallback(async (
    row: DsaPayoutSubmission,
    nextStatus: PayoutStatus,
    note = '',
  ) => {
    const edit = getFieldEdit(row);
    const inrReady = Boolean(edit.currencyInr.trim() || (row.currencyInr != null && row.currencyInr > 0));
    const limitReady = Boolean(edit.calculatedLimit.trim() || (row.calculatedLimit != null && row.calculatedLimit > 0));
    if (nextStatus === 'APPROVED' && !inrReady) {
      toast.error('Enter Currency-INR before approving.');
      return;
    }
    if (nextStatus === 'APPROVED' && !limitReady) {
      toast.error('Enter Limit before approving.');
      return;
    }

    try {
      setActioningId(row.id);
      if (isPendingPayoutStatus(row.status)) {
        await saveFieldEdits(row, ['currencyInr', 'calculatedLimit']);
      }
      await updatePayoutStatusById(row.id, nextStatus, note);
      toast.success(payoutStatusToastMessage(nextStatus));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update approval');
    } finally {
      setActioningId(null);
    }
  }, [getFieldEdit, load, saveFieldEdits]);

  const handleApprovalChange = React.useCallback((row: DsaPayoutSubmission, nextStatus: PayoutStatus) => {
    setFocusRowId(row.id);
    setPendingApprovalById((prev) => ({ ...prev, [row.id]: nextStatus }));
    if (nextStatus !== 'REJECTED') {
      setPendingRemarkById((prev) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
    }
  }, []);

  const handleRemarkChange = React.useCallback((row: DsaPayoutSubmission, remark: string) => {
    if (!remark) return;
    if (!isPayoutRemark(remark)) {
      toast.error('Select a valid remark.');
      return;
    }
    setFocusRowId(row.id);
    setPendingRemarkById((prev) => ({ ...prev, [row.id]: remark }));
  }, []);

  const focusRow = React.useMemo(
    () => (focusRowId ? records.find((r) => r.id === focusRowId) ?? null : null),
    [focusRowId, records],
  );

  const handleRowSave = React.useCallback(async (row: DsaPayoutSubmission) => {
    const nextStatus = pendingApprovalById[row.id] ?? normalizePayoutStatus(row.status);
    const remark = pendingRemarkById[row.id] || '';
    if (nextStatus === 'REJECTED' && !remark) {
      toast.error('Select a remark before rejecting.');
      return;
    }
    await submitApproval(row, nextStatus, remark);
  }, [pendingApprovalById, pendingRemarkById, submitApproval]);

  const filteredRecords = React.useMemo(() => {
    return records.filter((row) => {
      if (filterStatus && normalizePayoutStatus(row.status) !== filterStatus) return false;
      if (filterDate) {
        const rowDate = String(row.submissionDate || '').slice(0, 10);
        if (rowDate !== filterDate) return false;
      }
      return true;
    });
  }, [filterDate, filterStatus, records]);

  const columns = React.useMemo((): TableColumn<DsaPayoutSubmission>[] => [
    {
      name: 'Date',
      selector: (row) => row.submissionDate || '',
      cell: (row) => (
        <span className="whitespace-nowrap font-semibold text-slate-800">
          {formatDateDDMMYYYY(row.submissionDate)}
        </span>
      ),
      sortable: true,
      minWidth: '6.5rem',
    },
    {
      name: 'DSA Name',
      selector: (row) => row.dsaName || '',
      sortable: true,
      minWidth: '7rem',
    },
    {
      name: 'Country',
      selector: (row) => row.country || '',
      sortable: true,
      minWidth: '5.5rem',
    },
    {
      name: 'DSA Code',
      selector: (row) => row.dsaCode,
      cell: (row) => <span className="uppercase">{row.dsaCode}</span>,
      sortable: true,
      minWidth: '6rem',
    },
    {
      name: 'Sharing Ratio',
      selector: (row) => shareRatioLabel(row.shareRatio),
      sortable: true,
      minWidth: '7.5rem',
      width: '7.5rem',
    },
    {
      name: 'Mode',
      cell: (row) => <input className={readOnlyClass} readOnly value={row.mode || '-'} />,
      minWidth: '6.5rem',
    },
    {
      name: 'Transaction Ref No.',
      cell: (row) => (
        <input className={readOnlyClass} readOnly value={row.transactionNumber || '-'} />
      ),
      minWidth: '10rem',
      width: '10rem',
    },
    {
      name: 'Currency-Payin',
      cell: (row) => <input className={readOnlyClass} readOnly value={formatCurrencyPayin(row, countries)} />,
      minWidth: '9rem',
      width: '9rem',
    },
    {
      name: 'Currency-INR',
      cell: (row) => {
        const canEditInrLimit = isAdmin && isPendingPayoutStatus(row.status);
        const edit = getFieldEdit(row);
        return (
          <input
            type="text"
            inputMode="decimal"
            className={canEditInrLimit ? inputClass : readOnlyClass}
            readOnly={!canEditInrLimit}
            value={canEditInrLimit ? edit.currencyInr : formatInrAmount(row.currencyInr ?? '')}
            onKeyDown={canEditInrLimit ? onNumericInputKeyDown : undefined}
            onChange={(e) => {
              const currencyInr = e.target.value.replace(/[^\d.]/g, '');
              setFieldEdit(row, { currencyInr });
            }}
          />
        );
      },
      minWidth: '8.5rem',
      width: '8.5rem',
    },
    {
      name: 'Limit',
      cell: (row) => {
        const edit = getFieldEdit(row);
        const displayLimit = isPendingPayoutStatus(row.status)
          ? formatTotalLimit(edit.currencyInr, row.shareRatio, edit.calculatedLimit)
          : formatTotalLimit(row.currencyInr ?? '', row.shareRatio, row.calculatedLimit ?? '');
        const title = totalLimitTitle(
          isPendingPayoutStatus(row.status) ? edit.currencyInr : (row.currencyInr ?? ''),
          row.shareRatio,
          isPendingPayoutStatus(row.status) ? edit.calculatedLimit : (row.calculatedLimit ?? ''),
        );
        return (
          <input
            type="text"
            className={readOnlyClass}
            readOnly
            value={displayLimit}
            title={title}
          />
        );
      },
      minWidth: '11rem',
    },
    {
      name: 'Approval',
      cell: (row) => {
        if (!isAdmin) {
          return <input className={readOnlyClass} readOnly value={payoutStatusLabel(row.status)} />;
        }
        if (!isPendingPayoutStatus(row.status)) {
          return <input className={readOnlyClass} readOnly value={payoutStatusLabel(row.status)} />;
        }
        const selectedStatus = pendingApprovalById[row.id] ?? normalizePayoutStatus(row.status);
        return (
          <div className="min-w-0 py-1">
            <PayoutStatusSelect
              value={selectedStatus}
              disabled={actioningId === row.id}
              onChange={(status) => handleApprovalChange(row, status)}
            />
          </div>
        );
      },
      minWidth: '8.5rem',
      width: '8.5rem',
    },
    {
      name: 'Remark',
      cell: (row) => {
        const isRejected = normalizePayoutStatus(row.status) === 'REJECTED';
        const selectedStatus = pendingApprovalById[row.id] ?? normalizePayoutStatus(row.status);
        const awaitingRemark = isPendingPayoutStatus(row.status) && selectedStatus === 'REJECTED';
        if (!isRejected && !awaitingRemark) {
          return <span className="text-slate-400">—</span>;
        }
        if (isAdmin && awaitingRemark) {
          return (
            <div className="min-w-0 py-1">
              <PayoutRemarkSelect
                disabled={actioningId === row.id}
                value={pendingRemarkById[row.id] || ''}
                onChange={(remark) => handleRemarkChange(row, remark)}
              />
            </div>
          );
        }
        return (
          <span className="block max-w-[16rem] py-1 text-sm font-semibold leading-snug text-slate-800">
            {row.rejectionReason || '—'}
          </span>
        );
      },
      minWidth: '14.5rem',
      width: '14.5rem',
    },
    {
      name: 'Checker Date',
      selector: (row) => payoutCheckerDate(row),
      cell: (row) => (
        <span className="whitespace-nowrap text-sm font-semibold text-slate-800">
          {payoutCheckerDate(row)}
        </span>
      ),
      sortable: true,
      minWidth: '9rem',
      width: '9rem',
    },
    {
      name: 'Checker Id',
      selector: (row) => payoutCheckerId(row),
      cell: (row) => (
        <span className="whitespace-nowrap font-semibold uppercase text-slate-800">
          {payoutCheckerId(row)}
        </span>
      ),
      sortable: true,
      minWidth: '8.5rem',
      width: '8.5rem',
    },
  ], [
    actioningId,
    countries,
    getFieldEdit,
    handleApprovalChange,
    handleRemarkChange,
    isAdmin,
    pendingApprovalById,
    pendingRemarkById,
    setFieldEdit,
  ]);

  return (
    <ErrorBoundary>
      <PageHeader
        title="DSA Limit"
        subtitle="Enter Currency-INR — Limit shows total (INR + share). Set Approval, then Save from the bar above the table."
        beforeActions={
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              aria-label="Filter by date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className={`${LIST_FILTER_FIELD_CLASS} !w-40 !min-w-[9rem]`}
            />
            <select
              aria-label="Filter by status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as '' | PayoutStatus)}
              className={`${LIST_FILTER_FIELD_CLASS} !w-36 !min-w-[8.5rem]`}
            >
              <option value="">All status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <ListTableSearchInput
              value={tableSearch}
              onChange={setTableSearch}
              placeholder="Search…"
              className="!w-36 !min-w-[8rem] sm:!w-40"
            />
          </div>
        }
      />

      <SectionCard title="" contentClassName="p-0 overflow-hidden">
        {isAdmin && focusRow && isPendingPayoutStatus(focusRow.status) ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{focusRow.dsaName || focusRow.dsaCode}</span>
              {' · '}
              {formatDateDDMMYYYY(focusRow.submissionDate)}
              {' · '}
              Approval:{' '}
              <span className="font-semibold text-slate-800">
                {payoutStatusLabel(pendingApprovalById[focusRow.id] ?? normalizePayoutStatus(focusRow.status))}
              </span>
            </p>
            <button
              type="button"
              disabled={actioningId === focusRow.id}
              onClick={() => void handleRowSave(focusRow)}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-dark disabled:opacity-60"
            >
              {actioningId === focusRow.id ? 'Saving…' : 'Save'}
            </button>
          </div>
        ) : null}
        <DataTableWrapper
          className="!rounded-none !border-0 !shadow-none"
          columns={columns}
          data={filteredRecords}
          loading={loading}
          searchable
          filterText={tableSearch}
          onFilterTextChange={setTableSearch}
          hideSearchInput
        />
      </SectionCard>
    </ErrorBoundary>
  );
};
