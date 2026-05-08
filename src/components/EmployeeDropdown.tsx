import React from 'react';

type EmployeeCodeType = 'employee' | '3pc';

interface EmployeeDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type: EmployeeCodeType;
}

interface EmployeeOption {
  id: string;
  code: string;
  name: string;
}

const STATIC_EMPLOYEE: EmployeeOption[] = [
  { id: 'e1', code: 'EMP001', name: 'Sample Employee' },
  { id: 'e2', code: 'EMP002', name: 'Another Employee' },
];

const STATIC_3PC: EmployeeOption[] = [
  { id: 't1', code: '3PC001', name: 'Sample 3PC' },
  { id: 't2', code: '3PC002', name: 'Another 3PC' },
];

function optionsForType(type: EmployeeCodeType): EmployeeOption[] {
  return type === '3pc' ? STATIC_3PC : STATIC_EMPLOYEE;
}

export const EmployeeDropdown: React.FC<EmployeeDropdownProps> = ({
  label,
  value,
  onChange,
  type,
}) => {
  const options = React.useMemo(() => optionsForType(type), [type]);

  return (
    <div className="min-w-0 w-full flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      {label ? (
        <label className="text-sm font-semibold text-slate-700 sm:w-40">
          {label}
        </label>
      ) : null}

      <div className={label ? 'min-w-0 flex-1 sm:max-w-[220px]' : 'min-w-0 w-full flex-1 overflow-hidden sm:max-w-[260px]'}>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="block h-11 w-full min-w-0 max-w-full appearance-none truncate rounded-lg border border-slate-300 bg-white bg-no-repeat px-3 pr-9 text-sm text-slate-700 outline-none transition hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.25rem',
          }}
          aria-label="Select employee code"
        >
          <option value="">Select Emp Code</option>
          {options.map((employee) => (
            <option key={employee.id} value={employee.code}>
              {employee.code} - {employee.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
