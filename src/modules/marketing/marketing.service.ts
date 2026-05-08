import { api } from '../../shared/services/apiService';
import type { MatchDoeEntry, Contest, MediaAdSubmission, DsaSlider, SliderStatus } from './marketing.types';

const MATCH_DOE_KEY = 'blaunk_match_doe';
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
  return loadArr<MatchDoeEntry>(MATCH_DOE_KEY);
}
export async function getActiveMatchDoe(): Promise<MatchDoeEntry | null> {
  const all = loadArr<MatchDoeEntry>(MATCH_DOE_KEY);
  return all.find((e) => e.isActive) ?? null;
}
export async function generateNewMatchDoe(generatedBy: string): Promise<MatchDoeEntry> {
  const code = String(Math.floor(10000 + Math.random() * 90000));
  const all = loadArr<MatchDoeEntry>(MATCH_DOE_KEY).map((e) => ({ ...e, isActive: false }));
  const entry: MatchDoeEntry = {
    id: crypto.randomUUID(),
    code,
    generatedAt: new Date().toISOString(),
    generatedBy,
    isActive: true,
  };
  all.unshift(entry);
  persist(MATCH_DOE_KEY, all);
  return entry;
}
export async function validateMatchDoe(code: string): Promise<boolean> {
  const active = await getActiveMatchDoe();
  return active?.code === code;
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
  plan: string;
  productId: string;
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
    plan: dto.plan,
    productId: dto.productId,
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
