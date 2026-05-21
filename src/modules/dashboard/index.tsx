import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../shared/components/PageHeader';
import { SectionCard } from '../../shared/components/SectionCard';
import { ErrorBoundary } from '../../shared/components/ErrorBoundary';
import { fetchIndividuals, fetchIssues } from '../customers/customers.service';
import { fetchDsaPayouts } from '../finance/finance.service';

// KPI card — clickable if onClick is supplied
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

// Quick-navigate shortcut card
const QuickLink: React.FC<{ label: string; to: string }> = ({ label, to }) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-white hover:text-primary"
    >
      {label}
    </button>
  );
};

type KpiState = {
  activeEmployees: number;
  openIssues: number;
  pendingDsaPayments: number;
  pendingVerifications: number;
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = React.useState<KpiState>({
    activeEmployees: 0,
    openIssues: 0,
    pendingDsaPayments: 0,
    pendingVerifications: 0,
  });

  React.useEffect(() => {
    async function loadKpis() {
      const [individuals, issues, payouts] = await Promise.allSettled([
        fetchIndividuals(),
        fetchIssues(),
        fetchDsaPayouts(),
      ]);

      setKpis({
        activeEmployees:
          individuals.status === 'fulfilled'
            ? individuals.value.filter((i) => i.accountStatus === 'Active').length
            : 0,
        openIssues:
          issues.status === 'fulfilled'
            ? issues.value.filter((i) => i.status !== 'Resolved').length
            : 0,
        pendingDsaPayments:
          payouts.status === 'fulfilled'
            ? payouts.value.filter((p) => p.status === 'PENDING' || p.status === 'PENDING_APPROVAL').length
            : 0,
        pendingVerifications: 0,
      });
    }
    loadKpis();
  }, []);

  return (
    <ErrorBoundary>
      <PageHeader title="Dashboard" subtitle="Welcome back — here's what's happening." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active Customers"
          value={kpis.activeEmployees}
          color="text-primary"
          sub="Individual accounts"
          onClick={() => navigate('/customers/individuals')}
        />
        <KpiCard
          label="Open Customer Issues"
          value={kpis.openIssues}
          color="text-amber-600"
          sub="Pending + In Progress"
          onClick={() => navigate('/customers/issues')}
        />
        <KpiCard
          label="Pending DSA Payments"
          value={kpis.pendingDsaPayments}
          color="text-red-600"
          sub="Awaiting approval"
          onClick={() => navigate('/platform/dsa-limits')}
        />
        <KpiCard
          label="Pending Verifications"
          value={kpis.pendingVerifications}
          color="text-slate-700"
          sub="Channel partner KYC"
          onClick={() => navigate('/channel-partners/verifiers')}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Recent Activity">
          <p className="py-8 text-center text-sm text-slate-400">
            Activity feed will populate here once the API is wired.
          </p>
        </SectionCard>

        <SectionCard title="Quick Navigate">
          <div className="grid grid-cols-2 gap-3">
            <QuickLink label="People" to="/people/employees" />
            <QuickLink label="Finance" to="/finance/b2b" />
            <QuickLink label="Channel Partners" to="/channel-partners/dsa" />
            <QuickLink label="Platform" to="/platform/plan-charges" />
            <QuickLink label="Marketing" to="/marketing/media-ads" />
            <QuickLink label="Customers" to="/customers/individuals" />
            <QuickLink label="Reports" to="/reports" />
            <QuickLink label="Settings" to="/settings/rights" />
          </div>
        </SectionCard>
      </div>
    </ErrorBoundary>
  );
};
