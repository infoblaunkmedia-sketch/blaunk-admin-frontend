import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { getWorkspaceHomePath } from '../../auth/homePath';
import type { ModulePermission } from '../../shared/types/auth.types';

type NavItem = {
  label: string;
  path: string;
  permission: ModulePermission;
  icon: React.ReactNode;
  badge?: number;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    permission: 'dashboard',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 13h8V3H3v10zM13 21h8v-6h-8v6zM13 11h8V3h-8v8zM3 21h8v-6H3v6z" />
      </svg>
    ),
  },
  {
    label: 'CMS',
    path: '/cms',
    permission: 'cms',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
      </svg>
    ),
  },
  {
    label: 'People',
    path: '/people',
    permission: 'people',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="3.5" />
        <path d="M20 8v6M23 11h-6" />
      </svg>
    ),
  },
  {
    label: 'Channel Partners',
    path: '/channel-partners',
    permission: 'channelPartners',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8 7h8M8 12h8M8 17h5" />
        <rect x="3" y="4" width="18" height="16" rx="2" />
      </svg>
    ),
  },
  {
    label: 'Finance',
    path: '/finance',
    permission: 'finance',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 3h12" />
        <path d="M6 8h12" />
        <path d="m6 13 8.5 8" />
        <path d="M6 13h3" />
        <path d="M9 13c6.667 0 6.667-10 0-10" />
      </svg>
    ),
  },
  {
    label: 'Platform & Products',
    path: '/platform',
    permission: 'platform',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l9 5-9 5-9-5 9-5z" />
        <path d="M3 17l9 5 9-5" />
        <path d="M3 12l9 5 9-5" />
      </svg>
    ),
  },
  {
    label: 'Marketing & Ads',
    path: '/marketing',
    permission: 'marketing',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
        <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14" />
        <path d="M8 6v8" />
      </svg>
    ),
  },
  {
    label: 'Customers & Care',
    path: '/customers',
    permission: 'customers',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Reports (MIS)',
    path: '/reports',
    permission: 'reports',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3h18v18H3z" />
        <path d="M7 15l3-3 2 2 5-5" />
      </svg>
    ),
  },
  {
    label: 'Corporate',
    path: '/corporate',
    permission: 'corporate',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6M9 12h6M9 15h6" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    path: '/settings',
    permission: 'settings',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z" />
      </svg>
    ),
  },
];

const HOME_ICON = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10h14V10" />
  </svg>
);

interface SidebarProps {
  open: boolean;
  collapsed?: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open, collapsed = false, onClose }) => {
  const { hasPermission, user } = useAuth();
  const location = useLocation();

  const workspaceHome =
    user && user.role !== 'admin' ? getWorkspaceHomePath(user) : null;

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.permission === 'dashboard' && user?.role !== 'admin') return false;
    return hasPermission(item.permission);
  });

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
        />
      )}

      <aside
        style={{
          width: collapsed ? '84px' : 'var(--sidebar-width)',
          top: 'var(--topbar-height)',
          backgroundColor: 'var(--sidebar-bg)',
        }}
        className={[
          'fixed bottom-0 left-0 z-30 flex flex-col overflow-y-auto transition-transform duration-200',
          'border-r border-slate-200',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        <nav
          className={[
            'flex flex-1 flex-col gap-1 py-4',
            collapsed ? 'px-2.5' : 'px-3',
          ].join(' ')}
        >
          {workspaceHome ? (
            <NavLink
              key={workspaceHome}
              to={workspaceHome}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center rounded-lg px-3 text-sm font-bold transition-colors',
                  collapsed ? 'justify-center' : '',
                  collapsed ? 'py-2.5' : 'py-2.5',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-black hover:bg-slate-50',
                ].join(' ')
              }
            >
              <span className={collapsed ? '' : 'mr-2'} aria-hidden>{HOME_ICON}</span>
              {!collapsed ? <span className="flex-1 leading-snug">Home</span> : null}
            </NavLink>
          ) : null}
          {visibleItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={[
                  'flex items-center rounded-lg px-3 text-sm font-bold transition-colors',
                  collapsed ? 'justify-center' : '',
                  collapsed ? 'py-2.5' : 'py-2.5',
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-black hover:bg-slate-50',
                ].join(' ')}
              >
                <span className={collapsed ? '' : 'mr-2'} aria-hidden>{item.icon}</span>
                {!collapsed ? <span className="flex-1 leading-snug">{item.label}</span> : null}
                {!collapsed && item.badge != null && item.badge > 0 && (
                  <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
