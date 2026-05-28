import React from 'react';
import { toast } from 'react-toastify';
import { ImageCropDialog } from '../../../shared/components/ImageCropDialog';
import {
  formatMaxSizeLabel,
  previewAspectClass,
  type MediaImageSlotDef,
} from './mediaConfig';
import { uploadMediaImage } from '../adminPersonnel.service';
import type { MediaSectionId } from './mediaConfig';
import { MediaSlotActions } from './MediaSlotActions';

export type ImageSlotValue = {
  previewUrl: string;
  cloudinaryUrl?: string;
  fileName?: string;
  title?: string;
  uploading?: boolean;
};

interface MediaImageSlotProps {
  sectionId: MediaSectionId;
  slotDef: MediaImageSlotDef;
  maxSizeKb: number;
  value?: ImageSlotValue;
  onChange: (slot: number, value: ImageSlotValue | undefined) => void;
  onDelete: (slot: number) => void;
  showTitleInput?: boolean;
  titlePlaceholder?: string;
  titleHint?: string;
  onTitleSave?: (slot: number, title: string) => void;
}

const btnClass =
  'inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60';

export const MediaImageSlot: React.FC<MediaImageSlotProps> = ({
  sectionId,
  slotDef,
  maxSizeKb,
  value,
  onChange,
  onDelete,
  showTitleInput = false,
  titlePlaceholder = 'Enter card title',
  titleHint,
  onTitleSave,
}) => {
  const { slot, label, aspect, aspectLabel } = slotDef;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = React.useState('');
  const [cropSrc, setCropSrc] = React.useState<string | null>(null);

  const maxBytes = maxSizeKb * 1024;
  const maxLabel = formatMaxSizeLabel(maxSizeKb);
  const hasImage = Boolean(value?.previewUrl && !value.uploading);
  const [titleDraft, setTitleDraft] = React.useState(value?.title ?? '');

  React.useEffect(() => {
    setTitleDraft(value?.title ?? '');
  }, [value?.title, slot]);

  const uploadCropped = async (file: File, previewUrl: string) => {
    onChange(slot, {
      previewUrl,
      fileName: file.name,
      title: titleDraft.trim(),
      uploading: true,
    });

    try {
      const cloudinaryUrl = await uploadMediaImage(file, {
        section: sectionId,
        slot,
        title: titleDraft.trim(),
      });
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      onChange(slot, {
        previewUrl: cloudinaryUrl,
        cloudinaryUrl,
        fileName: file.name,
        title: titleDraft.trim(),
        uploading: false,
      });
      toast.success(`${label} ${hasImage ? 'updated' : 'uploaded'}`);
    } catch (e) {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      onChange(slot, undefined);
      toast.error(e instanceof Error ? e.message : 'Upload failed');
    }
  };

  const handleFilePick = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setLocalError('Please select an image file.');
      return;
    }
    if (file.size > maxBytes) {
      setLocalError(`Image must be ${maxLabel} or smaller before crop.`);
      return;
    }
    setLocalError('');
    const url = URL.createObjectURL(file);
    setCropSrc(url);
  };

  const handleCropComplete = async (file: File, previewUrl: string) => {
    await uploadCropped(file, previewUrl);
  };

  const closeCrop = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
  };

  React.useEffect(() => {
    return () => {
      if (value?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(value.previewUrl);
      }
    };
  }, [value?.previewUrl]);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500">Crop {aspectLabel}</p>
        </div>
        {hasImage ? (
          <MediaSlotActions
            disabled={value?.uploading}
            editLabel="Replace image"
            deleteLabel="Delete image"
            onEdit={() => inputRef.current?.click()}
            onDelete={() => onDelete(slot)}
          />
        ) : null}
      </div>

      <button
        type="button"
        className={btnClass}
        disabled={value?.uploading}
        onClick={() => inputRef.current?.click()}
      >
        {value?.uploading ? 'Uploading…' : hasImage ? 'Replace image' : 'Upload & crop'}
      </button>

      <p className="text-xs text-slate-500">
        Max {maxLabel} · JPG, PNG, WebP · Drag to reposition · scroll to zoom
      </p>

      {localError ? <p className="text-xs font-semibold text-red-600">{localError}</p> : null}

      {showTitleInput ? (
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">Card text</span>
          <input
            type="text"
            className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 outline-none focus:border-primary"
            value={titleDraft}
            placeholder={titlePlaceholder}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={() => {
              onChange(slot, value ? { ...value, title: titleDraft } : value);
              if (onTitleSave) onTitleSave(slot, titleDraft);
            }}
            disabled={value?.uploading}
          />
          {titleHint ? <span className="text-[11px] text-slate-500">{titleHint}</span> : null}
        </label>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFilePick(file);
          e.target.value = '';
        }}
      />

      {value?.previewUrl ? (
        <div
          className={[
            'relative overflow-hidden rounded-lg border border-slate-200 bg-white',
            previewAspectClass(slotDef),
            value.uploading ? 'opacity-60' : '',
          ].join(' ')}
        >
          <img
            src={value.previewUrl}
            alt={label}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      {cropSrc ? (
        <ImageCropDialog
          open
          imageSrc={cropSrc}
          aspect={aspect}
          title={`Crop — ${label}`}
          onClose={closeCrop}
          onComplete={handleCropComplete}
        />
      ) : null}
    </div>
  );
};
