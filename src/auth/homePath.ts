import type { AuthUser, ModulePermission } from '../shared/types/auth.types';
import { hasModuleAccess, hasSectionAccess } from '../shared/constants/moduleRights';

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
    { prefix: '/sales', permission: 'sales' },
    { prefix: '/it', permission: 'it' },
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

/** First path segment after module prefix, e.g. `/marketing/media-ads` → `media-ads`. */
export function sectionKeyForPath(pathname: string): string | null {
  const mod = modulePermissionForPath(pathname);
  if (!mod) return null;
  const hit = MODULE_BY_PREFIX.find((m) => m.permission === mod);
  if (!hit) return null;
  const rest = pathname.slice(hit.prefix.length).replace(/^\//, '');
  if (!rest) return null;
  return rest.split('/')[0] || null;
}

function legacyMarketingPathToSettings(pathname: string): { module: ModulePermission; section: string } | null {
  if (!pathname.startsWith('/marketing')) return null;
  if (pathname.includes('match-doe') || pathname.includes('match-code')) {
    return { module: 'settings', section: 'match-code' };
  }
  if (pathname.includes('slot-settings')) {
    return { module: 'settings', section: 'slot-settings' };
  }
  return { module: 'settings', section: 'slot-settings' };
}

export function canAccessPath(user: AuthUser | null, pathname: string): boolean {
  if (!user || user.role === 'admin') return true;
  const legacy = legacyMarketingPathToSettings(pathname);
  if (legacy) {
    if (!hasModuleAccess(user.permissions, legacy.module)) return false;
    return hasSectionAccess(user.permissions, legacy.module, legacy.section);
  }
  const mod = modulePermissionForPath(pathname);
  if (!mod) return true;
  if (!hasModuleAccess(user.permissions, mod)) return false;
  const section = sectionKeyForPath(pathname);
  if (!section) return true;
  return hasSectionAccess(user.permissions, mod, section);
}
