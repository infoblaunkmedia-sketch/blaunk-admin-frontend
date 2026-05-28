export type HomepageBannerPosition =
  | 'hero'
  | 'market-map'
  | 'market-card'
  | 'industry-card'
  | 'bdial-feature'
  | 'bdial-service'
  | 'bdial-logistics'
  | 'bdial-helpdesk'
  | 'trade-hub'
  | 'connect-testimonials'
  | 'partner-spotlight'
  | 'sustainability'
  | 'valued-clients';

export type HomepageBannerField =
  | 'title'
  | 'tag'
  | 'subtitle'
  | 'ctaText'
  | 'titleAccent'
  | 'description'
  | 'overlayQuote'
  | 'linkUrl'
  | 'variant'
  | 'imageFormat'
  | 'image'
  | 'focalPoint'
  | 'sortOrder'
  | 'isActive'
  | 'schedule';

export type HomepageBannerPositionConfig = {
  id: HomepageBannerPosition;
  label: string;
  hint: string;
  aspect: number;
  aspectLabel: string;
  fields: HomepageBannerField[];
  imageRequired: boolean;
  /** When 1, only one banner record may exist for this position. */
  maxRecords?: number;
};

/** Positions that allow a single upload/record only. */
export const SINGLE_RECORD_POSITIONS: HomepageBannerPosition[] = [
  'market-map',
  'bdial-feature',
  'sustainability',
];

export const HOMEPAGE_BANNER_POSITIONS: HomepageBannerPositionConfig[] = [
  {
    id: 'hero',
    label: 'Hero carousel',
    hint: 'Top carousel — title, tag pill, subtitle, CTA',
    aspect: 21 / 9,
    aspectLabel: '21:9',
    fields: ['image', 'title', 'tag', 'subtitle', 'ctaText', 'linkUrl', 'focalPoint', 'sortOrder', 'isActive', 'schedule'],
    imageRequired: true,
  },
  {
    id: 'market-map',
    label: 'Market map (BGT)',
    hint: 'Right map image — one record only',
    aspect: 4 / 3,
    aspectLabel: '4:3',
    fields: ['image', 'title', 'focalPoint', 'sortOrder', 'isActive', 'schedule'],
    imageRequired: true,
    maxRecords: 1,
  },
  {
    id: 'market-card',
    label: 'Market cards',
    hint: 'Market section squares + label',
    aspect: 1,
    aspectLabel: '1:1',
    fields: ['image', 'title', 'linkUrl', 'sortOrder', 'isActive', 'schedule'],
    imageRequired: true,
  },
  {
    id: 'industry-card',
    label: 'Industry insights',
    hint: 'Tall cards — variant blur | yellow | white',
    aspect: 3 / 4,
    aspectLabel: '3:4',
    fields: ['image', 'title', 'linkUrl', 'variant', 'sortOrder', 'isActive', 'schedule'],
    imageRequired: true,
  },
  {
    id: 'bdial-feature',
    label: 'B-Dial feature',
    hint: 'Large right image — one record only · tag = badge text',
    aspect: 4 / 3,
    aspectLabel: '4:3',
    fields: ['image', 'tag', 'focalPoint', 'sortOrder', 'isActive', 'schedule'],
    imageRequired: true,
    maxRecords: 1,
  },
  {
    id: 'bdial-service',
    label: 'B-Dial services',
    hint: 'Find Services small cards',
    aspect: 1,
    aspectLabel: '1:1',
    fields: ['image', 'title', 'linkUrl', 'sortOrder', 'isActive', 'schedule'],
    imageRequired: true,
  },
  {
    id: 'bdial-logistics',
    label: 'B-Dial logistics',
    hint: 'Find Logistics small cards',
    aspect: 1,
    aspectLabel: '1:1',
    fields: ['image', 'title', 'linkUrl', 'sortOrder', 'isActive', 'schedule'],
    imageRequired: true,
  },
  {
    id: 'bdial-helpdesk',
    label: 'B-Dial helpdesk',
    hint: 'Phone bar — title = label, subtitle = phone (no image)',
    aspect: 1,
    aspectLabel: '—',
    fields: ['title', 'subtitle', 'sortOrder', 'isActive', 'schedule'],
    imageRequired: false,
  },
  {
    id: 'trade-hub',
    label: 'Connect slider',
    hint: 'Below B-Dial · title = main line, subtitle = gold accent, ctaText = button',
    aspect: 21 / 9,
    aspectLabel: '21:9',
    fields: [
      'image',
      'title',
      'subtitle',
      'ctaText',
      'linkUrl',
      'focalPoint',
      'sortOrder',
      'isActive',
      'schedule',
    ],
    imageRequired: true,
  },
  {
    id: 'connect-testimonials',
    label: 'Mini slider',
    hint: 'Independent from trade-hub · same fields, 21:9',
    aspect: 21 / 9,
    aspectLabel: '21:9',
    fields: [
      'image',
      'title',
      'subtitle',
      'ctaText',
      'linkUrl',
      'focalPoint',
      'sortOrder',
      'isActive',
      'schedule',
    ],
    imageRequired: true,
  },
  {
    id: 'partner-spotlight',
    label: 'Partner spotlight',
    hint: 'Tall partner scroller',
    aspect: 2 / 3,
    aspectLabel: '2:3',
    fields: ['image', 'title', 'linkUrl', 'sortOrder', 'isActive', 'schedule'],
    imageRequired: true,
  },
  {
    id: 'sustainability',
    label: 'Ethical & Green',
    hint: 'One record only · tag, titleAccent, description (| = pills), overlayQuote, CTA',
    aspect: 3 / 4,
    aspectLabel: '3:4',
    fields: [
      'image',
      'tag',
      'title',
      'titleAccent',
      'subtitle',
      'description',
      'overlayQuote',
      'ctaText',
      'linkUrl',
      'focalPoint',
      'sortOrder',
      'isActive',
      'schedule',
    ],
    imageRequired: true,
    maxRecords: 1,
  },
  {
    id: 'valued-clients',
    label: 'Valued clients',
    hint: 'Client marquee images only (header is static on site)',
    aspect: 16 / 9,
    aspectLabel: '16:9',
    fields: ['image', 'title', 'linkUrl', 'sortOrder', 'isActive', 'schedule'],
    imageRequired: true,
  },
];

export function getPositionConfig(id: HomepageBannerPosition): HomepageBannerPositionConfig {
  return HOMEPAGE_BANNER_POSITIONS.find((p) => p.id === id) ?? HOMEPAGE_BANNER_POSITIONS[0];
}

export function canAddRecordForPosition(
  position: HomepageBannerPosition,
  existingCount: number,
): boolean {
  const max = getPositionConfig(position).maxRecords;
  if (max == null) return true;
  return existingCount < max;
}
