import {
  HOMEPAGE_BANNER_POSITIONS,
  type HomepageBannerPosition,
  type HomepageBannerPositionConfig,
  getPositionConfig as getHomepagePositionConfig,
  canAddRecordForPosition as canAddHomepageRecord,
} from './homepageBannerConfig';
import {
  BGT_MAIN_BANNER_POSITIONS,
  BGT_VIEW_MORE_BANNER_POSITIONS,
  type BgtCommonBannerPosition,
  type BgtMainBannerPosition,
  type BgtViewMoreBannerPosition,
  getBgtCommonPositionConfig,
  canAddBgtCommonRecord,
} from './bgtCommonBannerConfig';
import {
  BOUTIQUE_BANNER_POSITIONS,
  type BoutiqueBannerPosition,
  getBoutiquePositionConfig,
  canAddBoutiqueRecord,
} from './boutiqueBannerConfig';

/** CMS Upload — first dropdown (maps to API page). */
export type BannerCmsPage = 'home' | 'bgt' | 'bgt-view-more' | 'boutique';

export type BannerCmsSlot =
  | HomepageBannerPosition
  | BgtMainBannerPosition
  | BgtViewMoreBannerPosition
  | BoutiqueBannerPosition
  | 'testimonials';

export const BANNER_CMS_PAGES: { id: BannerCmsPage; label: string }[] = [
  { id: 'home', label: 'Homepage' },
  { id: 'bgt', label: 'BGT' },
  { id: 'bgt-view-more', label: 'BGT View More' },
  { id: 'boutique', label: 'Boutique' },
];

export type BannerPositionConfig = HomepageBannerPositionConfig;

export type BannerApiPage = 'home' | 'bgt-common' | 'boutique';

export function apiPageForCmsPage(page: BannerCmsPage): BannerApiPage {
  if (page === 'boutique') return 'boutique';
  return page === 'home' ? 'home' : 'bgt-common';
}

export function defaultSlotForPage(page: BannerCmsPage): BannerCmsSlot {
  switch (page) {
    case 'bgt':
      return 'hero';
    case 'bgt-view-more':
      return 'view-more-hero';
    case 'boutique':
      return 'hero';
    default:
      return 'hero';
  }
}

export function positionOptionsForPage(page: BannerCmsPage): BannerPositionConfig[] {
  switch (page) {
    case 'bgt':
      return BGT_MAIN_BANNER_POSITIONS;
    case 'bgt-view-more':
      return BGT_VIEW_MORE_BANNER_POSITIONS;
    case 'boutique':
      return BOUTIQUE_BANNER_POSITIONS;
    default:
      return HOMEPAGE_BANNER_POSITIONS;
  }
}

export function getSlotConfig(
  page: BannerCmsPage,
  slot: BannerCmsSlot,
): BannerPositionConfig | null {
  if (slot === 'testimonials') return null;
  if (page === 'home') return getHomepagePositionConfig(slot as HomepageBannerPosition);
  if (page === 'boutique') return getBoutiquePositionConfig(slot as BoutiqueBannerPosition);
  return getBgtCommonPositionConfig(slot as BgtCommonBannerPosition);
}

export function canAddRecordForSlot(
  page: BannerCmsPage,
  slot: BannerCmsSlot,
  existingCount: number,
): boolean {
  if (slot === 'testimonials') return true;
  if (page === 'home') return canAddHomepageRecord(slot as HomepageBannerPosition, existingCount);
  if (page === 'boutique') return canAddBoutiqueRecord(slot as BoutiqueBannerPosition, existingCount);
  return canAddBgtCommonRecord(slot as BgtCommonBannerPosition, existingCount);
}

export function pageLabel(page: BannerCmsPage): string {
  return BANNER_CMS_PAGES.find((p) => p.id === page)?.label ?? page;
}
