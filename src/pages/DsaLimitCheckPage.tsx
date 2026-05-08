import React from 'react';

/** Currency-INR and Limit: digits only. */
function sanitizeAmount(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 14);
}

const APPROVAL_OPTIONS = [
  'Pending',
  'Received',
  'Bank Reversed',
  'Dual Entry',
] as const;

type Approval = (typeof APPROVAL_OPTIONS)[number];

type DsaRow = {
  id: string;
  selected: boolean;
  date: string;
  dsaName: string;
  country: string;
  dsaCode: string;
  sharingRatio: string;
  mode: string;
  currencyPayin: string;
  txnRefNo: string;
  currencyInr: string;
  limit: string;
  approval: Approval;
  emplCode: string;
};

function createRow(overrides: Partial<DsaRow> = {}): DsaRow {
  return {
    id: `dsa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    selected: false,
    date: '15-04-2026',
    dsaName: 'DSA 1',
    country: 'India',
    dsaCode: 'DSA001',
    sharingRatio: '30:70',
    mode: 'Cash',
    currencyPayin: '$ 1000',
    txnRefNo: 'TXQ1241A',
    currencyInr: '',
    limit: '',
    approval: 'Pending',
    emplCode: 'QWE123',
    ...overrides,
  };
}

/** Extra horizontal padding so columns don’t feel cramped. */
const thClass =
  'whitespace-nowrap border-b border-white/25 px-4 py-3 text-left text-xs font-bold text-white sm:px-5 sm:text-sm';
const thCenter = `${thClass} text-center`;
const tdBase =
  'border-b border-slate-200 px-4 py-3 align-middle text-xs text-slate-900 sm:px-5 sm:text-sm';
/** Fixed height so text inputs and Approval select share the same box size. */
const inputClass =
  'box-border h-9 w-full min-w-[4.5rem] rounded-md border border-primary bg-slate-50 px-2 py-0 text-xs leading-9 text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-primary/25 sm:text-sm sm:leading-9';

/** Native checkbox, visually square with clear border. */
const checkboxClass =
  'h-[18px] w-[18px] shrink-0 cursor-pointer rounded-none border-2 border-slate-500 bg-white accent-primary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1';

const selectClass = `${inputClass} cursor-pointer appearance-none pr-7`;

const selectChevronStyle: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="#0b61c9" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>',
  )}")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.375rem center',
  backgroundSize: '0.875rem',
};

export const DsaLimitCheckPage: React.FC = () => {
  const [rows, setRows] = React.useState<DsaRow[]>(() => [createRow()]);

  const handleSave = () => {
    // Plug API persistence here when available.
  };

  const updateRow = (id: string, patch: Partial<DsaRow>) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const toggleSelect = (id: string) => {
    setRows((rs) =>
      rs.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r)),
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 bg-primary px-4 py-3 sm:px-5">
        <h2 className="text-lg font-bold text-white sm:text-xl">DSA Limit Check</h2>
        <button
          type="button"
          onClick={handleSave}
          aria-label="Save DSA limit data"
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          Save
        </button>
      </div>

      <div className="max-h-[min(75vh,800px)] overflow-auto">
        <table className="w-full min-w-[1500px] border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-primary text-white">
              <th className={`${thCenter} w-10`} aria-label="Select" />
              <th className={thClass}>Date</th>
              <th className={thClass}>DSA Name</th>
              <th className={thClass}>Country</th>
              <th className={thClass}>DSA Code</th>
              <th className={thClass}>Sharing Ratio</th>
              <th className={thClass}>Mode</th>
              <th className={thClass}>Currency-Payin</th>
              <th className={thClass}>Txn Ref No.</th>
              <th className={thClass}>Currency-INR</th>
              <th className={thClass}>Limit</th>
              <th className={`${thClass} min-w-[11rem]`}>Approval</th>
              <th className={thClass}>Empl Code</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-slate-200 bg-white last:border-b-0"
              >
                <td className={`${tdBase} text-center`}>
                  <input
                    type="checkbox"
                    className={checkboxClass}
                    checked={row.selected}
                    onChange={() => toggleSelect(row.id)}
                    aria-label="Select row"
                  />
                </td>
                <td className={tdBase}>
                  <span className="block whitespace-nowrap tabular-nums">{row.date}</span>
                </td>
                <td className={tdBase}>{row.dsaName}</td>
                <td className={tdBase}>{row.country}</td>
                <td className={`${tdBase} uppercase`}>{row.dsaCode}</td>
                <td className={`${tdBase} tabular-nums`}>{row.sharingRatio}</td>
                <td className={tdBase}>{row.mode}</td>
                <td className={tdBase}>{row.currencyPayin}</td>
                <td className={`${tdBase} uppercase`}>{row.txnRefNo}</td>
                <td className={tdBase}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`${inputClass} tabular-nums`}
                    value={row.currencyInr}
                    placeholder="0"
                    onChange={(e) =>
                      updateRow(row.id, {
                        currencyInr: sanitizeAmount(e.target.value),
                      })
                    }
                  />
                </td>
                <td className={tdBase}>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={`${inputClass} tabular-nums`}
                    value={row.limit}
                    placeholder="0"
                    onChange={(e) =>
                      updateRow(row.id, { limit: sanitizeAmount(e.target.value) })
                    }
                  />
                </td>
                <td className={`${tdBase} min-w-[11rem]`}>
                  <select
                    className={selectClass}
                    style={selectChevronStyle}
                    value={row.approval}
                    onChange={(e) =>
                      updateRow(row.id, {
                        approval: e.target.value as Approval,
                      })
                    }
                  >
                    {APPROVAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </td>
                <td className={`${tdBase} uppercase`}>{row.emplCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
