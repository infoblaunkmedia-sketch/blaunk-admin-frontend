import { api } from '../../shared/services/apiService';

export type Referral = {
  id: string;
  dsaCode: string;
  referredUserId: string;
  referredUserName: string;
  eventType: string;
  commissionRate: number;
  commissionAmount: number;
  payoutStatus: string;
  createdAt?: string;
};

export type LedgerRow = {
  dsaCode: string;
  totalCommission: number;
  pendingCommission: number;
  referralCount: number;
  totalSubmitted: number;
  approvedPayouts: number;
};

export function referralLink(dsaCode: string) {
  return `https://blaunk.com/register?ref=${encodeURIComponent(dsaCode)}`;
}

export async function fetchReferrals(params?: { dsaCode?: string; limit?: number }) {
  const q = new URLSearchParams();
  if (params?.dsaCode) q.set('dsaCode', params.dsaCode);
  if (params?.limit) q.set('limit', String(params.limit));
  const path = q.toString() ? `/api/referrals?${q}` : '/api/referrals';
  return api.get<{ records: Referral[]; pagination: { total: number } }>(path);
}

export async function fetchCommissionLedger(dsaCode?: string) {
  const q = dsaCode ? `?dsaCode=${encodeURIComponent(dsaCode)}` : '';
  return api.get<{ ledger: LedgerRow[] }>(`/api/dsa-payouts/ledger${q}`);
}
