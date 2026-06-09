import React from 'react';
import Cropper, { type Area, type MediaSize } from 'react-easy-crop';
import { getCroppedImageBlob } from '../utils/cropImage';

function fitZoomForContainer(
  media: MediaSize,
  containerWidth: number,
  containerHeight: number,
): number {
  if (!containerWidth || !containerHeight || !media.width || !media.height) return 1;
  const zoomW = containerWidth / media.width;
  const zoomH = containerHeight / media.height;
  return Math.min(zoomW, zoomH, 1);
}

type ImageCropDialogProps = {
  open: boolean;
  imageSrc: string;
  aspect: number;
  title?: string;
  /** Placement hint shown under the title, e.g. "Hero carousel · Crop 21:9 · Max 5MB" */
  subtitle?: string;
  dialogMaxWidthClass?: string;
  cropAreaHeightClass?: string;
  onClose: () => void;
  onComplete: (file: File, previewUrl: string) => void;
};

export const ImageCropDialog: React.FC<ImageCropDialogProps> = ({
  open,
  imageSrc,
  aspect,
  title = 'Upload Image',
  subtitle,
  dialogMaxWidthClass = 'max-w-3xl',
  cropAreaHeightClass = 'h-[min(55vh,420px)]',
  onClose,
  onComplete,
}) => {
  const cropAreaRef = React.useRef<HTMLDivElement>(null);
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [minZoom, setMinZoom] = React.useState(0.25);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);
  const [saving, setSaving] = React.useState(false);

  const handleMediaLoaded = React.useCallback((media: MediaSize) => {
    const el = cropAreaRef.current;
    const cw = el?.clientWidth ?? 0;
    const ch = el?.clientHeight ?? 0;
    const fitZoom = fitZoomForContainer(media, cw, ch);
    const safeMin = Math.max(0.1, Number(fitZoom.toFixed(3)));
    setMinZoom(safeMin);
    setZoom(safeMin);
    setCrop({ x: 0, y: 0 });
  }, []);

  React.useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setMinZoom(0.25);
      setCroppedAreaPixels(null);
    }
  }, [open, imageSrc]);

  if (!open) return null;

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      const file = new File([blob], `banner-crop-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const previewUrl = URL.createObjectURL(blob);
      onComplete(file, previewUrl);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className={['flex w-full flex-col overflow-hidden rounded-xl bg-white shadow-xl', dialogMaxWidthClass].join(' ')}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              {subtitle || 'Drag to reposition · scroll to zoom'}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-slate-500 px-4 py-2 text-xs font-bold text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || !croppedAreaPixels}
              onClick={() => void handleSave()}
              className="rounded bg-emerald-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Apply'}
            </button>
          </div>
        </div>
        <div ref={cropAreaRef} className={['relative bg-slate-900', cropAreaHeightClass].join(' ')}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            minZoom={minZoom}
            maxZoom={4}
            aspect={aspect}
            objectFit="contain"
            restrictPosition={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onMediaLoaded={handleMediaLoaded}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
          />
        </div>
        <div className="border-t border-slate-200 px-4 py-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            Zoom
            <input
              type="range"
              min={minZoom}
              max={4}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
