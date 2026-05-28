import { api } from '../../shared/services/apiService';

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image: string;
  sortOrder: number;
  isActive: boolean;
  children: CategoryNode[];
};

export async function fetchCategories() {
  const res = await api.get<{ categories: CategoryNode[] }>('/api/categories');
  return res.categories || [];
}

export async function createCategory(body: Partial<CategoryNode>) {
  const res = await api.post<{ record: CategoryNode }>('/api/categories', body);
  return res.record;
}

export async function updateCategory(id: string, body: Partial<CategoryNode>) {
  const res = await api.patch<{ record: CategoryNode }>(`/api/categories/${encodeURIComponent(id)}`, body);
  return res.record;
}

export async function deleteCategory(id: string) {
  await api.delete(`/api/categories/${encodeURIComponent(id)}`);
}
