/**
 * Public homepage testimonials API (no auth).
 */

export type PublicTestimonial = {
  name: string;
  occupation: string;
  country: string;
  rating: number;
  description: string;
  profilePhotoUrl: string;
  sortOrder: number;
};

const DEFAULT_API = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export async function fetchPublicTestimonials(
  apiBase = DEFAULT_API,
): Promise<PublicTestimonial[]> {
  const base = apiBase.replace(/\/$/, '');
  const res = await fetch(`${base}/api/testimonials/public`);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Failed to load testimonials (${res.status})`);
  }
  const json = (await res.json()) as { records?: PublicTestimonial[] };
  return json.records ?? [];
}
