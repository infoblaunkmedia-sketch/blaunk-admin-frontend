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
import { formatDsaPayinAmount, formatInrAmount } from '../../../shared/utils/dsaCurrencyFormat';
import { payoutCheckerLabel } from './payoutChecker';

const inputClass =
  'h-9 w-full min-w-[5rem] rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';

const readOnlyClass =
  `${inputClass} cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500`;

function formatCurrencyPayin(row: DsaPayoutSubmission): string {
  return formatDsaPayinAmount(row.submittedAmount || 0, row.currency);
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

function seedFieldEdits(row: DsaPayoutSubmission) {
  const currencyInr = row.currencyInr != null ? String(row.currencyInr) : '';
  const calculatedLimit = row.calculatedLimit != null && row.calculatedLimit > 0
    ? String(row.calculatedLimit)
    : (currencyInr ? calcLimitFromInr(Number(currencyInr), row.shareRatio) : '');
  return { currencyInr, calculatedLimit };
}

export const DsaPayouts: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin';
  const [records, setRecords] = React.useState<DsaPayoutSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tableSearch, setTableSearch] = React.useState('');
  const [filterDate, setFilterDate] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'' | PayoutStatus>('');
  const [actioningId, setActioningId] = React.useState<string | null>(null);
  const [fieldEdits, setFieldEdits] = React.useState<Record<string, { currencyInr: string; calculatedLimit: string }>>({});
  /** Row ids where admin chose Rejected and must pick a Remark before save. */
  const [pendingRejectIds, setPendingRejectIds] = React.useState<Record<string, true>>({});

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchDsaPayouts({ limit: 2000 });
      setRecords(rows);
      setFieldEdits((prev) => {
        const next: Record<string, { currencyInr: string; calculatedLimit: string }> = {};
        for (const row of rows) {
          if (!isPendingPayoutStatus(row.status)) continue;
          next[row.id] = prev[row.id] ?? seedFieldEdits(row);
        }
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
      setPendingRejectIds((prev) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
      toast.success(payoutStatusToastMessage(nextStatus));
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update approval');
    } finally {
      setActioningId(null);
    }
  }, [getFieldEdit, load, saveFieldEdits]);

  const handleApprovalChange = React.useCallback(async (row: DsaPayoutSubmission, nextStatus: PayoutStatus) => {
    const current = normalizePayoutStatus(row.status);
    if (nextStatus === current && !pendingRejectIds[row.id]) return;

    if (nextStatus === 'REJECTED') {
      setPendingRejectIds((prev) => ({ ...prev, [row.id]: true }));
      return;
    }

    setPendingRejectIds((prev) => {
      const next = { ...prev };
      delete next[row.id];
      return next;
    });
    await submitApproval(row, nextStatus);
  }, [pendingRejectIds, submitApproval]);

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

  const handleRemarkChange = React.useCallback(async (row: DsaPayoutSubmission, remark: string) => {
    if (!remark) return;
    if (!isPayoutRemark(remark)) {
      toast.error('Select a valid remark.');
      return;
    }
    await submitApproval(row, 'REJECTED', remark);
  }, [submitApproval]);

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
      minWidth: '6.5rem',
    },
    {
      name: 'Mode',
      cell: (row) => <input className={readOnlyClass} readOnly value={row.mode || '-'} />,
      minWidth: '6.5rem',
    },
    {
      name: 'Currency-Payin',
      cell: (row) => <input className={readOnlyClass} readOnly value={formatCurrencyPayin(row)} />,
      minWidth: '8.5rem',
    },
    {
      name: 'Txn Ref No.',
      cell: (row) => (
        <input className={readOnlyClass} readOnly value={row.transactionNumber || '-'} />
      ),
      minWidth: '7.5rem',
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
            onBlur={
              canEditInrLimit
                ? () => {
                    const edit = getFieldEdit(row);
                    if (!edit.currencyInr.trim()) return;
                    void saveFieldEdits(row, ['currencyInr', 'calculatedLimit']).catch(() => toast.error('Failed to save Currency-INR'));
                  }
                : undefined
            }
          />
        );
      },
      minWidth: '7.5rem',
    },
    {
      name: 'Limit',
      cell: (row) => {
        const edit = getFieldEdit(row);
        const displayLimit = isPendingPayoutStatus(row.status)
          ? edit.calculatedLimit
          : formatInrAmount(row.calculatedLimit ?? '');
        return (
          <input
            type="text"
            className={readOnlyClass}
            readOnly
            value={displayLimit}
            title={isPendingPayoutStatus(row.status) ? `${shareRatioLabel(row.shareRatio)} of Currency-INR` : undefined}
          />
        );
      },
      minWidth: '7rem',
    },
    {
      name: 'Approval',
      cell: (row) => (
        isAdmin ? (
          <PayoutStatusSelect
            value={pendingRejectIds[row.id] ? 'REJECTED' : row.status}
            disabled={actioningId === row.id}
            onChange={(status) => void handleApprovalChange(row, status)}
          />
        ) : (
          <input className={readOnlyClass} readOnly value={payoutStatusLabel(row.status)} />
        )
      ),
      minWidth: '11rem',
    },
    {
      name: 'Remark',
      cell: (row) => {
        const isRejected = normalizePayoutStatus(row.status) === 'REJECTED';
        const awaitingRemark = Boolean(pendingRejectIds[row.id]);
        if (!isRejected && !awaitingRemark) {
          return <span className="text-slate-400">—</span>;
        }
        if (isAdmin && awaitingRemark) {
          return (
            <PayoutRemarkSelect
              disabled={actioningId === row.id}
              onChange={(remark) => void handleRemarkChange(row, remark)}
            />
          );
        }
        return (
          <span className="font-semibold text-slate-800">
            {row.rejectionReason || '—'}
          </span>
        );
      },
      minWidth: '11rem',
    },
    {
      name: 'Checker',
      selector: (row) => payoutCheckerLabel(row),
      cell: (row) => {
        const checker = payoutCheckerLabel(row);
        const actedAt = row.lastActedAt || row.approvedAt || row.rejectedAt;
        return (
          <div className="min-w-[5.5rem]">
            <p className="font-semibold text-slate-800">{checker}</p>
            {checker !== '-' && actedAt ? (
              <p className="text-xs text-slate-500">{formatDateDDMMYYYY(String(actedAt))}</p>
            ) : null}
          </div>
        );
      },
      sortable: true,
      minWidth: '6.5rem',
    },
    {
      name: 'Empl Code',
      selector: (row) => row.dsaCode,
      cell: (row) => <span className="uppercase">{row.dsaCode}</span>,
      sortable: true,
      minWidth: '6rem',
    },
  ], [
    actioningId,
    getFieldEdit,
    handleApprovalChange,
    handleRemarkChange,
    isAdmin,
    pendingRejectIds,
    records,
    saveFieldEdits,
    setFieldEdit,
  ]);

  return (
    <ErrorBoundary>
      <PageHeader
        title="DSA Limit"
        subtitle="Enter Currency-INR — Limit auto-fills from sharing ratio (e.g. 30:70 → 30% of INR). Then set Approval."
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
