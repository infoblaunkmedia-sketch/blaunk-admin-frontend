export type ShareType = 'Fully Paid - EQ' | 'Partially Paid - EQ' | 'Convertible' | 'Debenture' | 'Preference Share';
export type ShareMode = 'Physical' | 'Demat';
export type Stakeholder = 'Board Member' | 'HNI' | 'Pledge Lender' | 'Investors' | 'Shareholders';
export type ShareRemarks =
  | 'Transferable'
  | 'Non-Transferable'
  | 'Partly Paid'
  | 'Partly Sold'
  | 'Lockin Period'
  | 'Buy Back by Director'
  | '3P Trf Restricted';

export const SHARE_REMARK_OPTIONS: ShareRemarks[] = [
  'Transferable',
  'Non-Transferable',
  'Partly Paid',
  'Partly Sold',
  'Lockin Period',
  'Buy Back by Director',
  '3P Trf Restricted',
];

export type Pledge =
  | ''
  | 'Pledge with Bank'
  | 'Pledge with Director'
  | 'Pledge with Investor'
  | 'Free Stock';

export const PLEDGE_OPTIONS: Exclude<Pledge, ''>[] = [
  'Pledge with Bank',
  'Pledge with Director',
  'Pledge with Investor',
  'Free Stock',
];

export type ShareStatus = '' | 'Active' | 'Sold' | 'Hold' | 'Exit';

export const SHARE_STATUS_OPTIONS: Exclude<ShareStatus, ''>[] = ['Active', 'Sold', 'Hold', 'Exit'];

export interface Nominee {
  name: string;
  mobile: string;
  relation: string;
  percentage: string;
  pan: string;
}

export interface Shareholder {
  id: string;
  /** Mongo id of the active shareholding history row (latest in list, or selected period). */
  historyId?: string;
  /** Number of year/project history rows for this PAN. */
  historyCount?: number;
  /** Optional project or scheme reference; distinguishes history when year repeats. */
  projectKey: string;
  name: string;
  pan: string;
  mobile: string;
  email: string;
  aadhaar: string;
  address: string;
  addressLine2: string;
  city: string;
  area: string;
  landmark: string;
  pincode: string;
  state: string;
  country: string;
  gender: string;
  formSubmission: string;
  holdingPercent: string;
  shareType: ShareType | '';
  faceValue: string;
  numberOfShares: string;
  mode: ShareMode | '';
  isinCode: string;
  dpNumber: string;
  dp: '' | 'NSDL' | 'CDSL';
  beneficiaryDpId: string;
  folioNumber: string;
  certificateNumber: string;
  distinctiveFrom: string;
  distinctiveTo: string;
  yearOfIssuance: string;
  stakeholder: Stakeholder | '';
  dateOfAllotment: string;
  remarks: ShareRemarks | '';
  exitDate: string;
  year: string;
  bankName: string;
  ifscCode: string;
  bankAccountNumber: string;
  bankCity: string;
  bankCountry: string;
  pledge: Pledge;
  shareStatus: ShareStatus;
  nominees: Nominee[];
  /** History row timestamp (ISO) for display ordering. */
  updatedAt?: string;
  createdAt?: string;
}

export interface CompanyAddressBlock {
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface CompanyProfile {
  companyName: string;
  cin: string;
  pan: string;
  aadhaar: string;
  gstin: string;
  email: string;
  contactNumber: string;
  incorporationDate: string;
  authorizedSignatoryName: string;
  designation: string;
  registered: CompanyAddressBlock;
  correspondence: CompanyAddressBlock;
  logoUrl: string;
  signatureUrl: string;
}
