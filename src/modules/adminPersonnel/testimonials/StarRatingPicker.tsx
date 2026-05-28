import React from 'react';

interface StarRatingPickerProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

export const StarRatingPicker: React.FC<StarRatingPickerProps> = ({
  value,
  onChange,
  disabled,
}) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }, (_, i) => {
      const star = i + 1;
      const filled = star <= value;
      return (
        <button
          key={star}
          type="button"
          disabled={disabled}
          aria-label={`${star} star`}
          className={[
            'text-2xl leading-none transition',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:scale-110',
            filled ? 'text-amber-500' : 'text-slate-300',
          ].join(' ')}
          onClick={() => onChange(star)}
        >
          ★
        </button>
      );
    })}
    <span className="ml-2 text-sm font-semibold text-slate-600">{value}/5</span>
  </div>
);
