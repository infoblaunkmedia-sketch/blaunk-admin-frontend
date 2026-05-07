import type { Shareholder, CompanyProfile, Nominee } from './corporate.types';
import { logger } from '../../shared/utils/logger';

const SHAREHOLDERS_KEY = 'blaunk_shareholders';
const COMPANY_PROFILE_KEY = 'blaunk_company_profile';

function loadArr<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]; }
  catch { return []; }
}
function loadObj<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function persist(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Shareholders
export async function fetchShareholders(): Promise<Shareholder[]> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) return [];
  const token = sessionStorage.getItem('authToken');
  const res = await fetch(`${base}/api/shareholding?limit=1000`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  const json = (await res.json()) as { records: any[] };
  return (json.records || []).map(toShareholder);
}
export async function saveShareholder(sh: Shareholder): Promise<void> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) throw new Error('VITE_API_BASE_URL is not configured');
  const token = sessionStorage.getItem('authToken');
  const payload = toPayload(sh);
  const res = await fetch(`${base}/api/shareholding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    logger.error('saveShareholder failed', text);
    throw new Error(text || 'Failed to save shareholder');
  }
  await res.json().catch(() => ({}));
}
export async function deleteShareholder(pan: string): Promise<void> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) throw new Error('VITE_API_BASE_URL is not configured');
  const token = sessionStorage.getItem('authToken');
  const res = await fetch(`${base}/api/shareholding/${encodeURIComponent(pan)}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function fetchShareholderByPan(pan: string): Promise<{ record: Shareholder; credential?: unknown | null }> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) throw new Error('VITE_API_BASE_URL is not configured');
  const token = sessionStorage.getItem('authToken');
  const res = await fetch(`${base}/api/shareholding/${encodeURIComponent(pan)}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  const json = (await res.json()) as { record: any; credential?: any };
  return { record: toShareholder(json.record), credential: json.credential ?? null };
}

function toNominee(n: any): Nominee {
  return {
    name: String(n?.name || ''),
    mobile: String(n?.mobile || ''),
    relation: String(n?.relation || ''),
    percentage: n?.percentage == null ? '' : String(n.percentage),
    pan: String(n?.pan || ''),
  };
}

function toShareholder(r: any): Shareholder {
  return {
    id: String(r?._id || r?.id || r?.pan || crypto.randomUUID()),
    name: String(r?.name || ''),
    pan: String(r?.pan || ''),
    mobile: String(r?.mobile || ''),
    email: String(r?.email || ''),
    aadhaar: String(r?.aadhaar || ''),
    address: String(r?.address || ''),
    city: String(r?.city || ''),
    landmark: String(r?.landmark || ''),
    country: String(r?.country || ''),
    gender: String(r?.gender || ''),
    holdingPercent: r?.holdingPercent == null ? '' : String(r.holdingPercent),
    shareType: (r?.shareType || '') as any,
    faceValue: r?.faceValue == null ? '' : String(r.faceValue),
    numberOfShares: r?.numberOfShares == null ? '' : String(r.numberOfShares),
    mode: (r?.mode || '') as any,
    isinCode: String(r?.isinCode || ''),
    dpNumber: String(r?.dpNumber || ''),
    folioNumber: String(r?.folioNumber || ''),
    distinctiveFrom: String(r?.distinctiveFrom || ''),
    distinctiveTo: String(r?.distinctiveTo || ''),
    yearOfIssuance: String(r?.yearOfIssuance || ''),
    stakeholder: (r?.stakeholder || '') as any,
    dateOfAllotment: String(r?.dateOfAllotment || ''),
    remarks: (r?.remarks || '') as any,
    exitDate: String(r?.exitDate || ''),
    year: String(r?.year || ''),
    bankName: String(r?.bankName || ''),
    ifscCode: String(r?.ifscCode || ''),
    bankAccountNumber: String(r?.bankAccountNumber || ''),
    pledge: (r?.pledge || 'NA') as any,
    nominees: Array.isArray(r?.nominees) ? r.nominees.map(toNominee) : [],
  };
}

function toPayload(sh: Shareholder) {
  return {
    pan: String(sh.pan || '').trim().toUpperCase(),
    name: sh.name,
    mobile: sh.mobile,
    email: sh.email,
    aadhaar: sh.aadhaar,
    address: sh.address,
    city: sh.city,
    landmark: sh.landmark,
    country: sh.country,
    gender: sh.gender,
    holdingPercent: sh.holdingPercent ? Number(sh.holdingPercent) : undefined,
    shareType: sh.shareType || '',
    faceValue: sh.faceValue ? Number(sh.faceValue) : undefined,
    numberOfShares: sh.numberOfShares ? Number(sh.numberOfShares) : undefined,
    mode: sh.mode || '',
    isinCode: sh.isinCode,
    dpNumber: sh.dpNumber,
    folioNumber: sh.folioNumber,
    distinctiveFrom: sh.distinctiveFrom,
    distinctiveTo: sh.distinctiveTo,
    yearOfIssuance: sh.yearOfIssuance,
    stakeholder: sh.stakeholder || '',
    dateOfAllotment: sh.dateOfAllotment,
    remarks: sh.remarks || '',
    exitDate: sh.exitDate,
    year: sh.year,
    bankName: sh.bankName,
    ifscCode: sh.ifscCode,
    bankAccountNumber: sh.bankAccountNumber,
    pledge: sh.pledge || 'NA',
    nominees: (sh.nominees || []).map((n) => ({
      ...n,
      percentage: n.percentage ? Number(n.percentage) : undefined,
      pan: String(n.pan || '').trim().toUpperCase(),
    })),
  };
}

// Company Profile
const defaultProfile: CompanyProfile = {
  companyName: '', cin: '', pan: '', gstin: '',
  registeredAddress: '', correspondenceAddress: '',
  city: '', state: '', pincode: '', country: '',
  email: '', contactNumber: '', incorporationDate: '',
  authorizedSignatoryName: '', designation: '',
  logoUrl: '', signatureUrl: '',
};
export async function fetchCompanyProfile(): Promise<CompanyProfile> {
  return loadObj<CompanyProfile>(COMPANY_PROFILE_KEY, defaultProfile);
}
export async function saveCompanyProfile(profile: CompanyProfile): Promise<void> {
  persist(COMPANY_PROFILE_KEY, profile);
}
