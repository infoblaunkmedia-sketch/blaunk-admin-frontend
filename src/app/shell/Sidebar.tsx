import React from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { getWorkspaceHomePath } from '../../auth/homePath';
import type { ModulePermission } from '../../shared/types/auth.types';

type NavChild = {
  label: string;
  path: string;
  section: string;
};

type NavItem = {
  label: string;
  path: string;
  permission: ModulePermission;
  icon: React.ReactNode;
  badge?: number;
  children?: NavChild[];
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
  // {
  //   label: 'CMS',
  //   path: '/cms',
  //   permission: 'cms',
  //   icon: (
  //     <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
  //       <rect x="3" y="4" width="18" height="16" rx="2" />
  //       <path d="M3 10h18" />
  //     </svg>
  //   ),
  // },
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
    children: [
      { label: 'DSA', path: '/channel-partners/dsa', section: 'dsa' },
      { label: 'Verifiers', path: '/channel-partners/verifiers', section: 'verifiers' },
    ],
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
    label: 'Management',
    path: '/management',
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
    label: 'Sales',
    path: '/sales',
    permission: 'sales',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3h18v18H3z" />
        <path d="M7 15l3-3 2 2 5-5" />
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
    label: 'Company Secretary',
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
    label: 'Admin & Personnel',
    path: '/admin-personnel',
    permission: 'adminPersonnel',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v18M3 12h18" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
  {
    label: 'IT',
    path: '/it',
    permission: 'it',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    label: 'Retail Management',
    path: '/retail-management',
    permission: 'retailManagement',
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" />
        <path d="M3 9l2.5-5h13L21 9" />
        <path d="M9 13h6" />
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

const CHEVRON_ICON = (
  <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ open, collapsed = false, onClose }) => {
  const { hasPermission, hasSection, user } = useAuth();
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});
  const [collapsedTip, setCollapsedTip] = React.useState<{
    label: string;
    top: number;
    left: number;
  } | null>(null);
  const [collapsedFlyout, setCollapsedFlyout] = React.useState<{
    item: NavItem;
    children: NavChild[];
    top: number;
    left: number;
  } | null>(null);

  const workspaceHome =
    user && user.role !== 'admin' ? getWorkspaceHomePath(user) : null;

  const showMyPayslip =
    Boolean(user && user.role !== 'admin' && String(user.employeeType || '').toLowerCase() !== '3pc');

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.permission === 'dashboard' && user?.role !== 'admin') return false;
    return hasPermission(item.permission);
  });

  React.useEffect(() => {
    if (!collapsed) {
      setCollapsedTip(null);
      setCollapsedFlyout(null);
    }
  }, [collapsed]);

  React.useEffect(() => {
    if (location.pathname.startsWith('/channel-partners')) {
      setExpandedGroups((prev) => ({ ...prev, '/channel-partners': true }));
    }
  }, [location.pathname]);

  const visibleChildren = (item: NavItem): NavChild[] => {
    if (!item.children?.length) return [];
    if (user?.role === 'admin') return item.children;
    return item.children.filter((child) => hasSection(item.permission, child.section));
  };

  const toggleGroup = (path: string) => {
    setExpandedGroups((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const collapsedLabelProps = (label: string) =>
    collapsed
      ? {
          'aria-label': label,
          onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
            const r = e.currentTarget.getBoundingClientRect();
            setCollapsedTip({
              label,
              top: r.top + r.height / 2,
              left: r.right + 10,
            });
          },
          onMouseLeave: () => setCollapsedTip(null),
          onFocus: (e: React.FocusEvent<HTMLElement>) => {
            const r = e.currentTarget.getBoundingClientRect();
            setCollapsedTip({
              label,
              top: r.top + r.height / 2,
              left: r.right + 10,
            });
          },
          onBlur: () => setCollapsedTip(null),
        }
      : {};

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
              {...collapsedLabelProps('Home')}
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
          {showMyPayslip ? (
            <NavLink
              to="/my-payslip"
              onClick={onClose}
              {...collapsedLabelProps('Payslip')}
              className={({ isActive }) =>
                [
                  'flex items-center rounded-lg px-3 text-sm font-bold transition-colors',
                  collapsed ? 'justify-center' : 'py-2.5',
                  isActive ? 'bg-primary text-white' : 'text-black hover:bg-slate-50',
                ].join(' ')
              }
            >
              <span className={collapsed ? '' : 'mr-2'} aria-hidden>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M8 13h8M8 17h5" />
                </svg>
              </span>
              {!collapsed ? <span className="flex-1 leading-snug">Payslip</span> : null}
            </NavLink>
          ) : null}
          {visibleItems.map((item) => {
            const children = visibleChildren(item);
            const hasChildren = children.length > 0;
            const isGroupActive =
              location.pathname === item.path ||
              location.pathname.startsWith(`${item.path}/`);
            const isExpanded = expandedGroups[item.path] ?? false;

            if (hasChildren) {
              return (
                <div key={item.path} className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      if (collapsed) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setCollapsedFlyout((prev) =>
                          prev?.item.path === item.path
                            ? null
                            : { item, children, top: rect.top, left: rect.right + 10 },
                        );
                        return;
                      }
                      toggleGroup(item.path);
                    }}
                    aria-expanded={collapsed ? collapsedFlyout?.item.path === item.path : isExpanded}
                    {...collapsedLabelProps(item.label)}
                    className={[
                      'flex w-full items-center rounded-lg px-3 text-sm font-bold transition-colors',
                      collapsed ? 'justify-center' : '',
                      'py-2.5',
                      isGroupActive
                        ? 'bg-primary text-white'
                        : 'text-black hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <span className={collapsed ? '' : 'mr-2'} aria-hidden>{item.icon}</span>
                    {!collapsed ? <span className="flex-1 text-left leading-snug">{item.label}</span> : null}
                    {!collapsed ? (
                      <span
                        className={['transition-transform', isExpanded ? 'rotate-90' : ''].join(' ')}
                        aria-hidden
                      >
                        {CHEVRON_ICON}
                      </span>
                    ) : null}
                  </button>
                  {!collapsed && isExpanded ? (
                    <div className="ml-3 flex flex-col mt-2 gap-0.5 border-l-2 border-slate-200 pl-2">
                      {children.map((child) => {
                        const childActive =
                          location.pathname === child.path ||
                          location.pathname.startsWith(`${child.path}/`);
                        return (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={onClose}
                            className={[
                              'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                              childActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-slate-700 hover:bg-slate-50',
                            ].join(' ')}
                          >
                            {child.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            }

            const isActive = isGroupActive;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                {...collapsedLabelProps(item.label)}
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

      {collapsed &&
        collapsedTip != null &&
        collapsedFlyout == null &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[9999] max-w-[min(16rem,calc(100vw-6rem))] -translate-y-1/2 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold leading-snug text-white shadow-lg"
            style={{ top: collapsedTip.top, left: collapsedTip.left }}
          >
            {collapsedTip.label}
          </div>,
          document.body,
        )}

      {collapsed &&
        collapsedFlyout != null &&
        createPortal(
          <>
            <button
              type="button"
              aria-label="Close submenu"
              className="fixed inset-0 z-[9998]"
              onClick={() => setCollapsedFlyout(null)}
            />
            <div
              className="fixed z-[9999] min-w-[10rem] rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
              style={{ top: collapsedFlyout.top, left: collapsedFlyout.left }}
            >
              <p className="border-b border-slate-100 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                {collapsedFlyout.item.label}
              </p>
              {collapsedFlyout.children.map((child) => {
                const childActive =
                  location.pathname === child.path ||
                  location.pathname.startsWith(`${child.path}/`);
                return (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    onClick={() => {
                      setCollapsedFlyout(null);
                      onClose();
                    }}
                    className={[
                      'block px-3 py-2 text-sm font-semibold transition-colors',
                      childActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-700 hover:bg-slate-50',
                    ].join(' ')}
                  >
                    {child.label}
                  </NavLink>
                );
              })}
            </div>
          </>,
          document.body,
        )}
    </>
  );
};
