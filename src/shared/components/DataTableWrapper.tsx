import React from 'react';
import DataTable, { type TableColumn, type TableStyles } from 'react-data-table-component';
import { EmptyState } from './EmptyState';

/** Shared width/height for list filters (dropdown + search on one row). */
export const LIST_FILTER_FIELD_CLASS =
  'h-9 w-56 min-w-[11rem] shrink-0 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-64';

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
      className={[LIST_FILTER_FIELD_CLASS, 'font-normal text-slate-900', className].join(' ')}
    />
  );
}

/** Keeps header and body columns aligned when the table scrolls horizontally. */
export function normalizeHorizontalScrollColumns<T>(
  columns: TableColumn<T>[],
): TableColumn<T>[] {
  return columns.map((col, index) => {
    const size = col.width || col.minWidth;
    const nameKey = typeof col.name === 'string' ? col.name : `col-${index}`;
    const base: TableColumn<T> = {
      ...col,
      id: col.id ?? nameKey.replace(/\s+/g, '-').toLowerCase(),
      grow: 0,
      wrap: false,
    };
    if (!size) return base;
    return {
      ...base,
      width: size,
      minWidth: col.minWidth || size,
    };
  });
}

/** Wrap table cell content so inputs respect the column width. */
export function TableCellBox({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={['dt-table-cell-box', className].filter(Boolean).join(' ')}>{children}</div>;
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
  responsive?: boolean;
  /** Use horizontal scroll on the table shell (avoids clipping wide columns). */
  horizontalScroll?: boolean;
  className?: string;
}

const customStyles = {
  table: {
    style: {
      width: '100%',
    },
  },
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
      wordBreak: 'break-word' as const,
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
  responsive = true,
  horizontalScroll = false,
  className = '',
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

  const tableColumns = React.useMemo(
    () => (horizontalScroll ? normalizeHorizontalScrollColumns(columns) : columns),
    [columns, horizontalScroll],
  );
  const tableResponsive = horizontalScroll ? false : responsive;

  const resolvedStyles: TableStyles = horizontalScroll
    ? {
        ...(customStyles as TableStyles),
        table: {
          style: {
            width: 'max-content',
            minWidth: '100%',
          },
        },
        tableWrapper: {
          style: {
            display: 'block',
            overflowX: 'visible',
            overflowY: 'visible',
          },
        },
        responsiveWrapper: {
          style: {
            overflow: 'visible',
            position: 'relative',
          },
        },
        head: {
          style: {
            width: 'max-content',
            minWidth: '100%',
          },
        },
        headRow: {
          style: {
            backgroundColor: '#0B61C9',
            color: '#ffffff',
            minHeight: '48px',
            borderRadius: '8px 8px 0 0',
            width: 'max-content',
            minWidth: '100%',
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
            lineHeight: '1.3',
            overflow: 'visible',
            textOverflow: 'clip',
            backgroundColor: '#0B61C9',
            flex: '0 0 auto',
          },
        },
        rows: {
          style: {
            minHeight: '44px',
            fontSize: '13px',
            width: 'max-content',
            minWidth: '100%',
          },
          stripedStyle: {
            backgroundColor: '#F8F9FA',
          },
        },
        cells: {
          style: {
            paddingLeft: '12px',
            paddingRight: '12px',
            flex: '0 0 auto',
            boxSizing: 'border-box',
            alignItems: 'center',
            overflow: 'hidden',
          },
        },
      }
    : (customStyles as TableStyles);

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
      <div
        className={[
          horizontalScroll ? 'dt-horizontal-scroll min-w-0 overflow-x-auto' : 'overflow-hidden',
          'rounded-card border border-slate-200 bg-white shadow-card',
          className,
        ].join(' ')}
      >
        <DataTable
          columns={tableColumns}
          data={filtered}
          progressPending={loading}
          pagination
          paginationPerPage={20}
          paginationRowsPerPageOptions={[10, 20, 50, 100]}
          striped
          highlightOnHover
          responsive={tableResponsive}
          noDataComponent={<EmptyState message="No records found." />}
          customStyles={resolvedStyles}
          className={horizontalScroll ? 'dt-horizontal-scroll-table' : undefined}
        />
      </div>
    </>
  );
}
