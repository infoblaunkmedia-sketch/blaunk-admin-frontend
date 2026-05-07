import type { CmsImage, PageContentBlock, ImageStatus, PageContentStatus } from './cms.types';

const IMAGES_KEY = 'blaunk_cms_images';
const PAGES_KEY = 'blaunk_cms_pages';

function loadArr<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]; }
  catch { return []; }
}
function persist(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Images
export async function fetchCmsImages(): Promise<CmsImage[]> {
  return loadArr<CmsImage>(IMAGES_KEY);
}
export async function saveCmsImage(image: CmsImage): Promise<void> {
  const all = loadArr<CmsImage>(IMAGES_KEY);
  const idx = all.findIndex((i) => i.id === image.id);
  if (idx >= 0) all[idx] = image; else all.push(image);
  persist(IMAGES_KEY, all);
}
export async function deleteCmsImage(id: string): Promise<void> {
  persist(IMAGES_KEY, loadArr<CmsImage>(IMAGES_KEY).filter((i) => i.id !== id));
}
export async function updateImageStatus(id: string, status: ImageStatus): Promise<void> {
  persist(IMAGES_KEY, loadArr<CmsImage>(IMAGES_KEY).map((i) => i.id === id ? { ...i, status } : i));
}

// Page Content
export async function fetchPageContent(): Promise<PageContentBlock[]> {
  return loadArr<PageContentBlock>(PAGES_KEY);
}
export async function savePageContent(block: PageContentBlock): Promise<void> {
  const all = loadArr<PageContentBlock>(PAGES_KEY);
  const idx = all.findIndex((b) => b.id === block.id);
  if (idx >= 0) all[idx] = block; else all.push(block);
  persist(PAGES_KEY, all);
}
export async function deletePageContent(id: string): Promise<void> {
  persist(PAGES_KEY, loadArr<PageContentBlock>(PAGES_KEY).filter((b) => b.id !== id));
}
export async function updatePageContentStatus(id: string, status: PageContentStatus): Promise<void> {
  persist(PAGES_KEY, loadArr<PageContentBlock>(PAGES_KEY).map((b) => b.id === id ? { ...b, status } : b));
}
