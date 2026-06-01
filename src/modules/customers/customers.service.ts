import { api } from '../../shared/services/apiService';
import type { Individual, CustomerIssue, CustomerReview, CustomerStatus, ReviewStatus } from './customers.types';

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

type IssueDto = {
  id: string;
  rnNumber?: string;
  customerName?: string;
  customerId?: string;
  article?: string;
  issueType?: string;
  vendorName?: string;
  vendorResponse?: string;
  penaltyAmount?: number;
  status?: CustomerIssue['status'];
  country?: string;
  raisedDate?: string;
  resolvedDate?: string;
};

type ReviewDto = {
  id: string;
  reviewerName?: string;
  product?: string;
  rating?: number;
  reviewText?: string;
  date?: string;
  status?: ReviewStatus;
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

function mapIssue(dto: IssueDto): CustomerIssue {
  return {
    id: dto.id,
    rnNumber: dto.rnNumber || '',
    customerName: dto.customerName || '',
    customerId: dto.customerId || '',
    article: dto.article || '',
    issueType: dto.issueType || '',
    vendorName: dto.vendorName || '',
    vendorResponse: dto.vendorResponse || '',
    penaltyAmount: Number(dto.penaltyAmount || 0),
    status: (dto.status as CustomerIssue['status']) || 'Pending',
    country: dto.country || '',
    raisedDate: dto.raisedDate || '',
    resolvedDate: dto.resolvedDate || '',
  };
}

function mapReview(dto: ReviewDto): CustomerReview {
  return {
    id: dto.id,
    reviewerName: dto.reviewerName || '',
    product: dto.product || '',
    rating: Number(dto.rating || 0),
    reviewText: dto.reviewText || '',
    date: dto.date || '',
    status: (dto.status as ReviewStatus) || 'Published',
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

export async function fetchIssues(): Promise<CustomerIssue[]> {
  const res = await api.get<{ records: IssueDto[] }>('/api/issues');
  return (res.records || []).map(mapIssue);
}

export async function saveIssue(issue: CustomerIssue): Promise<void> {
  const body = {
    ...(issue.id && /^[a-f\d]{24}$/i.test(issue.id) ? { id: issue.id } : {}),
    rnNumber: issue.rnNumber,
    customerName: issue.customerName,
    customerId: issue.customerId,
    article: issue.article,
    issueType: issue.issueType,
    vendorName: issue.vendorName,
    vendorResponse: issue.vendorResponse,
    penaltyAmount: issue.penaltyAmount,
    status: issue.status,
    country: issue.country,
    raisedDate: issue.raisedDate,
    resolvedDate: issue.resolvedDate || undefined,
  };
  await api.post<{ record: IssueDto }>('/api/issues', body);
}

export async function deleteIssue(id: string): Promise<void> {
  await api.delete(`/api/issues/${encodeURIComponent(id)}`);
}

export async function fetchReviews(): Promise<CustomerReview[]> {
  const res = await api.get<{ records: ReviewDto[] }>('/api/reviews');
  return (res.records || []).map(mapReview);
}

export async function updateReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  await api.patch<{ record: ReviewDto }>(`/api/reviews/${encodeURIComponent(id)}`, { status });
}
