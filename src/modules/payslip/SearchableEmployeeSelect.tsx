import React from 'react';
import type { PayrollEmployeeOption } from './payslip.service';

const inputClass =
  'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:bg-slate-50 disabled:text-slate-400';

type Props = {
  employees: PayrollEmployeeOption[];
  value: string;
  onChange: (empCode: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export const SearchableEmployeeSelect: React.FC<Props> = ({
  employees,
  value,
  onChange,
  disabled,
  placeholder = 'Search by name or employee code…',
}) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const wrapRef = React.useRef<HTMLDivElement>(null);

  const selected = employees.find((e) => e.empCode === value);

  React.useEffect(() => {
    if (selected) {
      setQuery(`${selected.employeeName} (${selected.empCode})`);
    } else if (!value) {
      setQuery('');
    }
  }, [selected, value]);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || (selected && query === `${selected.employeeName} (${selected.empCode})`)) {
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
  }, [employees, query, selected]);

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        className={inputClass}
        disabled={disabled}
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value.trim()) onChange('');
        }}
        onFocus={() => setOpen(true)}
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {open && !disabled ? (
        <ul
          className="absolute z-30 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">No employees match your search.</li>
          ) : (
            filtered.map((e) => (
              <li key={e.empCode}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === e.empCode}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 focus:bg-primary/5 focus:outline-none"
                  onClick={() => {
                    onChange(e.empCode);
                    setQuery(`${e.employeeName} (${e.empCode})`);
                    setOpen(false);
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
