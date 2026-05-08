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
  actions?: Action[];
}

const variantClass: Record<NonNullable<Action['variant']>, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions = [] }) => (
  <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 className="text-xl font-bold text-primary">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {actions.length > 0 && (
      <div className="flex flex-wrap items-center gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={[
              'flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition',
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
