import React from 'react';
import { ImageCropDialog } from './ImageCropDialog';

type CroppableImageUploaderProps = {
  onFile: (file: File, preview: string) => void;
  /** Max file size in bytes before crop */
  maxBytes?: number;
  /** Human-readable size hint, e.g. "200KB" */
  maxSizeHint?: string;
  label?: string;
  currentPreview?: string;
  className?: string;
  /** Crop aspect ratio (width / height) */
  aspect?: number;
  aspectLabel?: string;
  disabled?: boolean;
};

function formatBytesHint(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))}MB`;
  return `${Math.round(bytes / 1024)}KB`;
}

export const CroppableImageUploader: React.FC<CroppableImageUploaderProps> = ({
  onFile,
  maxBytes = 200 * 1024,
  maxSizeHint,
  label = 'Upload Image',
  currentPreview,
  className = '',
  aspect = 4 / 3,
  aspectLabel = '4:3',
  disabled = false,
}) => {
  const [preview, setPreview] = React.useState<string>(currentPreview ?? '');
  const [error, setError] = React.useState('');
  const [cropSrc, setCropSrc] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const sizeHint = maxSizeHint ?? formatBytesHint(maxBytes);

  React.useEffect(() => {
    const next = currentPreview ?? '';
    if (!next && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
      setPreview('');
      return;
    }
    if (preview.startsWith('blob:')) return;
    if (next !== preview) setPreview(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPreview]);

  React.useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
      if (cropSrc) URL.revokeObjectURL(cropSrc);
    };
  }, [preview, cropSrc]);

  const handlePick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      e.target.value = '';
      return;
    }

    if (file.size > maxBytes) {
      setError(`Image must be ${sizeHint} or smaller.`);
      e.target.value = '';
      return;
    }

    setError('');
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(URL.createObjectURL(file));
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleCropComplete = (file: File, previewUrl: string) => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview(previewUrl);
    onFile(file, previewUrl);
  };

  const handleRemove = () => {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    setPreview('');
  };

  return (
    <div className={['flex flex-col gap-2', className].join(' ')}>
      <p className="text-xs font-semibold text-slate-700">{label}</p>
      <button
        type="button"
        disabled={disabled}
        onClick={handlePick}
        className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 px-1 text-slate-400">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-center text-[10px] font-semibold leading-tight">Upload &amp; crop</span>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="hidden"
        onChange={handleChange}
      />

      {preview ? (
        <button
          type="button"
          disabled={disabled}
          onClick={handleRemove}
          className="text-left text-xs font-semibold text-red-600 hover:underline disabled:opacity-60"
        >
          Remove
        </button>
      ) : null}

      <p className="max-w-[7rem] text-[10px] leading-snug text-slate-500">
        Crop {aspectLabel} · Max {sizeHint} · JPG, PNG, WebP · Drag · scroll to zoom
      </p>
      {error ? <p className="max-w-[7rem] text-xs font-semibold text-red-600">{error}</p> : null}

      {cropSrc ? (
        <ImageCropDialog
          open
          imageSrc={cropSrc}
          aspect={aspect}
          title={label}
          subtitle={`Crop ${aspectLabel} · Max ${sizeHint} · JPG, PNG, WebP · Drag to reposition · scroll to zoom`}
          onClose={() => {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }}
          onComplete={handleCropComplete}
        />
      ) : null}
    </div>
  );
};
