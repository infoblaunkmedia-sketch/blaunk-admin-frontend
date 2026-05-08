import React from 'react';

interface PermissionRowProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  isStriped?: boolean;
}

export const PermissionRow: React.FC<PermissionRowProps> = ({
  label,
  checked,
  onChange,
  isStriped,
}) => {
  return (
    <label
      className={[
        'flex cursor-pointer items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0',
        'transition hover:bg-primary/5',
        isStriped ? 'bg-slate-50/80' : 'bg-white',
      ].join(' ')}
    >
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary/30 focus:ring-offset-0"
        checked={checked}
        onChange={(event) => onChange?.(event.target.checked)}
      />
      <span className="text-sm font-medium text-slate-800">{label}</span>
    </label>
  );
};

