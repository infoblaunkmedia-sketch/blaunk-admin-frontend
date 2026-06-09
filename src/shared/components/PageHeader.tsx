import React from 'react';
import { usePageChrome } from './pageChromeContext';

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

const backLinkClass =
  'inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary-dark hover:underline';

function isBackAction(action: Action): boolean {
  return /\bback\b/i.test(action.label);
}

const BackChevron = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

function renderActionButton(action: Action, compactChrome: boolean) {
  if (compactChrome && isBackAction(action)) {
    return (
      <button
        key={action.label}
        type="button"
        onClick={action.onClick}
        className={backLinkClass}
      >
        <BackChevron />
        {action.label}
      </button>
    );
  }

  return (
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
  );
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  className = 'mb-6',
  toolbarLeft,
  beforeActions,
  actions = [],
  reserveActionsColumn = false,
}) => {
  const { showPageTitle } = usePageChrome();
  const compactChrome = !showPageTitle;
  const showTitle = showPageTitle && Boolean(title);
  const showRight =
    beforeActions != null || actions.length > 0 || reserveActionsColumn;
  const showLeft = showTitle || toolbarLeft != null;

  if (!showLeft && !showRight) {
    return null;
  }

  const marginClass = compactChrome ? 'mb-2' : className;

  if (compactChrome) {
    const backActions = actions.filter(isBackAction);
    const otherActions = actions.filter((a) => !isBackAction(a));
    const hasLeft = toolbarLeft != null || beforeActions != null;

    // Back-only rows are rendered inside form SectionCard headers instead.
    if (!hasLeft && otherActions.length === 0 && backActions.length > 0) {
      return null;
    }

    return (
      <div
        className={[
          'flex flex-wrap items-center gap-3',
          hasLeft ? 'justify-between' : 'justify-end',
          marginClass,
        ].join(' ')}
      >
        {hasLeft ? (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            {toolbarLeft}
            {beforeActions}
          </div>
        ) : null}
        {(otherActions.length > 0 || backActions.length > 0) && (
          <div className="ml-auto flex shrink-0 flex-wrap items-center justify-end gap-3">
            {otherActions.map((action) => renderActionButton(action, false))}
            {backActions.map((action) => renderActionButton(action, true))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={['flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', marginClass].join(' ')}>
      {showLeft && (
        <div className="min-w-0 flex-1">
          {showTitle ? (
            <h1 className="text-xl font-bold text-primary">{title}</h1>
          ) : null}
          {toolbarLeft != null ? (
            <div className={showTitle ? 'mt-3' : undefined}>{toolbarLeft}</div>
          ) : null}
        </div>
      )}
      {showRight && (
        <div className="flex shrink-0 flex-nowrap items-center gap-2 sm:ml-auto sm:self-end">
          {beforeActions}
          {actions.map((action) => renderActionButton(action, false))}
        </div>
      )}
    </div>
  );
};
