import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../shared/components/PageHeader';
import { SectionCard } from '../../shared/components/SectionCard';
import { useAuth } from '../../auth/useAuth';
import { api } from '../../shared/services/apiService';
import { fetchSliderSummary } from '../marketing/marketing.service';
import { hasSectionAccess } from '../../shared/constants/moduleRights';
import {
  WelcomeHero,
  QuickLinksGrid,
  PartnerTipsCard,
  DsaBalanceCards,
  buildWorkspaceQuickLinks,
} from './workspaceHome';

type MeResp = {
  user: {
    username?: string;
    email?: string | null;
    employeeCode?: string | null;
    department?: string | null;
  };
};

export const ContractorWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const [me, setMe] = React.useState<MeResp['user'] | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [summary, setSummary] = React.useState<{
    totalMargin: number;
    marginUsed: number;
    availableMargin: number;
  } | null>(null);
  const [summaryLoading, setSummaryLoading] = React.useState(false);
  const [summaryErr, setSummaryErr] = React.useState<string | null>(null);

  const dsaCode = (me?.employeeCode ?? user?.code ?? '').trim().toUpperCase();
  const canDsa = hasSectionAccess(user?.permissions ?? [], 'channelPartners', 'dsa');

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await api.get<MeResp>('/api/auth/me');
        if (mounted) setMe(data.user ?? null);
      } catch (e) {
        if (mounted) setErr(e instanceof Error ? e.message : 'Unable to load profile.');
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!dsaCode || !canDsa) return;
    let mounted = true;
    setSummaryLoading(true);
    setSummaryErr(null);
    (async () => {
      try {
        const data = await fetchSliderSummary({ dsaCode });
        if (mounted) setSummary(data);
      } catch (e) {
        if (mounted) setSummaryErr(e instanceof Error ? e.message : 'Unable to load balance.');
      } finally {
        if (mounted) setSummaryLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [canDsa, dsaCode]);

  const displayName = me?.username ?? user?.username ?? 'Partner';
  const quickLinks = buildWorkspaceQuickLinks(user?.permissions ?? []);

  return (
    <>
      <PageHeader
        title="Partner workspace"
        subtitle="Manage limits, uploads, and sales from one place"
      />

      <div className="space-y-6">
        <WelcomeHero
          title={`Hello, ${displayName}`}
          subtitle="Track your DSA balance, submit pay-ins, and publish media. All from your assigned modules."
          code={dsaCode || null}
        />

        {err ? <p className="text-sm text-red-600">{err}</p> : null}

        {canDsa ? (
          <SectionCard
            title="DSA balance"
            actions={
              <Link
                to="/channel-partners/dsa"
                className="text-sm font-semibold text-primary hover:text-primary-dark"
              >
                Open DSA portal →
              </Link>
            }
          >
            <DsaBalanceCards summary={summary} loading={summaryLoading} error={summaryErr} />
          </SectionCard>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard title="Quick access" className="lg:col-span-2">
            <QuickLinksGrid
              links={quickLinks}
              emptyMessage="No modules are assigned yet. Your administrator can grant DSA or Sales access when needed."
            />
          </SectionCard>

          <SectionCard title="Account">
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">Email</dt>
                <dd className="text-slate-900">{me?.email ?? user?.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Partner code</dt>
                <dd className="uppercase text-slate-900">{dsaCode || '—'}</dd>
              </div>
            </dl>
          </SectionCard>
        </div>

        <SectionCard title="Partner guide">
          <PartnerTipsCard />
        </SectionCard>
      </div>
    </>
  );
};
