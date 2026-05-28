export type DsaStatus = 'Active' | 'Suspended' | 'Blocked';
export type KycStatus = 'Pending' | 'Verified' | 'Rejected';
export type VendorStatus = 'Active' | 'Inactive' | 'Suspended';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type VerifierStatus = 'Active' | 'Inactive' | 'Suspended';

export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  branch: string;
}

export interface DsaRecord {
  dsaCode: string;
  companyName: string;
  ownerName: string;
  mobile: string;
  email: string;
  country: string;
  city: string;
  state: string;
  productsCovered: string;
  shareRatio: number;
  status: DsaStatus;
  kycStatus: KycStatus;
  bank: BankDetails;
  joiningDate: string;
  createdAt?: string;
}

export interface VerifierRecord {
  verifierCode: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  city: string;
  state: string;
  productsCovered: string;
  verificationFee: number;
  status: VerifierStatus;
  kycStatus: KycStatus;
  bank: BankDetails;
  createdAt?: string;
}

export interface VendorRecord {
  id?: string;
  vendorCode: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  productCategories: string;
  bank: BankDetails;
  kycStatus: KycStatus;
  status: VendorStatus;
  approvalStatus?: ApprovalStatus;
  rejectionReason?: string;
  joiningDate: string;
  createdAt?: string;
}

export interface ThirdPartyCredential {
  id: string;
  department: string;
  name: string;
  username: string;
  password: string;
  url: string;
  notes: string;
  createdAt?: string;
}
