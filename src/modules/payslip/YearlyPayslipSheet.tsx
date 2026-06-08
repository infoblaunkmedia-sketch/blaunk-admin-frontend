import React from 'react';
import type { DetailedPayslip } from './payslip.service';
import { AnnualReportHeader } from './AnnualReportHeader';
import {
  EMPTY_CELL,
  FY_MONTHS,
  deductionAmount,
  earningAmount,
  formatFinancialYearLabel,
  periodCells,
  sumRowPeriods,
  sumRowTotal,
  totalFromPeriod,
} from './payslipAnnualFormat';

const MONTH_COUNT = FY_MONTHS.length;

type RowDef = { label?: string; amount: number | null; bold?: boolean };

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(5.5rem,auto)_auto_1fr] items-baseline gap-x-2 py-[3px] text-[10px] text-black sm:text-[11px]">
      <span className="font-bold uppercase">{label}</span>
      <span>:</span>
      <span className="font-semibold uppercase">{value || '—'}</span>
    </div>
  );
}

function DataRow({
  row,
  cells,
  total,
  stripe,
}: {
  row: RowDef;
  cells: string[];
  total: string;
  stripe: boolean;
}) {
  const bg = stripe ? 'bg-[#f3f3f3]' : 'bg-white';
  const isSubtotal = !row.label;
  return (
    <tr className={`${bg} ${row.bold ? 'font-bold' : ''}`}>
      <td className={`border-b border-[#c5c5c5] px-2 py-[5px] text-left text-[9px] font-semibold uppercase leading-tight text-black ${bg}`}>
        {row.label || ''}
      </td>
      {cells.map((c, i) => (
        <td
          key={i}
          className={`border-b border-[#c5c5c5] px-1 py-[5px] text-center text-[9px] tabular-nums leading-tight text-black ${bg} ${isSubtotal ? 'font-bold' : ''}`}
        >
          {c}
        </td>
      ))}
      <td className={`border-b border-[#c5c5c5] px-2 py-[5px] text-right text-[9px] font-bold tabular-nums leading-tight text-black ${bg}`}>
        {total}
      </td>
    </tr>
  );
}

export const YearlyPayslipSheet: React.FC<{ p: DetailedPayslip }> = ({ p }) => {
  const earningsRows: RowDef[] = [
    { label: 'BASIC SALARY', amount: earningAmount(p, 'BASIC') },
    { label: 'HRA', amount: earningAmount(p, 'HRA') },
    { label: 'LOCAL TRAVELLING ALLOWANCE', amount: earningAmount(p, 'CONVEYANCE', 'L.T.A', 'LTA') },
    { label: 'MEDICAL ALLOWANCE', amount: earningAmount(p, 'MEDICAL') },
    { label: 'EDUCATION ALLOWANCE- CEA', amount: earningAmount(p, 'EDUCATION') },
    { label: 'MEAL STIPEND', amount: earningAmount(p, 'FOOD', 'MEAL') },
    { label: 'SUPPLEMENTARY ALLOWANCE', amount: earningAmount(p, 'SUPPLEMENT') },
    { label: 'MISCELLANEOUS EXP ALLOWANCE', amount: earningAmount(p, 'MISCELLANEOUS') },
  ];

  const contributionRows: RowDef[] = [
    { label: 'ESI', amount: deductionAmount(p, 'ESI') },
    { label: 'PF CONTRIBUTION', amount: deductionAmount(p, 'PF') },
    { label: 'Insurance - HEALTH', amount: deductionAmount(p, 'INSURANCE', 'HEALTH') },
    { label: 'NPS - EMPLOYER', amount: deductionAmount(p, 'NPS - EMPLOYER') },
    { label: 'PROFESSIONAL TAX', amount: deductionAmount(p, 'PROFESSIONAL') },
  ];

  const incentiveRows: RowDef[] = [
    { label: 'INCENTIVES', amount: null },
    { label: 'BONUS', amount: null },
  ];

  const deductionRows: RowDef[] = [
    { label: 'TDS', amount: deductionAmount(p, 'TDS') },
    { label: 'PENALTY', amount: null },
    { label: 'NPS-80CCD1', amount: null },
  ];

  const earningsSubtotal = sumRowPeriods(earningsRows, MONTH_COUNT);
  const contributionsSubtotal = sumRowPeriods(contributionRows, MONTH_COUNT);
  const ctcMonthly =
    earningsRows.reduce((s, r) => s + (r.amount || 0), 0)
    + contributionRows.reduce((s, r) => s + (r.amount || 0), 0);
  const ctcCells = periodCells(ctcMonthly || null, MONTH_COUNT);
  const ctcTotal = totalFromPeriod(ctcMonthly || null, MONTH_COUNT);

  const paymentSubtotal = sumRowPeriods(incentiveRows, MONTH_COUNT);
  const paymentCells = periodCells(ctcMonthly || null, MONTH_COUNT);
  const paymentTotal = totalFromPeriod(ctcMonthly || null, MONTH_COUNT);

  const deductionsSubtotal = sumRowPeriods(deductionRows, MONTH_COUNT);

  let rowIndex = 0;
  const nextStripe = () => {
    const s = rowIndex % 2 === 1;
    rowIndex += 1;
    return s;
  };

  const thClass =
    'border-b border-[#a8a8a8] bg-[#e4e4e4] px-1 py-2 text-center text-[9px] font-bold uppercase leading-tight text-black';

  return (
    <article className="annual-payslip-sheet box-border w-fit max-w-none break-inside-avoid border-2 border-[#1a3d6d] bg-white px-4 py-4 pr-8 text-black">
      <AnnualReportHeader title="Annual CTC Break-up" />

      <div className="mb-4 grid grid-cols-1 gap-x-12 sm:grid-cols-2">
        <div>
          <MetaRow label="Empl Name" value={p.employeeName} />
          <MetaRow label="Empl Code" value={p.employeeCode} />
        </div>
        <div>
          <MetaRow label="Year" value={formatFinancialYearLabel(p.financialYear)} />
          <MetaRow label="Department" value={p.department} />
        </div>
      </div>

      <div className="overflow-visible">
        <table className="w-[1080px] table-fixed border-collapse text-black">
          <colgroup>
            <col style={{ width: '148px' }} />
            {FY_MONTHS.map((m) => (
              <col key={m} style={{ width: '62px' }} />
            ))}
            <col style={{ width: '76px' }} />
          </colgroup>
          <thead>
            <tr>
              <th className={`${thClass} pl-2 text-left`}>Particulars</th>
              {FY_MONTHS.map((m) => (
                <th key={m} className={thClass}>
                  {m}
                </th>
              ))}
              <th className={`${thClass} pr-2 text-right`}>Total</th>
            </tr>
          </thead>
          <tbody>
            {earningsRows.map((row) => (
              <DataRow
                key={row.label}
                row={row}
                stripe={nextStripe()}
                cells={periodCells(row.amount, MONTH_COUNT)}
                total={totalFromPeriod(row.amount, MONTH_COUNT)}
              />
            ))}
            <DataRow row={{ amount: null }} stripe={nextStripe()} cells={earningsSubtotal} total={sumRowTotal(earningsRows, MONTH_COUNT)} />
            {contributionRows.map((row) => (
              <DataRow
                key={row.label}
                row={row}
                stripe={nextStripe()}
                cells={periodCells(row.amount, MONTH_COUNT)}
                total={totalFromPeriod(row.amount, MONTH_COUNT)}
              />
            ))}
            <DataRow row={{ amount: null }} stripe={nextStripe()} cells={contributionsSubtotal} total={sumRowTotal(contributionRows, MONTH_COUNT)} />
            <DataRow row={{ label: 'CTC TOTAL', amount: ctcMonthly, bold: true }} stripe={nextStripe()} cells={ctcCells} total={ctcTotal} />
            {incentiveRows.map((row) => (
              <DataRow
                key={row.label}
                row={row}
                stripe={nextStripe()}
                cells={periodCells(row.amount, MONTH_COUNT)}
                total={totalFromPeriod(row.amount, MONTH_COUNT)}
              />
            ))}
            <DataRow row={{ amount: null }} stripe={nextStripe()} cells={paymentSubtotal} total={sumRowTotal(incentiveRows, MONTH_COUNT)} />
            <DataRow row={{ label: 'TOTAL PAYMENT', amount: ctcMonthly, bold: true }} stripe={nextStripe()} cells={paymentCells} total={paymentTotal} />
            {deductionRows.map((row) => (
              <DataRow
                key={row.label}
                row={row}
                stripe={nextStripe()}
                cells={periodCells(row.amount, MONTH_COUNT)}
                total={totalFromPeriod(row.amount, MONTH_COUNT)}
              />
            ))}
            <DataRow row={{ label: 'TOTAL DEDUCTIONS', amount: null, bold: true }} stripe={nextStripe()} cells={deductionsSubtotal} total={sumRowTotal(deductionRows, MONTH_COUNT)} />
            <DataRow
              row={{ label: 'GRATUITY EMPLOYER CONTRIBUTION', amount: null, bold: true }}
              stripe={nextStripe()}
              cells={periodCells(null, MONTH_COUNT)}
              total={EMPTY_CELL}
            />
          </tbody>
        </table>
      </div>
    </article>
  );
};
