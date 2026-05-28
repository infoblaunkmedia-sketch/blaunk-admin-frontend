import React from 'react';

const iconBtn =
  'inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50';

interface MediaSlotActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  editLabel?: string;
  deleteLabel?: string;
  disabled?: boolean;
}

export const MediaSlotActions: React.FC<MediaSlotActionsProps> = ({
  onEdit,
  onDelete,
  editLabel = 'Replace',
  deleteLabel = 'Delete',
  disabled = false,
}) => (
  <div className="flex items-center gap-1.5">
    {onEdit ? (
      <button
        type="button"
        className={iconBtn}
        disabled={disabled}
        aria-label={editLabel}
        title={editLabel}
        onClick={onEdit}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      </button>
    ) : null}
    {onDelete ? (
      <button
        type="button"
        className={[iconBtn, 'hover:border-red-300 hover:text-red-600'].join(' ')}
        disabled={disabled}
        aria-label={deleteLabel}
        title={deleteLabel}
        onClick={onDelete}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </button>
    ) : null}
  </div>
);
