import { api } from '../../../shared/services/apiService';
import { parseApiErrorBody } from '../../../shared/utils/apiErrorMessage';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export type ShopStatus = 'pending' | 'approved' | 'rejected';

export type Shop = {
  id: string;
  shopName: string;
  ownerName: string;
  email: string;
  phone: string;
  tagline: string;
  category: string;
  city: string;
  pincode: string;
  address: string;
  promoText: string;
  imageUrl: string;
  coverImage: string;
  rating: number;
  isVerified: boolean;
  sortOrder: number;
  linkUrl: string;
  status: ShopStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type ShopCategory = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

function authHeaders(): HeadersInit {
  const token = sessionStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchShops(params?: { status?: string; category?: string; q?: string }) {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.category) q.set('category', params.category);
  if (params?.q) q.set('q', params.q);
  const path = q.toString() ? `/api/shops?${q}` : '/api/shops';
  const res = await api.get<{ records: Shop[] }>(path);
  return res.records || [];
}

export async function updateShop(id: string, body: Partial<Shop>) {
  const res = await api.put<{ record: Shop }>(`/api/shops/${encodeURIComponent(id)}`, body);
  return res.record;
}

export async function deleteShop(id: string) {
  await api.delete(`/api/shops/${encodeURIComponent(id)}`);
}

export async function fetchShopCategories() {
  const res = await api.get<{ records: ShopCategory[] }>('/api/shop-categories');
  return res.records || [];
}

export async function createShopCategory(body: { name: string; sortOrder: number; isActive: boolean }) {
  const res = await api.post<{ record: ShopCategory }>('/api/shop-categories', body);
  return res.record;
}

export async function updateShopCategory(id: string, body: Partial<ShopCategory>) {
  const res = await api.put<{ record: ShopCategory }>(`/api/shop-categories/${encodeURIComponent(id)}`, body);
  return res.record;
}

export async function deleteShopCategory(id: string) {
  await api.delete(`/api/shop-categories/${encodeURIComponent(id)}`);
}

export async function uploadShopImage(file: File): Promise<string> {
  if (!API_BASE) throw new Error('VITE_API_BASE_URL is not configured');
  const payload = new FormData();
  payload.append('image', file);
  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/upload/shop`, {
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

export function shopImageUrl(url: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = API_BASE.replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}
