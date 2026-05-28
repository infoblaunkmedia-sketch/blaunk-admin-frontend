import { api } from '../../shared/services/apiService';

export type Order = {
  id: string;
  orderNumber: string;
  buyerName: string;
  sellerName: string;
  productTitle: string;
  qty: number;
  amount: number;
  gstAmount: number;
  paymentStatus: string;
  orderStatus: string;
  trackingNo: string;
  orderDate: string;
};

export async function fetchOrders(params?: {
  orderStatus?: string;
  q?: string;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.orderStatus) q.set('orderStatus', params.orderStatus);
  if (params?.q) q.set('q', params.q);
  if (params?.fromDate) q.set('fromDate', params.fromDate);
  if (params?.toDate) q.set('toDate', params.toDate);
  if (params?.limit) q.set('limit', String(params.limit));
  const path = q.toString() ? `/api/orders?${q}` : '/api/orders';
  return api.get<{ records: Order[]; pagination: { total: number } }>(path);
}

export async function fetchOrder(id: string) {
  const res = await api.get<{ record: Order }>(`/api/orders/${encodeURIComponent(id)}`);
  return res.record;
}

export async function updateOrderStatus(
  id: string,
  patch: { orderStatus?: string; paymentStatus?: string; trackingNo?: string },
) {
  const res = await api.patch<{ record: Order }>(`/api/orders/${encodeURIComponent(id)}/status`, patch);
  return res.record;
}
