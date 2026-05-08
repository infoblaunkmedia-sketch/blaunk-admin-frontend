import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../shared/components/PageHeader';
import { SectionCard } from '../../shared/components/SectionCard';
import { FormField } from '../../shared/components/FormField';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { generateExcelReport } from '../../shared/utils/reportGenerator';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

type Department = keyof typeof REPORT_TYPES;

const REPORT_TYPES = {
  HR: ['Employee List', 'Salary Register', 'Vacancy Report'],
  Finance: ['B2B Payment Ledger', 'Outstanding Payments'],
  DSA: ['DSA Performance', 'DSA Payment History', 'DSA Limit Usage'],
  Sales: [
    'MIS-Subscription', 'MIS-Lead Tour', 'MIS-Lead Cake',
    'MIS-Lead Store', 'MIS-Product Listing', 'MIS-Email Subscription',
  ],
  Admin: ['Country Login Analytics', 'Admin Activity'],
  'Customer Care': ['Issue Report', 'Review Summary'],
  Verifier: ['Verifier Activity', 'KYC Status'],
  IT: ['Security Log', 'IP Access Log'],
  'Company Secretary': ['Shareholding Register'],
  Payroll: ['Monthly Payslip Register', 'Yearly Summary', 'Employee Cost'],
} as const;

const COLUMN_MAP: Record<string, { header: string; key: string; width?: number }[]> = {
  'Employee List': [
    { header: 'Employee Code', key: 'empCode', width: 14 },
    { header: 'Full Name', key: 'fullName', width: 22 },
    { header: 'Department', key: 'department', width: 18 },
    { header: 'Designation', key: 'designation', width: 20 },
    { header: 'Date of Joining', key: 'doj', width: 16 },
    { header: 'Status', key: 'status', width: 12 },
  ],
  'Salary Register': [
    { header: 'Employee Code', key: 'empCode', width: 14 },
    { header: 'Full Name', key: 'fullName', width: 22 },
    { header: 'Basic', key: 'basic', width: 12 },
    { header: 'HRA', key: 'hra', width: 10 },
    { header: 'Monthly CTC', key: 'ctc', width: 14 },
    { header: 'Per Day CTC', key: 'perDay', width: 14 },
  ],
  'Vacancy Report': [
    { header: 'Job Title', key: 'title', width: 22 },
    { header: 'Department', key: 'department', width: 18 },
    { header: 'Openings', key: 'openings', width: 10 },
    { header: 'Posted Date', key: 'postedDate', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
  ],
  'B2B Payment Ledger': [
    { header: 'Order ID', key: 'orderId', width: 16 },
    { header: 'Payin Amount', key: 'payinAmount', width: 14 },
    { header: 'Net Payout', key: 'netPayout', width: 14 },
    { header: 'Transfer Status', key: 'transferStatus', width: 16 },
    { header: 'Date', key: 'date', width: 12 },
  ],
  'Outstanding Payments': [
    { header: 'Order ID', key: 'orderId', width: 16 },
    { header: 'Amount Due', key: 'amountDue', width: 14 },
    { header: 'Due Date', key: 'dueDate', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
  ],
  'DSA Performance': [
    { header: 'DSA Code', key: 'dsaCode', width: 14 },
    { header: 'DSA Name', key: 'dsaName', width: 22 },
    { header: 'Total Transactions', key: 'totalTx', width: 18 },
    { header: 'Total Volume', key: 'totalVolume', width: 16 },
  ],
  'DSA Payment History': [
    { header: 'DSA Code', key: 'dsaCode', width: 14 },
    { header: 'Amount', key: 'amount', width: 14 },
    { header: 'Currency', key: 'currency', width: 10 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Date', key: 'date', width: 12 },
  ],
  'DSA Limit Usage': [
    { header: 'DSA Code', key: 'dsaCode', width: 14 },
    { header: 'Available Balance', key: 'available', width: 18 },
    { header: 'Used', key: 'used', width: 12 },
    { header: 'BOD Balance', key: 'bod', width: 14 },
  ],
  'Issue Report': [
    { header: 'RN No.', key: 'rnNumber', width: 14 },
    { header: 'Customer', key: 'customerName', width: 22 },
    { header: 'Issue Type', key: 'issueType', width: 18 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Raised Date', key: 'raisedDate', width: 14 },
  ],
  'Review Summary': [
    { header: 'Reviewer', key: 'reviewerName', width: 22 },
    { header: 'Product', key: 'product', width: 20 },
    { header: 'Rating', key: 'rating', width: 8 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Date', key: 'date', width: 12 },
  ],
  'Shareholding Register': [
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Folio No.', key: 'folioNumber', width: 14 },
    { header: 'PAN', key: 'pan', width: 12 },
    { header: 'Share Type', key: 'shareType', width: 18 },
    { header: 'No. of Shares', key: 'numberOfShares', width: 14 },
    { header: 'Holding %', key: 'holdingPercent', width: 12 },
  ],
  'Monthly Payslip Register': [
    { header: 'Employee Code', key: 'empCode', width: 14 },
    { header: 'Name', key: 'fullName', width: 22 },
    { header: 'Month', key: 'month', width: 12 },
    { header: 'Basic', key: 'basic', width: 12 },
    { header: 'Monthly CTC', key: 'ctc', width: 14 },
  ],
  'Yearly Summary': [
    { header: 'Employee Code', key: 'empCode', width: 14 },
    { header: 'Name', key: 'fullName', width: 22 },
    { header: 'Financial Year', key: 'fy', width: 14 },
    { header: 'Annual CTC', key: 'annualCtc', width: 14 },
  ],
  'Employee Cost': [
    { header: 'Employee Code', key: 'empCode', width: 14 },
    { header: 'Name', key: 'fullName', width: 22 },
    { header: 'Monthly CTC', key: 'ctc', width: 14 },
    { header: 'Annual Cost', key: 'annualCost', width: 14 },
  ],
};

const DEFAULT_COLUMNS = [
  { header: 'ID', key: 'id', width: 14 },
  { header: 'Name', key: 'name', width: 22 },
  { header: 'Date', key: 'date', width: 14 },
  { header: 'Status', key: 'status', width: 12 },
];

const DEPARTMENTS = Object.keys(REPORT_TYPES) as Department[];

export const ReportsPage: React.FC = () => {
  const [department, setDepartment] = React.useState<Department | ''>('');
  const [reportType, setReportType] = React.useState('');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [extraFilter, setExtraFilter] = React.useState('');
  const [generating, setGenerating] = React.useState(false);

  const reportTypes = department ? [...REPORT_TYPES[department]] : [];

  React.useEffect(() => { setReportType(''); }, [department]);

  const handleGenerate = async () => {
    if (!department) { toast.error('Select a department'); return; }
    if (!reportType) { toast.error('Select a report type'); return; }
    if (!fromDate || !toDate) { toast.error('Select date range'); return; }

    setGenerating(true);
    try {
      const columns = COLUMN_MAP[reportType] ?? DEFAULT_COLUMNS;
      await generateExcelReport(
        { title: reportType, sheetName: reportType.slice(0, 31), columns },
        [],
        `${reportType.replace(/\s+/g, '_')}_${fromDate}_to_${toDate}.xlsx`,
      );
      toast.success(`${reportType} exported`);
    } catch { toast.error('Export failed'); }
    finally { setGenerating(false); }
  };

  return (
    <ErrorBoundary>
      <PageHeader title="Reports (MIS)"
        subtitle="Unified report generator — select department and report type, then export to Excel." />

      <SectionCard title="Generate Report">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Department" required>
            <select className={inputClass} value={department}
              onChange={(e) => setDepartment(e.target.value as Department | '')}>
              <option value="">Select department…</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </FormField>

          <FormField label="Report Type" required>
            <select className={inputClass} value={reportType} disabled={!department}
              onChange={(e) => setReportType(e.target.value)}>
              <option value="">Select report type…</option>
              {reportTypes.map((r) => <option key={r}>{r}</option>)}
            </select>
          </FormField>

          <FormField label="Additional Filter (optional)">
            <input className={inputClass} placeholder="Employee code, country, etc."
              value={extraFilter} onChange={(e) => setExtraFilter(e.target.value)} />
          </FormField>

          <FormField label="From Date" required>
            <input type="date" className={`${inputClass} [color-scheme:light]`}
              value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </FormField>

          <FormField label="To Date" required>
            <input type="date" className={`${inputClass} [color-scheme:light]`}
              value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </FormField>

          <FormField label="Output Format">
            <div className={`${inputClass} flex cursor-default items-center font-semibold text-slate-600`}>
              Excel (.xlsx)
            </div>
          </FormField>
        </div>

        <div className="mt-5">
          <button type="button" disabled={generating} onClick={handleGenerate}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
            {generating ? 'Generating…' : 'Generate Report'}
          </button>
        </div>
      </SectionCard>

      {department && reportType && (
        <SectionCard title="Report Preview" className="mt-5">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-center">
            <p className="text-sm font-semibold text-slate-600">{reportType}</p>
            <p className="mt-1 text-xs text-slate-400">
              {fromDate && toDate ? `${fromDate} → ${toDate}` : 'Set date range to generate'}
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Data will be fetched from the API and downloaded as an Excel file.
            </p>
          </div>
        </SectionCard>
      )}
    </ErrorBoundary>
  );
};
