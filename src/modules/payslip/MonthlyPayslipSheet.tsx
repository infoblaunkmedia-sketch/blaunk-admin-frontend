import React from 'react';
import type { DetailedPayslip, PayslipDeductionRow, PayslipEarningRow } from './payslip.service';
import { formatPayslipAmount, payslipMonthYearLabel } from './payslipFormat';
import { formatDateDDMMYYYY } from '../../shared/utils/dateFormat';

const BlaunkLogo = '/blaunk_logo.png';

function cell(value: string | number | null | undefined): string {
  if (value == null || value === '') return '';
  return String(value);
}

function amt(value: number | undefined): string {
  if (value == null || !Number.isFinite(value) || value === 0) return '';
  return formatPayslipAmount(value);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1.15fr)_auto_minmax(0,1fr)] items-baseline gap-x-1.5 py-[4px] text-[10px] leading-snug text-black sm:text-[11px]">
      <span className="font-bold uppercase">{label}</span>
      <span className="shrink-0">:</span>
      <span className="font-semibold uppercase break-words">{value || ''}</span>
    </div>
  );
}

export const PayslipSheet: React.FC<{ p: DetailedPayslip }> = ({ p }) => {
  const profile = p.profile || {};
  const rowCount = Math.max(p.earnings.length, p.deductions.length);
  const rows: Array<{ earning?: PayslipEarningRow; deduction?: PayslipDeductionRow }> = Array.from(
    { length: rowCount },
    (_, i) => ({ earning: p.earnings[i], deduction: p.deductions[i] }),
  );

  const grossDeductionOther = p.deductions.reduce((s, d) => s + d.deduction, 0);
  const grossDeductionActual = p.deductions.reduce((s, d) => s + d.actual, 0);

  const innerLine = 'border-[#c8c8c8] [border-width:1px]';
  const thClass = `border-b border-r ${innerLine} bg-white px-2 py-2 text-center text-[9px] font-bold uppercase leading-tight text-black last:border-r-0 sm:text-[10px]`;
  const tdClass = `border-b border-r ${innerLine} px-2 py-1.5 text-[9px] leading-snug text-black last:border-r-0 sm:text-[10px]`;
  const tdRight = `${tdClass} text-right tabular-nums`;
  const tdLabel = `${tdClass} font-semibold uppercase`;
  const tdLastRow = `px-2 py-1.5 text-[9px] leading-snug text-black sm:text-[10px]`;

  return (
    <article className="payslip-capture-root monthly-payslip-sheet box-border w-full max-w-none break-inside-avoid bg-white p-2 text-black sm:p-4">
      <header className="mb-3">
        <div className="relative flex min-h-[2.75rem] items-center justify-center pb-3">
          <img
            src={BlaunkLogo}
            alt="Blaunk"
            className="absolute left-0 top-1/2 h-9 w-auto -translate-y-1/2 object-contain sm:h-10"
            crossOrigin="anonymous"
          />
          <div className="px-20 text-center">
            <h2 className="text-sm font-bold uppercase tracking-wide text-black sm:text-base">
              Blaunk (India) Limited
            </h2>
            <p className="mt-1 text-xs font-bold uppercase text-black sm:text-sm">
              {payslipMonthYearLabel(p.month, p.financialYear)}
            </p>
          </div>
        </div>
        <div className="border-b border-neutral-400" />
      </header>

      <div className="payslip-capture-body w-full overflow-hidden border border-neutral-400">
        <div className="grid grid-cols-3 border-b border-[#c8c8c8]">
          <div className="space-y-0 border-r border-[#c8c8c8] p-2.5">
            <InfoRow label="Employee Name" value={p.employeeName} />
            <InfoRow label="Department" value={p.department} />
            <InfoRow label="PAN No." value={cell(profile.panNo)} />
            <InfoRow label="Grade" value={cell(profile.grade)} />
            <InfoRow label="UAN No." value={cell(profile.uanNo)} />
            <InfoRow label="Aadhar No." value={cell(profile.aadharNo)} />
          </div>
          <div className="space-y-0 border-r border-[#c8c8c8] p-2.5">
            <InfoRow label="Employee Code" value={p.employeeCode} />
            <InfoRow label="Location" value={cell(profile.location)} />
            <InfoRow label="Designation" value={cell(profile.designation)} />
            <InfoRow label="PF Account No." value={cell(profile.pfAccountNo)} />
            <InfoRow label="ESI No." value={cell(profile.esiNo)} />
            <InfoRow label="Date of Joining" value={cell(profile.dateOfJoining)} />
          </div>
          <div className="space-y-0 p-2.5">
            <InfoRow label="Bank A/C No." value={cell(profile.bankAccountNo)} />
            <InfoRow label="Bank Name" value={cell(profile.bankName)} />
            <InfoRow label="Leave Taken" value={cell(profile.leaveTaken)} />
            <InfoRow label="Leave Balance" value={cell(profile.leaveBalance)} />
            <InfoRow label="LWP-(A)" value={cell(profile.lwp)} />
            <InfoRow label="OD-PAY" value={cell(profile.odPay)} />
          </div>
        </div>

        <div>
          <table className="w-full table-fixed border-collapse text-black [border-spacing:0]">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[9%]" />
              <col className="w-[22%]" />
              <col className="w-[14%]" />
              <col className="w-[9%]" />
            </colgroup>
            <thead>
              <tr>
                <th className={`${thClass} text-left`}>Earning</th>
                <th className={thClass}>Actual</th>
                <th className={thClass}>Deduction</th>
                <th className={thClass}>Earned</th>
                <th className={`${thClass} text-left`}>Details</th>
                <th className={thClass}>Other Deduction</th>
                <th className={thClass}>Actual</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={i % 2 === 1 ? 'bg-gray-100 text-black' : 'bg-white text-black'}>
                  <td className={tdLabel}>{row.earning?.label ?? ''}</td>
                  <td className={tdRight}>{amt(row.earning?.actual)}</td>
                  <td className={tdRight}>{amt(row.earning?.deduction)}</td>
                  <td className={`${tdRight} font-semibold`}>{amt(row.earning?.earned)}</td>
                  <td className={tdLabel}>{row.deduction?.label ?? ''}</td>
                  <td className={tdRight}>{amt(row.deduction?.deduction)}</td>
                  <td className={tdRight}>{amt(row.deduction?.actual)}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold text-black">
                <td className={tdClass} colSpan={3}>
                  GROSS EARNINGS
                </td>
                <td className={tdRight}>{formatPayslipAmount(p.grossEarnings)}</td>
                <td className={tdClass}>GROSS DEDUCTION</td>
                <td className={tdRight}>{formatPayslipAmount(grossDeductionOther)}</td>
                <td className={tdRight}>{formatPayslipAmount(grossDeductionActual)}</td>
              </tr>
              <tr className="bg-gray-100 font-bold text-black">
                <td className={tdClass} colSpan={3}>
                  NETT SALARY RELEASE
                </td>
                <td className={tdRight}>{formatPayslipAmount(p.nettSalaryRelease)}</td>
                <td className={tdClass} colSpan={3} />
              </tr>
              <tr className="text-black">
                <td className={`${tdLastRow} font-bold`} colSpan={7}>
                  Rupees in Words: <span className="font-normal italic">{p.amountInWords}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <footer className="mt-3 space-y-1 text-[10px] text-black sm:text-[11px]">
        <p>Since this is a computer generated statement, it does not require any signature</p>
        <p>
          Payslip generated on {formatDateDDMMYYYY(p.generatedOn || new Date().toISOString())}
        </p>
      </footer>
    </article>
  );
};
