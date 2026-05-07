import type { DsaRecord, VerifierRecord, VendorRecord, ThirdPartyCredential } from './channelPartners.types';

const DSA_KEY = 'blaunk_dsa';
const VERIFIER_KEY = 'blaunk_verifiers';
const VENDOR_KEY = 'blaunk_vendors';
const CRED_KEY = 'blaunk_3p_creds';

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function persist<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// DSA
export async function fetchDsaRecords(): Promise<DsaRecord[]> {
  return load<DsaRecord>(DSA_KEY);
}

export async function saveDsaRecord(record: DsaRecord): Promise<void> {
  const all = load<DsaRecord>(DSA_KEY);
  const idx = all.findIndex((r) => r.dsaCode === record.dsaCode);
  const now = new Date().toISOString();
  const updated = { ...record, createdAt: record.createdAt ?? now };
  if (idx >= 0) all[idx] = updated;
  else all.push(updated);
  persist(DSA_KEY, all);
}

export async function deleteDsaRecord(code: string): Promise<void> {
  persist(DSA_KEY, load<DsaRecord>(DSA_KEY).filter((r) => r.dsaCode !== code));
}

export async function generateDsaCode(existing: DsaRecord[]): Promise<string> {
  const codes = existing.map((r) => r.dsaCode).filter((c) => /^DSA\d+$/.test(c));
  const max = codes.reduce((acc, c) => Math.max(acc, parseInt(c.slice(3), 10)), 0);
  return `DSA${String(max + 1).padStart(4, '0')}`;
}

// Verifiers
export async function fetchVerifiers(): Promise<VerifierRecord[]> {
  return load<VerifierRecord>(VERIFIER_KEY);
}

export async function saveVerifier(record: VerifierRecord): Promise<void> {
  const all = load<VerifierRecord>(VERIFIER_KEY);
  const idx = all.findIndex((r) => r.verifierCode === record.verifierCode);
  const now = new Date().toISOString();
  const updated = { ...record, createdAt: record.createdAt ?? now };
  if (idx >= 0) all[idx] = updated;
  else all.push(updated);
  persist(VERIFIER_KEY, all);
}

export async function deleteVerifier(code: string): Promise<void> {
  persist(VERIFIER_KEY, load<VerifierRecord>(VERIFIER_KEY).filter((r) => r.verifierCode !== code));
}

export async function generateVerifierCode(existing: VerifierRecord[]): Promise<string> {
  const codes = existing.map((r) => r.verifierCode).filter((c) => /^VER\d+$/.test(c));
  const max = codes.reduce((acc, c) => Math.max(acc, parseInt(c.slice(3), 10)), 0);
  return `VER${String(max + 1).padStart(4, '0')}`;
}

// Vendors
export async function fetchVendors(): Promise<VendorRecord[]> {
  return load<VendorRecord>(VENDOR_KEY);
}

export async function saveVendor(record: VendorRecord): Promise<void> {
  const all = load<VendorRecord>(VENDOR_KEY);
  const idx = all.findIndex((r) => r.vendorCode === record.vendorCode);
  const now = new Date().toISOString();
  const updated = { ...record, createdAt: record.createdAt ?? now };
  if (idx >= 0) all[idx] = updated;
  else all.push(updated);
  persist(VENDOR_KEY, all);
}

export async function deleteVendor(code: string): Promise<void> {
  persist(VENDOR_KEY, load<VendorRecord>(VENDOR_KEY).filter((r) => r.vendorCode !== code));
}

export async function generateVendorCode(existing: VendorRecord[]): Promise<string> {
  const codes = existing.map((r) => r.vendorCode).filter((c) => /^VND\d+$/.test(c));
  const max = codes.reduce((acc, c) => Math.max(acc, parseInt(c.slice(3), 10)), 0);
  return `VND${String(max + 1).padStart(4, '0')}`;
}

// 3P Credentials
export async function fetchCredentials(): Promise<ThirdPartyCredential[]> {
  return load<ThirdPartyCredential>(CRED_KEY);
}

export async function saveCredential(record: ThirdPartyCredential): Promise<void> {
  const all = load<ThirdPartyCredential>(CRED_KEY);
  const idx = all.findIndex((r) => r.id === record.id);
  const now = new Date().toISOString();
  const updated = { ...record, createdAt: record.createdAt ?? now };
  if (idx >= 0) all[idx] = updated;
  else all.push(updated);
  persist(CRED_KEY, all);
}

export async function deleteCredential(id: string): Promise<void> {
  persist(CRED_KEY, load<ThirdPartyCredential>(CRED_KEY).filter((r) => r.id !== id));
}
