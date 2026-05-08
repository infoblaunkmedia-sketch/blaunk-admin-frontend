import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export type ModuleTab = {
  label: string;
  path: string;
};

interface ModuleLayoutProps {
  tabs: ModuleTab[];
  children?: React.ReactNode;
}

export const ModuleLayout: React.FC<ModuleLayoutProps> = ({ tabs, children }) => {
  const location = useLocation();

  return (
    <div className="flex flex-col gap-5">
      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-0">
        {tabs.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            location.pathname.startsWith(`${tab.path}/`);
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

      <div>{children ?? <Outlet />}</div>
    </div>
  );
};
