import React from 'react';
import type { TableColumn } from 'react-data-table-component';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { DataTableWrapper, ListTableSearchInput } from '../../../shared/components/DataTableWrapper';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import type { Employee } from '../people.types';
import { fetchEmployees } from '../people.service';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const FINANCIAL_YEARS = ['2024-25', '2025-26', '2026-27'];

const PAYROLL_TABS = ['Monthly Payslip', 'Yearly Payslip', 'Employee Cost'] as const;
type PayrollTab = typeof PAYROLL_TABS[number];

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export const Payroll: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<PayrollTab>('Monthly Payslip');
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [filtered, setFiltered] = React.useState<Employee[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [filters, setFilters] = React.useState({
    financialYear: '',
    department: '',
    employeeCode: '',
    month: '',
  });
  const [tableSearch, setTableSearch] = React.useState('');

  React.useEffect(() => {
    fetchEmployees().then(setEmployees);
  }, []);

  const setFilter = (key: keyof typeof filters, val: string) =>
    setFilters((p) => ({ ...p, [key]: val }));

  const handleGenerate = () => {
    setLoading(true);
    let result = [...employees];
    if (filters.department) result = result.filter((e) => e.department === filters.department);
    if (filters.employeeCode) result = result.filter((e) => e.employeeCode.includes(filters.employeeCode));
    setFiltered(result);
    setLoading(false);
  };

  const departments = [...new Set(employees.map((e) => e.department).filter(Boolean))];

  const columns: TableColumn<Employee>[] = [
    { name: 'Code', selector: (r) => r.employeeCode, width: '90px' },
    { name: 'Name', selector: (r) => r.fullName, grow: 2 },
    { name: 'Department', selector: (r) => r.department },
    { name: 'Basic', selector: (r) => r.basicSalary, format: (r) => `₹${r.basicSalary.toLocaleString()}` },
    { name: 'HRA', selector: (r) => r.hra, format: (r) => `₹${r.hra.toLocaleString()}` },
    { name: 'Monthly CTC', selector: (r) => r.monthlyCtc, format: (r) => `₹${r.monthlyCtc.toLocaleString()}` },
    {
      name: 'Action',
      cell: () => (
        <button
          type="button"
          className="rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white hover:bg-primary-dark"
        >
          Generate PDF
        </button>
      ),
      width: '130px',
      ignoreRowClick: true,
    },
  ];

  return (
    <ErrorBoundary>
      <PageHeader title="Payroll" subtitle="Generate payslips and cost reports."
        beforeActions={<ListTableSearchInput value={tableSearch} onChange={setTableSearch} />} />

      <div className="mb-5 flex flex-wrap gap-2">
        {PAYROLL_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              'rounded-lg border px-4 py-1.5 text-sm font-semibold transition',
              activeTab === tab
                ? 'border-primary bg-primary text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300',
            ].join(' ')}
          >
            {tab}
          </button>
        ))}
      </div>

      <SectionCard title="Filters" className="mb-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Financial Year</label>
            <select className={inputClass} value={filters.financialYear}
              onChange={(e) => setFilter('financialYear', e.target.value)}>
              <option value="">All Years</option>
              {FINANCIAL_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Department</label>
            <select className={inputClass} value={filters.department}
              onChange={(e) => setFilter('department', e.target.value)}>
              <option value="">All</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-600">Employee Code</label>
            <input className={inputClass} placeholder="Search code"
              value={filters.employeeCode} onChange={(e) => setFilter('employeeCode', e.target.value)} />
          </div>
          {activeTab === 'Monthly Payslip' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-600">Month</label>
              <select className={inputClass} value={filters.month}
                onChange={(e) => setFilter('month', e.target.value)}>
                <option value="">All Months</option>
                {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}
          <div className="flex items-end">
            <button type="button" onClick={handleGenerate}
              className="h-9 w-full rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">
              Apply Filters
            </button>
          </div>
        </div>
      </SectionCard>

      <DataTableWrapper columns={columns} data={filtered} loading={loading} searchable
        filterText={tableSearch} onFilterTextChange={setTableSearch} hideSearchInput />
    </ErrorBoundary>
  );
};
