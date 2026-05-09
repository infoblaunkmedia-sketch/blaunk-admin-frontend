export type ShareType = 'Fully Paid - EQ' | 'Partially Paid - EQ' | 'Convertible' | 'Debenture' | 'Preference Share';
export type ShareMode = 'Physical' | 'Demat';
export type Stakeholder = 'Board Member' | 'HNI' | 'Pledge Lender' | 'Investors' | 'Shareholders';
export type ShareRemarks = 'Transferable' | 'Non-Transferable' | 'Partly Paid' | 'Partly Sold' | 'Lockin Period';
export type Pledge = 'NA' | 'Un Pledge' | 'Pledge';

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
  city: string;
  landmark: string;
  country: string;
  gender: string;
  holdingPercent: string;
  shareType: ShareType | '';
  faceValue: string;
  numberOfShares: string;
  mode: ShareMode | '';
  isinCode: string;
  dpNumber: string;
  folioNumber: string;
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
  pledge: Pledge;
  nominees: Nominee[];
}

export interface CompanyProfile {
  companyName: string;
  cin: string;
  pan: string;
  gstin: string;
  registeredAddress: string;
  correspondenceAddress: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  email: string;
  contactNumber: string;
  incorporationDate: string;
  authorizedSignatoryName: string;
  designation: string;
  logoUrl: string;
  signatureUrl: string;
}
