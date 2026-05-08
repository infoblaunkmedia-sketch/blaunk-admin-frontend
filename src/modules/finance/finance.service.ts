import type {
  B2BPayment, DsaPayoutSubmission, BgtBankAccounts,
  NeftAccount, WireAccount, QrEntry,
} from './finance.types';

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
export async function fetchDsaPayouts(): Promise<DsaPayoutSubmission[]> {
  return load<DsaPayoutSubmission>(DSA_PAYOUTS_KEY);
}
export async function saveDsaPayout(record: DsaPayoutSubmission): Promise<void> {
  const all = load<DsaPayoutSubmission>(DSA_PAYOUTS_KEY);
  const idx = all.findIndex((r) => r.id === record.id);
  if (idx >= 0) all[idx] = record; else all.push(record);
  persist(DSA_PAYOUTS_KEY, all);
}
export async function fetchPendingPayouts(): Promise<DsaPayoutSubmission[]> {
  return (await fetchDsaPayouts()).filter((r) => r.status === 'PENDING_APPROVAL');
}
export async function approvePayoutById(id: string, note: string): Promise<void> {
  const all = load<DsaPayoutSubmission>(DSA_PAYOUTS_KEY);
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) return;
  const rec = all[idx];
  all[idx] = {
    ...rec,
    status: 'APPROVED',
    approvalNote: note,
    availableBalance:
      (rec.newAmount ?? 0) + (rec.bodBalance ?? 0) - (rec.usedValue ?? 0),
  };
  persist(DSA_PAYOUTS_KEY, all);
}
export async function rejectPayoutById(id: string, reason: string): Promise<void> {
  const all = load<DsaPayoutSubmission>(DSA_PAYOUTS_KEY);
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) return;
  all[idx] = { ...all[idx], status: 'REJECTED', rejectionReason: reason };
  persist(DSA_PAYOUTS_KEY, all);
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
