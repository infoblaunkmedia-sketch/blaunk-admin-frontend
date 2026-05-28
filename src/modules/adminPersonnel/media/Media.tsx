import React from 'react';
import { toast } from 'react-toastify';
import { PageHeader } from '../../../shared/components/PageHeader';
import { SectionCard } from '../../../shared/components/SectionCard';
import { FormField } from '../../../shared/components/FormField';
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary';
import { ConfirmDialog } from '../../../shared/components/ConfirmDialog';
import {
  MEDIA_SECTIONS,
  buildExpandableSlotDefs,
  getMediaSection,
  groupImageSlots,
  maxUsedImageSlot,
  slotStorageKey,
  type MediaImageSlotDef,
  type MediaSectionId,
} from './mediaConfig';
import { MediaImageSlot, type ImageSlotValue } from './MediaImageSlot';
import { SocialMediaSlot } from './SocialMediaSlot';
import {
  deleteSiteMediaSlot,
  fetchSiteMediaAssets,
  recordsToSlotMaps,
  saveSiteMediaSlot,
} from '../adminPersonnel.service';

const inputClass =
  'h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-primary';

const addBtnClass =
  'inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-dashed border-primary/50 bg-primary/5 px-4 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50';

export const Media: React.FC = () => {
  const [sectionId, setSectionId] = React.useState<MediaSectionId>('contact-us');
  const [imageSlots, setImageSlots] = React.useState<Record<string, ImageSlotValue>>({});
  const [socialUrls, setSocialUrls] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState(false);
  const [expandableVisible, setExpandableVisible] = React.useState(1);
  const [confirmDelete, setConfirmDelete] = React.useState<{
    sectionId: MediaSectionId;
    slot: number;
    label: string;
    kind: 'image' | 'url';
  } | null>(null);
  const saveTimersRef = React.useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const section = getMediaSection(sectionId);
  const showCardTitleInput = Boolean(section.editableCardTitle);
  const titleFieldConfig = section.expandableImages;

  const loadSavedMedia = React.useCallback(async () => {
    setLoading(true);
    try {
      const records = await fetchSiteMediaAssets();
      const { imageSlots: images, socialUrls: urls } = recordsToSlotMaps(records);
      setImageSlots(images);
      setSocialUrls(urls);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load saved media');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSavedMedia();
  }, [loadSavedMedia]);

  React.useEffect(() => {
    return () => {
      Object.values(saveTimersRef.current).forEach((t) => clearTimeout(t));
    };
  }, []);

  React.useEffect(() => {
    const expandable = section.expandableImages;
    if (!expandable) return;
    const used = maxUsedImageSlot(section.id, imageSlots, expandable.maxSlots);
    setExpandableVisible(Math.max(expandable.minSlots, used || expandable.minSlots));
  }, [sectionId, section, imageSlots, loading]);

  const setSlotValue = React.useCallback((slot: number, value: ImageSlotValue | undefined) => {
    const key = slotStorageKey(sectionId, slot);
    setImageSlots((prev) => {
      const next = { ...prev };
      if (!value) delete next[key];
      else next[key] = value;
      return next;
    });
  }, [sectionId]);

  const requestDeleteSlot = React.useCallback(
    (slot: number, kind: 'image' | 'url', label: string) => {
      setConfirmDelete({ sectionId, slot, label, kind });
    },
    [sectionId],
  );

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await deleteSiteMediaSlot({
        section: confirmDelete.sectionId,
        slot: confirmDelete.slot,
      });
      const key = slotStorageKey(confirmDelete.sectionId, confirmDelete.slot);
      if (confirmDelete.kind === 'image') {
        setImageSlots((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      } else {
        setSocialUrls((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
      toast.success('Deleted');
      setConfirmDelete(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const persistSocialUrl = React.useCallback(
    async (slot: number, url: string) => {
      try {
        await saveSiteMediaSlot({
          section: sectionId,
          slot,
          kind: 'url',
          value: url.trim(),
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to save URL');
      }
    },
    [sectionId],
  );

  const scheduleSocialUrlSave = React.useCallback(
    (slot: number, url: string) => {
      const key = slotStorageKey(sectionId, slot);
      if (saveTimersRef.current[key]) clearTimeout(saveTimersRef.current[key]);
      saveTimersRef.current[key] = setTimeout(() => {
        void persistSocialUrl(slot, url);
      }, 600);
    },
    [sectionId, persistSocialUrl],
  );

  const setSocialUrl = React.useCallback(
    (slot: number, url: string) => {
      const key = slotStorageKey(sectionId, slot);
      setSocialUrls((prev) => ({ ...prev, [key]: url }));
      scheduleSocialUrlSave(slot, url);
    },
    [sectionId, scheduleSocialUrlSave],
  );

  const saveImageTitle = React.useCallback(
    async (slot: number, title: string) => {
      const key = slotStorageKey(sectionId, slot);
      const existing = imageSlots[key];
      const imageUrl = existing?.cloudinaryUrl || existing?.previewUrl;
      if (!imageUrl || imageUrl.startsWith('blob:')) return;
      try {
        await saveSiteMediaSlot({
          section: sectionId,
          slot,
          kind: 'image',
          value: imageUrl,
          fileName: existing?.fileName,
          title: title.trim(),
        });
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to save title');
      }
    },
    [imageSlots, sectionId],
  );

  const resolveImageSlots = (): MediaImageSlotDef[] => {
    if (section.expandableImages) {
      return buildExpandableSlotDefs(section.expandableImages, expandableVisible);
    }
    return section.imageSlots;
  };

  const renderImageSlot = (slotDef: MediaImageSlotDef) => {
    const key = slotStorageKey(section.id, slotDef.slot);
    return (
      <MediaImageSlot
        key={key}
        sectionId={section.id}
        slotDef={slotDef}
        maxSizeKb={section.maxSizeKb}
        value={imageSlots[key]}
        onChange={setSlotValue}
        onDelete={(s) => requestDeleteSlot(s, 'image', slotDef.label)}
        showTitleInput={showCardTitleInput}
        titlePlaceholder={titleFieldConfig?.titlePlaceholder}
        titleHint={titleFieldConfig?.titleHint}
        onTitleSave={saveImageTitle}
      />
    );
  };

  const renderAddBannerButton = () => {
    const expandable = section.expandableImages;
    if (!expandable) return null;
    const atMax = expandableVisible >= expandable.maxSlots;
    return (
      <button
        type="button"
        className={addBtnClass}
        disabled={atMax || deleting}
        onClick={() => {
          if (atMax) {
            toast.info(`Maximum ${expandable.maxSlots} banners`);
            return;
          }
          setExpandableVisible((n) => Math.min(n + 1, expandable.maxSlots));
        }}
      >
        + Add
      </button>
    );
  };

  const renderImageGroup = (
    group: { title: string | null; slots: MediaImageSlotDef[] },
    gi: number,
    showAdd?: boolean,
  ) => (
    <div key={group.title ?? `group-${gi}`} className={gi > 0 ? 'mt-6' : ''}>
      {group.title ? (
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
          {group.title}
        </h3>
      ) : null}
      <div className="flex flex-wrap items-start gap-3">
        {group.slots.map((slotDef) => renderImageSlot(slotDef))}
        {showAdd ? renderAddBannerButton() : null}
      </div>
    </div>
  );

  const renderImageSections = () => {
    const slots = resolveImageSlots();
    const groups = groupImageSlots(slots);
    const isExpandable = Boolean(section.expandableImages);
    return groups.map((group, gi) =>
      renderImageGroup(group, gi, isExpandable && gi === groups.length - 1),
    );
  };

  const renderSocialMedia = () => {
    const bannerGroups = groupImageSlots(section.imageSlots);
    return (
      <div className="flex flex-col gap-6">
        {bannerGroups.map((group, gi) => renderImageGroup(group, gi))}
        <div>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-600">
            Social links
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(section.urlSlots ?? []).map((urlSlot) => {
              const key = slotStorageKey(section.id, urlSlot.slot);
              return (
                <SocialMediaSlot
                  key={key}
                  label={urlSlot.label}
                  value={socialUrls[key] ?? ''}
                  disabled={deleting}
                  onChange={(url) => setSocialUrl(urlSlot.slot, url)}
                  onBlur={() => {
                    const keyTimer = slotStorageKey(section.id, urlSlot.slot);
                    if (saveTimersRef.current[keyTimer]) {
                      clearTimeout(saveTimersRef.current[keyTimer]);
                      delete saveTimersRef.current[keyTimer];
                    }
                    void persistSocialUrl(urlSlot.slot, socialUrls[key] ?? '');
                  }}
                  onDelete={() =>
                    requestDeleteSlot(urlSlot.slot, 'url', `${urlSlot.label} URL`)
                  }
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <PageHeader title="Media" />

      <SectionCard>
        <div className="mb-6 max-w-md">
          <FormField label="Section">
            <select
              className={inputClass}
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value as MediaSectionId)}
              disabled={loading}
            >
              {MEDIA_SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {loading ? (
          <div className="flex min-h-[8rem] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : section.kind === 'mixed' ? (
          renderSocialMedia()
        ) : section.kind === 'urls' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(section.urlSlots ?? []).map((urlSlot) => {
              const key = slotStorageKey(section.id, urlSlot.slot);
              return (
                <SocialMediaSlot
                  key={key}
                  label={urlSlot.label}
                  value={socialUrls[key] ?? ''}
                  disabled={deleting}
                  onChange={(url) => setSocialUrl(urlSlot.slot, url)}
                  onBlur={() => {
                    const keyTimer = slotStorageKey(section.id, urlSlot.slot);
                    if (saveTimersRef.current[keyTimer]) {
                      clearTimeout(saveTimersRef.current[keyTimer]);
                      delete saveTimersRef.current[keyTimer];
                    }
                    void persistSocialUrl(urlSlot.slot, socialUrls[key] ?? '');
                  }}
                  onDelete={() =>
                    requestDeleteSlot(urlSlot.slot, 'url', `${urlSlot.label} URL`)
                  }
                />
              );
            })}
          </div>
        ) : (
          renderImageSections()
        )}
      </SectionCard>

      {confirmDelete ? (
        <ConfirmDialog
          title="Delete media"
          message={`Remove ${confirmDelete.label}? This cannot be undone.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={() => void handleConfirmDelete()}
          onCancel={() => setConfirmDelete(null)}
        />
      ) : null}
    </ErrorBoundary>
  );
};
