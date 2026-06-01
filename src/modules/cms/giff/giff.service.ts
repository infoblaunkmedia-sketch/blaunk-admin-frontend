import { api } from '../../../shared/services/apiService';
import { parseApiErrorBody } from '../../../shared/utils/apiErrorMessage';
import type { GiffCategoryId } from './giffConfig';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export type GiffRecord = {
  id: string;
  category: GiffCategoryId | string;
  categoryLabel?: string;
  sortOrder: number;
  slotKey?: 'left' | 'right';
  imageUrl: string;
  format: 'gif' | 'jpg';
  isActive: boolean;
  productId?: string;
};

export type GiffListResponse = {
  category: string;
  categoryLabel: string;
  maxRecords: number;
  records: GiffRecord[];
};

export type GiffPublicRecord = {
  id: string;
  category: string;
  sortOrder: number;
  imageUrl: string;
  format: 'gif' | 'jpg';
  isActive: boolean;
  productId?: string;
};

export type GiffPublicResponse = {
  records: GiffPublicRecord[];
};

export type GiffPayload = {
  category: string;
  imageUrl: string;
  format: string;
  isActive: boolean;
  sortOrder: number;
  productId?: string;
};

function authHeaders(): HeadersInit {
  const token = sessionStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchGiffs(category: string): Promise<GiffListResponse> {
  const q = new URLSearchParams({ category });
  const res = await api.get<GiffListResponse>(`/api/giff?${q}`);
  return res;
}

export async function createGiff(body: GiffPayload) {
  const res = await api.post<{ record: GiffRecord }>('/api/giff', body);
  return res.record;
}

export async function updateGiff(id: string, body: GiffPayload) {
  const res = await api.put<{ record: GiffRecord }>(`/api/giff/${encodeURIComponent(id)}`, body);
  return res.record;
}

export async function deleteGiff(id: string) {
  await api.delete(`/api/giff/${encodeURIComponent(id)}`);
}

export async function uploadGiffImage(file: File, category?: string): Promise<string> {
  if (!API_BASE) throw new Error('VITE_API_BASE_URL is not configured');
  const payload = new FormData();
  payload.append('image', file);
  if (category) payload.append('category', category);
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/upload/giff`, {
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

export function giffImageUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = API_BASE.replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

/** Public API for consumer site */
export async function fetchPublicGiffs(category?: string, apiBase?: string) {
  const base = (apiBase ?? API_BASE).replace(/\/$/, '');
  const q = category ? `?category=${encodeURIComponent(category)}` : '';
  const res = await fetch(`${base}/api/giff/public${q}`);
  if (!res.ok) throw new Error(`Failed to load GIFF (${res.status})`);
  return res.json() as Promise<GiffPublicResponse>;
}

export function giffBySortOrder(records: GiffPublicRecord[]) {
  return {
    left: records.find((r) => r.sortOrder === 1) ?? null,
    right: records.find((r) => r.sortOrder === 2) ?? null,
  };
}

export function emptyGiffForm(category: string): GiffPayload & { id?: string } {
  return {
    category,
    imageUrl: '',
    format: 'gif',
    isActive: true,
    sortOrder: 1,
  };
}
