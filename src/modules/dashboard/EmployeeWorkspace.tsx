import React from 'react';
import { PageHeader } from '../../shared/components/PageHeader';
import { SectionCard } from '../../shared/components/SectionCard';
import { useAuth } from '../../auth/useAuth';
import { api } from '../../shared/services/apiService';
import {
  WelcomeHero,
  QuickLinksGrid,
  EmployeeTipsCard,
  buildWorkspaceQuickLinks,
} from './workspaceHome';

type MeResp = {
  user: {
    username?: string;
    email?: string | null;
    employeeCode?: string | null;
    department?: string | null;
    role?: string;
  };
};

export const EmployeeWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const [me, setMe] = React.useState<MeResp['user'] | null>(null);
  const [err, setErr] = React.useState<string | null>(null);

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

  const displayName = me?.username ?? user?.username ?? 'there';
  const code = me?.employeeCode ?? user?.code ?? null;
  const quickLinks = buildWorkspaceQuickLinks(user?.permissions ?? []);

  return (
    <>
      <PageHeader
        title="Workspace"
        subtitle="Your home base for day-to-day work"
      />

      <div className="space-y-6">
        <WelcomeHero
          title={`Welcome back, ${displayName}`}
          subtitle="Jump into your tools below or use the sidebar for full navigation."
          code={code}
          department={me?.department}
        />

        {err ? <p className="text-sm text-red-600">{err}</p> : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <SectionCard title="Quick access" className="lg:col-span-2">
            <QuickLinksGrid
              links={quickLinks}
              emptyMessage="No modules are assigned yet. Contact your administrator if you need access."
            />
          </SectionCard>

          <SectionCard title="Profile">
            <dl className="grid gap-3 text-sm">
              <div>
                <dt className="font-semibold text-slate-500">Email</dt>
                <dd className="text-slate-900">{me?.email ?? user?.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Role</dt>
                <dd className="capitalize text-slate-900">{me?.role ?? user?.role ?? '—'}</dd>
              </div>
            </dl>
          </SectionCard>
        </div>

        <SectionCard title="Getting started">
          <EmployeeTipsCard />
        </SectionCard>
      </div>
    </>
  );
};
