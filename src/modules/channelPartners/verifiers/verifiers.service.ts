import { api } from '../../../shared/services/apiService';

export type FieldVerificationStatus = 'Pending' | 'Verified' | 'Rejected';

export interface VendorVerificationRecord {
  id: string;
  vendorId: string;
  vendorCode: string;
  businessName: string;
  ownerName: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  emailStatus: FieldVerificationStatus;
  mobileStatus: FieldVerificationStatus;
  photoStatus: FieldVerificationStatus;
  bankStatus: FieldVerificationStatus;
  shopLocationStatus: FieldVerificationStatus;
  submittedBy: string;
  reviewedBy: string;
  overallStatus: FieldVerificationStatus;
  createdAt?: string;
  updatedAt?: string;
}

type VerifierDto = VendorVerificationRecord;

export async function fetchVerifierRecords(q?: string): Promise<VendorVerificationRecord[]> {
  const params = q ? `?q=${encodeURIComponent(q)}` : '';
  const res = await api.get<{ records: VerifierDto[] }>(`/api/verifiers${params}`);
  return res.records || [];
}

export async function submitVendorVerification(vendorId: string): Promise<VendorVerificationRecord> {
  const res = await api.post<{ record: VerifierDto }>(
    `/api/verifiers/${encodeURIComponent(vendorId)}/submit`,
    {},
  );
  return res.record;
}

export type ReviewVerificationPayload = {
  emailStatus?: FieldVerificationStatus;
  mobileStatus?: FieldVerificationStatus;
  photoStatus?: FieldVerificationStatus;
  bankStatus?: FieldVerificationStatus;
  shopLocationStatus?: FieldVerificationStatus;
};

export async function reviewVendorVerification(
  vendorId: string,
  payload: ReviewVerificationPayload,
): Promise<VendorVerificationRecord> {
  const res = await api.patch<{ record: VerifierDto }>(
    `/api/verifiers/${encodeURIComponent(vendorId)}/review`,
    payload,
  );
  return res.record;
}
