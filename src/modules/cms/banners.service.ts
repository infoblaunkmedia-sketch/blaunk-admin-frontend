import { api } from '../../shared/services/apiService';
import { parseApiErrorBody } from '../../shared/utils/apiErrorMessage';
import type { HomepageBannerPosition } from './banners/homepageBannerConfig';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export type BannerFocalPoint = { x: number; y: number };

/** Full banner record (most homepage slots). */
export type Banner = {
  id: string;
  page: string;
  position: HomepageBannerPosition | string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  tag: string;
  subtitle: string;
  ctaText: string;
  titleAccent: string;
  description: string;
  overlayQuote: string;
  variant: string;
  focalPoint: BannerFocalPoint;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  sortOrder: number;
  createdAt?: string;
};

/** Cake GIFF slot — matches API slim shape with section + slot names. */
export type CakeUploadBanner = {
  id: string;
  position: 'cake-upload';
  section: 'cake-upload';
  sectionLabel: string;
  /** 1 = left box, 2 = right box */
  slot: 1 | 2;
  /** `left` | `right` — use on consumer site for placement */
  slotKey: 'left' | 'right';
  imageUrl: string;
  /** GIF or JPG */
  format: 'gif' | 'jpg';
  /** @deprecated use `format` */
  variant?: string;
  isActive: boolean;
  sortOrder: number;
};

export type CakeUploadSectionLayout = {
  left: CakeUploadBanner | null;
  right: CakeUploadBanner | null;
};

export type CakeUploadListResponse = {
  position: 'cake-upload';
  section: 'cake-upload';
  sectionLabel: string;
  records: CakeUploadBanner[];
  sectionLayout: CakeUploadSectionLayout;
};

export type BannerPayload = Partial<Banner> & {
  page?: string;
  position?: string;
};

export type CakeUploadBannerPayload = {
  page: 'home';
  position: 'cake-upload';
  imageUrl: string;
  variant: string;
  isActive: boolean;
  sortOrder: number;
};

function authHeaders(): HeadersInit {
  const token = sessionStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchBanners(params?: { page?: string; position?: string }): Promise<Banner[]> {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', params.page);
  if (params?.position) q.set('position', params.position);
  const path = q.toString() ? `/api/banners?${q}` : '/api/banners';
  const res = await api.get<{ records: Banner[] }>(path);
  return res.records ?? [];
}

/** Public `GET /api/banners/public?page=home&position=cake-upload` */
export type CakeUploadPublicBanner = {
  id: string;
  page: string;
  position: 'cake-upload';
  sortOrder: number;
  imageUrl: string;
  isActive: boolean;
};

export type CakeUploadPublicResponse = {
  records: CakeUploadPublicBanner[];
};

/** Public homepage Cake GIFF — flat `records` (use `sortOrder` 1=left, 2=right). */
export async function fetchPublicCakeUploadBanners(apiBase?: string) {
  const base = (apiBase ?? API_BASE).replace(/\/$/, '');
  const res = await fetch(`${base}/api/banners/public?page=home&position=cake-upload`);
  if (!res.ok) throw new Error(`Failed to load Cake GIFF (${res.status})`);
  return res.json() as Promise<CakeUploadPublicResponse>;
}

export type CakeUploadPublicLayout = {
  left: CakeUploadPublicBanner | null;
  right: CakeUploadPublicBanner | null;
};

/** Left/right boxes from public records (`sortOrder` 1 and 2). */
export function cakeUploadBySortOrder(records: CakeUploadPublicBanner[]): CakeUploadPublicLayout {
  return {
    left: records.find((r) => r.sortOrder === 1) ?? null,
    right: records.find((r) => r.sortOrder === 2) ?? null,
  };
}

/** Admin cake list — `sectionLayout` from admin API response. */
export function cakeUploadSectionLayout(
  data: CakeUploadListResponse | { records: CakeUploadBanner[] },
): CakeUploadSectionLayout {
  if ('sectionLayout' in data && data.sectionLayout) return data.sectionLayout;
  const layout: CakeUploadSectionLayout = { left: null, right: null };
  for (const row of data.records) {
    const key = row.slotKey === 'right' ? 'right' : 'left';
    layout[key] = row;
  }
  return layout;
}

export async function createBanner(body: BannerPayload) {
  const res = await api.post<{ record: Banner }>('/api/banners', body);
  return res.record;
}

export async function updateBanner(id: string, body: BannerPayload) {
  const res = await api.put<{ record: Banner }>(`/api/banners/${encodeURIComponent(id)}`, body);
  return res.record;
}

export async function deleteBanner(id: string) {
  await api.delete(`/api/banners/${encodeURIComponent(id)}`);
}

export async function uploadBannerImage(file: File): Promise<string> {
  if (!API_BASE) throw new Error('VITE_API_BASE_URL is not configured');
  const payload = new FormData();
  payload.append('image', file);
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/upload/banner`, {
    method: 'POST',
    headers: authHeaders(),
    body: payload,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(parseApiErrorBody(text, res.status));
  }
  const json = (await res.json()) as { url?: string };
  if (!json.url) throw new Error('Upload failed');
  return String(json.url);
}

export function bannerImageUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = API_BASE.replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

export function emptyBanner(position: HomepageBannerPosition): BannerPayload {
  const base: BannerPayload = {
    page: 'home',
    position,
    title: '',
    imageUrl: '',
    linkUrl: '',
    tag: '',
    subtitle: '',
    ctaText: '',
    titleAccent: '',
    description: '',
    overlayQuote: '',
    variant: 'blur',
    focalPoint: { x: 50, y: 50 },
    isActive: true,
    sortOrder: 1,
    startDate: null,
    endDate: null,
  };
  return base;
}
