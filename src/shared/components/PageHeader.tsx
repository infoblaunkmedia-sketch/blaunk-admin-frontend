import React from 'react';

interface Action {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: React.ReactNode;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Renders before primary action buttons (e.g. list search). */
  beforeActions?: React.ReactNode;
  actions?: Action[];
}

const variantClass: Record<NonNullable<Action['variant']>, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  beforeActions,
  actions = [],
}) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
    <div className="min-w-0 shrink">
      <h1 className="text-xl font-bold text-primary">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {(beforeActions != null || actions.length > 0) && (
      <div className="flex shrink-0 flex-nowrap items-center gap-2 sm:ml-auto">
        {beforeActions}
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={[
              'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition',
              variantClass[action.variant ?? 'primary'],
            ].join(' ')}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    )}
  </div>
);
