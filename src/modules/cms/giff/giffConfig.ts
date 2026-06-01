export type GiffCategoryId =
  | 'home-page-cake-giff'
  | 'connect-page-giff'
  | 'boutique-page-giff'
  | 'bgt-home-page-giff'
  | 'dial-home-page-hotel-giff'
  | 'dial-home-page-boutique'
  | 'hotel-home-page-giff'
  | 'hotel-page-wedding-giff'
  | 'bgt-view-more-giff';

export type GiffCategoryConfig = {
  id: GiffCategoryId;
  label: string;
  maxRecords: number;
};

export const GIFF_CATEGORIES: GiffCategoryConfig[] = [
  { id: 'home-page-cake-giff', label: 'HOME PAGE CAKE - GIFF', maxRecords: 2 },
  { id: 'bgt-view-more-giff', label: 'BGT VIEW MORE - GIFF', maxRecords: 2 },
  { id: 'connect-page-giff', label: 'CONNECT PAGE - GIFF', maxRecords: 2 },
  { id: 'boutique-page-giff', label: 'BOUTIQUE PAGE - GIFF', maxRecords: 1 },
  { id: 'bgt-home-page-giff', label: 'BGT HOME PAGE - GIFF', maxRecords: 1 },
  { id: 'dial-home-page-hotel-giff', label: 'DIAL HOME PAGE - HOTEL GIFF', maxRecords: 2 },
  { id: 'dial-home-page-boutique', label: 'DIAL HOME PAGE - BOUTIQUE', maxRecords: 1 },
  { id: 'hotel-home-page-giff', label: 'HOTEL HOME PAGE - GIFF', maxRecords: 1 },
  { id: 'hotel-page-wedding-giff', label: 'HOTEL PAGE WEDDING - GIFF', maxRecords: 1 },
];

export const GIFF_ASPECT = 2 / 1;
export const GIFF_ASPECT_LABEL = '2:1';

export function getGiffCategory(id: string): GiffCategoryConfig {
  return GIFF_CATEGORIES.find((c) => c.id === id) ?? GIFF_CATEGORIES[0];
}

export function canAddGiffForCategory(categoryId: string, existingCount: number): boolean {
  const max = getGiffCategory(categoryId).maxRecords;
  return existingCount < max;
}
