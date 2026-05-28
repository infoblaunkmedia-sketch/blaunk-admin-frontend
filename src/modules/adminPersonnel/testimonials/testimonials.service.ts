import { api } from '../../../shared/services/apiService';
import { parseApiErrorBody } from '../../../shared/utils/apiErrorMessage';
import type { Testimonial, TestimonialPayload } from './testimonials.types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

function authHeaders(): HeadersInit {
  const token = sessionStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const res = await api.get<{ records: Testimonial[] }>('/api/testimonials');
  return res.records || [];
}

export async function createTestimonial(payload: TestimonialPayload): Promise<Testimonial> {
  const res = await api.post<{ record: Testimonial }>('/api/testimonials', payload);
  return res.record;
}

export async function updateTestimonial(
  id: string,
  payload: Partial<TestimonialPayload>,
): Promise<Testimonial> {
  const res = await api.put<{ record: Testimonial }>(`/api/testimonials/${encodeURIComponent(id)}`, payload);
  return res.record;
}

export async function deleteTestimonial(id: string): Promise<void> {
  await api.delete(`/api/testimonials/${encodeURIComponent(id)}`);
}

export async function uploadTestimonialPhoto(file: File): Promise<string> {
  if (!API_BASE) throw new Error('VITE_API_BASE_URL is not configured');

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE.replace(/\/$/, '')}/api/upload/testimonial-photo`, {
    method: 'POST',
    headers: authHeaders(),
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(parseApiErrorBody(text, res.status));
  }

  const json = (await res.json()) as { url?: string };
  if (!json.url) throw new Error('Upload failed');
  return String(json.url);
}
