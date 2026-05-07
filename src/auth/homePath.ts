import type { AuthUser, ModulePermission } from '../shared/types/auth.types';

/** Default landing route for authenticated users by role / employee type (not module permissions). */
export function getWorkspaceHomePath(user: AuthUser | null): '/dashboard' | '/home/employee' | '/home/contractor' {
  if (!user || user.role === 'admin') return '/dashboard';
  if (user.employeeType === '3pc') return '/home/contractor';
  return '/home/employee';
}

const MODULE_BY_PREFIX: Array<{ prefix: string; permission: ModulePermission }> =
  [
    { prefix: '/dashboard', permission: 'dashboard' },
    { prefix: '/cms', permission: 'cms' },
    { prefix: '/people', permission: 'people' },
    { prefix: '/channel-partners', permission: 'channelPartners' },
    { prefix: '/finance', permission: 'finance' },
    { prefix: '/platform', permission: 'platform' },
    { prefix: '/marketing', permission: 'marketing' },
    { prefix: '/customers', permission: 'customers' },
    { prefix: '/reports', permission: 'reports' },
    { prefix: '/corporate', permission: 'corporate' },
    { prefix: '/settings', permission: 'settings' },
  ];

/** First module permission keyed by pathname, if any (home routes excluded). */
export function modulePermissionForPath(pathname: string): ModulePermission | null {
  if (pathname.startsWith('/home/')) return null;
  const hit = MODULE_BY_PREFIX.find((m) => pathname === m.prefix || pathname.startsWith(`${m.prefix}/`));
  return hit ? hit.permission : null;
}
