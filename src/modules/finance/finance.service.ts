import type {
  B2BPayment, DsaPayoutSubmission, BgtBankAccounts,
  NeftAccount, WireAccount, QrEntry,
} from './finance.types';
import { api } from '../../shared/services/apiService';

const B2B_KEY = 'blaunk_b2b_payments';
const DSA_PAYOUTS_KEY = 'blaunk_dsa_payouts';
const BGT_BANK_KEY = 'blaunk_bgt_bank';

function load<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]; }
  catch { return []; }
}
function loadOne<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function persist<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// B2B Payments
export async function fetchB2BPayments(): Promise<B2BPayment[]> {
  return load<B2BPayment>(B2B_KEY);
}
export async function saveB2BPayment(record: B2BPayment): Promise<void> {
  const all = load<B2BPayment>(B2B_KEY);
  const idx = all.findIndex((r) => r.id === record.id);
  if (idx >= 0) all[idx] = record; else all.push(record);
  persist(B2B_KEY, all);
}
export async function deleteB2BPayment(id: string): Promise<void> {
  persist(B2B_KEY, load<B2BPayment>(B2B_KEY).filter((r) => r.id !== id));
}

// DSA Payouts
export async function fetchDsaPayouts(filters?: { dsaCode?: string; status?: string; limit?: number }): Promise<DsaPayoutSubmission[]> {
  const q = new URLSearchParams();
  if (filters?.dsaCode) q.set('dsaCode', filters.dsaCode);
  if (filters?.status) q.set('status', filters.status);
  if (typeof filters?.limit === 'number') q.set('limit', String(filters.limit));
  const path = q.toString() ? `/api/dsa-payouts?${q.toString()}` : '/api/dsa-payouts';
  const res = await api.get<{ records: Array<DsaPayoutSubmission & { _id?: string }> }>(path);
  return (res.records || []).map((r) => ({
    ...r,
    id: String(r.id || r._id || ''),
  }));
}
export async function saveDsaPayout(record: DsaPayoutSubmission): Promise<void> {
  await api.post<{ record: unknown }>('/api/dsa-payouts', record);
}
export async function fetchPendingPayouts(): Promise<DsaPayoutSubmission[]> {
  const res = await api.get<{ records: Array<DsaPayoutSubmission & { _id?: string }> }>(
    '/api/dsa-payouts?status=PENDING',
  );
  return (res.records || []).map((r) => ({
    ...r,
    id: String(r.id || r._id || ''),
  }));
}
export async function updatePayoutStatusById(id: string, status: string, note = ''): Promise<void> {
  await api.patch<{ record: unknown }>(`/api/dsa-payouts/${encodeURIComponent(id)}/status`, { status, note });
}

export async function updatePayoutFieldsById(
  id: string,
  fields: { currencyInr?: number; calculatedLimit?: number },
): Promise<void> {
  await api.patch<{ record: unknown }>(`/api/dsa-payouts/${encodeURIComponent(id)}/fields`, fields);
}
export async function approvePayoutById(id: string, note: string): Promise<void> {
  await updatePayoutStatusById(id, 'APPROVED', note);
}
export async function rejectPayoutById(id: string, reason: string): Promise<void> {
  await updatePayoutStatusById(id, 'REJECTED', reason);
}

// BGT Bank Accounts
const DEFAULT_BGT: BgtBankAccounts = {
  neft: { accountHolder: '', accountNumber: '', ifsc: '', bankName: '', branch: '' },
  qrEntries: [],
  wire: { swiftCode: '', iban: '', bankName: '', beneficiaryName: '', country: '' },
};
export async function fetchBgtBankAccounts(): Promise<BgtBankAccounts> {
  return loadOne<BgtBankAccounts>(BGT_BANK_KEY, DEFAULT_BGT);
}
export async function saveBgtBankAccounts(data: BgtBankAccounts): Promise<void> {
  persist(BGT_BANK_KEY, data);
}
