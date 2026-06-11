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
    employeeName?: string | null;
    department?: string | null;
    role?: string;
  };
};

function firstNameFromFullName(name: string): string {
  const trimmed = String(name || '').trim();
  if (!trimmed) return '';
  const first = trimmed.split(/\s+/)[0] || '';
  if (!first) return '';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

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

  const welcomeName = firstNameFromFullName(me?.employeeName || '') || 'there';
  const profileName = String(me?.employeeName || '').trim() || '—';
  const quickLinks = buildWorkspaceQuickLinks(user?.permissions ?? []);

  return (
    <>
      <PageHeader
        title="Workspace"
        subtitle="Your home base for day-to-day work"
      />

      <div className="space-y-6">
        <WelcomeHero
          title={`Welcome back, ${welcomeName}`}
          subtitle="Jump into your tools below or use the sidebar for full navigation."
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
            <dl className="space-y-2.5 text-sm">
              <div className="flex flex-wrap gap-x-1">
                <dt className="font-bold text-slate-600">Name :</dt>
                <dd className="text-slate-900">{profileName}</dd>
              </div>
              <div className="flex flex-wrap gap-x-1">
                <dt className="font-bold text-slate-600">Emp Code :</dt>
                <dd className="text-slate-900">{me?.employeeCode ?? user?.code ?? '—'}</dd>
              </div>
              <div className="flex flex-wrap gap-x-1">
                <dt className="font-bold text-slate-600">Department :</dt>
                <dd className="text-slate-900">{me?.department ?? '—'}</dd>
              </div>
              <div className="flex flex-wrap gap-x-1">
                <dt className="font-bold text-slate-600">Email</dt>
                <dd className="text-slate-900">{me?.email ?? user?.email ?? '—'}</dd>
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
