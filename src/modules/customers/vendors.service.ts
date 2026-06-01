import { api } from '../../shared/services/apiService';
import type { VendorRecord, BankDetails } from '../channelPartners/channelPartners.types';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type KycDocument = {
  id: string;
  docType: string;
  fileName: string;
  originalName: string;
  url: string;
  uploadedAt?: string;
  uploadedBy?: string;
};

type SellerDto = VendorRecord & {
  id: string;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  kycDocumentCount?: number;
};

function mapSeller(dto: SellerDto): VendorRecord {
  return {
    id: dto.id,
    vendorCode: dto.vendorCode,
    businessName: dto.businessName,
    ownerName: dto.ownerName,
    mobile: dto.mobile,
    email: dto.email,
    address: dto.address,
    city: dto.city,
    state: dto.state,
    country: dto.country,
    productCategories: dto.productCategories,
    bank: dto.bank || emptyBank(),
    kycStatus: dto.kycStatus,
    status: dto.status,
    approvalStatus: dto.approvalStatus,
    rejectionReason: dto.rejectionReason,
    joiningDate: dto.joiningDate,
    createdAt: dto.createdAt,
  };
}

function emptyBank(): BankDetails {
  return { accountHolderName: '', accountNumber: '', ifsc: '', bankName: '', branch: '' };
}

export type SellersListParams = {
  q?: string;
  status?: ApprovalStatus | '';
  page?: number;
  limit?: number;
};

export type SellersListResult = {
  records: VendorRecord[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export async function fetchVendors(params: SellersListParams = {}): Promise<SellersListResult> {
  const q = new URLSearchParams();
  if (params.q) q.set('q', params.q);
  if (params.status) q.set('status', params.status);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  const path = q.toString() ? `/api/sellers?${q.toString()}` : '/api/sellers';
  const res = await api.get<{ records: SellerDto[]; pagination: SellersListResult['pagination'] }>(path);
  return {
    records: (res.records || []).map(mapSeller),
    pagination: res.pagination,
  };
}

export async function fetchVendorById(id: string): Promise<VendorRecord> {
  const res = await api.get<{ record: SellerDto }>(`/api/sellers/${encodeURIComponent(id)}`);
  return mapSeller(res.record);
}

export async function fetchVendorDocuments(sellerId: string): Promise<KycDocument[]> {
  const res = await api.get<{ documents: KycDocument[] }>(
    `/api/sellers/${encodeURIComponent(sellerId)}/documents`,
  );
  return res.documents || [];
}

export async function generateVendorCode(): Promise<string> {
  const res = await api.get<{ code: string }>('/api/sellers/next-code');
  return res.code;
}

export async function updateVendorStatus(id: string, status: VendorRecord['status']): Promise<VendorRecord> {
  const res = await api.patch<{ record: SellerDto }>(
    `/api/sellers/${encodeURIComponent(id)}`,
    { status },
  );
  return mapSeller(res.record);
}

export async function saveVendor(record: VendorRecord): Promise<VendorRecord> {
  const body = {
    id: record.id,
    vendorCode: record.vendorCode,
    businessName: record.businessName,
    ownerName: record.ownerName,
    mobile: record.mobile,
    email: record.email,
    address: record.address,
    city: record.city,
    state: record.state,
    country: record.country,
    productCategories: record.productCategories,
    bank: record.bank,
    kycStatus: record.kycStatus,
    status: record.status,
    joiningDate: record.joiningDate,
  };
  if (record.id) {
    const res = await api.patch<{ record: SellerDto }>(
      `/api/sellers/${encodeURIComponent(record.id)}`,
      body,
    );
    return mapSeller(res.record);
  }
  const res = await api.post<{ record: SellerDto }>('/api/sellers', body);
  return mapSeller(res.record);
}

export async function deleteVendor(id: string): Promise<void> {
  await api.delete(`/api/sellers/${encodeURIComponent(id)}`);
}

export async function approveVendor(id: string): Promise<{ record: VendorRecord; email: { sent: boolean } }> {
  const res = await api.post<{ record: SellerDto; email: { sent: boolean } }>(
    `/api/sellers/${encodeURIComponent(id)}/approve`,
    {},
  );
  return { record: mapSeller(res.record), email: res.email };
}

export async function rejectVendor(id: string, reason: string): Promise<{ record: VendorRecord; email: { sent: boolean } }> {
  const res = await api.post<{ record: SellerDto; email: { sent: boolean } }>(
    `/api/sellers/${encodeURIComponent(id)}/reject`,
    { reason },
  );
  return { record: mapSeller(res.record), email: res.email };
}

export async function uploadKycDocument(
  sellerId: string,
  file: File,
  docType = 'KYC',
): Promise<KycDocument> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) throw new Error('VITE_API_BASE_URL is not configured');
  const token = sessionStorage.getItem('authToken');
  const payload = new FormData();
  payload.append('document', file);
  payload.append('sellerId', sellerId);
  payload.append('docType', docType);
  const res = await fetch(`${base}/api/upload/kyc-document`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: payload,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || 'KYC upload failed');
  }
  const json = (await res.json()) as { document: KycDocument };
  return json.document;
}

export function kycDocumentUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  return `${base.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
}
