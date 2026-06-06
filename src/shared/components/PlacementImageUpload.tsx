import React from 'react';
import { PLACEMENT_UI_PREVIEW_WIDTH_PX } from '../constants/placementPreview';

export type PlacementImageUploadProps = {
  placementLabel: string;
  aspectLabel: string;
  aspect: number;
  /** e.g. "5MB" or "700KB" */
  maxSizeHint: string;
  imageUrl: string;
  uploading?: boolean;
  disabled?: boolean;
  title?: string;
  headerActions?: React.ReactNode;
  footnote?: React.ReactNode;
  resolveImageUrl?: (url: string) => string;
  onPickImage: () => void;
  onPreviewClick?: () => void;
  fileInputRef?: React.RefObject<HTMLInputElement>;
  onFileChange?: React.ChangeEventHandler<HTMLInputElement>;
  accept?: string;
};

export const PlacementImageUpload: React.FC<PlacementImageUploadProps> = ({
  placementLabel,
  aspectLabel,
  aspect,
  maxSizeHint,
  imageUrl,
  uploading = false,
  disabled = false,
  title = 'Upload Image',
  headerActions,
  footnote,
  resolveImageUrl = (url) => url,
  onPickImage,
  onPreviewClick,
  fileInputRef,
  onFileChange,
  accept = 'image/*',
}) => {
  const previewSrc = imageUrl ? resolveImageUrl(imageUrl) : '';
  const previewFrameStyle: React.CSSProperties = {
    aspectRatio: aspect,
    width: `min(${PLACEMENT_UI_PREVIEW_WIDTH_PX}px, 100%)`,
  };
  const previewFrameClass =
    'overflow-hidden rounded-lg border border-dashed border-slate-200 bg-slate-50';

  return (
    <div>
      <div className="mb-1 flex items-start justify-between gap-4">
        <p className="text-2xl font-bold text-slate-800">{title}</p>
        {headerActions ? <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">{headerActions}</div> : null}
      </div>
      <p className="mb-3 text-xs font-semibold text-slate-500">
        {placementLabel} · Crop {aspectLabel} · Max {maxSizeHint} · JPG, PNG, WebP · Drag to reposition · scroll to
        zoom
      </p>
      <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
        <div className="flex flex-col items-start gap-3">
          <button
            type="button"
            onClick={onPickImage}
            disabled={uploading}
            className="rounded-lg border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Uploading…' : imageUrl ? 'Replace image' : 'Upload & crop'}
          </button>
          {fileInputRef && onFileChange ? (
            <input ref={fileInputRef} type="file" accept={accept} className="hidden" onChange={onFileChange} />
          ) : null}
          {previewSrc ? (
            <button
              type="button"
              title="Click to preview full size"
              className={`block transition hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50 ${previewFrameClass}`}
              style={previewFrameStyle}
              onClick={onPreviewClick}
            >
              <img src={previewSrc} alt={`${placementLabel} preview`} className="h-full w-full object-cover" />
            </button>
          ) : (
            <div
              className={`flex items-center justify-center px-2 py-3 text-center text-[10px] font-semibold leading-tight text-slate-400 ${previewFrameClass}`}
              style={previewFrameStyle}
            >
              Image preview will appear here
            </div>
          )}
        </div>
      </div>
      {footnote}
    </div>
  );
};
