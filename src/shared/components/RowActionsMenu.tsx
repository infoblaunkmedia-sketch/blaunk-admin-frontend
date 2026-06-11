import React from 'react';

const selectClass =
  'h-8 min-w-[7.5rem] max-w-full rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

type RowActionsMenuProps = {
  onEdit?: () => void;
  onToggle?: () => void;
  toggleLabel?: string;
  onDelete: () => void;
};

export const RowActionsMenu: React.FC<RowActionsMenuProps> = ({
  onEdit,
  onToggle,
  toggleLabel = 'Disable',
  onDelete,
}) => {
  const [selected, setSelected] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelected(value);
    if (value === 'edit') onEdit?.();
    else if (value === 'toggle') onToggle?.();
    else if (value === 'delete') onDelete();
  };

  return (
    <select
      className={selectClass}
      value={selected}
      onChange={handleChange}
      aria-label="Row actions"
    >
      <option value="" disabled>
        Select…
      </option>
      {onEdit ? <option value="edit">Edit</option> : null}
      {onToggle ? <option value="toggle">{toggleLabel}</option> : null}
      <option value="delete">Delete</option>
    </select>
  );
};
