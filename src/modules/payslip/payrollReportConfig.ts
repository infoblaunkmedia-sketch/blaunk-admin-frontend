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
    outputFormats: ['pdf', 'excel'],
  },
  {
    id: 'FORM16',
    backendType: 'form16',
    period: 'Yearly',
    needsMonth: false,
    outputFormats: ['pdf', 'excel'],
  },
  {
    id: 'Investment Declaration',
    backendType: 'investment-declaration',
    period: 'Yearly',
    needsMonth: false,
    outputFormats: ['pdf', 'excel'],
  },
];

export function getPayrollReportConfig(id: string): PayrollReportConfig | undefined {
  return PAYROLL_REPORT_TYPES.find((r) => r.id === id);
}
