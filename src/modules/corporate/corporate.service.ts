import type { Shareholder, CompanyProfile, CompanyAddressBlock, Nominee } from './corporate.types';
import { logger } from '../../shared/utils/logger';
import { parseApiErrorBody } from '../../shared/utils/apiErrorMessage';

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
  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    throw new Error(parseApiErrorBody(t, res.status));
  }
  const json = (await res.json()) as { records: any[] };
  return (json.records || []).map(toShareholder);
}
export interface ShareholderByPanResponse {
  identity: Shareholder | null;
  record: Shareholder | null;
  history: Shareholder[];
  credential: unknown | null;
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
    throw new Error(parseApiErrorBody(text, res.status) || 'Failed to save shareholder');
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
  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    throw new Error(parseApiErrorBody(t, res.status));
  }
}

export async function deleteShareholdingHistory(pan: string, historyId: string): Promise<void> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) throw new Error('VITE_API_BASE_URL is not configured');
  const token = sessionStorage.getItem('authToken');
  const res = await fetch(
    `${base}/api/shareholding/${encodeURIComponent(pan)}/history/${encodeURIComponent(historyId)}`,
    {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    throw new Error(parseApiErrorBody(t, res.status));
  }
}

export async function fetchShareholderByPan(pan: string): Promise<ShareholderByPanResponse> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) throw new Error('VITE_API_BASE_URL is not configured');
  const token = sessionStorage.getItem('authToken');
  const res = await fetch(`${base}/api/shareholding/${encodeURIComponent(pan)}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    throw new Error(parseApiErrorBody(t, res.status));
  }
  const json = (await res.json()) as {
    shareholder?: any;
    record: any;
    history?: any[];
    credential?: any;
  };
  const history = Array.isArray(json.history) ? json.history.map((h) => toShareholder(h)) : [];
  const identity = json.shareholder ? toShareholder(json.shareholder) : null;
  return {
    identity,
    record: json.record ? toShareholder(json.record) : null,
    history,
    credential: json.credential ?? null,
  };
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
  const y = String(r?.year || '');
  const pk = String(r?.projectKey ?? '');
  const historyId =
    r.historyId != null
      ? String(r.historyId)
      : r.shareholder != null && r._id != null
        ? String(r._id)
        : undefined;
  return {
    id: String(r._id || r.id || r.pan || crypto.randomUUID()),
    historyId,
    historyCount: r?.historyCount != null ? Number(r.historyCount) : undefined,
    projectKey: pk === '_' ? '' : pk,
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
    dp: (String(r?.dp || '') as Shareholder['dp']) || '',
    beneficiaryDpId: String(r?.beneficiaryDpId || ''),
    folioNumber: String(r?.folioNumber || ''),
    certificateNumber: String(r?.certificateNumber || ''),
    distinctiveFrom: String(r?.distinctiveFrom || ''),
    distinctiveTo: String(r?.distinctiveTo || ''),
    yearOfIssuance: String(r?.yearOfIssuance || ''),
    stakeholder: (r?.stakeholder || '') as any,
    dateOfAllotment: String(r?.dateOfAllotment || ''),
    remarks: (r?.remarks || '') as any,
    exitDate: String(r?.exitDate || ''),
    year: y === '_' ? '' : y,
    bankName: String(r?.bankName || ''),
    ifscCode: String(r?.ifscCode || ''),
    bankAccountNumber: String(r?.bankAccountNumber || ''),
    bankCity: String(r?.bankCity || ''),
    bankCountry: String(r?.bankCountry || ''),
    pledge: String(r?.pledge || ''),
    shareStatus: String(r?.shareStatus || ''),
    nominees: Array.isArray(r?.nominees) ? r.nominees.map(toNominee) : [],
  };
}

function isMongoObjectId(value: string | undefined | null): boolean {
  if (!value) return false;
  return /^[a-f\d]{24}$/i.test(String(value).trim());
}

function toPayload(sh: Shareholder) {
  const historyId = isMongoObjectId(sh.historyId) ? String(sh.historyId).trim() : undefined;
  return {
    pan: String(sh.pan || '').trim().toUpperCase(),
    projectKey: String(sh.projectKey || '').trim(),
    historyId,
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
    dp: sh.dp || '',
    beneficiaryDpId: sh.beneficiaryDpId,
    folioNumber: sh.folioNumber,
    certificateNumber: sh.certificateNumber,
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
    bankCity: sh.bankCity,
    bankCountry: sh.bankCountry,
    pledge: sh.pledge || '',
    shareStatus: sh.shareStatus || '',
    nominees: (sh.nominees || []).map((n) => ({
      ...n,
      percentage: n.percentage ? Number(n.percentage) : undefined,
      pan: String(n.pan || '').trim().toUpperCase(),
    })),
  };
}

// Company Profile
const emptyAddress = (): CompanyAddressBlock => ({
  address: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
});

function normalizeAddressBlock(raw: Record<string, unknown> | undefined): CompanyAddressBlock {
  if (!raw || typeof raw !== 'object') return emptyAddress();
  const line1 = String(raw.line1 ?? '').trim();
  const line2 = String(raw.line2 ?? '').trim();
  const legacyAddress = String(raw.address ?? '').trim();
  const address =
    legacyAddress ||
    [line1, line2].filter(Boolean).join(line1 && line2 ? ', ' : '');
  return {
    address,
    city: String(raw.city ?? ''),
    state: String(raw.state ?? ''),
    country: String(raw.country ?? ''),
    pincode: String(raw.pincode ?? ''),
  };
}

const defaultProfile: CompanyProfile = {
  companyName: '',
  cin: '',
  pan: '',
  aadhaar: '',
  gstin: '',
  email: '',
  contactNumber: '',
  incorporationDate: '',
  authorizedSignatoryName: '',
  designation: '',
  registered: emptyAddress(),
  correspondence: emptyAddress(),
  logoUrl: '',
  signatureUrl: '',
};

function normalizeCompanyProfile(raw: Record<string, unknown>): CompanyProfile {
  const base = { ...defaultProfile, ...raw } as CompanyProfile & Record<string, unknown>;
  if (base.registered && base.correspondence) {
    return {
      ...defaultProfile,
      ...base,
      registered: normalizeAddressBlock(base.registered as Record<string, unknown>),
      correspondence: normalizeAddressBlock(base.correspondence as Record<string, unknown>),
    };
  }

  const legacyCity = String(raw.city ?? '');
  const legacyState = String(raw.state ?? '');
  const legacyCountry = String(raw.country ?? '');
  const legacyPincode = String(raw.pincode ?? '');

  return {
    companyName: String(raw.companyName ?? ''),
    cin: String(raw.cin ?? ''),
    pan: String(raw.pan ?? ''),
    aadhaar: String(raw.aadhaar ?? ''),
    gstin: String(raw.gstin ?? ''),
    email: String(raw.email ?? ''),
    contactNumber: String(raw.contactNumber ?? ''),
    incorporationDate: String(raw.incorporationDate ?? ''),
    authorizedSignatoryName: String(raw.authorizedSignatoryName ?? ''),
    designation: String(raw.designation ?? ''),
    registered: {
      address: String(raw.registeredAddress ?? ''),
      city: legacyCity,
      state: legacyState,
      country: legacyCountry,
      pincode: legacyPincode,
    },
    correspondence: {
      address: String(raw.correspondenceAddress ?? ''),
      city: '',
      state: '',
      country: '',
      pincode: '',
    },
    logoUrl: String(raw.logoUrl ?? ''),
    signatureUrl: String(raw.signatureUrl ?? ''),
  };
}

export async function fetchCompanyProfile(): Promise<CompanyProfile> {
  try {
    const raw = localStorage.getItem(COMPANY_PROFILE_KEY);
    if (!raw) return defaultProfile;
    return normalizeCompanyProfile(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return defaultProfile;
  }
}
export async function saveCompanyProfile(profile: CompanyProfile): Promise<void> {
  persist(COMPANY_PROFILE_KEY, profile);
}

export type ShareholdingMisExportResult = 'downloaded' | 'no-data';

export async function exportShareholdingMIS(params: {
  fromDate: string;
  toDate: string;
}): Promise<ShareholdingMisExportResult> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) throw new Error('VITE_API_BASE_URL is not configured');
  const token = sessionStorage.getItem('authToken');
  const res = await fetch(`${base}/api/shareholding/mis-export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      fromDate: params.fromDate,
      toDate: params.toDate,
      format: 'excel',
    }),
  });
  if (res.status === 404) {
    return 'no-data';
  }
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(parseApiErrorBody(text, res.status) || 'Failed to export MIS');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `MIS-Shareholding_${params.fromDate}_to_${params.toDate}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
