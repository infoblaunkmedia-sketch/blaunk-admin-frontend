import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import type { ModulePermission } from '../types/auth.types';
import { useAuth } from '../../auth/useAuth';
import { PageChromeContext } from './pageChromeContext';

export type ModuleTab = {
  label: string;
  path: string;
  /** Section slug for rights, e.g. `media-ads` → `marketing:media-ads` */
  section?: string;
};

interface ModuleLayoutProps {
  tabs: ModuleTab[];
  moduleKey?: ModulePermission;
  children?: React.ReactNode;
}

export const ModuleLayout: React.FC<ModuleLayoutProps> = ({ tabs, moduleKey, children }) => {
  const location = useLocation();
  const { hasSection, user } = useAuth();

  const visibleTabs = React.useMemo(() => {
    if (!moduleKey || user?.role === 'admin') return tabs;
    return tabs.filter((tab) => {
      if (!tab.section) return true;
      return hasSection(moduleKey, tab.section);
    });
  }, [tabs, moduleKey, hasSection, user?.role]);

  if (visibleTabs.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        You do not have access to any sections in this module.
      </div>
    );
  }

  const activeTabPath = React.useMemo(() => {
    const matches = visibleTabs.filter(
      (tab) =>
        location.pathname === tab.path ||
        location.pathname.startsWith(`${tab.path}/`),
    );
    if (matches.length === 0) return null;
    return matches.reduce((best, tab) => (tab.path.length > best.path.length ? tab : best)).path;
  }, [location.pathname, visibleTabs]);

  const showModuleTabs = visibleTabs.length > 1;

  return (
    <PageChromeContext.Provider value={{ showPageTitle: !showModuleTabs }}>
      <div className="flex flex-col gap-3">
        {showModuleTabs ? (
          <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-0">
            {visibleTabs.map((tab) => {
              const isActive = tab.path === activeTabPath;
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  className={[
                    'relative -mb-px rounded-t-lg border border-b-0 px-4 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'border-slate-200 border-b-white bg-white text-primary'
                      : 'border-transparent bg-transparent text-slate-500 hover:text-slate-700',
                  ].join(' ')}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        ) : null}

        <div>{children ?? <Outlet />}</div>
      </div>
    </PageChromeContext.Provider>
  );
};
