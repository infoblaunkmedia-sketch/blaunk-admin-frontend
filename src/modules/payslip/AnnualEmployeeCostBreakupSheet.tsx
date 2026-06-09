import React from 'react';
import type { DetailedPayslip } from './payslip.service';
import { CostBreakupReportHeader } from './CostBreakupReportHeader';
import { deductionAmount, earningAmount, formatFinancialYearLabel } from './payslipAnnualFormat';

function periodValue(monthly: number | null | undefined, multiplier: number): number {
  if (monthly == null || !Number.isFinite(monthly)) return 0;
  return Math.round(monthly * multiplier * 10) / 10;
}

function formatCell(n: number): string {
  if (!n) return '0.0';
  return n.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

type RowDef = {
  label: string;
  bold?: boolean;
  value: (p: DetailedPayslip) => number;
};

function buildRows(mult: number): RowDef[] {
  return [
    { label: 'BASIC SALARY (Earned)', value: (p) => periodValue(earningAmount(p, 'BASIC'), mult) },
    { label: 'HRA', value: (p) => periodValue(earningAmount(p, 'HRA'), mult) },
    { label: 'L.T.A', value: (p) => periodValue(earningAmount(p, 'CONVEYANCE', 'L.T.A', 'LTA'), mult) },
    { label: 'MED. ALLOWANCE', value: (p) => periodValue(earningAmount(p, 'MEDICAL'), mult) },
    { label: 'EDU. ALLOWANCE', value: (p) => periodValue(earningAmount(p, 'EDUCATION'), mult) },
    { label: 'MEAL STIPEND', value: (p) => periodValue(earningAmount(p, 'FOOD', 'MEAL'), mult) },
    { label: 'SUP. ALLOWANCE', value: (p) => periodValue(earningAmount(p, 'SUPPLEMENT'), mult) },
    { label: 'MIS. ALLOWANCE', value: (p) => periodValue(earningAmount(p, 'MISCELLANEOUS'), mult) },
  ];
}

function contributionRows(mult: number): RowDef[] {
  return [
    { label: 'PROFESSIONAL TAX', value: (p) => periodValue(deductionAmount(p, 'PROFESSIONAL'), mult) },
    { label: 'INSURANCE', value: (p) => periodValue(deductionAmount(p, 'INSURANCE', 'HEALTH'), mult) },
    { label: 'ESI', value: (p) => periodValue(deductionAmount(p, 'ESI'), mult) },
    { label: 'PENSION FUND', value: (p) => periodValue(deductionAmount(p, 'PF'), mult) },
    { label: 'NPS - EMPLOYER', value: (p) => periodValue(deductionAmount(p, 'NPS - EMPLOYER'), mult) },
  ];
}

function employeeDeductionRows(mult: number): RowDef[] {
  return [
    { label: 'TDS', value: (p) => periodValue(deductionAmount(p, 'TDS'), mult) },
    { label: 'PENALTY / Other', value: (p) => periodValue(deductionAmount(p, 'PENALTY'), mult) },
    { label: 'NPS-Employee', value: (p) => periodValue(deductionAmount(p, 'NPS - EMPLOYEE'), mult) },
  ];
}

const thClass =
  'border-b border-[#a8a8a8] bg-[#e4e4e4] px-1 py-2 text-center text-[9px] font-bold uppercase leading-tight text-black';

const tdClass = 'border-b border-[#c5c5c5] px-1 py-[5px] text-center text-[9px] tabular-nums leading-tight text-black';

export const AnnualEmployeeCostBreakupSheet: React.FC<{
  payslips: DetailedPayslip[];
  financialYear: string;
  period?: 'Monthly' | 'Yearly';
  month?: string;
}> = ({ payslips, financialYear, period = 'Yearly', month = '' }) => {
  const mult = period === 'Yearly' ? 12 : 1;
  const earnings = buildRows(mult);
  const contributions = contributionRows(mult);
  const empDeductions = employeeDeductionRows(mult);
  const title = period === 'Yearly' ? 'Annual Employee Cost Break-up' : 'Monthly Employee Cost Break-up';
  const codes = payslips.map((p) => p.employeeCode);

  const sumRows = (rows: RowDef[], p: DetailedPayslip) =>
    rows.reduce((s, r) => s + r.value(p), 0);

  const grossEarning = (p: DetailedPayslip) => sumRows(earnings, p);
  const grossDeduction = (p: DetailedPayslip) => sumRows(contributions, p);
  const ctcTotal = (p: DetailedPayslip) => grossEarning(p) + grossDeduction(p);
  const totalOtherIncome = () => 0;
  const nettCtc = (p: DetailedPayslip) => ctcTotal(p) + totalOtherIncome();
  const totalDeductions = (p: DetailedPayslip) => sumRows(empDeductions, p);

  const colTotal = (fn: (p: DetailedPayslip) => number) =>
    payslips.reduce((s, p) => s + fn(p), 0);

  let stripe = 0;
  const nextStripe = () => {
    stripe += 1;
    return stripe % 2 === 1 ? 'bg-[#f3f3f3]' : 'bg-white';
  };

  const renderDataRow = (label: string, fn: (p: DetailedPayslip) => number, bold = false) => {
    const bg = nextStripe();
    return (
      <tr key={label} className={bold ? 'font-bold' : ''}>
        <td className={`${tdClass} pl-2 text-left font-semibold uppercase ${bg}`}>{label}</td>
        {payslips.map((p) => (
          <td key={p.employeeCode} className={`${tdClass} ${bg}`}>
            {formatCell(fn(p))}
          </td>
        ))}
        <td className={`${tdClass} pr-2 text-right font-bold ${bg}`}>{formatCell(colTotal(fn))}</td>
      </tr>
    );
  };

  const colWidth = Math.max(58, Math.min(72, Math.floor(900 / Math.max(codes.length, 1))));

  return (
    <article className="payslip-capture-root annual-cost-breakup-sheet box-border w-fit max-w-none break-inside-avoid border-2 border-[#1a3d6d] bg-white px-4 py-4 pr-8 text-black">
      <CostBreakupReportHeader title={title} />
      <p className="mb-3 text-center text-[10px] font-semibold uppercase text-black">
        Financial Year: {formatFinancialYearLabel(financialYear)}
        {period === 'Monthly' && month ? ` · ${month}` : ''}
      </p>

      <div className="overflow-visible">
        <table className="table-fixed border-collapse text-black" style={{ minWidth: `${148 + codes.length * colWidth + 76}px` }}>
          <colgroup>
            <col style={{ width: '148px' }} />
            {codes.map((c) => (
              <col key={c} style={{ width: `${colWidth}px` }} />
            ))}
            <col style={{ width: '76px' }} />
          </colgroup>
          <thead>
            <tr>
              <th className={`${thClass} pl-2 text-left`}>Particulars</th>
              {codes.map((c) => (
                <th key={c} className={thClass}>
                  {c}
                </th>
              ))}
              <th className={`${thClass} pr-2 text-right`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {earnings.map((row) => renderDataRow(row.label, row.value))}
            {renderDataRow('GROSS EARNING', grossEarning, true)}
            {contributions.map((row) => renderDataRow(row.label, row.value))}
            {renderDataRow('GROSS DEDUCTION', grossDeduction, true)}
            {renderDataRow('CTC TOTAL', ctcTotal, true)}
            {renderDataRow('INCENTIVES', () => 0)}
            {renderDataRow('BONUS', () => 0)}
            {renderDataRow('TOTAL OTHER INCOME', totalOtherIncome, true)}
            {renderDataRow('NETT SALARY - CTC', nettCtc, true)}
            {empDeductions.map((row) => renderDataRow(row.label, row.value))}
            {renderDataRow('TOTAL DEDUCTIONS', totalDeductions, true)}
          </tbody>
        </table>
      </div>
    </article>
  );
};
