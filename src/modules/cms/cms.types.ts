export type ImageStatus = 'Active' | 'Inactive';
export type PageContentStatus = 'Active' | 'Inactive';

export interface CmsImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  sectionTag: string;
  uploadDate: string;
  status: ImageStatus;
  fileName: string;
  sizeKb: number;
}

export interface PageContentBlock {
  id: string;
  page: string;
  section: string;
  title: string;
  body: string;
  status: PageContentStatus;
  updatedAt: string;
  updatedBy: string;
}
