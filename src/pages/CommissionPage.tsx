import React from 'react';

const PORTAL_PRODUCTS = ['Tour', 'Cake', 'Store'] as const;

type PortalFeesState = Record<(typeof PORTAL_PRODUCTS)[number], string>;

const initialPortalFees = (): PortalFeesState =>
  Object.fromEntries(PORTAL_PRODUCTS.map((p) => [p, ''])) as PortalFeesState;

type BgtRowKey = 'BGT' | 'GST';

interface BgtRow {
  buyer: number;
  seller: number;
}

const STEP = 0.1;

function clampPct(n: number): number {
  const x = Math.round(n / STEP) * STEP;
  return Math.min(100, Math.max(0, Number(x.toFixed(1))));
}

function Stepper({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="inline-flex items-stretch">
      <button
        type="button"
        disabled={disabled || value <= 0}
        onClick={() => onChange(clampPct(value - STEP))}
        className="rounded-l-md border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Decrease"
      >
        −
      </button>
      <span className="relative z-[1] -mx-px min-w-[3.25rem] border border-primary bg-white px-2 py-1.5 text-center text-sm font-medium tabular-nums text-slate-900">
        {value.toFixed(1)}
      </span>
      <button
        type="button"
        disabled={disabled || value >= 100}
        onClick={() => onChange(clampPct(value + STEP))}
        className="rounded-r-md border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}

export const CommissionPage: React.FC = () => {
  const [portalFees, setPortalFees] = React.useState<PortalFeesState>(initialPortalFees);
  const [portalEditing, setPortalEditing] = React.useState(false);
  const [bgtRows, setBgtRows] = React.useState<Record<BgtRowKey, BgtRow>>({
    BGT: { buyer: 1.0, seller: 1.5 },
    GST: { buyer: 1.0, seller: 0.0 },
  });
  const [bgtEditing, setBgtEditing] = React.useState(false);

  const inputClass =
    'h-10 w-full min-w-[8rem] rounded-md border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-70';

  return (
    <div className="w-full space-y-10">
      {/* Portal Fees */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-primary sm:text-2xl">Portal Fees</h2>
          <button
            type="button"
            onClick={() => setPortalEditing((e) => !e)}
            className={[
              'rounded-md px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2',
              portalEditing
                ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-300'
                : 'bg-primary hover:bg-primary-dark focus-visible:ring-primary/40',
            ].join(' ')}
          >
            {portalEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-left text-slate-900">
                <th className="border-b border-slate-200 px-4 py-3 font-bold">Product</th>
                <th className="border-b border-slate-200 px-4 py-3 font-bold">Amount (in Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {PORTAL_PRODUCTS.map((product, index) => {
                const striped = index % 2 === 1;
                return (
                  <tr key={product} className={striped ? 'bg-slate-50' : 'bg-white'}>
                    <td className="border-b border-slate-200 px-4 py-3 font-medium text-slate-800">
                      {product}
                    </td>
                    <td className="border-b border-slate-200 px-4 py-3">
                      <input
                        type="text"
                        inputMode="decimal"
                        className={inputClass}
                        placeholder="Enter amount"
                        value={portalFees[product]}
                        disabled={!portalEditing}
                        onChange={(e) =>
                          setPortalFees((prev) => ({
                            ...prev,
                            [product]: e.target.value,
                          }))
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Commission BGT */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-primary sm:text-2xl">Commission BGT</h2>
          <button
            type="button"
            onClick={() => setBgtEditing((e) => !e)}
            className={[
              'rounded-md px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2',
              bgtEditing
                ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-300'
                : 'bg-primary hover:bg-primary-dark focus-visible:ring-primary/40',
            ].join(' ')}
          >
            {bgtEditing ? 'Save' : 'Edit'}
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-100 text-left text-slate-900">
                <th className="border-b border-slate-200 px-4 py-3 font-bold">Type</th>
                <th className="border-b border-slate-200 px-4 py-3 font-bold">Buyer (in %)</th>
                <th className="border-b border-slate-200 px-4 py-3 font-bold">Seller (in %)</th>
              </tr>
            </thead>
            <tbody>
              {(['BGT', 'GST'] as const).map((rowKey, index) => {
                const striped = index % 2 === 1;
                const row = bgtRows[rowKey];
                return (
                  <tr key={rowKey} className={striped ? 'bg-slate-50' : 'bg-white'}>
                    <td className="border-b border-slate-200 px-4 py-3 font-medium text-slate-800">
                      {rowKey}
                    </td>
                    <td className="border-b border-slate-200 px-4 py-3">
                      <Stepper
                        value={row.buyer}
                        disabled={!bgtEditing}
                        onChange={(buyer) =>
                          setBgtRows((prev) => ({
                            ...prev,
                            [rowKey]: { ...prev[rowKey], buyer },
                          }))
                        }
                      />
                    </td>
                    <td className="border-b border-slate-200 px-4 py-3">
                      <Stepper
                        value={row.seller}
                        disabled={!bgtEditing}
                        onChange={(seller) =>
                          setBgtRows((prev) => ({
                            ...prev,
                            [rowKey]: { ...prev[rowKey], seller },
                          }))
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
