import type { HomepageBannerField, HomepageBannerPositionConfig } from './homepageBannerConfig';

export type BoutiqueBannerPosition =
  | 'hero'
  | 'fashion-accessories'
  | 'trendy-star'
  | 'editorial-gallery'
  | 'new-launch-carousel'
  | 'exclusive-video'
  | 'disclaimer-utility';

const FASHION_ACCESSORIES_CHIP_COUNT = 5;
const TRENDY_STAR_CHIP_COUNT = 5;
const DISCLAIMER_UTILITY_CHIP_COUNT = 5;
const EDITORIAL_GALLERY_MAX = 8;

export const BOUTIQUE_BANNER_POSITIONS: HomepageBannerPositionConfig[] = [
  {
    id: 'hero',
    label: 'Hero carousel',
    hint: 'Background carousel — 21:9, recommended 2560×1097; sortOrder 0 = first slide',
    aspect: 21 / 9,
    aspectLabel: '21:9',
    fields: ['image', 'title', 'linkUrl', 'isActive'],
    imageRequired: true,
    maxRecords: 5,
    slotPicker: true,
    sortOrderStart: 0,
  },
  {
    id: 'fashion-accessories',
    label: 'Fashion & Accessories',
    hint: 'Optional section header (sortOrder 0) + up to 5 carousel slides — 16:9 recommended',
    aspect: 16 / 9,
    aspectLabel: '16:9',
    fields: [],
    imageRequired: false,
    maxRecords: 1 + FASHION_ACCESSORIES_CHIP_COUNT,
    discoveryHub: {
      headerFields: ['title', 'titleAccent', 'subtitle', 'ctaText', 'linkUrl', 'isActive'],
      chipFields: ['image', 'title', 'linkUrl', 'chipSlot', 'isActive'],
      chipCount: FASHION_ACCESSORIES_CHIP_COUNT,
    },
  },
  {
    id: 'trendy-star',
    label: 'Trendy Star',
    hint: 'Optional section header (sortOrder 0) + up to 5 carousel cards — 3:4 recommended',
    aspect: 3 / 4,
    aspectLabel: '3:4',
    fields: [],
    imageRequired: false,
    maxRecords: 1 + TRENDY_STAR_CHIP_COUNT,
    discoveryHub: {
      headerFields: ['title', 'titleAccent', 'subtitle', 'isActive'],
      chipFields: ['image', 'title', 'linkUrl', 'chipSlot', 'isActive'],
      chipCount: TRENDY_STAR_CHIP_COUNT,
    },
  },
  {
    id: 'editorial-gallery',
    label: 'Editorial Gallery',
    hint: '2-column card grid — upload 2 for the pair (sortOrder 0 = left, 1 = right); up to 8 cards wrap in the same layout',
    aspect: 4 / 5,
    aspectLabel: '4:5',
    fields: ['image', 'title', 'linkUrl', 'isActive'],
    imageRequired: true,
    maxRecords: EDITORIAL_GALLERY_MAX,
    slotPicker: true,
    sortOrderStart: 0,
  },
  {
    id: 'new-launch-carousel',
    label: 'New Launch Carousel',
    hint: 'One record per slide — carousel uses all active uploads in sortOrder',
    aspect: 16 / 9,
    aspectLabel: '16:9',
    fields: ['image', 'title', 'linkUrl', 'isActive'],
    imageRequired: true,
    sortOrderStart: 0,
  },
  {
    id: 'exclusive-video',
    label: 'Exclusive Video',
    hint: 'Optional EXCLUSIVE header (sortOrder 0) + one video card (sortOrder 1) — 16:9 background image',
    aspect: 16 / 9,
    aspectLabel: '16:9',
    fields: [],
    imageRequired: false,
    maxRecords: 2,
    discoveryHub: {
      headerFields: ['title', 'titleAccent', 'isActive'],
      chipFields: [
        'image',
        'subtitle',
        'title',
        'tag',
        'titleAccent',
        'description',
        'ctaText',
        'linkUrl',
        'isActive',
      ],
      chipCount: 1,
    },
  },
  {
    id: 'disclaimer-utility',
    label: 'Disclaimer Utility',
    hint: 'Optional LEGAL DISCLAIMER header (sortOrder 0) + up to 5 carousel cards — 16:9 recommended',
    aspect: 16 / 9,
    aspectLabel: '16:9',
    fields: [],
    imageRequired: false,
    maxRecords: 1 + DISCLAIMER_UTILITY_CHIP_COUNT,
    discoveryHub: {
      headerFields: ['title', 'titleAccent', 'description', 'isActive'],
      chipFields: ['image', 'title', 'linkUrl', 'chipSlot', 'isActive'],
      chipCount: DISCLAIMER_UTILITY_CHIP_COUNT,
    },
  },
];

export function getBoutiquePositionConfig(id: BoutiqueBannerPosition): HomepageBannerPositionConfig {
  return BOUTIQUE_BANNER_POSITIONS.find((p) => p.id === id) ?? BOUTIQUE_BANNER_POSITIONS[0];
}

export function canAddBoutiqueRecord(position: BoutiqueBannerPosition, existingCount: number): boolean {
  const max = getBoutiquePositionConfig(position).maxRecords;
  if (max == null) return true;
  return existingCount < max;
}
