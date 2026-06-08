/** Format payslip amounts as whole numbers (no decimals). */
export function formatPayslipAmount(value: number | string | null | undefined): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  return Math.round(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function payslipMonthYearLabel(month: string, financialYear: string): string {
  const m = String(month || '').trim().toUpperCase();
  if (!m) return 'PAYSLIP';
  const yr = String(financialYear || '').trim();
  let yearPart = new Date().getFullYear();
  if (yr.includes('-')) {
    const endYear = yr.split('-')[1];
    yearPart = endYear?.length === 2 ? Number(`20${endYear}`) : Number(yr.split('-')[0]);
  } else if (/^\d{4}$/.test(yr)) {
    yearPart = Number(yr);
  }
  return `PAYSLIP FOR ${m} ${yearPart}`;
}
