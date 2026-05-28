import { api } from '../../shared/services/apiService';

export type ProductStatus = 'pending' | 'active' | 'rejected';

export type Product = {
  id: string;
  sellerId: string;
  sellerName: string;
  categoryId: string;
  title: string;
  description: string;
  moq: number;
  priceMin: number;
  priceMax: number;
  images: string[];
  country: string;
  exportReady: boolean;
  status: ProductStatus;
  rejectionReason: string;
  approvedBy: string;
  createdAt?: string;
};

export async function fetchProducts(params?: { status?: string; q?: string; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.q) q.set('q', params.q);
  if (params?.limit) q.set('limit', String(params.limit));
  const path = q.toString() ? `/api/products?${q}` : '/api/products';
  const res = await api.get<{ records: Product[]; pagination: { total: number } }>(path);
  return res;
}

export async function patchProductStatus(id: string, status: ProductStatus, rejectionReason?: string) {
  const res = await api.patch<{ record: Product }>(`/api/products/${encodeURIComponent(id)}/status`, {
    status,
    rejectionReason,
  });
  return res.record;
}
