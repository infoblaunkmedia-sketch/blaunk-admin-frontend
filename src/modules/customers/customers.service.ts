import type { Individual, CustomerIssue, CustomerReview, CustomerStatus, ReviewStatus } from './customers.types';

const INDIVIDUALS_KEY = 'blaunk_individuals';
const ISSUES_KEY = 'blaunk_customer_issues';
const REVIEWS_KEY = 'blaunk_customer_reviews';

function loadArr<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]; }
  catch { return []; }
}
function persist(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Individuals
export async function fetchIndividuals(): Promise<Individual[]> {
  return loadArr<Individual>(INDIVIDUALS_KEY);
}
export async function updateIndividualStatus(id: string, accountStatus: CustomerStatus): Promise<void> {
  const all = loadArr<Individual>(INDIVIDUALS_KEY).map((i) =>
    i.id === id ? { ...i, accountStatus } : i,
  );
  persist(INDIVIDUALS_KEY, all);
}
export async function updateIndividualNotes(id: string, internalNotes: string): Promise<void> {
  const all = loadArr<Individual>(INDIVIDUALS_KEY).map((i) =>
    i.id === id ? { ...i, internalNotes } : i,
  );
  persist(INDIVIDUALS_KEY, all);
}

// Issues
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

// Reviews
export async function fetchReviews(): Promise<CustomerReview[]> {
  return loadArr<CustomerReview>(REVIEWS_KEY);
}
export async function updateReviewStatus(id: string, status: ReviewStatus): Promise<void> {
  const all = loadArr<CustomerReview>(REVIEWS_KEY).map((r) =>
    r.id === id ? { ...r, status } : r,
  );
  persist(REVIEWS_KEY, all);
}
