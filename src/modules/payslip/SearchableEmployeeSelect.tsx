import React from 'react';
import type { PayrollEmployeeOption } from './payslip.service';
import { ALL_EMPLOYEES_CODE } from './payrollReportConfig';

const inputBase =
  'w-full rounded-lg border border-slate-300 bg-white text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:bg-slate-50 disabled:text-slate-400';

type Props = {
  employees: PayrollEmployeeOption[];
  value: string;
  onChange: (empCode: string) => void;
  disabled?: boolean;
  placeholder?: string;
  compact?: boolean;
  includeAllOption?: boolean;
};

function displayLabel(emp: PayrollEmployeeOption, compact: boolean): string {
  if (compact) {
    const name = emp.employeeName.length > 16 ? `${emp.employeeName.slice(0, 16)}…` : emp.employeeName;
    return `${name} (${emp.empCode})`;
  }
  return `${emp.employeeName} (${emp.empCode})`;
}

export const SearchableEmployeeSelect: React.FC<Props> = ({
  employees,
  value,
  onChange,
  disabled,
  placeholder = 'Search employee…',
  compact = false,
  includeAllOption = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [browseAll, setBrowseAll] = React.useState(false);
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selected = employees.find((e) => e.empCode === value);
  const selectedLabel =
    value === ALL_EMPLOYEES_CODE ? 'All employees' : selected ? displayLabel(selected, compact) : '';

  React.useEffect(() => {
    if (selected) {
      setQuery(selectedLabel);
    } else if (!value) {
      setQuery('');
    }
  }, [selected, value, selectedLabel]);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
        setBrowseAll(false);
        if (selected) setQuery(selectedLabel);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [selected, selectedLabel]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (browseAll || !q || (selected && query === selectedLabel)) {
      return employees.slice(0, 80);
    }
    return employees
      .filter(
        (e) =>
          e.empCode.toLowerCase().includes(q) ||
          e.employeeName.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [employees, query, selected, selectedLabel, browseAll]);

  const inputClass = [
    inputBase,
    compact ? 'h-10 truncate px-2 pr-8 text-xs' : 'h-11 px-3 text-sm',
  ].join(' ');

  return (
    <div ref={wrapRef} className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        className={inputClass}
        disabled={disabled}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setBrowseAll(false);
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value.trim()) onChange('');
        }}
        onFocus={() => {
          setOpen(true);
          inputRef.current?.select();
        }}
        aria-autocomplete="list"
        aria-expanded={open}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setBrowseAll(true);
          setOpen(true);
        }}
        className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
        aria-label="Show employees"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && !disabled ? (
        <ul
          className={[
            'absolute z-30 mt-1 max-h-56 overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg',
            compact ? 'min-w-[14rem] w-max max-w-[20rem]' : 'w-full',
          ].join(' ')}
          role="listbox"
        >
          {includeAllOption && (!query.trim() || query.trim().toLowerCase().includes('all')) ? (
            <li>
              <button
                type="button"
                role="option"
                aria-selected={value === ALL_EMPLOYEES_CODE}
                className={[
                  'w-full px-3 py-2 text-left hover:bg-slate-50 focus:bg-primary/5 focus:outline-none',
                  value === ALL_EMPLOYEES_CODE ? 'bg-primary/5' : '',
                  compact ? 'text-xs' : 'text-sm',
                ].join(' ')}
                onClick={() => {
                  onChange(ALL_EMPLOYEES_CODE);
                  setQuery('All employees');
                  setOpen(false);
                  setBrowseAll(false);
                }}
              >
                <span className="font-bold text-primary">All employees</span>
                <span className="mt-0.5 block text-xs text-slate-500">Generate for every employee</span>
              </button>
            </li>
          ) : null}
          {filtered.length === 0 && !(includeAllOption && !query.trim()) ? (
            <li className="px-3 py-2 text-sm text-slate-500">No employees match your search.</li>
          ) : (
            filtered.map((e) => (
              <li key={e.empCode}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === e.empCode}
                  className={[
                    'w-full px-3 py-2 text-left hover:bg-slate-50 focus:bg-primary/5 focus:outline-none',
                    value === e.empCode ? 'bg-primary/5' : '',
                    compact ? 'text-xs' : 'text-sm',
                  ].join(' ')}
                  onClick={() => {
                    onChange(e.empCode);
                    setQuery(displayLabel(e, compact));
                    setOpen(false);
                    setBrowseAll(false);
                  }}
                >
                  <span className="font-medium text-slate-800">{e.employeeName}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {e.empCode}
                    {e.department ? ` · ${e.department}` : ''}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
};
