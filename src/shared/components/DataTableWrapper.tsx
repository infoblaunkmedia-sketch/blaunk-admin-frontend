import React from 'react';
import DataTable, { type TableColumn } from 'react-data-table-component';
import { EmptyState } from './EmptyState';

interface DataTableWrapperProps<T extends object> {
  columns: TableColumn<T>[];
  data: T[];
  searchable?: boolean;
  exportable?: boolean;
  onExport?: () => void;
  loading?: boolean;
  title?: string;
  actions?: React.ReactNode;
}

const customStyles = {
  headRow: {
    style: {
      backgroundColor: '#0B61C9',
      color: '#ffffff',
      minHeight: '44px',
      borderRadius: '8px 8px 0 0',
    },
  },
  headCells: {
    style: {
      color: '#ffffff',
      fontWeight: '700',
      fontSize: '13px',
      paddingLeft: '12px',
      paddingRight: '12px',
    },
  },
  rows: {
    style: {
      minHeight: '44px',
      fontSize: '13px',
    },
    stripedStyle: {
      backgroundColor: '#F8F9FA',
    },
  },
  cells: {
    style: {
      paddingLeft: '12px',
      paddingRight: '12px',
    },
  },
};

export function DataTableWrapper<T extends object>({
  columns,
  data,
  searchable = true,
  exportable = false,
  onExport,
  loading = false,
  title,
  actions,
}: DataTableWrapperProps<T>) {
  const [filter, setFilter] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!filter.trim()) return data;
    const lower = filter.toLowerCase();
    return data.filter((row) =>
      Object.values(row as Record<string, unknown>).some((val) =>
        String(val ?? '').toLowerCase().includes(lower),
      ),
    );
  }, [data, filter]);

  return (
    <div className="rounded-card border border-slate-200 bg-white shadow-card">
      {(title || searchable || exportable || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          {title && <h3 className="text-sm font-bold text-slate-800">{title}</h3>}
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            {searchable && (
              <input
                type="search"
                placeholder="Search…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-8 w-48 rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            )}
            {exportable && onExport && (
              <button
                type="button"
                onClick={onExport}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>
            )}
            {actions}
          </div>
        </div>
      )}
      <DataTable
        columns={columns}
        data={filtered}
        progressPending={loading}
        pagination
        paginationPerPage={20}
        paginationRowsPerPageOptions={[10, 20, 50, 100]}
        striped
        highlightOnHover
        responsive
        noDataComponent={<EmptyState message="No records found." />}
        customStyles={customStyles}
      />
    </div>
  );
}
