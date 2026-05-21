import { api } from '../../shared/services/apiService';
import type {
  MatchDoeEntry,
  Contest,
  MediaAdSubmission,
  DsaSlider,
  SliderStatus,
  MediaSlotTabConfig,
  DsaSlotStatus,
  DsaPayoutHistory,
} from './marketing.types';

const CONTESTS_KEY = 'blaunk_contests';
const MEDIA_ADS_KEY = 'blaunk_media_ads';

function loadArr<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]; }
  catch { return []; }
}
function persist(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Match Doe
export async function fetchMatchDoeHistory(): Promise<MatchDoeEntry[]> {
  const res = await api.get<{ entries: Array<{ _id?: string; code?: string; generatedBy?: string; generatedAt?: string; createdAt?: string; isActive?: boolean }> }>('/api/match-code/history');
  return (res.entries || []).map((e) => ({
    id: String(e._id || crypto.randomUUID()),
    code: String(e.code || ''),
    generatedAt: String(e.generatedAt || e.createdAt || ''),
    generatedBy: String(e.generatedBy || ''),
    isActive: !!e.isActive,
  }));
}
export async function getActiveMatchDoe(): Promise<MatchDoeEntry | null> {
  const res = await api.get<{ entry?: { _id?: string; code?: string; generatedBy?: string; generatedAt?: string; createdAt?: string; isActive?: boolean } | null }>('/api/match-code/active');
  const e = res.entry;
  if (!e) return null;
  return {
    id: String(e._id || crypto.randomUUID()),
    code: String(e.code || ''),
    generatedAt: String(e.generatedAt || e.createdAt || ''),
    generatedBy: String(e.generatedBy || ''),
    isActive: !!e.isActive,
  };
}
export async function generateNewMatchDoe(generatedBy: string): Promise<MatchDoeEntry> {
  const res = await api.post<{ entry: { _id?: string; code?: string; generatedBy?: string; generatedAt?: string; createdAt?: string; isActive?: boolean } }>('/api/match-code/generate', { generatedBy });
  const e = res.entry;
  return {
    id: String(e._id || crypto.randomUUID()),
    code: String(e.code || ''),
    generatedAt: String(e.generatedAt || e.createdAt || ''),
    generatedBy: String(e.generatedBy || generatedBy),
    isActive: !!e.isActive,
  };
}
export async function validateMatchDoe(code: string): Promise<boolean> {
  const q = new URLSearchParams();
  q.set('code', code);
  const res = await api.get<{ valid?: boolean }>(`/api/match-code/validate?${q.toString()}`);
  return !!res.valid;
}

// Contests
export async function fetchContests(): Promise<Contest[]> {
  return loadArr<Contest>(CONTESTS_KEY);
}
export async function saveContest(contest: Contest): Promise<void> {
  const all = loadArr<Contest>(CONTESTS_KEY);
  const idx = all.findIndex((c) => c.id === contest.id);
  if (idx >= 0) all[idx] = contest; else all.push(contest);
  persist(CONTESTS_KEY, all);
}
export async function deleteContest(id: string): Promise<void> {
  persist(CONTESTS_KEY, loadArr<Contest>(CONTESTS_KEY).filter((c) => c.id !== id));
}

// Media Ads (read-only — DSA portal writes, admin reads)
export async function fetchMediaAds(): Promise<MediaAdSubmission[]> {
  return loadArr<MediaAdSubmission>(MEDIA_ADS_KEY);
}

type SliderDto = {
  _id: string;
  mediaTab: string;
  imageUrl: string;
  section: string;
  country: string;
  category?: string;
  plan: string;
  productId: string;
  matchCode?: string;
  planCharge: number;
  luxuryFees: number;
  discount: number;
  toPay: number;
  dsaCode?: string;
  status: SliderStatus;
  uploadDate?: string | null;
  expiryDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function mapSlider(dto: SliderDto): DsaSlider {
  return {
    id: dto._id,
    mediaTab: dto.mediaTab,
    imageUrl: dto.imageUrl,
    section: dto.section,
    country: dto.country,
    category: String(dto.category || ''),
    plan: dto.plan,
    productId: dto.productId,
    matchCode: String(dto.matchCode || ''),
    planCharge: Number(dto.planCharge || 0),
    luxuryFees: Number(dto.luxuryFees || 0),
    discount: Number(dto.discount || 0),
    toPay: Number(dto.toPay || 0),
    dsaCode: dto.dsaCode,
    status: dto.status,
    uploadDate: dto.uploadDate ?? null,
    expiryDate: dto.expiryDate ?? null,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export async function fetchDsaSliders(filters?: { mediaTab?: string; section?: string; country?: string; status?: SliderStatus | ''; q?: string }) {
  const params = new URLSearchParams();
  if (filters?.mediaTab) params.set('mediaTab', filters.mediaTab);
  if (filters?.section) params.set('section', filters.section);
  if (filters?.country) params.set('country', filters.country);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.q) params.set('q', filters.q);
  const query = params.toString();
  const path = query ? `/api/dsa-sliders?${query}` : '/api/dsa-sliders';
  const res = await api.get<{ records: SliderDto[] }>(path);
  return (res.records || []).map(mapSlider);
}

export async function createDsaSlider(payload: Omit<DsaSlider, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) {
  const res = await api.post<{ record: SliderDto }>('/api/dsa-sliders', payload);
  return mapSlider(res.record);
}

export async function updateDsaSlider(
  id: string,
  payload: Omit<DsaSlider, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>,
) {
  const res = await api.put<{ record: SliderDto }>(`/api/dsa-sliders/${encodeURIComponent(id)}`, payload);
  return mapSlider(res.record);
}

export async function deleteDsaSlider(id: string) {
  await api.delete(`/api/dsa-sliders/${encodeURIComponent(id)}`);
}

export async function fetchPublicSlidersBySlot(params?: { mediaTab?: string; section?: string; country?: string }) {
  const q = new URLSearchParams();
  if (params?.mediaTab) q.set('mediaTab', params.mediaTab);
  if (params?.section) q.set('section', params.section);
  if (params?.country) q.set('country', params.country);
  const path = q.toString() ? `/api/dsa-sliders/public?${q.toString()}` : '/api/dsa-sliders/public';
  const res = await api.get<{ records: SliderDto[] }>(path);
  return (res.records || []).map(mapSlider);
}

export async function fetchSliderSummary(params?: { mediaTab?: string; section?: string; country?: string; dsaCode?: string }) {
  const q = new URLSearchParams();
  if (params?.mediaTab) q.set('mediaTab', params.mediaTab);
  if (params?.section) q.set('section', params.section);
  if (params?.country) q.set('country', params.country);
  if (params?.dsaCode) q.set('dsaCode', params.dsaCode);
  const path = q.toString() ? `/api/dsa-sliders/summary?${q.toString()}` : '/api/dsa-sliders/summary';
  const res = await api.get<{ summary: { totalMargin: number; marginUsed: number; availableMargin: number } }>(path);
  return res.summary;
}

export async function fetchDsaSlotStatus(params: { mediaTab: string; section: string; country: string }): Promise<DsaSlotStatus> {
  const q = new URLSearchParams();
  q.set('mediaTab', params.mediaTab);
  q.set('section', params.section);
  q.set('country', params.country);
  const res = await api.get<{ status: DsaSlotStatus }>(`/api/dsa-sliders/slot-status?${q.toString()}`);
  return res.status;
}

type DsaPayoutDto = {
  _id: string;
  dsaCode?: string;
  dsaName?: string;
  mode?: string;
  submittedAmount?: number;
  currency?: string;
  currencyInr?: number;
  calculatedLimit?: number;
  status?: string;
  submissionDate?: string;
  approvalNote?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  createdAt?: string;
};

export async function fetchDsaPayoutHistory(params?: { dsaCode?: string; status?: string }) {
  const q = new URLSearchParams();
  if (params?.dsaCode) q.set('dsaCode', params.dsaCode);
  if (params?.status) q.set('status', params.status);
  const path = q.toString() ? `/api/dsa-payouts?${q.toString()}` : '/api/dsa-payouts';
  const res = await api.get<{ records: DsaPayoutDto[] }>(path);
  return (res.records || []).map((r): DsaPayoutHistory => ({
    id: String(r._id || ''),
    dsaCode: String(r.dsaCode || ''),
    dsaName: String(r.dsaName || ''),
    mode: String(r.mode || ''),
    submittedAmount: Number(r.submittedAmount || 0),
    currency: String(r.currency || ''),
    currencyInr: Number(r.currencyInr || 0),
    calculatedLimit: Number(r.calculatedLimit || 0),
    status: String(r.status || 'PENDING'),
    submissionDate: String(r.submissionDate || ''),
    approvalNote: String(r.approvalNote || ''),
    rejectionReason: String(r.rejectionReason || ''),
    approvedBy: String(r.approvedBy || ''),
    approvedAt: String(r.approvedAt || ''),
    rejectedBy: String(r.rejectedBy || ''),
    rejectedAt: String(r.rejectedAt || ''),
    createdAt: r.createdAt,
  }));
}

export async function fetchMediaSlotConfigs(): Promise<MediaSlotTabConfig[]> {
  const res = await api.get<{ configs: MediaSlotTabConfig[] }>('/api/media-slot-config');
  return res.configs || [];
}

export async function saveMediaSlotConfigs(configs: MediaSlotTabConfig[]): Promise<MediaSlotTabConfig[]> {
  const res = await api.put<{ configs: MediaSlotTabConfig[] }>('/api/media-slot-config', { configs });
  return res.configs || [];
}
