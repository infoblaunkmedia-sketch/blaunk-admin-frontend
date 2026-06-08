import type { DetailedPayslip } from './payslip.service';
import { formatPayslipAmount } from './payslipFormat';

export const EMPTY_CELL = '0';

export const FY_MONTHS = ['APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'] as const;

export function formatFinancialYearLabel(fy: string): string {
  const s = String(fy || '').trim();
  const m = s.match(/^(\d{4})-(\d{2,4})$/);
  if (!m) return s;
  const start = m[1];
  const end = m[2].length === 2 ? `20${m[2]}` : m[2];
  return `${start} - ${end}`;
}

export function monthlyAmount(value: number | null | undefined): number | null {
  if (value == null || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

export function cellFromMonthly(amount: number | null): string {
  if (amount == null) return EMPTY_CELL;
  return formatPayslipAmount(amount);
}

export function periodCells(amount: number | null, count: number): string[] {
  const cell = cellFromMonthly(amount);
  return Array.from({ length: count }, () => cell);
}

export function totalFromPeriod(amount: number | null, count: number): string {
  if (amount == null) return EMPTY_CELL;
  return formatPayslipAmount(amount * count);
}

export function sumAmounts(values: Array<number | null>): number | null {
  const nums = values.filter((v): v is number => v != null && Number.isFinite(v));
  if (!nums.length) return null;
  return nums.reduce((s, n) => s + n, 0);
}

export function earningAmount(p: DetailedPayslip, ...needles: string[]): number | null {
  for (const needle of needles) {
    const row = p.earnings.find((e) => e.label.toUpperCase().includes(needle.toUpperCase()));
    if (row) return monthlyAmount(row.actual || row.earned);
  }
  return null;
}

export function deductionAmount(p: DetailedPayslip, ...needles: string[]): number | null {
  for (const needle of needles) {
    const row = p.deductions.find((d) => d.label.toUpperCase().includes(needle.toUpperCase()));
    if (row) return monthlyAmount(row.actual);
  }
  return null;
}

export function sumRowPeriods(rows: Array<{ amount: number | null }>, count: number): string[] {
  const monthly = sumAmounts(rows.map((r) => r.amount));
  return periodCells(monthly, count);
}

export function sumRowTotal(rows: Array<{ amount: number | null }>, count: number): string {
  const monthly = sumAmounts(rows.map((r) => r.amount));
  return totalFromPeriod(monthly, count);
}
