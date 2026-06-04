import type { HomepageBannerField, HomepageBannerPositionConfig } from './homepageBannerConfig';

export type BgtMainBannerPosition =
  | 'hero'
  | 'discovery-best-sellers'
  | 'discovery-top-category'
  | 'explore-gallery'
  | 'explorer-carousel'
  | 'international-sourcing-banner'
  | 'blaunk-advantage';

export type BgtViewMoreBannerPosition =
  | 'view-more-hero'
  | 'view-more-sponsored-ads'
  | 'view-more-premium-showcase'
  | 'view-more-trending-discovery'
  | 'view-more-deals-offers'
  | 'view-more-brand-footer'
  | 'view-more-sidebar-ads';

export type BgtCommonBannerPosition = BgtMainBannerPosition | BgtViewMoreBannerPosition;

const DISCOVERY_CHIP_COUNT = 4;

/** BGT Trading main page (not View More listing). */
export const BGT_MAIN_BANNER_POSITIONS: HomepageBannerPositionConfig[] = [
  {
    id: 'hero',
    label: 'Hero carousel',
    hint: 'Top carousel — title, subtitle, CTA (up to 3 slides)',
    aspect: 21 / 9,
    aspectLabel: '21:9',
    fields: ['image', 'title', 'subtitle', 'ctaText', 'linkUrl', 'slideSlot', 'isActive'],
    imageRequired: true,
    maxRecords: 3,
    slotPicker: true,
  },
  {
    id: 'discovery-best-sellers',
    label: 'Discovery — Best Sellers',
    hint: 'Card header + category chips for the Discovery Hub',
    aspect: 1,
    aspectLabel: '—',
    fields: [],
    imageRequired: false,
    maxRecords: 1 + DISCOVERY_CHIP_COUNT,
    discoveryHub: {
      headerFields: ['tag', 'title', 'subtitle', 'isActive'],
      chipFields: ['tag', 'title', 'linkUrl', 'chipSlot', 'isActive'],
      chipCount: DISCOVERY_CHIP_COUNT,
    },
  },
  {
    id: 'discovery-top-category',
    label: 'Discovery — Top Category',
    hint: 'Card header + service chips for the Discovery Hub',
    aspect: 1,
    aspectLabel: '—',
    fields: [],
    imageRequired: false,
    maxRecords: 1 + DISCOVERY_CHIP_COUNT,
    discoveryHub: {
      headerFields: ['tag', 'title', 'subtitle', 'isActive'],
      chipFields: ['tag', 'title', 'linkUrl', 'chipSlot', 'isActive'],
      chipCount: DISCOVERY_CHIP_COUNT,
    },
  },
  {
    id: 'explore-gallery',
    label: 'Explore Gallery',
    hint: 'Gallery images — 16:9 recommended, min 1600px wide',
    aspect: 16 / 9,
    aspectLabel: '16:9',
    fields: ['image', 'title', 'slideSlot', 'isActive'],
    imageRequired: true,
    maxRecords: 4,
    slotPicker: true,
  },
  {
    id: 'explorer-carousel',
    label: 'Explorer Carousel',
    hint: 'Wide banner below Explore Gallery — 21:9, min 1700px wide',
    aspect: 21 / 9,
    aspectLabel: '21:9',
    fields: ['image', 'title', 'slideSlot', 'isActive'],
    imageRequired: true,
    maxRecords: 4,
    slotPicker: true,
  },
  {
    id: 'international-sourcing-banner',
    label: 'International Sourcing Banner',
    hint: 'Ultra-wide carousel above International Sourcing — 21:5 recommended',
    aspect: 21 / 5,
    aspectLabel: '21:5',
    fields: ['image', 'title', 'slideSlot', 'isActive'],
    imageRequired: true,
    maxRecords: 3,
    slotPicker: true,
  },
  {
    id: 'blaunk-advantage',
    label: 'Blaunk Exporter Directory',
    hint: 'Add intro header once (+ Add header), then + Add card for up to 6 exporter posters (1:1 icons)',
    aspect: 1,
    aspectLabel: '1:1',
    fields: [],
    imageRequired: false,
    maxRecords: 1 + 6,
    discoveryHub: {
      headerFields: ['description', 'isActive'],
      chipFields: ['image', 'title', 'chipSlot', 'isActive'],
      chipCount: 6,
    },
  },
];

/** BGT View More listing page (`/listing/:id`). */
export const BGT_VIEW_MORE_BANNER_POSITIONS: HomepageBannerPositionConfig[] = [
  {
    id: 'view-more-hero',
    label: 'View More Hero',
    hint: 'Top strip above search on View More listing — full width, ~130px tall on desktop',
    aspect: 14 / 1,
    aspectLabel: '14:1',
    fields: ['image', 'title', 'slideSlot', 'isActive'],
    imageRequired: true,
    maxRecords: 3,
    slotPicker: true,
  },
  {
    id: 'view-more-sponsored-ads',
    label: 'View More Sponsored Ads',
    hint: 'Sponsored trade/export banners — 16:9, min 1200px wide (~180–260px tall on site)',
    aspect: 16 / 9,
    aspectLabel: '16:9',
    fields: ['image', 'title', 'isActive'],
    imageRequired: true,
    maxRecords: 3,
    slotPicker: false,
  },
  {
    id: 'view-more-premium-showcase',
    label: 'View More Premium Showcase',
    hint: 'Large landscape showcases — min 1600px wide (~400–500px tall on site)',
    aspect: 16 / 5,
    aspectLabel: '16:5',
    fields: ['image', 'title', 'isActive'],
    imageRequired: true,
    maxRecords: 3,
    slotPicker: false,
  },
  {
    id: 'view-more-trending-discovery',
    label: 'View More Trending Discovery',
    hint: 'Wide landscape cards — 3:1, min 1200px wide (~600×200 desktop)',
    aspect: 3,
    aspectLabel: '3:1',
    fields: ['image', 'title', 'isActive'],
    imageRequired: true,
    maxRecords: 5,
    slotPicker: false,
  },
  {
    id: 'view-more-deals-offers',
    label: 'View More Deals & Offers',
    hint: 'Single wide hero — ~1780×420, min 1600px (food/deals imagery)',
    aspect: 1780 / 420,
    aspectLabel: '1780:420',
    fields: ['image', 'title', 'titleAccent', 'subtitle', 'ctaText', 'linkUrl', 'isActive'],
    imageRequired: true,
    maxRecords: 1,
    slotPicker: false,
  },
  {
    id: 'view-more-brand-footer',
    label: 'View More Brand Footer',
    hint: 'Cinematic footer banner — min 1600px wide (~400–500px tall on site)',
    aspect: 16 / 5,
    aspectLabel: '16:5',
    fields: ['image', 'title', 'titleAccent', 'subtitle', 'tag', 'description', 'isActive'],
    imageRequired: true,
    maxRecords: 1,
    slotPicker: false,
  },
  {
    id: 'view-more-sidebar-ads',
    label: 'Sidebar Ads',
    hint: 'Up to 9 sidebar slots — sortOrder 0 = first slot; fewer ads repeat in order',
    aspect: 1,
    aspectLabel: '1:1',
    fields: ['image', 'title', 'linkUrl', 'isActive'],
    imageRequired: true,
    maxRecords: 9,
    slotPicker: false,
  },
];

/** All BGT slots (stored under page `bgt-common` in the API). */
export const BGT_COMMON_BANNER_POSITIONS: HomepageBannerPositionConfig[] = [
  ...BGT_MAIN_BANNER_POSITIONS,
  ...BGT_VIEW_MORE_BANNER_POSITIONS,
];

export function isBgtViewMorePosition(position: string): boolean {
  return String(position || '').startsWith('view-more-');
}

export function getBgtCommonPositionConfig(id: BgtCommonBannerPosition): HomepageBannerPositionConfig {
  return BGT_COMMON_BANNER_POSITIONS.find((p) => p.id === id) ?? BGT_MAIN_BANNER_POSITIONS[0];
}

export function canAddBgtCommonRecord(position: BgtCommonBannerPosition, existingCount: number): boolean {
  const max = getBgtCommonPositionConfig(position).maxRecords;
  if (max == null) return true;
  return existingCount < max;
}

export function isDiscoveryBannerPosition(position: string): boolean {
  return position === 'discovery-best-sellers' || position === 'discovery-top-category';
}
