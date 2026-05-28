/**
 * Public site media API for the consumer website (no auth).
 * Base URL: same backend as admin — VITE_API_BASE_URL or your public API origin.
 */

export type SiteMediaSectionId =
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
  | 'boutique-disclaimer';

export type PublicSiteMediaItem = {
  section: SiteMediaSectionId;
  slot: number;
  kind: 'image' | 'url';
  value: string;
  /** Present for social-media links, e.g. Instagram, Youtube */
  title?: string;
};

export type MediaSlotImage = { slot: number; value: string };
export type MediaSlotLink = { slot: number; value: string; title?: string };
export type BoutiqueCard = { slot: number; value: string; title?: string };

export type GifPosterCard = {
  slot: number;
  value: string;
  title?: string;
  cardTitle: string;
  offerText?: string;
};

export type BecomeASellerLayout = {
  heroImage?: string;
  heroSlider: MediaSlotImage[];
  bottomSlider: MediaSlotImage[];
};

export type PublicSiteMediaResponse = {
  records: PublicSiteMediaItem[];
  bySection: Record<
    string,
    Array<{ slot: number; kind: 'image' | 'url'; value: string; title?: string }>
  >;
  /** Named groups per section — use this instead of guessing from flat slot order. */
  sectionLayout: Record<string, unknown>;
};

const DEFAULT_API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function fetchPublicSiteMedia(
  apiBase = DEFAULT_API,
  section?: SiteMediaSectionId,
): Promise<PublicSiteMediaResponse> {
  const q = section ? `?section=${encodeURIComponent(section)}` : '';
  const res = await fetch(`${apiBase.replace(/\/$/, '')}/api/site-media/public${q}`);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Failed to load site media (${res.status})`);
  }
  return res.json() as Promise<PublicSiteMediaResponse>;
}

/** Image URLs only, sorted by slot (for sliders, posters, etc.). */
export function imageUrlsForSection(
  data: PublicSiteMediaResponse,
  section: SiteMediaSectionId,
): string[] {
  const items = data.bySection[section] || [];
  return items
    .filter((i) => i.kind === 'image' && i.value)
    .sort((a, b) => a.slot - b.slot)
    .map((i) => i.value);
}

/** Single hero/banner image for a section (e.g. contact-us slot 1, social-media slot 4). */
export function heroImageForSection(
  data: PublicSiteMediaResponse,
  section: SiteMediaSectionId,
  slot = 1,
): string | undefined {
  const items = data.bySection[section] || [];
  return items.find((i) => i.kind === 'image' && i.slot === slot && i.value)?.value;
}

/** Banner images for social-media (slots 4–5) or any explicit slot list. */
export function bannerImagesForSection(
  data: PublicSiteMediaResponse,
  section: SiteMediaSectionId,
  slots: number[],
): string[] {
  return sliderImagesForSection(data, section, slots);
}

/** B-Boutique homepage cards from sectionLayout (slot, image, label). */
export function boutiqueCards(data: PublicSiteMediaResponse): BoutiqueCard[] {
  const layout = data.sectionLayout?.['boutique-ellite11'] as
    | { images?: BoutiqueCard[] }
    | undefined;
  return layout?.images ?? [];
}

/** Parse Cakes & Bakes title: `CARD_TITLE | OFFER_TEXT` (offer optional). */
export function parseGifPosterTitle(title?: string): { cardTitle: string; offerText?: string } {
  const raw = String(title ?? '').trim();
  if (!raw) return { cardTitle: '' };
  const [cardTitle, offerText] = raw.split('|').map((part) => part.trim());
  return {
    cardTitle: cardTitle || '',
    ...(offerText ? { offerText } : {}),
  };
}

/** Cakes & Bakes (`gif-poster`) homepage cards. */
export function gifPosterCards(data: PublicSiteMediaResponse): GifPosterCard[] {
  const fromLayout = data.sectionLayout?.['gif-poster'] as { cards?: BoutiqueCard[] } | undefined;
  const items = fromLayout?.cards?.length
    ? fromLayout.cards
    : (data.bySection['gif-poster'] ?? [])
        .filter((i) => i.kind === 'image' && i.value)
        .sort((a, b) => a.slot - b.slot)
        .map((i) => ({ slot: i.slot, value: i.value, title: i.title }));

  return items.map((item) => ({
    slot: item.slot,
    value: item.value,
    ...(item.title ? { title: item.title } : {}),
    ...parseGifPosterTitle(item.title),
  }));
}

/** Become a Seller — hero image (slot 1), hero slider (2–4), bottom slider (5–6). */
export function becomeASellerLayout(data: PublicSiteMediaResponse): BecomeASellerLayout {
  const layout = data.sectionLayout?.['become-a-seller'] as BecomeASellerLayout | undefined;
  return {
    heroImage: layout?.heroImage || '',
    heroSlider: layout?.heroSlider ?? [],
    bottomSlider: layout?.bottomSlider ?? [],
  };
}

/** Slider images only — excludes a hero slot when provided (e.g. career slots 2–3). */
export function sliderImagesForSection(
  data: PublicSiteMediaResponse,
  section: SiteMediaSectionId,
  slots?: number[],
): string[] {
  const items = data.bySection[section] || [];
  const filtered = items.filter((i) => i.kind === 'image' && i.value);
  const picked = slots
    ? filtered.filter((i) => slots.includes(i.slot))
    : filtered;
  return picked.sort((a, b) => a.slot - b.slot).map((i) => i.value);
}

/** Social / link URLs only, sorted by slot. */
export function linkUrlsForSection(
  data: PublicSiteMediaResponse,
  section: SiteMediaSectionId = 'social-media',
): string[] {
  const items = data.bySection[section] || [];
  return items
    .filter((i) => i.kind === 'url' && i.value)
    .sort((a, b) => a.slot - b.slot)
    .map((i) => i.value);
}

/** Social links with display titles (Instagram, Youtube, Facebook), sorted by slot. */
export function socialLinksForSection(
  data: PublicSiteMediaResponse,
  section: SiteMediaSectionId = 'social-media',
): Array<{ slot: number; title: string; url: string }> {
  const items = data.bySection[section] || [];
  return items
    .filter((i) => i.kind === 'url' && i.value)
    .sort((a, b) => a.slot - b.slot)
    .map((i) => ({
      slot: i.slot,
      title: i.title || '',
      url: i.value,
    }));
}
