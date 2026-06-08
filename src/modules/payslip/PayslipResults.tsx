import React from 'react';
import { toast } from 'react-toastify';
import type { DetailedPayslip } from './payslip.service';
import { downloadPayslipPdf } from './downloadPayslipPdf';
import { YearlyPayslipSheet } from './YearlyPayslipSheet';
import { NotAvailableReportSheet } from './NotAvailableReportSheet';
import { PayslipSheet } from './MonthlyPayslipSheet';
import { PayslipPreviewViewport } from './PayslipPreviewViewport';
import { canDownloadPayslipPdf, isUnavailableReport } from './payrollReportConfig';

type Props = {
  payslips: DetailedPayslip[];
  reportLabel?: string;
};

function reportSlug(p: DetailedPayslip): string {
  const type = String(p.reportType || 'payslip').replace(/\s+/g, '-').toLowerCase();
  return `${p.employeeCode}-${type}`.replace(/\s+/g, '-');
}

function PayslipDocument({ p }: { p: DetailedPayslip }) {
  const rt = String(p.reportType || '').toLowerCase();

  if (isUnavailableReport(rt)) {
    return <NotAvailableReportSheet />;
  }

  if (rt === 'yearly-payslip') {
    return <YearlyPayslipSheet p={p} />;
  }

  return <PayslipSheet p={p} />;
}

export const PayslipResults: React.FC<Props> = ({ payslips }) => {
  const [downloading, setDownloading] = React.useState(false);
  const primary = payslips[0];
  const allowDownload = primary ? canDownloadPayslipPdf(String(primary.reportType || '')) : false;
  const isWideReport = primary
    ? String(primary.reportType || '').toLowerCase() === 'yearly-payslip'
    : false;

  const handleDownload = async () => {
    if (!payslips.length || !allowDownload) return;
    setDownloading(true);
    try {
      const p = payslips[0];
      await downloadPayslipPdf('payslip-print-area', `${reportSlug(p)}.pdf`);
      toast.success('PDF downloaded.');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  if (!payslips.length) {
    return <p className="py-8 text-center text-sm text-slate-500">No payslip records for the selected filters.</p>;
  }

  const printArea = (
    <div id="payslip-print-area" className="inline-block max-w-none">
      {payslips.map((p) => (
        <PayslipDocument key={`${p.employeeCode}-${p.month}-${p.reportType}`} p={p} />
      ))}
    </div>
  );

  return (
    <div className="min-w-0 space-y-4">
      {allowDownload ? (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={downloading}
            onClick={() => void handleDownload()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-60"
          >
            {downloading ? 'Downloading…' : 'Download PDF'}
          </button>
        </div>
      ) : null}
      {isWideReport ? (
        <PayslipPreviewViewport>{printArea}</PayslipPreviewViewport>
      ) : (
        <div className="w-full max-w-full overflow-x-auto">{printArea}</div>
      )}
    </div>
  );
};
