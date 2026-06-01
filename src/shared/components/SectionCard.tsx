import React from 'react';

interface SectionCardProps {
  title?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
  /** Inner content wrapper classes (default `p-5`). Use `p-0 overflow-hidden` for flush tables. */
  contentClassName?: string;
  actions?: React.ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  collapsible = false,
  defaultOpen = true,
  children,
  className = '',
  contentClassName = 'p-5',
  actions,
}) => {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div
      className={[
        'rounded-card border border-slate-200 bg-white shadow-card',
        className,
      ].join(' ')}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">{title}</h3>
          <div className="flex items-center gap-2">
            {actions}
            {collapsible && (
              <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label={open ? 'Collapse' : 'Expand'}
              >
                <svg
                  className={['h-4 w-4 transition-transform', open ? '' : '-rotate-90'].join(' ')}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      {open && <div className={contentClassName}>{children}</div>}
    </div>
  );
};
