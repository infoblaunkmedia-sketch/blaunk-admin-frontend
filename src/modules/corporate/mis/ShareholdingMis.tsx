import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { exportShareholdingMIS } from '../corporate.service';

function defaultDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    from: start.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  };
}

const dateInputClass =
  'h-9 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 [color-scheme:light]';

const readonlyInputClass =
  'h-9 w-full min-w-0 cursor-default rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 shadow-sm';

const thClass =
  'px-3 py-3 text-left text-[13px] font-bold leading-snug text-white';

const tdClass = 'px-3 py-2.5 align-middle';

export const ShareholdingMis: React.FC = () => {
  const defaults = React.useMemo(() => defaultDateRange(), []);
  const [fromDate, setFromDate] = React.useState(defaults.from);
  const [toDate, setToDate] = React.useState(defaults.to);
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!fromDate || !toDate) {
      toast.error('Select from date and to date.');
      return;
    }
    if (fromDate > toDate) {
      toast.error('From date cannot be after to date.');
      return;
    }

    setExporting(true);
    try {
      const result = await exportShareholdingMIS({ fromDate, toDate });
      if (result === 'no-data') {
        toast.warn('No data found to generate MIS for the selected date range.');
        return;
      }
      toast.success('Shareholding MIS exported to Excel');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="MIS"
        subtitle="Exports one Excel row per shareholding history period (year / project) updated in the date range — not one row per shareholder. Example: 3 shareholders with 5 history periods in range → 5 Excel rows."
      />

      <div className="overflow-x-auto rounded-card border border-slate-200 bg-white shadow-card">
        <table className="w-full min-w-[38rem] table-fixed border-collapse">
          <colgroup>
            <col className="w-[11.5rem]" />
            <col className="w-[11.5rem]" />
            <col className="w-[14rem]" />
            <col className="w-[8.5rem]" />
            <col className="w-[10.5rem]" />
          </colgroup>
          <thead>
            <tr className="bg-primary">
              <th className={thClass}>From Date</th>
              <th className={thClass}>To Date</th>
              <th className={thClass}>Report Type</th>
              <th className={thClass}>Output Format</th>
              <th className={`${thClass} text-right`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200 bg-white">
              <td className={tdClass}>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={dateInputClass}
                  aria-label="From date"
                />
              </td>
              <td className={tdClass}>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={dateInputClass}
                  aria-label="To date"
                />
              </td>
              <td className={tdClass}>
                <input
                  readOnly
                  value="MIS-Shareholding"
                  className={readonlyInputClass}
                  aria-label="Report type"
                />
              </td>
              <td className={tdClass}>
                <input
                  readOnly
                  value="Excel"
                  className={readonlyInputClass}
                  aria-label="Output format"
                />
              </td>
              <td className={`${tdClass} text-right`}>
                <form onSubmit={handleExport}>
                  <button
                    type="submit"
                    disabled={exporting}
                    className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {exporting ? 'Exporting…' : 'Export Excel'}
                  </button>
                </form>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};
