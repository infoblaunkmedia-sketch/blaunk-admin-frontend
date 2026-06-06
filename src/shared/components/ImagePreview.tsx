import React from 'react';
import { PLACEMENT_UI_PREVIEW_WIDTH_PX } from '../constants/placementPreview';

type ImagePreviewDialogProps = {
  open: boolean;
  src: string;
  alt?: string;
  title?: string;
  /** When set, preview is framed at this aspect ratio (e.g. 21/9 or "21 / 9"). */
  aspectRatio?: number | string;
  onClose: () => void;
};

export const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  open,
  src,
  alt = '',
  title,
  aspectRatio,
  onClose,
}) => {
  React.useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !src) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || alt || 'Image preview'}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-5xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow hover:bg-white"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {aspectRatio ? (
          <div
            className="w-full max-w-4xl overflow-hidden rounded-lg bg-black/40 shadow-2xl"
            style={{ aspectRatio }}
          >
            <img src={src} alt={alt} className="h-full w-full object-cover" />
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
          />
        )}
        {title ? <p className="mt-3 max-w-full truncate text-center text-sm text-white/90">{title}</p> : null}
      </div>
    </div>
  );
};

type ClickableImageThumbProps = {
  src: string;
  alt?: string;
  title?: string;
  wrapClassName?: string;
  imgClassName?: string;
  empty?: React.ReactNode;
};

export const ClickableImageThumb: React.FC<ClickableImageThumbProps> = ({
  src,
  alt = '',
  title,
  wrapClassName = 'my-1 block h-10 w-14 overflow-hidden rounded border border-slate-200 bg-slate-50',
  imgClassName = 'h-full w-full object-cover',
  empty = <span className="text-xs text-slate-400">—</span>,
}) => {
  const [open, setOpen] = React.useState(false);

  if (!src) return <>{empty}</>;

  return (
    <>
      <button
        type="button"
        title="Click to preview"
        aria-label={alt ? `Preview ${alt}` : 'Preview image'}
        className={`cursor-pointer transition hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50 ${wrapClassName}`}
        onClick={() => setOpen(true)}
      >
        <img src={src} alt={alt} className={imgClassName} />
      </button>
      <ImagePreviewDialog
        open={open}
        src={src}
        alt={alt}
        title={title || alt}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

type ClickablePreviewImageProps = {
  src: string;
  alt?: string;
  title?: string;
  className?: string;
  /** When set, preview uses this aspect ratio with object-cover (matches frontend carousel). */
  aspectRatio?: number | string;
};

/** Larger in-form preview — click to open full-size lightbox. */
export const ClickablePreviewImage: React.FC<ClickablePreviewImageProps> = ({
  src,
  alt = '',
  title,
  className = 'max-h-28 rounded-lg border object-contain',
  aspectRatio,
}) => {
  const [open, setOpen] = React.useState(false);
  if (!src) return null;

  return (
    <>
      <button
        type="button"
        title="Click to preview full size"
        className="cursor-pointer overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50 transition hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
        style={
          aspectRatio
            ? { aspectRatio, width: `min(${PLACEMENT_UI_PREVIEW_WIDTH_PX}px, 100%)` }
            : undefined
        }
        onClick={() => setOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          className={
            aspectRatio
              ? 'h-full w-full rounded-lg border border-slate-200 object-cover'
              : className
          }
        />
      </button>
      <ImagePreviewDialog
        open={open}
        src={src}
        alt={alt}
        title={title || alt}
        aspectRatio={aspectRatio}
        onClose={() => setOpen(false)}
      />
    </>
  );
};
