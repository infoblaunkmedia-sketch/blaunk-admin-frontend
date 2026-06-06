export type MediaAdStatus = 'Pending Review' | 'Approved' | 'Rejected';
export type ContestStatus = 'Draft' | 'Active' | 'Ended';
export type SliderStatus = 'Draft' | 'Active' | 'Inactive';
export type AdUploadSource = 'vendor_direct' | 'admin_3p';

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

export interface DsaSlotStatus {
  mediaTab: string;
  cmsPage: string;
  cmsPosition: string;
  pageLabel?: string;
  slotLabel?: string;
  /** Legacy section code; prefer cmsPage + cmsPosition */
  section: string;
  country: string;
  maxSlots: number;
  usedSlots: number;
}

export interface DsaSlider {
  id: string;
  mediaTab: string;
  imageUrl: string;
  cmsPage: string;
  cmsPosition: string;
  /** Legacy; synced from placement */
  section: string;
  country: string;
  category: string;
  plan: string;
  productId: string;
  matchCode: string;
  planCharge: number;
  luxuryFees: number;
  discount: number;
  toPay: number;
  dsaCode?: string;
  uploadSource?: AdUploadSource;
  uploadedByDsaCode?: string | null;
  status: SliderStatus;
  uploadDate?: string | null;
  expiryDate?: string | null;
  giffFormat?: string;
  giffSortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DsaPayoutHistory {
  id: string;
  dsaCode: string;
  dsaName: string;
  mode?: string;
  submittedAmount: number;
  currency: string;
  currencyInr: number;
  calculatedLimit: number;
  status: string;
  submissionDate: string;
  approvalNote?: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  createdAt?: string;
}
