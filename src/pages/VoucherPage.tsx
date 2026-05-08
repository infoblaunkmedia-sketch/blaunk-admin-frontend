import React from 'react';
import { ScrollContainer } from '../components/ScrollContainer';

const PLAN_COLUMNS = [
  'Silver - 3M',
  'Gold - 6M',
  'Platinum - 1Y',
  'Premium - 1Y',
  'Special Code',
] as const;

const SCREEN_ROWS = [
  'Cake',
  'Tour',
  'Store',
  'BGT',
  'Dial',
  'Ads',
  'Boutique',
  'Logistic',
] as const;

type PlanCol = (typeof PLAN_COLUMNS)[number];
type ScreenRow = (typeof SCREEN_ROWS)[number];

type CellValue = { code: string; pct: string };

/** Uppercase A–Z and digits 0–9 only (typical voucher codes). */
function sanitizeVoucherCode(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

/** Digits only for percentage (no letters or symbols). */
function sanitizePct(raw: string): string {
  return raw.replace(/\D/g, '');
}

function emptyGrid(): Record<ScreenRow, Record<PlanCol, CellValue>> {
  const row = () =>
    Object.fromEntries(
      PLAN_COLUMNS.map((c) => [c, { code: '', pct: '' }]),
    ) as Record<PlanCol, CellValue>;
  return Object.fromEntries(SCREEN_ROWS.map((r) => [r, row()])) as Record<
    ScreenRow,
    Record<PlanCol, CellValue>
  >;
}

const inputCodeClass =
  'min-w-0 flex-1 rounded-md border border-primary bg-slate-50 px-2 py-1.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm';
const inputPctClass =
  'w-12 shrink-0 rounded-md border border-primary bg-slate-50 px-1.5 py-1.5 text-center text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60 sm:w-14 sm:text-sm';

export const VoucherPage: React.FC = () => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [grid, setGrid] = React.useState(emptyGrid);

  const handlePrimaryAction = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    // Persist: grid is already in React state; plug API here when available.
    setIsEditing(false);
  };

  const setCell = (
    screen: ScreenRow,
    plan: PlanCol,
    patch: Partial<CellValue>,
  ) => {
    setGrid((g) => ({
      ...g,
      [screen]: {
        ...g[screen],
        [plan]: { ...g[screen][plan], ...patch },
      },
    }));
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      {/* Title bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/20 bg-primary px-4 py-3 sm:px-5">
        <h2 className="text-lg font-bold text-white sm:text-xl">Voucher Management</h2>
        <button
          type="button"
          onClick={handlePrimaryAction}
          aria-label={isEditing ? 'Save voucher data' : 'Edit voucher data'}
          className={[
            'rounded-md px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60',
            isEditing ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-dark',
          ].join(' ')}
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      <ScrollContainer orientation="both" className="max-h-[min(70vh,720px)]">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-primary text-white">
              <th className="border-b border-white/25 px-3 py-3 text-left text-xs font-bold sm:px-4 sm:text-sm">
                Screen
              </th>
              {PLAN_COLUMNS.map((col) => (
                <th
                  key={col}
                  className="border-b border-white/25 px-2 py-3 text-center text-xs font-bold sm:px-3 sm:text-sm"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCREEN_ROWS.map((screen) => (
              <tr key={screen} className="border-b border-slate-200 bg-white last:border-b-0">
                <th
                  scope="row"
                  className="whitespace-nowrap px-3 py-3 text-left text-xs font-bold text-slate-900 sm:px-4 sm:text-sm"
                >
                  {screen}
                </th>
                {PLAN_COLUMNS.map((plan) => {
                  const cell = grid[screen][plan];
                  return (
                    <td key={plan} className="px-2 py-2.5 align-middle sm:px-3">
                      <div className="mx-auto flex max-w-[220px] min-w-0 items-stretch justify-center gap-1 sm:max-w-none">
                        <input
                          type="text"
                          className={`${inputCodeClass} uppercase`}
                          placeholder="Enter Voucher Code"
                          value={cell.code}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setCell(screen, plan, {
                              code: sanitizeVoucherCode(e.target.value),
                            })
                          }
                          autoComplete="off"
                          spellCheck={false}
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className={`${inputPctClass} tabular-nums`}
                          placeholder="in%"
                          value={cell.pct}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setCell(screen, plan, {
                              pct: sanitizePct(e.target.value),
                            })
                          }
                          autoComplete="off"
                        />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollContainer>
    </div>
  );
};
