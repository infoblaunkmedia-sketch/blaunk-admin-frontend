export type MediaSectionId =
  | 'contact-us'
  | 'social-media'
  | 'become-a-seller'
  | 'contest'
  | 'refer-earn'
  | 'career'
  | 'home-page-slider'
  | 'gif-poster'
  | 'bgt-export-poster'
  | 'boutique-ellite11'
  | 'boutique-disclaimer'
  | 'testimonials';

/** Wide homepage-style banner (first reference image). */
export const ASPECT_HERO = 21 / 9;
export const ASPECT_HERO_LABEL = '21:9';

export type MediaImageSlotDef = {
  slot: number;
  label: string;
  aspect: number;
  aspectLabel: string;
  /** Optional UI group heading within a section. */
  group?: string;
};

export type MediaUrlSlotDef = {
  slot: number;
  label: string;
};

export type ExpandableImageConfig = {
  minSlots: number;
  maxSlots: number;
  labelPrefix: string;
  group?: string;
  aspect: number;
  aspectLabel: string;
  titlePlaceholder?: string;
  titleHint?: string;
};

export type MediaSectionConfig = {
  id: MediaSectionId;
  label: string;
  kind: 'images' | 'urls' | 'mixed';
  imageSlots: MediaImageSlotDef[];
  urlSlots?: MediaUrlSlotDef[];
  maxSizeKb: number;
  /** Show + Add to grow image slots; optional editable card title per slot. */
  expandableImages?: ExpandableImageConfig;
  /** Per-slot title field in admin (e.g. boutique cards, Cakes & Bakes). */
  editableCardTitle?: boolean;
};

/** Fixed labels for social-media URL slots (slots 1–3). */
export const SOCIAL_MEDIA_SLOT_TITLES = ['Instagram', 'Youtube', 'Facebook'] as const;

const heroSlot = (slot: number, label: string, group?: string): MediaImageSlotDef => ({
  slot,
  label,
  aspect: ASPECT_HERO,
  aspectLabel: ASPECT_HERO_LABEL,
  group,
});

const sliderSlot = (slot: number, label: string, group?: string): MediaImageSlotDef => ({
  slot,
  label,
  aspect: ASPECT_HERO,
  aspectLabel: ASPECT_HERO_LABEL,
  group,
});

export const MEDIA_SECTIONS: MediaSectionConfig[] = [
  {
    id: 'contact-us',
    label: 'Contact Us',
    kind: 'images',
    maxSizeKb: 1024,
    imageSlots: [],
    expandableImages: {
      minSlots: 1,
      maxSlots: 10,
      labelPrefix: 'Banner',
      group: 'Page banners',
      aspect: ASPECT_HERO,
      aspectLabel: ASPECT_HERO_LABEL,
    },
  },
  {
    id: 'social-media',
    label: 'Social Media',
    kind: 'mixed',
    maxSizeKb: 1024,
    imageSlots: [
      heroSlot(4, 'Banner 1', 'Banners'),
      heroSlot(5, 'Banner 2', 'Banners'),
    ],
    urlSlots: SOCIAL_MEDIA_SLOT_TITLES.map((title, i) => ({
      slot: i + 1,
      label: title,
    })),
  },
  {
    id: 'become-a-seller',
    label: 'Become a Seller',
    kind: 'images',
    maxSizeKb: 1024,
    imageSlots: [
      heroSlot(1, 'Hero image', 'Hero image'),
      sliderSlot(2, 'Hero slide 1', 'Hero slider (top)'),
      sliderSlot(3, 'Hero slide 2', 'Hero slider (top)'),
      sliderSlot(4, 'Hero slide 3', 'Hero slider (top)'),
      heroSlot(5, 'Bottom slide 1', 'Bottom slider'),
      heroSlot(6, 'Bottom slide 2', 'Bottom slider'),
    ],
  },
  {
    id: 'contest',
    label: 'Contest',
    kind: 'images',
    maxSizeKb: 1024,
    imageSlots: [
      sliderSlot(1, 'Slider image 1', 'Slider'),
      sliderSlot(2, 'Slider image 2', 'Slider'),
    ],
  },
  {
    id: 'refer-earn',
    label: 'Refer & Earn',
    kind: 'images',
    maxSizeKb: 1024,
    imageSlots: [
      sliderSlot(1, 'Slider image 1', 'Slider'),
      sliderSlot(2, 'Slider image 2', 'Slider'),
    ],
  },
  {
    id: 'career',
    label: 'Career',
    kind: 'images',
    maxSizeKb: 1024,
    imageSlots: [
      heroSlot(1, 'Top banner', 'Top banner'),
      sliderSlot(2, 'Slider image 1', 'Slider'),
      sliderSlot(3, 'Slider image 2', 'Slider'),
    ],
  },
  {
    id: 'home-page-slider',
    label: 'Home Page Slider',
    kind: 'images',
    maxSizeKb: 1024,
    imageSlots: Array.from({ length: 5 }, (_, i) =>
      sliderSlot(i + 1, `Slide ${i + 1}`, 'Slider'),
    ),
  },
  {
    id: 'gif-poster',
    label: 'Cakes & Bakes',
    kind: 'images',
    maxSizeKb: 1024,
    imageSlots: [],
    editableCardTitle: true,
    expandableImages: {
      minSlots: 3,
      maxSlots: 20,
      labelPrefix: 'Card',
      group: 'Homepage cards',
      aspect: 16 / 9,
      aspectLabel: '16:9',
      titlePlaceholder: 'Card title | Offer text',
      titleHint: 'Offer is optional. Use | between title and offer.',
    },
  },
  {
    id: 'bgt-export-poster',
    label: 'BGT Export Poster',
    kind: 'images',
    maxSizeKb: 1024,
    imageSlots: Array.from({ length: 3 }, (_, i) => ({
      slot: i + 1,
      label: `Poster ${i + 1}`,
      aspect: 9 / 16,
      aspectLabel: '9:16',
    })),
  },
  {
    id: 'boutique-ellite11',
    label: 'Boutique Ellite11',
    kind: 'images',
    maxSizeKb: 700,
    imageSlots: [],
    editableCardTitle: true,
    expandableImages: {
      minSlots: 3,
      maxSlots: 20,
      labelPrefix: 'Card',
      group: 'Homepage cards',
      aspect: 1,
      aspectLabel: '1:1',
      titlePlaceholder: 'Card label',
    },
  },
  {
    id: 'boutique-disclaimer',
    label: 'Boutique Disclaimer',
    kind: 'images',
    maxSizeKb: 1024,
    imageSlots: [
      {
        slot: 1,
        label: 'Banner',
        aspect: 16 / 9,
        aspectLabel: '16:9',
      },
    ],
  },
];

export function getMediaSection(id: MediaSectionId): MediaSectionConfig {
  return MEDIA_SECTIONS.find((s) => s.id === id) ?? MEDIA_SECTIONS[0];
}

export function slotStorageKey(sectionId: MediaSectionId, slot: number): string {
  return `${sectionId}:${slot}`;
}

export function formatMaxSizeLabel(maxSizeKb: number): string {
  if (maxSizeKb >= 1024) return '1 MB';
  return `${maxSizeKb} KB`;
}

/** Compact admin thumbnail — not full page width. */
export function previewAspectClass(slot: MediaImageSlotDef): string {
  if (slot.aspectLabel === '1:1') {
    return 'h-24 w-24 shrink-0';
  }
  if (slot.aspectLabel === '9:16') {
    return 'h-28 w-[72px] shrink-0';
  }
  if (slot.aspectLabel === '16:9') {
    return 'h-20 w-[142px] shrink-0';
  }
  return 'h-20 w-[187px] shrink-0';
}

export function buildExpandableSlotDefs(
  config: ExpandableImageConfig,
  visibleCount: number,
): MediaImageSlotDef[] {
  const count = Math.min(Math.max(visibleCount, config.minSlots), config.maxSlots);
  return Array.from({ length: count }, (_, i) => ({
    slot: i + 1,
    label: `${config.labelPrefix} ${i + 1}`,
    aspect: config.aspect,
    aspectLabel: config.aspectLabel,
    group: config.group,
  }));
}

export function maxUsedImageSlot(
  sectionId: MediaSectionId,
  imageSlots: Record<string, { previewUrl?: string } | undefined>,
  maxSlots: number,
): number {
  let max = 0;
  for (let s = 1; s <= maxSlots; s++) {
    const key = slotStorageKey(sectionId, s);
    if (imageSlots[key]?.previewUrl) max = s;
  }
  return max;
}

/** Group image slots by optional `group` for section UI. */
export function groupImageSlots(slots: MediaImageSlotDef[]): Array<{ title: string | null; slots: MediaImageSlotDef[] }> {
  const groups: Array<{ title: string | null; slots: MediaImageSlotDef[] }> = [];
  for (const slot of slots) {
    const title = slot.group ?? null;
    const last = groups[groups.length - 1];
    if (last && last.title === title) {
      last.slots.push(slot);
    } else {
      groups.push({ title, slots: [slot] });
    }
  }
  return groups;
}
