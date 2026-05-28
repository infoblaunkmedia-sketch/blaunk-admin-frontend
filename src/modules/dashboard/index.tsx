import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../shared/components/PageHeader';
import { SectionCard } from '../../shared/components/SectionCard';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { fetchAnalyticsSummary, fetchAnalyticsCharts, type AnalyticsSummary } from './analytics.service';

const KpiCard: React.FC<{
  label: string;
  value: string | number;
  color: string;
  sub?: string;
  onClick?: () => void;
}> = ({ label, value, color, sub, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      'flex flex-col gap-1 rounded-card border border-slate-200 bg-white p-5 shadow-card text-left transition',
      onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30' : 'cursor-default',
    ].join(' ')}
  >
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
    <p className={['text-3xl font-bold', color].join(' ')}>{value}</p>
    {sub && <p className="text-xs text-slate-400">{sub}</p>}
  </button>
);

const QuickLink: React.FC<{ label: string; to: string }> = ({ label, to }) => {
  const navigate = useNavigate();
  return (
    <button type="button" onClick={() => navigate(to)}
      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-white hover:text-primary">
      {label}
    </button>
  );
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = React.useState<AnalyticsSummary | null>(null);
  const [charts, setCharts] = React.useState<{ newUsersByDay: { date: string; count: number }[]; ordersByDay: { date: string; orders: number; revenue: number }[] } | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const [s, c] = await Promise.all([
          fetchAnalyticsSummary(),
          fetchAnalyticsCharts('30d'),
        ]);
        setSummary(s);
        setCharts(c);
      } catch {
        setSummary(null);
      }
    }
    load();
  }, []);

  const maxOrders = Math.max(1, ...(charts?.ordersByDay.map((d) => d.orders) || [1]));

  return (
    <ErrorBoundary>
      <PageHeader title="Dashboard" subtitle="Live metrics from MongoDB." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="B2C Users" value={summary?.totalUsers ?? '—'} color="text-primary"
          onClick={() => navigate('/customers/individuals')} />
        <KpiCard label="Orders" value={summary?.totalOrders ?? '—'} color="text-amber-600"
          sub={`Revenue ₹${(summary?.totalRevenue ?? 0).toLocaleString()}`}
          onClick={() => navigate('/customers/orders')} />
        <KpiCard label="Pending Sellers" value={summary?.pendingSellerApprovals ?? '—'} color="text-red-600"
          onClick={() => navigate('/customers/vendors')} />
        <KpiCard label="Pending Products" value={summary?.pendingProductApprovals ?? '—'} color="text-slate-700"
          onClick={() => navigate('/platform/products')} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Approved Sellers" value={summary?.totalSellers.approved ?? '—'} color="text-emerald-600" />
        <KpiCard label="DSA Payouts (total)" value={`₹${(summary?.dsaPayoutTotal ?? 0).toLocaleString()}`} color="text-primary" />
        <KpiCard label="Referral Commission" value={`₹${(summary?.referralCommissionTotal ?? 0).toLocaleString()}`} color="text-primary"
          onClick={() => navigate('/channel-partners/dsa')} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="New users (30 days)">
          {charts?.newUsersByDay.length ? (
            <div className="flex h-40 items-end gap-1">
              {charts.newUsersByDay.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-primary/80" style={{ height: `${Math.max(8, (d.count || 0) * 24)}px` }} title={`${d.count}`} />
                  <span className="text-[9px] text-slate-400 rotate-[-45deg] origin-top-left whitespace-nowrap">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No chart data yet.</p>
          )}
        </SectionCard>

        <SectionCard title="Orders per day (30 days)">
          {charts?.ordersByDay.length ? (
            <div className="flex h-40 items-end gap-1">
              {charts.ordersByDay.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-amber-500/80" style={{ height: `${Math.max(8, ((d.orders || 0) / maxOrders) * 120)}px` }} title={`${d.orders} orders`} />
                  <span className="text-[9px] text-slate-400">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-slate-400">No chart data yet.</p>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Quick Navigate" className="mt-6">
        <div className="grid grid-cols-2 gap-3">
          <QuickLink label="Products" to="/platform/products" />
          <QuickLink label="Orders" to="/customers/orders" />
          <QuickLink label="Vendors" to="/customers/vendors" />
          <QuickLink label="DSA Referrals" to="/channel-partners/dsa" />
          <QuickLink label="Banners" to="/cms/banners" />
          <QuickLink label="Categories" to="/platform/categories" />
        </div>
      </SectionCard>
    </ErrorBoundary>
  );
};
