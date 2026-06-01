import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../shared/components/PageHeader';
import { SectionCard } from '../../shared/components/SectionCard';
import { FormField } from '../../shared/components/FormField';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { generateExcelReport } from '../../shared/utils/reportGenerator';
import { fetchMisReportRows, type UploadSourceFilter } from './reports.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

/** Aligns with sidebar modules that need operational MIS exports (Excel). */
const REPORT_TYPES = {
  Employees: [
    'Employee List',
    'Salary Register',
    'Vacancy Report',
    '3P DSA Employee Roster',
  ],
  Payroll: ['Monthly Payroll Summary', 'Yearly Payroll Summary', 'Employee Cost Summary'],
  Finance: ['B2B Payment Ledger', 'Outstanding Payments'],
  DSA: [
    'DSA Performance',
    'DSA Payment History',
    'DSA Limit Usage',
    'DSA Ad Activity',
  ],
  Verifier: ['Verifier Activity', 'KYC Status Summary'],
  Sales: [
    'MIS-Subscription',
    'MIS-Lead Tour',
    'MIS-Lead Cake',
    'MIS-Lead Store',
    'MIS-Product Listing',
    'MIS-Email Subscription',
  ],
  'Customer Care': ['Issue Report', 'Review Summary', 'Vendor Status Summary'],
  'Company Secretary': ['Shareholding Register'],
  IT: ['Security Log', 'IP Access Log'],
  'Admin & Personnel': ['Admin Activity Log'],
} as const;

type Department = keyof typeof REPORT_TYPES;

const SALES_UPLOAD_REPORT_TYPES = new Set([
  'MIS-Subscription',
  'MIS-Lead Tour',
  'MIS-Lead Cake',
  'MIS-Lead Store',
  'MIS-Product Listing',
  'MIS-Email Subscription',
]);

const UPLOAD_TRACKING_COLUMNS = [
  { header: 'Upload Source', key: 'uploadSourceLabel', width: 16 },
  { header: 'DSA Code', key: 'dsaEmpCode', width: 14 },
  { header: 'DSA Name', key: 'dsaName', width: 22 },
];

const SALES_AD_COLUMNS = [
  { header: 'Media Tab', key: 'mediaTab', width: 14 },
  { header: 'Section', key: 'section', width: 12 },
  { header: 'Country', key: 'country', width: 12 },
  { header: 'Category', key: 'category', width: 14 },
  { header: 'Plan', key: 'plan', width: 18 },
  { header: 'DSA', key: 'dsaCode', width: 12 },
  { header: 'Amount', key: 'amount', width: 12 },
  { header: 'Upload Date', key: 'date', width: 12 },
  { header: 'Status', key: 'status', width: 10 },
  ...UPLOAD_TRACKING_COLUMNS,
];

const DSA_AD_COLUMNS = [...SALES_AD_COLUMNS];

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
  'Monthly Payroll Summary': [
    { header: 'Employee Code', key: 'empCode', width: 14 },
    { header: 'Name', key: 'fullName', width: 22 },
    { header: 'Department', key: 'department', width: 18 },
    { header: 'Gross Earnings', key: 'grossEarnings', width: 14 },
    { header: 'Net Salary', key: 'netSalary', width: 14 },
  ],
  'Yearly Payroll Summary': [
    { header: 'Employee Code', key: 'empCode', width: 14 },
    { header: 'Name', key: 'fullName', width: 22 },
    { header: 'Department', key: 'department', width: 18 },
    { header: 'Gross (Annual)', key: 'grossEarnings', width: 14 },
    { header: 'Net (Annual)', key: 'netSalary', width: 14 },
  ],
  'Employee Cost Summary': [
    { header: 'Employee Code', key: 'empCode', width: 14 },
    { header: 'Name', key: 'fullName', width: 22 },
    { header: 'Department', key: 'department', width: 18 },
    { header: 'Annual Cost', key: 'annualCost', width: 14 },
    { header: 'Gross (Annual)', key: 'grossEarnings', width: 14 },
  ],
  '3P DSA Employee Roster': [
    { header: '3P Code', key: 'empCode', width: 14 },
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Department', key: 'department', width: 16 },
    { header: 'Company', key: 'company', width: 20 },
    { header: 'Mobile', key: 'mobile', width: 14 },
    { header: 'Email', key: 'email', width: 22 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Country', key: 'country', width: 12 },
    { header: 'Last Updated', key: 'updatedAt', width: 14 },
  ],
  'B2B Payment Ledger': [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'DSA Code', key: 'dsaCode', width: 14 },
    { header: 'DSA Name', key: 'dsaName', width: 20 },
    { header: 'Country', key: 'country', width: 12 },
    { header: 'Mode', key: 'mode', width: 10 },
    { header: 'Payin Amount', key: 'payinAmount', width: 14 },
    { header: 'Net Payout (INR)', key: 'netPayout', width: 14 },
    { header: 'Share %', key: 'sharePct', width: 10 },
    { header: 'Status', key: 'transferStatus', width: 14 },
    { header: 'Approval Date', key: 'approvalDate', width: 14 },
    { header: 'Txn Ref', key: 'orderId', width: 16 },
  ],
  'Outstanding Payments': [
    { header: 'Txn Ref', key: 'orderId', width: 16 },
    { header: 'Amount Due', key: 'amountDue', width: 14 },
    { header: 'Due Date', key: 'dueDate', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
  ],
  'DSA Performance': [
    { header: 'DSA Code', key: 'dsaCode', width: 14 },
    { header: 'DSA Name', key: 'dsaName', width: 22 },
    { header: 'Total Transactions', key: 'totalTx', width: 18 },
    { header: 'Total Volume (INR)', key: 'totalVolume', width: 16 },
    { header: 'Approved', key: 'approvedCount', width: 12 },
    { header: 'Rejected', key: 'rejectedCount', width: 12 },
  ],
  'DSA Payment History': [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'DSA Code', key: 'dsaCode', width: 14 },
    { header: 'Amount', key: 'amount', width: 14 },
    { header: 'Currency', key: 'currency', width: 10 },
    { header: 'Status', key: 'status', width: 12 },
  ],
  'DSA Limit Usage': [
    { header: 'DSA Code', key: 'dsaCode', width: 14 },
    { header: 'Available Balance', key: 'available', width: 18 },
    { header: 'Used', key: 'used', width: 12 },
    { header: 'BOD Balance', key: 'bod', width: 14 },
  ],
  'DSA Ad Activity': DSA_AD_COLUMNS,
  'Admin Activity Log': [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Action', key: 'action', width: 28 },
    { header: 'Performed By', key: 'performedBy', width: 18 },
    { header: 'Role', key: 'role', width: 12 },
    { header: 'Module', key: 'module', width: 14 },
  ],
  'Issue Report': [
    { header: 'RN No.', key: 'rnNumber', width: 14 },
    { header: 'Customer', key: 'customerName', width: 22 },
    { header: 'Customer ID', key: 'customerId', width: 14 },
    { header: 'Issue Type', key: 'issueType', width: 18 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Raised Date', key: 'raisedDate', width: 14 },
    { header: 'Resolved Date', key: 'resolvedDate', width: 14 },
  ],
  'Review Summary': [
    { header: 'Reviewer', key: 'reviewerName', width: 22 },
    { header: 'Product / Vendor', key: 'product', width: 20 },
    { header: 'Rating', key: 'rating', width: 8 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Review', key: 'reviewText', width: 40 },
  ],
  'Vendor Status Summary': [
    { header: 'Vendor Code', key: 'vendorCode', width: 14 },
    { header: 'Business Name', key: 'businessName', width: 24 },
    { header: 'Email', key: 'email', width: 22 },
    { header: 'Mobile', key: 'mobile', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Approval', key: 'approvalStatus', width: 12 },
    { header: 'KYC', key: 'kycStatus', width: 12 },
    { header: 'Registered', key: 'registeredDate', width: 12 },
    { header: 'Last Updated', key: 'lastUpdated', width: 12 },
  ],
  'Verifier Activity': [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Vendor ID', key: 'vendorId', width: 22 },
    { header: 'Company', key: 'companyName', width: 22 },
    { header: 'Email', key: 'emailStatus', width: 12 },
    { header: 'Mobile', key: 'mobileStatus', width: 12 },
    { header: 'Photo', key: 'photoStatus', width: 12 },
    { header: 'Bank', key: 'bankStatus', width: 12 },
    { header: 'Shop', key: 'shopStatus', width: 12 },
    { header: 'Overall', key: 'overallStatus', width: 12 },
    { header: 'Submitted By', key: 'submittedBy', width: 14 },
    { header: 'Reviewed By', key: 'reviewedBy', width: 14 },
  ],
  'KYC Status Summary': [
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Vendor ID', key: 'vendorId', width: 22 },
    { header: 'Company', key: 'companyName', width: 22 },
    { header: 'Overall KYC', key: 'overallStatus', width: 14 },
    { header: 'Submitted By', key: 'submittedBy', width: 14 },
    { header: 'Reviewed By', key: 'reviewedBy', width: 14 },
  ],
  'Shareholding Register': [
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Beneficiary DP ID', key: 'beneficiaryDpId', width: 16 },
    { header: 'Folio No.', key: 'folioNumber', width: 14 },
    { header: 'PAN', key: 'pan', width: 12 },
    { header: 'Share Type', key: 'shareType', width: 18 },
    { header: 'No. of Shares', key: 'numberOfShares', width: 14 },
    { header: 'Holding %', key: 'holdingPercent', width: 12 },
    { header: 'Mobile', key: 'mobile', width: 14 },
    { header: 'Remarks', key: 'remarks', width: 20 },
  ],
  'Security Log': [
    { header: 'Type', key: 'type', width: 16 },
    { header: 'Value', key: 'value', width: 24 },
    { header: 'Added By', key: 'addedBy', width: 16 },
    { header: 'Added Date', key: 'addedDate', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
  ],
  'IP Access Log': [
    { header: 'Type', key: 'type', width: 16 },
    { header: 'Value', key: 'value', width: 24 },
    { header: 'Added By', key: 'addedBy', width: 16 },
    { header: 'Added Date', key: 'addedDate', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
  ],
  'MIS-Subscription': SALES_AD_COLUMNS,
  'MIS-Lead Tour': SALES_AD_COLUMNS,
  'MIS-Lead Cake': SALES_AD_COLUMNS,
  'MIS-Lead Store': SALES_AD_COLUMNS,
  'MIS-Product Listing': SALES_AD_COLUMNS,
  'MIS-Email Subscription': SALES_AD_COLUMNS,
};

const DEPARTMENT_HINTS: Record<Department, string> = {
  Employees: 'Employee master, salary register, vacancies, 3P DSA roster',
  Payroll: 'Excel summaries for admin — use People → Payroll for payslip PDFs and FORM16',
  Finance: 'B2B payouts and outstanding payments',
  DSA: 'Channel partner DSA payments, limits, and ad uploads',
  Verifier: 'Vendor verification and KYC status',
  Sales: 'Advertisement / subscription uploads by section',
  'Customer Care': 'Issues, reviews, and vendor account status',
  'Company Secretary': 'Shareholding register',
  IT: 'IP and security configuration',
  'Admin & Personnel': 'Admin panel activity audit trail',
};

const DEPARTMENTS = Object.keys(REPORT_TYPES) as Department[];

function defaultDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    from: start.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  };
}

export const ReportsPage: React.FC = () => {
  const defaults = React.useMemo(() => defaultDateRange(), []);
  const [department, setDepartment] = React.useState<Department | ''>('');
  const [reportType, setReportType] = React.useState('');
  const [fromDate, setFromDate] = React.useState(defaults.from);
  const [toDate, setToDate] = React.useState(defaults.to);
  const [extraFilter, setExtraFilter] = React.useState('');
  const [uploadSourceFilter, setUploadSourceFilter] = React.useState<UploadSourceFilter>('all');
  const [generating, setGenerating] = React.useState(false);

  const reportTypes = department ? [...REPORT_TYPES[department]] : [];
  const showUploadSourceFilter =
    department === 'Sales' && reportType !== '' && SALES_UPLOAD_REPORT_TYPES.has(reportType);
  const showDsaUploadFilter =
    department === 'DSA' && reportType === 'DSA Ad Activity';

  React.useEffect(() => {
    setReportType('');
    setUploadSourceFilter('all');
  }, [department]);

  const handleGenerate = async () => {
    if (!department) {
      toast.error('Select a module');
      return;
    }
    if (!reportType) {
      toast.error('Select a report type');
      return;
    }
    if (!fromDate || !toDate) {
      toast.error('Select date range');
      return;
    }

    setGenerating(true);
    try {
      const columns = COLUMN_MAP[reportType] ?? [];
      const rows = await fetchMisReportRows({
        department,
        reportType,
        fromDate,
        toDate,
        uploadSource: showUploadSourceFilter || showDsaUploadFilter ? uploadSourceFilter : 'all',
        extraFilter: extraFilter.trim() || undefined,
      });
      if (!rows.length) {
        toast.info('No rows in this period — Excel will still download with headers only.');
      }
      await generateExcelReport(
        {
          title: `${department} — ${reportType}`,
          sheetName: reportType.slice(0, 31),
          columns,
        },
        rows,
        `${department.replace(/\s+/g, '_')}_${reportType.replace(/\s+/g, '_')}_${fromDate}_to_${toDate}.xlsx`,
      );
      toast.success(`Exported ${rows.length} row(s) to Excel`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <ErrorBoundary>
      <PageHeader
        title="Reports (MIS)"
        subtitle="Download live Excel snapshots by module — see what is happening across employees, finance, DSA, sales, customers, and more."
      />

      <SectionCard title="Generate Excel Report">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Module" required>
            <select
              className={inputClass}
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department | '')}
            >
              <option value="">Select module…</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {department ? (
              <p className="mt-1 text-[11px] text-slate-500">{DEPARTMENT_HINTS[department]}</p>
            ) : null}
          </FormField>

          <FormField label="Report Type" required>
            <select
              className={inputClass}
              value={reportType}
              disabled={!department}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="">Select report type…</option>
              {reportTypes.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FormField>

          {showUploadSourceFilter || showDsaUploadFilter ? (
            <FormField label="Upload Source">
              <select
                className={inputClass}
                value={uploadSourceFilter}
                onChange={(e) => setUploadSourceFilter(e.target.value as UploadSourceFilter)}
              >
                <option value="all">All</option>
                <option value="vendor_direct">Vendor Direct</option>
                <option value="admin_3p">Admin 3P DSA</option>
              </select>
            </FormField>
          ) : null}

          <FormField label="Search filter (optional)">
            <input
              className={inputClass}
              placeholder="Code, name, country, DSA…"
              value={extraFilter}
              onChange={(e) => setExtraFilter(e.target.value)}
            />
          </FormField>

          <FormField label="From Date" required>
            <input
              type="date"
              className={`${inputClass} [color-scheme:light]`}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </FormField>

          <FormField label="To Date" required>
            <input
              type="date"
              className={`${inputClass} [color-scheme:light]`}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </FormField>

          <FormField label="Output">
            <div className={`${inputClass} flex cursor-default items-center font-semibold text-slate-600`}>
              Excel (.xlsx)
            </div>
          </FormField>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={generating}
            onClick={handleGenerate}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {generating ? 'Exporting…' : 'Download Excel'}
          </button>
          <button
            type="button"
            className="text-xs font-semibold text-primary hover:underline"
            onClick={() => {
              const d = defaultDateRange();
              setFromDate(d.from);
              setToDate(d.to);
            }}
          >
            Reset dates to this month
          </button>
        </div>
      </SectionCard>

      {department && reportType ? (
        <SectionCard title="About this export" className="mt-5">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-800">{department}</span>
            {' → '}
            <span className="font-semibold text-slate-800">{reportType}</span>
            {fromDate && toDate ? (
              <span className="text-slate-500">{` · ${fromDate} to ${toDate}`}</span>
            ) : null}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Data is loaded live from the database. For payslip PDFs and FORM16 use People → Payroll.
            Reports → Payroll is Excel summary only. Settings, CMS, Platform, and Dashboard are not listed.
          </p>
        </SectionCard>
      ) : null}
    </ErrorBoundary>
  );
};
