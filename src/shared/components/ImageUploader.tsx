import React from 'react';

interface ImageUploaderProps {
  onFile: (file: File, preview: string) => void;
  maxSizeMB?: number;
  label?: string;
  currentPreview?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onFile,
  maxSizeMB = 2,
  label = 'Upload Image',
  currentPreview,
  className = '',
}) => {
  const [preview, setPreview] = React.useState<string>(currentPreview ?? '');
  const [error, setError] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keep preview in sync when editing an existing record.
  React.useEffect(() => {
    const next = currentPreview ?? '';
    // Allow parent resets to clear the local blob preview.
    if (!next && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
      setPreview('');
      return;
    }
    // If we already have a blob preview (newly selected file), don't override it.
    if (preview.startsWith('blob:')) return;
    if (next !== preview) setPreview(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPreview]);

  React.useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      e.target.value = '';
      return;
    }

    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Image must be ${maxSizeMB}MB or smaller.`);
      e.target.value = '';
      return;
    }

    setError('');
    if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFile(file, url);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={['flex flex-col gap-2', className].join(' ')}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition hover:border-primary hover:bg-primary/5"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[10px] font-semibold">{label}</span>
          </div>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />

      {preview && (
        <button
          type="button"
          onClick={() => {
            if (preview.startsWith('blob:')) URL.revokeObjectURL(preview);
            setPreview('');
          }}
          className="text-xs font-semibold text-red-600 hover:underline"
        >
          Remove
        </button>
      )}

      <p className="text-[10px] text-slate-500">Max {maxSizeMB}MB · JPG, PNG, WebP</p>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
};
