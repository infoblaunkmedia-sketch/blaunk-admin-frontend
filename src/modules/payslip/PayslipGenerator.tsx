import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../shared/components/PageHeader';
import { SectionCard } from '../../shared/components/SectionCard';
import {
  fetchPayrollEmployees,
  generatePayslipReport,
  type DetailedPayslip,
} from './payslip.service';
import { PayslipResults } from './PayslipResults';
import { SearchableEmployeeSelect } from './SearchableEmployeeSelect';
import { getPayrollReportConfig, PAYROLL_REPORT_TYPES } from './payrollReportConfig';

const FINANCIAL_YEARS = ['2023-24', '2024-25', '2025-26', '2026-27'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const selectClass =
  'h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:bg-slate-50 disabled:text-slate-400';

const labelClass = 'mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600';

function downloadExcel(payslips: DetailedPayslip[], reportLabel: string) {
  const headers = ['Employee Code', 'Employee Name', 'Department', 'Gross Earnings', 'Net Salary'];
  const rows = payslips.map((p) => [
    p.employeeCode,
    p.employeeName,
    p.department,
    String(p.grossEarnings),
    String(p.nettSalaryRelease),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${reportLabel.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function isFormValid(
  reportType: string,
  financialYear: string,
  employeeCode: string,
  month: string,
  outputFormat: string,
): boolean {
  const cfg = getPayrollReportConfig(reportType);
  if (!cfg || !financialYear || !employeeCode || !outputFormat) return false;
  if (cfg.needsMonth && !month) return false;
  return true;
}

export type PayslipGeneratorProps = {
  title: string;
  subtitle: string;
};

export const PayslipGenerator: React.FC<PayslipGeneratorProps> = ({ title, subtitle }) => {
  const [employees, setEmployees] = React.useState<Awaited<ReturnType<typeof fetchPayrollEmployees>>>([]);
  const [dataLoading, setDataLoading] = React.useState(true);

  const [financialYear, setFinancialYear] = React.useState('');
  const [reportType, setReportType] = React.useState('');
  const [employeeCode, setEmployeeCode] = React.useState('');
  const [month, setMonth] = React.useState('');
  const [outputFormat, setOutputFormat] = React.useState<'pdf' | 'excel' | ''>('');
  const [generating, setGenerating] = React.useState(false);
  const [payslips, setPayslips] = React.useState<DetailedPayslip[]>([]);

  const cfg = reportType ? getPayrollReportConfig(reportType) : undefined;
  const canGenerate = isFormValid(reportType, financialYear, employeeCode, month, outputFormat);

  React.useEffect(() => {
    let cancelled = false;
    setDataLoading(true);
    void fetchPayrollEmployees()
      .then((emps) => {
        if (!cancelled) setEmployees(emps);
      })
      .catch(() => {
        if (!cancelled) toast.error('Failed to load employees.');
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  React.useEffect(() => {
    setEmployeeCode('');
    setMonth('');
    setOutputFormat('');
    setPayslips([]);
  }, [reportType]);

  React.useEffect(() => {
    if (!cfg?.outputFormats.length) return;
    if (!outputFormat || !cfg.outputFormats.includes(outputFormat)) {
      setOutputFormat(cfg.outputFormats[0]);
    }
  }, [cfg, outputFormat]);

  const handleGenerate = async () => {
    if (!canGenerate || !cfg) return;

    setGenerating(true);
    setPayslips([]);
    try {
      const res = await generatePayslipReport({
        financialYear,
        reportType: cfg.backendType,
        period: cfg.period,
        month: cfg.needsMonth ? month : '',
        employeeCode,
        outputFormat: outputFormat as 'pdf' | 'excel',
      });
      const list = (res.data?.payslips || []).filter((p) => p.employeeCode === employeeCode);
      if (!list.length) {
        toast.info('No records found.');
        return;
      }

      if (outputFormat === 'excel') {
        downloadExcel(list, reportType);
        toast.success('Excel downloaded.');
      } else {
        setPayslips(list);
        toast.success('Generated.');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const showMonth = Boolean(cfg?.needsMonth);
  const actionCol = showMonth ? 'md:col-span-2' : 'md:col-span-3';
  const employeeCol = showMonth ? 'md:col-span-5' : 'md:col-span-6';
  const monthCol = 'md:col-span-3';
  const formatCol = showMonth ? 'md:col-span-2' : 'md:col-span-3';

  return (
    <>
      <PageHeader title={title} subtitle={subtitle} />

      <SectionCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Report type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className={selectClass}
              disabled={dataLoading}
            >
              <option value="">Select</option>
              {PAYROLL_REPORT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Financial year</label>
            <select
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
              className={selectClass}
              disabled={!reportType}
            >
              <option value="">Select</option>
              {FINANCIAL_YEARS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {reportType && cfg ? (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
            <div className={employeeCol}>
              <label className={labelClass}>Employee</label>
              <SearchableEmployeeSelect
                employees={employees}
                value={employeeCode}
                onChange={setEmployeeCode}
                disabled={dataLoading}
              />
            </div>

            {showMonth ? (
              <div className={monthCol}>
                <label className={labelClass}>Month</label>
                <select value={month} onChange={(e) => setMonth(e.target.value)} className={selectClass}>
                  <option value="">Select</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className={formatCol}>
              <label className={labelClass}>Output format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as 'pdf' | 'excel')}
                className={selectClass}
              >
                <option value="">Select</option>
                {cfg.outputFormats.map((f) => (
                  <option key={f} value={f}>
                    {f === 'pdf' ? 'PDF' : 'Excel'}
                  </option>
                ))}
              </select>
            </div>

            <div className={actionCol}>
              <button
                type="button"
                disabled={!canGenerate || generating || dataLoading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => void handleGenerate()}
              >
                {generating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating…
                  </>
                ) : (
                  'Generate'
                )}
              </button>
            </div>
          </div>
        ) : null}
      </SectionCard>

      {payslips.length > 0 ? (
        <SectionCard title="Preview" className="mt-4">
          <PayslipResults payslips={payslips} onPrint={() => window.print()} />
        </SectionCard>
      ) : null}
    </>
  );
};
