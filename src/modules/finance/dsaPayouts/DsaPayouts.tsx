import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { formatDateDDMMYYYY } from '../../../shared/utils/dateFormat';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { useAuth } from '../../../auth/useAuth';
import { fetchDsaPayouts, updatePayoutFieldsById, updatePayoutStatusById } from '../finance.service';
import type { DsaPayoutSubmission } from '../finance.types';
import { PayoutStatusSelect } from '../../../shared/components/PayoutStatusSelect';
import {
  isPendingPayoutStatus,
  isNegativePayoutStatus,
  normalizePayoutStatus,
  payoutStatusLabel,
  type PayoutStatus,
} from '../../../shared/constants/payoutStatus';
import { onNumericInputKeyDown } from '../../../shared/utils/numericInput';
import { payoutCheckerLabel } from './payoutChecker';

const inputClass =
  'h-9 w-full min-w-[5rem] rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';

const readOnlyClass =
  `${inputClass} cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500`;

function payoutCurrencyLabel(currency: string): string {
  const c = String(currency || '').toUpperCase();
  if (c === 'USD') return '$';
  return 'Rs.';
}

function formatCurrencyPayin(row: DsaPayoutSubmission): string {
  return `${payoutCurrencyLabel(row.currency)} ${Number(row.submittedAmount || 0).toLocaleString()}`;
}

function shareRatioLabel(shareRatio: number | undefined): string {
  const sr = Number(shareRatio);
  if (!Number.isFinite(sr)) return '-';
  return `${sr}:${100 - sr}`;
}

export const DsaPayouts: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = String(user?.role || '').toLowerCase() === 'admin';
  const [records, setRecords] = React.useState<DsaPayoutSubmission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tableSearch, setTableSearch] = React.useState('');
  const [actioningId, setActioningId] = React.useState<string | null>(null);
  const [fieldEdits, setFieldEdits] = React.useState<Record<string, { currencyInr: string; calculatedLimit: string }>>({});

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const rows = await fetchDsaPayouts({ limit: 2000 });
      setRecords(rows);
      setFieldEdits((prev) => {
        const next: Record<string, { currencyInr: string; calculatedLimit: string }> = {};
        for (const row of rows) {
          if (!isPendingPayoutStatus(row.status)) continue;
          next[row.id] = prev[row.id] ?? { currencyInr: '', calculatedLimit: '' };
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
      const edit = fieldEdits[row.id];
      return {
        currencyInr: edit?.currencyInr ?? '',
        calculatedLimit: edit?.calculatedLimit ?? '',
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
      const current = p[row.id] ?? { currencyInr: '', calculatedLimit: '' };
      return { ...p, [row.id]: { ...current, ...patch } };
    });
  }, []);

  const saveFieldEdits = React.useCallback(async (row: DsaPayoutSubmission) => {
    const { currencyInr, calculatedLimit } = getFieldEdit(row);
    const inr = parseFloat(currencyInr) || 0;
    const limit = parseFloat(calculatedLimit) || 0;
    await updatePayoutFieldsById(row.id, { currencyInr: inr, calculatedLimit: limit });
    setRecords((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, currencyInr: inr, calculatedLimit: limit } : r)),
    );
  }, [getFieldEdit]);

  const handleApprovalChange = React.useCallback(async (row: DsaPayoutSubmission, nextStatus: PayoutStatus) => {
    const current = normalizePayoutStatus(row.status);
    if (nextStatus === current) return;

    let note = '';
    if (isNegativePayoutStatus(nextStatus)) {
      const reason = window.prompt('Note / reason (required):', row.rejectionReason || '');
      if (!reason?.trim()) {
        toast.error('Note / reason is required for this status.');
        return;
      }
      note = reason.trim();
    }

    const { currencyInr, calculatedLimit } = getFieldEdit(row);
    if (nextStatus === 'APPROVED' && (!currencyInr.trim() || !calculatedLimit.trim())) {
      toast.error('Enter Currency-INR and Limit before approving.');
      return;
    }

    try {
      setActioningId(row.id);
      if (isPendingPayoutStatus(row.status)) {
        await saveFieldEdits(row);
      }
      await updatePayoutStatusById(row.id, nextStatus, note);
      toast.success('Approval updated — synced to DSA section');
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update approval');
    } finally {
      setActioningId(null);
    }
  }, [getFieldEdit, load, saveFieldEdits]);

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
            value={canEditInrLimit ? edit.currencyInr : (row.currencyInr != null ? String(row.currencyInr) : '')}
            onKeyDown={canEditInrLimit ? onNumericInputKeyDown : undefined}
            onChange={(e) => setFieldEdit(row, { currencyInr: e.target.value.replace(/[^\d.]/g, '') })}
            onBlur={
              canEditInrLimit
                ? () => {
                    const { currencyInr, calculatedLimit } = getFieldEdit(row);
                    if (!currencyInr.trim() && !calculatedLimit.trim()) return;
                    void saveFieldEdits(row).catch(() => toast.error('Failed to save Currency-INR'));
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
        const canEditInrLimit = isAdmin && isPendingPayoutStatus(row.status);
        const edit = getFieldEdit(row);
        return (
          <input
            type="text"
            inputMode="decimal"
            className={canEditInrLimit ? inputClass : readOnlyClass}
            readOnly={!canEditInrLimit}
            value={canEditInrLimit ? edit.calculatedLimit : (row.calculatedLimit != null ? String(row.calculatedLimit) : '')}
            onKeyDown={canEditInrLimit ? onNumericInputKeyDown : undefined}
            onChange={(e) => setFieldEdit(row, { calculatedLimit: e.target.value.replace(/[^\d.]/g, '') })}
            onBlur={
              canEditInrLimit
                ? () => {
                    const { currencyInr, calculatedLimit } = getFieldEdit(row);
                    if (!currencyInr.trim() && !calculatedLimit.trim()) return;
                    void saveFieldEdits(row).catch(() => toast.error('Failed to save limit'));
                  }
                : undefined
            }
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
            value={row.status}
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
      name: 'Checker',
      selector: (row) => payoutCheckerLabel(row),
      cell: (row) => {
        const checker = payoutCheckerLabel(row);
        const actedAt = row.lastActedAt || row.approvedAt || row.rejectedAt;
        return (
          <div className="min-w-[5.5rem]">
            <p className="font-semibold text-slate-800">{checker}</p>
            {checker !== '-' && actedAt ? (
              <p className="text-xs text-slate-500">{String(actedAt).slice(0, 10)}</p>
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
    isAdmin,
    saveFieldEdits,
    setFieldEdit,
  ]);

  return (
    <ErrorBoundary>
      <PageHeader
        title="DSA Limit"
        subtitle="DSA pay-in is shown as submitted. Enter Currency-INR and Limit manually, then set Approval."
        beforeActions={
          <ListTableSearchInput
            value={tableSearch}
            onChange={setTableSearch}
            placeholder="Search DSA, txn ref…"
          />
        }
      />

      <SectionCard title="" contentClassName="p-0 overflow-hidden">
        <DataTableWrapper
          className="!rounded-none !border-0 !shadow-none"
          columns={columns}
          data={records}
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
