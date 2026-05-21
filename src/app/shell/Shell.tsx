import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import type { ModulePermission } from '../../shared/types/auth.types';
import { useAuth } from '../../auth/useAuth';
import { canAccessPath, getWorkspaceHomePath } from '../../auth/homePath';
import { api } from '../../shared/services/apiService';

type MeMinimal = {
  user: {
    email?: string | null;
    employeeCode?: string | null;
    employeeType?: string | null;
    department?: string | null;
  };
};

export const Shell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : false,
  );
  const { user, updatePermissions, patchUserFields, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  React.useEffect(() => {
    if (isDesktop) {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  React.useEffect(() => {
    if (!user || user.role === 'admin') return;
    if (!canAccessPath(user, location.pathname)) {
      navigate(getWorkspaceHomePath(user), { replace: true });
    }
  }, [user, user?.permissions, location.pathname, navigate]);

  React.useEffect(() => {
    // Keep rights in sync for non-admin users without forcing logout/login.
    if (!user || user.role === 'admin') return;

    let cancelled = false;
    let inflight = false;

    const refresh = async () => {
      if (inflight) return;
      inflight = true;
      try {
        const [rightsRes, meRes] = await Promise.all([
          api.get<{ sections: string[] }>('/api/rights/me'),
          api.get<MeMinimal>('/api/auth/me').catch(() => null),
        ]);
        if (cancelled) return;
        const res = rightsRes;

        const meUser = meRes?.user;
        if (meUser) {
          const trimEt = String(meUser.employeeType ?? '').trim();
          const patch: Parameters<typeof patchUserFields>[0] = {};
          if (meUser.email != null && String(meUser.email) !== String(user.email ?? ''))
            patch.email = meUser.email ?? undefined;
          if (meUser.employeeCode) {
            const c = String(meUser.employeeCode).trim();
            if (c !== String(user.code || '').trim()) patch.code = c;
          }
          if (trimEt) {
            const et = trimEt.toLowerCase() === '3pc' ? '3pc' : 'employee';
            if (et !== user.employeeType) patch.employeeType = et;
          }
          if (Object.keys(patch).length) patchUserFields(patch);
        }

        // Update only when changed to avoid extra renders.
        const next = res.sections || [];
        const cur = user.permissions || [];
        const same =
          cur.length === next.length &&
          cur.every((p) => next.includes(p)) &&
          next.every((p) => cur.includes(p));
        if (!same) updatePermissions(next);

        const modAfter = modulePermissionForPath(location.pathname);
        if (modAfter !== null && !next.includes(modAfter)) {
          navigate(getWorkspaceHomePath(user), { replace: true });
        }
      } catch (e) {
        // If token is invalid/expired, logout to force re-auth.
        const msg = e instanceof Error ? e.message : '';
        if (String(msg).includes('401') || String(msg).includes('Unauthorized')) {
          logout();
        }
      } finally {
        inflight = false;
      }
    };

    // Refresh now, on focus/visibility, and periodically.
    refresh();
    const onFocus = () => refresh();
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);
    const timer = window.setInterval(refresh, 8000);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
      window.clearInterval(timer);
    };
    // Intentionally do not depend on user.permissions to avoid resetting interval each change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  return (
    <div className="min-h-screen bg-surface">
      <Topbar
        onMenuClick={() => {
          if (isDesktop) {
            setSidebarCollapsed((p) => !p);
            return;
          }
          setSidebarOpen((p) => !p);
        }}
      />

      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
      />

      <main
        style={{
          paddingTop: 'var(--topbar-height)',
          paddingLeft: isDesktop ? (sidebarCollapsed ? '76px' : 'var(--sidebar-width)') : 0,
        }}
        className="min-h-screen transition-all duration-200 max-lg:pl-0"
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
