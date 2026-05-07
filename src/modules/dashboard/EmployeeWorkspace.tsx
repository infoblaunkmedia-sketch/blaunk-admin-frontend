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
  platform: 'Platform & Products',
  marketing: 'Marketing',
  customers: 'Customers & Care',
  reports: 'Reports',
  corporate: 'Corporate',
  settings: 'Settings',
};

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

  const modules =
    user?.permissions.filter((p) =>
      ([
        'dashboard',
        'cms',
        'people',
        'channelPartners',
        'finance',
        'platform',
        'marketing',
        'customers',
        'reports',
        'corporate',
        'settings',
      ] satisfies ModulePermission[]).includes(p),
    ) || [];

  return (
    <>
      <PageHeader
        title="Workspace"
        subtitle="Overview for internal employees"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Profile">
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          <dl className="grid gap-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-500">Username</dt>
              <dd className="text-slate-900">{me?.username ?? user?.username ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Employee code</dt>
              <dd className="text-slate-900">{me?.employeeCode ?? user?.code ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Email</dt>
              <dd className="text-slate-900">{me?.email ?? user?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-500">Department</dt>
              <dd className="text-slate-900">{me?.department ?? '—'}</dd>
            </div>
          </dl>
        </SectionCard>

        <SectionCard title="Areas you can open">
          {modules.length === 0 ? (
            <p className="text-sm text-slate-600">
              You do not currently have module access assigned. If something looks wrong,
              please contact your administrator.
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
