import React from 'react';
import { formatDateDDMMYYYY } from '../../shared/utils/dateFormat';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { fetchAnalyticsSummary, fetchAnalyticsCharts, type AnalyticsSummary, type ChartsData } from './analytics.service';

type AttentionItem = {
  label: string;
  count: number;
  to: string;
  tone: 'amber' | 'red' | 'blue' | 'violet';
};

const toneStyles = {
  amber: 'border-amber-200 bg-amber-50 text-amber-900',
  red: 'border-red-200 bg-red-50 text-red-900',
  blue: 'border-blue-200 bg-blue-50 text-blue-900',
  violet: 'border-violet-200 bg-violet-50 text-violet-900',
};

const MetricCard: React.FC<{
  label: string;
  value: string;
  hint?: string;
  accent: string;
  onClick?: () => void;
}> = ({ label, value, hint, accent, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={!onClick}
    className={[
      'relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition',
      onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : 'cursor-default',
    ].join(' ')}
  >
    <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
    {hint ? <p className="mt-1 text-xs font-medium text-slate-500">{hint}</p> : null}
  </button>
);

const MiniBarChart: React.FC<{
  title: string;
  points: { label: string; value: number }[];
  barClass: string;
  emptyText: string;
}> = ({ title, points, barClass, emptyText }) => {
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      {points.length ? (
        <div className="mt-4 flex h-36 items-end gap-1.5">
          {points.map((p) => (
            <div key={p.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div
                className={`w-full rounded-t-md ${barClass}`}
                style={{ height: `${Math.max(10, (p.value / max) * 100)}%` }}
                title={`${p.label}: ${p.value}`}
              />
              <span className="w-full truncate text-center text-[10px] font-medium text-slate-400">
                {p.label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="py-10 text-center text-sm text-slate-400">{emptyText}</p>
      )}
    </div>
  );
};

function buildAttentionItems(summary: AnalyticsSummary | null): AttentionItem[] {
  if (!summary) return [];
  const items: AttentionItem[] = [];
  if (summary.pendingSellerApprovals > 0) {
    items.push({
      label: 'Seller approvals pending',
      count: summary.pendingSellerApprovals,
      to: '/customers/vendors',
      tone: 'amber',
    });
  }
  if (summary.pendingProductApprovals > 0) {
    items.push({
      label: 'Product approvals pending',
      count: summary.pendingProductApprovals,
      to: '/management/products',
      tone: 'red',
    });
  }
  if ((summary.dsaPayoutPendingCount ?? 0) > 0 || summary.dsaPayoutPending > 0) {
    items.push({
      label: 'DSA limit requests pending',
      count: summary.dsaPayoutPendingCount ?? 0,
      to: '/finance/dsa-payouts',
      tone: 'blue',
    });
  }
  return items;
}

function formatInr(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = React.useState<AnalyticsSummary | null>(null);
  const [charts, setCharts] = React.useState<ChartsData | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, c] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchAnalyticsCharts('30d'),
        ]);
        setSummary(s);
        setCharts(c);
      } catch {
        setSummary(null);
        setCharts(null);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const attention = buildAttentionItems(summary);
  const today = formatDateDDMMYYYY(new Date().toISOString());

  const userPoints = (charts?.newUsersByDay || []).slice(-14).map((d) => ({
    label: formatDateDDMMYYYY(d.date).slice(0, 5),
    value: d.count || 0,
  }));
  const orderPoints = (charts?.ordersByDay || []).slice(-14).map((d) => ({
    label: formatDateDDMMYYYY(d.date).slice(0, 5),
    value: d.orders || 0,
  }));

  const quickActions = [
    { label: 'Approve sellers', to: '/customers/vendors' },
    { label: 'Review products', to: '/management/products' },
    { label: 'DSA limit queue', to: '/finance/dsa-payouts' },
    { label: 'Customer orders', to: '/customers/orders' },
    { label: 'Shareholding', to: '/corporate/shareholding' },
    { label: 'MIS reports', to: '/reports' },
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-6 py-6 text-white shadow-lg">
          <p className="text-sm font-semibold text-white/80">{today}</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/90">
            Live overview of approvals, revenue, and channel activity, Only what needs your attention.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[12rem] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            {attention.length > 0 ? (
              <></>
              // <section>
              //   <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
              //     Needs attention
              //   </h2>
              //   <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              //     {attention.map((item) => (
              //       <button
              //         key={item.label}
              //         type="button"
              //         onClick={() => navigate(item.to)}
              //         className={[
              //           'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition hover:shadow-md',
              //           toneStyles[item.tone],
              //         ].join(' ')}
              //       >
              //         <span className="text-sm font-bold">{item.label}</span>
              //         <span className="rounded-full bg-white/80 px-3 py-1 text-lg font-extrabold">
              //           {item.count}
              //         </span>
              //       </button>
              //     ))}
              //   </div>
              // </section>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                All clear — no pending approvals in queue right now.
              </div>
            )}

            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
                Business snapshot
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="B2C customers"
                  value={(summary?.totalUsers ?? 0).toLocaleString('en-IN')}
                  hint="Registered individuals"
                  accent="bg-primary"
                  onClick={() => navigate('/customers/individuals')}
                />
                <MetricCard
                  label="Orders"
                  value={(summary?.totalOrders ?? 0).toLocaleString('en-IN')}
                  hint={`Revenue ${formatInr(summary?.totalRevenue ?? 0)}`}
                  accent="bg-amber-500"
                  onClick={() => navigate('/customers/orders')}
                />
                <MetricCard
                  label="Approved sellers"
                  value={(summary?.totalSellers.approved ?? 0).toLocaleString('en-IN')}
                  hint={`${summary?.totalSellers.pending ?? 0} pending review`}
                  accent="bg-emerald-500"
                  onClick={() => navigate('/customers/vendors')}
                />
                <MetricCard
                  label="DSA pay-ins"
                  value={formatInr(summary?.dsaPayoutTotal ?? 0)}
                  hint={`${formatInr(summary?.dsaPayoutPending ?? 0)} awaiting approval`}
                  accent="bg-violet-500"
                  onClick={() => navigate('/finance/dsa-payouts')}
                />
              </div>
            </section>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <MiniBarChart
                title="New customers (last 14 days)"
                points={userPoints}
                barClass="bg-primary/80"
                emptyText="No new sign-ups in this period."
              />
              <MiniBarChart
                title="Orders per day (last 14 days)"
                points={orderPoints}
                barClass="bg-amber-500/80"
                emptyText="No orders in this period."
              />
            </div>

            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
                Quick actions
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {quickActions.map((action) => (
                  <button
                    key={action.to}
                    type="button"
                    onClick={() => navigate(action.to)}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700 transition hover:border-primary/40 hover:bg-white hover:text-primary"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};
