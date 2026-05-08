import React from 'react';

const financialYears = ['2023-24', '2024-25'];
const reportTypes = [
  'Monthly Payslip',
  'Investment Declaration',
  'FORM16',
  'Yearly Payslip',
  'Employee CTC',
];
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const outputFormats = ['PDF', 'Excel'];

export const PayslipDashboardPage: React.FC = () => {
  const [reportType, setReportType] = React.useState('');

  const handleGenerateReport = () => {
    window.alert('Report generation started (UI demo only).');
  };

  const filterInputClass =
    'h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25';
  const periodLabel = reportType === 'Monthly Payslip' ? 'Monthly' : 'Yearly';
  const isMonthlyPeriod = periodLabel === 'Monthly';

  return (
    <section className="flex w-full flex-col gap-4">
      <h1 className="text-3xl font-bold text-primary">
        Payslip
      </h1>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card" role="region" aria-label="Payslip filters">
        <div
          className="grid min-w-[1080px] gap-0 bg-primary px-2 py-3 text-left text-sm font-semibold text-white"
          style={{ gridTemplateColumns: '1.25fr 1fr 1.45fr 0.9fr 1.15fr 1.45fr 1.2fr' }}
        >
          <div className="px-3">Financial Year</div>
          <div className="px-3">Department</div>
          <div className="px-3">Report Type</div>
          <div className="px-3">Period</div>
          <div className="px-3">Month</div>
          <div className="px-3">Output Format</div>
          <div className="px-3">Action</div>
        </div>

        <div
          className="grid min-w-[1080px] gap-3 border-t border-slate-200 bg-white px-2 py-3"
          style={{ gridTemplateColumns: '1.25fr 1fr 1.45fr 0.9fr 1.15fr 1.45fr 1.2fr' }}
        >
          <div className="px-1.5">
            <select id="financial-year" defaultValue="" className={filterInputClass}>
              <option value="">Select Financial Year</option>
              {financialYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="px-1.5">
            <select id="department" defaultValue="Finance" className={filterInputClass}>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div className="px-1.5">
            <select
              id="report-type"
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
              className={filterInputClass}
            >
              <option value="">Select Report Type</option>
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="px-1.5">
            <button
              id="period-monthly"
              type="button"
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              {periodLabel}
            </button>
          </div>

          <div className="px-1.5">
            <select id="month" defaultValue="" className={filterInputClass} disabled={!isMonthlyPeriod}>
              <option value="">Select Month</option>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="px-1.5">
            <select id="output-format" defaultValue="" className={filterInputClass}>
              <option value="">Select Output Format</option>
              {outputFormats.map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>
          </div>

          <div className="px-1.5">
            <button
              type="button"
              className="h-11 w-full whitespace-nowrap rounded-md bg-primary px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-primary-dark"
              onClick={handleGenerateReport}
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
