/**
 * Shared CMS banner placement options (same source as CMS → Upload).
 * DSA Media Upload uses Page + Slot — records stay in DsaSlider, not CMS banner store.
 */
import {
  getSlotConfig,
  positionOptionsForPage,
  type BannerCmsPage,
  type BannerCmsSlot,
} from '../../modules/cms/banners/bannerPageConfig';

export {
  BANNER_CMS_PAGES,
  defaultSlotForPage,
  positionOptionsForPage,
  getSlotConfig,
  pageLabel,
  apiPageForCmsPage,
  type BannerCmsPage,
  type BannerCmsSlot,
  type BannerPositionConfig,
} from '../../modules/cms/banners/bannerPageConfig';

const DEFAULT_DSA_SLOT_MAX = 8;

export function maxSlotsForCmsPlacement(page: BannerCmsPage, slot: BannerCmsSlot): number {
  if (slot === 'testimonials') return 0;
  const cfg = getSlotConfig(page, slot);
  if (!cfg) return DEFAULT_DSA_SLOT_MAX;
  const max = cfg.maxRecords;
  return max != null && max >= 1 ? max : DEFAULT_DSA_SLOT_MAX;
}

export function dsaPlacementSlotOptions(page: BannerCmsPage) {
  return positionOptionsForPage(page);
}

export function slotLabel(page: BannerCmsPage, slot: BannerCmsSlot): string {
  const cfg = getSlotConfig(page, slot);
  return cfg?.label ?? String(slot);
}

/** Crop aspect + labels for DSA media upload (same rules as CMS → Upload). */
export function placementImageCrop(page: BannerCmsPage, slot: BannerCmsSlot) {
  const cfg = getSlotConfig(page, slot);
  return {
    aspect: cfg?.aspect ?? 16 / 9,
    aspectLabel: cfg?.aspectLabel ?? '16:9',
    label: cfg?.label ?? slotLabel(page, slot),
  };
}

export const DSA_PLACEMENT_IMAGE_MAX_MB = 5;
export const GIFF_PLACEMENT_IMAGE_MAX_KB = 700;

export function placementImageMaxSize(page: BannerCmsPage) {
  if (page === 'giff') {
    return { hint: `${GIFF_PLACEMENT_IMAGE_MAX_KB}KB`, maxBytes: GIFF_PLACEMENT_IMAGE_MAX_KB * 1024 };
  }
  return { hint: `${DSA_PLACEMENT_IMAGE_MAX_MB}MB`, maxBytes: DSA_PLACEMENT_IMAGE_MAX_MB * 1024 * 1024 };
}
