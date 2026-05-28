import React from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { getCroppedImageBlob } from '../utils/cropImage';

type ImageCropDialogProps = {
  open: boolean;
  imageSrc: string;
  aspect: number;
  title?: string;
  onClose: () => void;
  onComplete: (file: File, previewUrl: string) => void;
};

export const ImageCropDialog: React.FC<ImageCropDialogProps> = ({
  open,
  imageSrc,
  aspect,
  title = 'Crop image',
  onClose,
  onComplete,
}) => {
  const [crop, setCrop] = React.useState({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
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
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-bold text-primary">{title}</h3>
          <p className="text-xs text-slate-500">Drag to reposition · scroll to zoom</p>
        </div>
        <div className="relative h-[min(50vh,360px)] bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
          />
        </div>
        <div className="flex items-center gap-3 border-t border-slate-200 px-4 py-3">
          <label className="flex flex-1 items-center gap-2 text-xs text-slate-600">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
          </label>
          <button type="button" onClick={onClose} className="text-sm text-slate-600">
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !croppedAreaPixels}
            onClick={() => void handleSave()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Apply crop'}
          </button>
        </div>
      </div>
    </div>
  );
};
