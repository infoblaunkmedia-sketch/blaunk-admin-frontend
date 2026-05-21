import React from 'react';
import DataTable, { type TableColumn } from 'react-data-table-component';
import { EmptyState } from './EmptyState';

/** Shared styling for the list search field (e.g. in `PageHeader.beforeActions`). */
export function ListTableSearchInput({
  value,
  onChange,
  className = '',
  placeholder = 'Search…',
}: {
  value: string;
  onChange: (next: string) => void;
  className?: string;
  placeholder?: string;
}) {
  return (
    <input
      type="search"
      aria-label="Search table"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={[
        'h-9 w-56 min-w-[11rem] shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none sm:w-64',
        'focus:border-primary focus:ring-2 focus:ring-primary/20',
        className,
      ].join(' ')}
    />
  );
}

interface DataTableWrapperProps<T extends object> {
  columns: TableColumn<T>[];
  data: T[];
  searchable?: boolean;
  /** Controlled filter (use with `onFilterTextChange` and usually `hideSearchInput` + `PageHeader.beforeActions`). */
  filterText?: string;
  onFilterTextChange?: (value: string) => void;
  /** When true, the built-in search field is not rendered (filter UI lives elsewhere). */
  hideSearchInput?: boolean;
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
      minHeight: '48px',
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
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      overflow: 'visible',
      textOverflow: 'clip',
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
  filterText,
  onFilterTextChange,
  hideSearchInput = false,
  exportable = false,
  onExport,
  loading = false,
  title,
  actions,
}: DataTableWrapperProps<T>) {
  const [internalFilter, setInternalFilter] = React.useState('');
  const isControlled =
    filterText !== undefined && onFilterTextChange !== undefined;
  const filter = isControlled ? filterText! : internalFilter;
  const setFilter = isControlled ? onFilterTextChange! : setInternalFilter;

  const filtered = React.useMemo(() => {
    if (!searchable) return data;
    if (!filter.trim()) return data;
    const lower = filter.toLowerCase();
    return data.filter((row) =>
      Object.values(row as Record<string, unknown>).some((val) =>
        String(val ?? '').toLowerCase().includes(lower),
      ),
    );
  }, [data, filter, searchable]);

  const showBuiltInSearch = searchable && !hideSearchInput;
  const showToolbar =
    Boolean(title) || showBuiltInSearch || exportable || Boolean(actions);

  return (
    <>
      {showToolbar && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {showBuiltInSearch && (
            <ListTableSearchInput value={filter} onChange={setFilter} />
          )}
          {title && (
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {exportable && onExport && (
              <button
                type="button"
                onClick={onExport}
                className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export
              </button>
            )}
            {actions}
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-card border border-slate-200 bg-white shadow-card">
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
    </>
  );
}
