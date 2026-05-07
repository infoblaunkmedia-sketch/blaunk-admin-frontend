import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { DataTableWrapper } from '../../../shared/components/DataTableWrapper';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { Shareholder } from '../corporate.types';
import { deleteShareholder, fetchShareholders } from '../corporate.service';

function IconEye({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEdit({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export const ShareholdingList: React.FC = () => {
  const [rows, setRows] = React.useState<Shareholder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [confirmDel, setConfirmDel] = React.useState<string | null>(null);
  const navigate = useNavigate();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchShareholders());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!confirmDel) return;
    await deleteShareholder(confirmDel);
    setConfirmDel(null);
    toast.success('Shareholder deleted');
    load();
  };

  const columns: TableColumn<Shareholder>[] = [
    { name: 'Name', selector: (r) => r.name, sortable: true, grow: 2 },
    { name: 'Folio No.', selector: (r) => r.folioNumber, width: '130px' },
    { name: 'PAN', selector: (r) => r.pan, width: '120px' },
    { name: 'Share Type', selector: (r) => r.shareType as string, width: '150px' },
    { name: 'No. of Shares', selector: (r) => r.numberOfShares, width: '120px', sortable: true },
    { name: 'Holding %', selector: (r) => r.holdingPercent, width: '100px' },
    { name: 'Allotment Date', selector: (r) => r.dateOfAllotment, width: '125px' },
    {
      name: 'Actions',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/corporate/shareholding/${encodeURIComponent(r.pan)}`)}
            className="rounded border border-slate-200 p-1.5 text-slate-700 transition hover:bg-slate-50"
            title="View"
            aria-label="View shareholder"
          >
            <IconEye />
          </button>
          <button
            type="button"
            onClick={() => navigate(`/corporate/shareholding/${encodeURIComponent(r.pan)}/edit`)}
            className="rounded border border-slate-200 p-1.5 text-primary transition hover:bg-slate-50"
            title="Edit"
            aria-label="Edit shareholder"
          >
            <IconEdit />
          </button>
          <button
            type="button"
            onClick={() => setConfirmDel(r.pan)}
            className="rounded border border-slate-200 p-1.5 text-red-600 transition hover:bg-red-50"
            title="Delete"
            aria-label="Delete shareholder"
          >
            <IconTrash />
          </button>
        </div>
      ),
      width: '140px',
      ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader
        title="Shareholding Register"
        subtitle="Manage company shareholders, share allocations, and nominees."
        actions={[{ label: '+ Add Shareholder', onClick: () => navigate('/corporate/shareholding/new') }]}
      />

      <DataTableWrapper columns={columns} data={rows} loading={loading} searchable />

      {confirmDel && (
        <ConfirmDialog
          title="Delete Shareholder"
          message={`Delete shareholder with PAN ${confirmDel}? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </ErrorBoundary>
  );
};

