import { api } from '../../shared/services/apiService';
import type { Individual, CustomerIssue, CustomerReview, CustomerStatus, ReviewStatus } from './customers.types';

const ISSUES_KEY = 'blaunk_customer_issues';
const REVIEWS_KEY = 'blaunk_customer_reviews';

type IndividualDto = {
  id: string;
  customerId?: string;
  fullName: string;
  email: string;
  mobile: string;
  country: string;
  registrationDate: string;
  accountStatus: CustomerStatus;
  lastLoginDate: string;
  totalOrders: number;
  internalNotes: string;
};

function mapIndividual(dto: IndividualDto): Individual {
  return {
    id: dto.id,
    customerId: dto.customerId || dto.id,
    fullName: dto.fullName,
    email: dto.email,
    mobile: dto.mobile,
    country: dto.country,
    registrationDate: dto.registrationDate,
    accountStatus: dto.accountStatus,
    lastLoginDate: dto.lastLoginDate,
    totalOrders: dto.totalOrders,
    internalNotes: dto.internalNotes,
  };
}

export type IndividualsListParams = {
  q?: string;
  status?: CustomerStatus | '';
  page?: number;
  limit?: number;
};

export type IndividualsListResult = {
  records: Individual[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export async function fetchIndividuals(params: IndividualsListParams = {}): Promise<IndividualsListResult> {
  const q = new URLSearchParams();
  if (params.q) q.set('q', params.q);
  if (params.status) q.set('status', params.status);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  const path = q.toString() ? `/api/users?${q.toString()}` : '/api/users';
  const res = await api.get<{ records: IndividualDto[]; pagination: IndividualsListResult['pagination'] }>(path);
  return {
    records: (res.records || []).map(mapIndividual),
    pagination: res.pagination,
  };
}

export async function fetchIndividualById(id: string): Promise<Individual> {
  const res = await api.get<{ record: IndividualDto }>(`/api/users/${encodeURIComponent(id)}`);
  return mapIndividual(res.record);
}

export async function updateIndividualStatus(id: string, accountStatus: CustomerStatus): Promise<Individual> {
  const res = await api.patch<{ record: IndividualDto }>(
    `/api/users/${encodeURIComponent(id)}/status`,
    { accountStatus },
  );
  return mapIndividual(res.record);
}

export async function updateIndividualNotes(id: string, internalNotes: string): Promise<Individual> {
  const res = await api.patch<{ record: IndividualDto }>(
    `/api/users/${encodeURIComponent(id)}/status`,
    { internalNotes },
  );
  return mapIndividual(res.record);
}

/** Status + notes in one request (preferred for profile save). */
export async function updateIndividualProfile(
  id: string,
  patch: { accountStatus: CustomerStatus; internalNotes: string },
): Promise<Individual> {
  const res = await api.patch<{ record: IndividualDto }>(
    `/api/users/${encodeURIComponent(id)}/status`,
    patch,
  );
  return mapIndividual(res.record);
}

// Issues (localStorage until API exists)
function loadArr<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]; }
  catch { return []; }
}
function persist(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export async function fetchIssues(): Promise<CustomerIssue[]> {
  return loadArr<CustomerIssue>(ISSUES_KEY);
}
export async function saveIssue(issue: CustomerIssue): Promise<void> {
  const all = loadArr<CustomerIssue>(ISSUES_KEY);
  const idx = all.findIndex((i) => i.id === issue.id);
  if (idx >= 0) all[idx] = issue; else all.push(issue);
  persist(ISSUES_KEY, all);
}
export async function deleteIssue(id: string): Promise<void> {
  persist(ISSUES_KEY, loadArr<CustomerIssue>(ISSUES_KEY).filter((i) => i.id !== id));
}

// Reviews (localStorage until API exists)
export async function fetchReviews(): Promise<CustomerReview[]> {
  return loadArr<CustomerReview>(REVIEWS_KEY);
}
export async function updateReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  const all = loadArr<CustomerReview>(REVIEWS_KEY).map((r) =>
    r.id === id ? { ...r, status } : r,
  );
  persist(REVIEWS_KEY, all);
}
