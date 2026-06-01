import React from 'react';
import type { DetailedPayslip } from './payslip.service';

type Props = {
  payslips: DetailedPayslip[];
  onPrint: () => void;
};

export const PayslipResults: React.FC<Props> = ({ payslips, onPrint }) => {
  if (!payslips.length) {
    return <p className="py-8 text-center text-sm text-slate-500">No payslip records for the selected filters.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2 print:hidden">
        <button
          type="button"
          onClick={onPrint}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
        >
          Print / Save as PDF
        </button>
      </div>
      <div id="payslip-print-area" className="space-y-6 sm:space-y-8">
        {payslips.map((p) => (
          <article
            key={`${p.employeeCode}-${p.month}-${p.reportType}`}
            className="break-inside-avoid rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
          >
            <header className="mb-4 border-b border-slate-200 pb-3">
              <h3 className="text-lg font-bold text-primary">{p.employeeName}</h3>
              <p className="text-sm text-slate-600">
                {p.employeeCode} · {p.department} · {p.financialYear} · {p.month || p.period}
              </p>
            </header>
            <div className="grid gap-4 lg:grid-cols-2">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="px-2 py-1 text-left">Earnings</th>
                    <th className="px-2 py-1 text-right">Actual</th>
                    <th className="px-2 py-1 text-right">Ded.</th>
                    <th className="px-2 py-1 text-right">Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {p.earnings.map((row) => (
                    <tr key={row.label} className="border-b border-slate-100">
                      <td className="px-2 py-1">{row.label}</td>
                      <td className="px-2 py-1 text-right">{row.actual.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right">{row.deduction.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right font-semibold">{row.earned.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="px-2 py-1 text-left">Deductions</th>
                    <th className="px-2 py-1 text-right">Ded.</th>
                    <th className="px-2 py-1 text-right">Actual</th>
                  </tr>
                </thead>
                <tbody>
                  {p.deductions.map((row) => (
                    <tr key={row.label} className="border-b border-slate-100">
                      <td className="px-2 py-1">{row.label}</td>
                      <td className="px-2 py-1 text-right">{row.deduction.toFixed(2)}</td>
                      <td className="px-2 py-1 text-right">{row.actual.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="mt-4 grid gap-1 border-t border-slate-200 pt-3 text-sm font-semibold text-slate-800">
              <p>Gross earnings: ₹{p.grossEarnings.toLocaleString()}</p>
              <p>Net salary: ₹{p.nettSalaryRelease.toLocaleString()}</p>
              <p className="text-xs font-normal text-slate-600">{p.amountInWords}</p>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
};
