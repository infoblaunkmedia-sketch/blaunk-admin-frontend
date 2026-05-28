import React from 'react';
import { FormField } from '../../../shared/components/FormField';
import { MediaSlotActions } from './MediaSlotActions';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

interface SocialMediaSlotProps {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
  onDelete: () => void;
}

export const SocialMediaSlot: React.FC<SocialMediaSlotProps> = ({
  label,
  value,
  disabled,
  onChange,
  onBlur,
  onDelete,
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hasValue = Boolean(value.trim());

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-sm font-bold text-slate-800">{label}</span>
        {hasValue ? (
          <MediaSlotActions
            disabled={disabled}
            editLabel="Edit URL"
            deleteLabel="Delete URL"
            onEdit={() => inputRef.current?.focus()}
            onDelete={onDelete}
          />
        ) : null}
      </div>
      <FormField label="">
        <input
          ref={inputRef}
          type="url"
          className={inputClass}
          placeholder="https://"
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      </FormField>
    </div>
  );
};
