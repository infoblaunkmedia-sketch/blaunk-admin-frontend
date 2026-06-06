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
  className?: string;
  /** Filters/controls below title on the left (e.g. slot dropdown + search). */
  toolbarLeft?: React.ReactNode;
  /** Renders before primary action buttons on the right (legacy; prefer toolbarLeft). */
  beforeActions?: React.ReactNode;
  actions?: Action[];
  /** Keep right column width when actions is empty so layout does not shift. */
  reserveActionsColumn?: boolean;
}

const variantClass: Record<NonNullable<Action['variant']>, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  className = 'mb-6',
  toolbarLeft,
  beforeActions,
  actions = [],
  reserveActionsColumn = false,
}) => {
  const showRight =
    beforeActions != null || actions.length > 0 || reserveActionsColumn;

  return (
    <div className={['flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className].join(' ')}>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold text-primary">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        {toolbarLeft != null && <div className="mt-3">{toolbarLeft}</div>}
      </div>
      {showRight && (
        <div className="flex shrink-0 flex-nowrap items-center gap-2 sm:ml-auto sm:self-end">
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
};
