export type MediaAdStatus = 'Pending Review' | 'Approved' | 'Rejected';
export type ContestStatus = 'Draft' | 'Active' | 'Ended';
export type SliderStatus = 'Draft' | 'Active' | 'Inactive';

export interface MediaAdSubmission {
  id: string;
  sectionName: string;
  platform: string;
  slotLimit: number;
  slotsFilled: number;
  slotsRemaining: number;
  submittedBy: string;
  submissionDate: string;
  status: MediaAdStatus;
  imageUrl?: string;
}

export interface MatchDoeEntry {
  id: string;
  code: string;
  generatedAt: string;
  generatedBy: string;
  isActive: boolean;
}

export interface Contest {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  prize: string;
  eligibilityCriteria: string;
  status: ContestStatus;
}

export interface DsaSlider {
  id: string;
  mediaTab: string;
  imageUrl: string;
  section: string;
  country: string;
  plan: string;
  productId: string;
  planCharge: number;
  luxuryFees: number;
  discount: number;
  toPay: number;
  dsaCode?: string;
  status: SliderStatus;
  uploadDate?: string | null;
  expiryDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
