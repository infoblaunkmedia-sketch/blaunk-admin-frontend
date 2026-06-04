import type { SliderStatus } from '../marketing.types';

export const SECTIONS = ['HOMEPAGE', 'BGT', 'TOUR', 'STORE', 'CAKE', 'BOUTIQUE', 'LOGISTIC'];
export const MEDIA_TABS = [
  'Slider',
  'Explore',
  'Trendy Star',
  'Global Store',
  'Exclusive',
  'New Launch',
  'GIFF',
  'Tour Package',
];
export const CATEGORIES = ['Banner', 'Product', 'Service', 'Offer', 'Event'];
export const PLANS = ['Bronze', 'Silver', 'Gold', 'Diamond', 'Platinum', 'Infinity'];

export const COUNTRIES = [
  'India',
  'Bahrain',
  'Bhutan',
  'Indonesia',
  'Jordan',
  'Malaysia',
  'Maldives',
  'Philippines',
  'Singapore',
  'Sri Lanka',
  'Qatar',
  'Thailand',
  'UAE-Dubai',
  'Vietnam',
];
export const STATUSES: SliderStatus[] = ['Draft', 'Active', 'Inactive'];

export const PLAN_MONTHS: Record<string, number> = {
  Bronze: 3,
  Silver: 6,
  Gold: 12,
  Diamond: 12,
  Platinum: 24,
  Infinity: 9999,
};

export const PLAN_DURATION_LABELS: Record<string, string> = {
  Bronze: '3 months',
  Silver: '6 months',
  Gold: '12 months',
  Diamond: '12 months',
  Platinum: '24 months',
  Infinity: 'Extended visibility',
};

export function planOptionLabel(plan: string): string {
  const duration = PLAN_DURATION_LABELS[plan];
  return duration ? `${plan} — ${duration}` : plan;
}

export function addMonths(dateISO: string, months: number) {
  const d = new Date(dateISO);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function toAbsoluteMediaUrl(urlOrPath: string) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
  const s = String(urlOrPath || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('/')) return `${API_BASE}${s}`;
  return s;
}
