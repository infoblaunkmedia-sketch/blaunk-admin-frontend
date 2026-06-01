import { api } from '../../shared/services/apiService';

export type PayslipEarningRow = {
  label: string;
  actual: number;
  deduction: number;
  earned: number;
};

export type PayslipDeductionRow = {
  label: string;
  deduction: number;
  actual: number;
};

export type DetailedPayslip = {
  employeeCode: string;
  employeeName: string;
  department: string;
  financialYear: string;
  reportType: string;
  period: string;
  month: string;
  earnings: PayslipEarningRow[];
  deductions: PayslipDeductionRow[];
  grossEarnings: number;
  totalDeductionColumn: number;
  totalActualColumn: number;
  nettSalaryRelease: number;
  amountInWords: string;
};

export type PayrollEmployeeOption = {
  empCode: string;
  employeeName: string;
  department: string;
};

export type PayslipReportPayload = {
  financialYear: string;
  department?: string;
  employeeCode?: string;
  reportType: string;
  period: string;
  month: string;
  outputFormat: 'pdf' | 'excel';
};

export async function generatePayslipReport(payload: PayslipReportPayload) {
  return api.post<{
    data: { detailed: boolean; payslips: DetailedPayslip[] };
    filters: Record<string, string>;
  }>('/api/payslip-report', {
    ...payload,
    outputFormat: payload.outputFormat === 'excel' ? 'excel' : 'pdf',
  });
}

export async function fetchPayrollEmployees(): Promise<PayrollEmployeeOption[]> {
  try {
    const res = await api.get<{ employees?: PayrollEmployeeOption[] }>('/api/payslip-report/employees');
    return (res.employees || []).filter((e) => e.empCode);
  } catch {
    return [];
  }
}

export async function fetchPayrollDepartments(): Promise<string[]> {
  try {
    const res = await api.get<{ departments?: string[] }>('/api/payslip-report/departments');
    return (res.departments || []).filter(Boolean);
  } catch {
    return [];
  }
}
