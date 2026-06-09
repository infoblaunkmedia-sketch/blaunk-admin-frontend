import React from 'react';

const backLinkClass =
  'inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary-dark hover:underline';

const BackChevron = () => (
  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

type FormBackLinkProps = {
  onClick: () => void;
  label?: string;
  className?: string;
};

/** Blue text back control for nested forms under module tabs (inside SectionCard header). */
export const FormBackLink: React.FC<FormBackLinkProps> = ({
  onClick,
  label = 'Back',
  className = '',
}) => (
  <button
    type="button"
    onClick={onClick}
    className={[backLinkClass, className].filter(Boolean).join(' ')}
  >
    <BackChevron />
    {label}
  </button>
);
