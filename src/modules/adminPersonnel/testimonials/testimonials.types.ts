export const TESTIMONIAL_OCCUPATIONS = [
  'owner',
  'manager',
  'founder',
  'retailer',
  'trader',
  'exporter',
  'wholesaler',
  'director',
] as const;

export type TestimonialOccupation = (typeof TESTIMONIAL_OCCUPATIONS)[number];

export const OCCUPATION_LABELS: Record<TestimonialOccupation, string> = {
  owner: 'Owner',
  manager: 'Manager',
  founder: 'Founder',
  retailer: 'Retailer',
  trader: 'Trader',
  exporter: 'Exporter',
  wholesaler: 'Wholesaler',
  director: 'Director',
};

export type Testimonial = {
  id: string;
  name: string;
  occupation: TestimonialOccupation;
  country: string;
  rating: number;
  description: string;
  profilePhotoUrl: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TestimonialPayload = {
  name: string;
  occupation: TestimonialOccupation;
  country: string;
  rating: number;
  description: string;
  profilePhotoUrl: string;
  isActive: boolean;
};

export const DESCRIPTION_MAX = 70;

export const emptyTestimonial = (): TestimonialPayload => ({
  name: '',
  occupation: 'owner',
  country: '',
  rating: 5,
  description: '',
  profilePhotoUrl: '',
  isActive: true,
});
