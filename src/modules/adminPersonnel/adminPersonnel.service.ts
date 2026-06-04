import { api } from '../../shared/services/apiService';
import { parseApiErrorBody } from '../../shared/utils/apiErrorMessage';
import { slotStorageKey, type MediaSectionId } from './media/mediaConfig';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export type SiteMediaRecord = {
  id: string;
  section: MediaSectionId;
  slot: number;
  kind: 'image' | 'url';
  value: string;
  fileName?: string;
  title?: string;
  updatedAt?: string;
};

function authHeaders(): HeadersInit {
  const token = sessionStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchSiteMediaAssets(): Promise<SiteMediaRecord[]> {
  const res = await api.get<{ records: SiteMediaRecord[] }>('/api/admin-personnel/media');
  return res.records || [];
}

export async function saveSiteMediaSlot(payload: {
  section: MediaSectionId;
  slot: number;
  kind: 'image' | 'url';
  value: string;
  fileName?: string;
  title?: string;
}): Promise<SiteMediaRecord> {
  const res = await api.put<{ record: SiteMediaRecord }>('/api/admin-personnel/media/slots', payload);
  return res.record;
}

export async function deleteSiteMediaSlot(payload: {
  section: MediaSectionId;
  slot: number;
}): Promise<void> {
  await api.delete('/api/admin-personnel/media/slots', payload);
}

export type ContestQuizForm = {
  question: string;
  options: string[];
  validUntil: string;
};

export type ContestQuizAdmin =
  | { exists: false }
  | {
      exists: true;
      key: string;
      question: string;
      options: string[];
      validUntil: string;
      deadlinePreview: string;
    };

export type ContestSubmissionRow = {
  id: string;
  participantName: string;
  participantEmail: string;
  username: string;
  answerText: string;
  optionIndex: number;
  submittedAt: string;
};

export async function fetchContestQuiz(): Promise<ContestQuizAdmin> {
  const res = await api.get<{ quiz: ContestQuizAdmin }>('/api/contest-quiz');
  return res.quiz;
}

export async function saveContestQuiz(payload: ContestQuizForm): Promise<ContestQuizAdmin> {
  const res = await api.put<{ quiz: ContestQuizAdmin }>('/api/contest-quiz', payload);
  return res.quiz;
}

export async function deleteContestQuiz(): Promise<ContestQuizAdmin> {
  const res = await api.delete<{ quiz: ContestQuizAdmin }>('/api/contest-quiz');
  return res.quiz;
}

export async function fetchContestSubmissions(): Promise<ContestSubmissionRow[]> {
  const res = await api.get<{ records: ContestSubmissionRow[]; total: number }>(
    '/api/contest-quiz/submissions',
  );
  return res.records || [];
}

export function recordsToSlotMaps(records: SiteMediaRecord[]) {
  const imageSlots: Record<
    string,
    { previewUrl: string; cloudinaryUrl: string; fileName?: string; title?: string }
  > = {};
  const socialUrls: Record<string, string> = {};

  for (const row of records) {
    if (!row.value?.trim()) continue;
    const key = slotStorageKey(row.section, row.slot);
    if (row.kind === 'url') {
      socialUrls[key] = row.value;
    } else {
      imageSlots[key] = {
        previewUrl: row.value,
        cloudinaryUrl: row.value,
        fileName: row.fileName,
        title: row.title,
      };
    }
  }

  return { imageSlots, socialUrls };
}

export async function uploadMediaImage(
  file: File,
  params: { section: MediaSectionId; slot: number; title?: string },
): Promise<string> {
  if (!API_BASE) throw new Error('VITE_API_BASE_URL is not configured');

  const payload = new FormData();
  payload.append('image', file);
  payload.append('section', params.section);
  payload.append('slot', String(params.slot));
  if (params.title != null) payload.append('title', params.title);

  const res = await fetch(`${API_BASE}/api/upload/cloudinary`, {
    method: 'POST',
    headers: authHeaders(),
    body: payload,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(parseApiErrorBody(text, res.status));
  }

  const json = (await res.json()) as { url?: string };
  if (!json.url) throw new Error('Upload failed');
  return String(json.url);
}
