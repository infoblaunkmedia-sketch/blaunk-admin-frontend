import React from 'react';
import { PageHeader } from '../../shared/components/PageHeader';
import { SectionCard } from '../../shared/components/SectionCard';
import { useAuth } from '../../auth/useAuth';
import { api } from '../../shared/services/apiService';
import type { ModulePermission } from '../../shared/types/auth.types';

const MODULE_LABELS: Partial<Record<ModulePermission, string>> = {
  dashboard: 'Home',
  cms: 'CMS',
  people: 'People',
  channelPartners: 'Channel Partners',
  finance: 'Finance',
  platform: 'Management',
  customers: 'Customers & Care',
  reports: 'Reports',
  corporate: 'Corporate',
  retailManagement: 'Retail Management',
};

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

  const modules = user?.permissions || [];

  return (
    <>
      <PageHeader
        title="Partner workspace"
        subtitle="Where partners move work forward."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Account">
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">Username</dt>
              <dd className="text-slate-900">{me?.username ?? user?.username ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Partner / code</dt>
              <dd className="text-slate-900">{me?.employeeCode ?? user?.code ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Email</dt>
              <dd className="text-slate-900">{me?.email ?? user?.email ?? '—'}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="Modules available to you">
          {modules.length === 0 ? (
            <p className="text-sm text-slate-600">
              No modules are assigned right now. Your administrator can grant access when needed.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {modules.map((p) => (
                <li
                  key={p}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {MODULE_LABELS[p] ?? p}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
};
