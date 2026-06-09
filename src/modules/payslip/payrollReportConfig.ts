import type { DetailedPayslip } from './payslip.service';

export type PayrollReportTypeId =
  | 'Monthly Payslip'
  | 'Yearly Payslip'
  | 'Employee CTC'
  | 'FORM16'
  | 'Investment Declaration';

export type PayrollReportConfig = {
  id: PayrollReportTypeId;
  backendType: string;
  period: 'Monthly' | 'Yearly';
  needsMonth: boolean;
  outputFormats: Array<'pdf' | 'excel'>;
};

/** Employee self-service (sidebar Payslip): monthly & yearly PDF only. */
export const PAYROLL_SELF_SERVICE_TYPES: PayrollReportConfig[] = [
  {
    id: 'Monthly Payslip',
    backendType: 'monthly-payslip',
    period: 'Monthly',
    needsMonth: true,
    outputFormats: ['pdf'],
  },
  {
    id: 'Yearly Payslip',
    backendType: 'yearly-payslip',
    period: 'Yearly',
    needsMonth: false,
    outputFormats: ['pdf'],
  },
  {
    id: 'FORM16',
    backendType: 'form16',
    period: 'Yearly',
    needsMonth: false,
    outputFormats: ['pdf'],
  },
  {
    id: 'Investment Declaration',
    backendType: 'investment-declaration',
    period: 'Yearly',
    needsMonth: false,
    outputFormats: ['pdf'],
  },
];

export const PAYROLL_REPORT_TYPES: PayrollReportConfig[] = [
  {
    id: 'Monthly Payslip',
    backendType: 'monthly-payslip',
    period: 'Monthly',
    needsMonth: true,
    outputFormats: ['pdf', 'excel'],
  },
  {
    id: 'Yearly Payslip',
    backendType: 'yearly-payslip',
    period: 'Yearly',
    needsMonth: false,
    outputFormats: ['pdf', 'excel'],
  },
  {
    id: 'Employee CTC',
    backendType: 'employee-ctc',
    period: 'Yearly',
    needsMonth: false,
    outputFormats: ['pdf'],
  },
  {
    id: 'FORM16',
    backendType: 'form16',
    period: 'Yearly',
    needsMonth: false,
    outputFormats: ['pdf'],
  },
  {
    id: 'Investment Declaration',
    backendType: 'investment-declaration',
    period: 'Yearly',
    needsMonth: false,
    outputFormats: ['pdf'],
  },
];

/** People → Payroll: no Employee CTC. */
export const PAYROLL_ADMIN_TYPES: PayrollReportConfig[] = PAYROLL_REPORT_TYPES.filter(
  (r) => r.id !== 'Employee CTC',
);

export const ALL_EMPLOYEES_CODE = '__ALL__';

const AVAILABLE_BACKEND_TYPES = new Set(['monthly-payslip', 'yearly-payslip']);

export function getPayrollReportConfig(id: string): PayrollReportConfig | undefined {
  return PAYROLL_REPORT_TYPES.find((r) => r.id === id);
}

export function isAvailableReport(backendType: string): boolean {
  return AVAILABLE_BACKEND_TYPES.has(backendType);
}

export function isUnavailableReport(backendType: string): boolean {
  return !isAvailableReport(backendType);
}

export function canDownloadPayslipPdf(backendType: string): boolean {
  return isAvailableReport(backendType);
}

export function buildUnavailablePayslipStub(
  cfg: PayrollReportConfig,
  employeeCode: string,
  employeeName: string,
  department: string,
  financialYear: string,
): DetailedPayslip {
  return {
    employeeCode,
    employeeName,
    department,
    financialYear,
    reportType: cfg.backendType,
    period: cfg.period,
    month: '',
    earnings: [],
    deductions: [],
    grossEarnings: 0,
    totalDeductionColumn: 0,
    totalActualColumn: 0,
    nettSalaryRelease: 0,
    amountInWords: '',
    generatedOn: new Date().toISOString(),
  };
}
