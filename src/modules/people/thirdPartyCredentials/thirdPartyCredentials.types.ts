export interface ThirdPartyCredential {
  id: string;
  department: string;
  name: string;
  aadharNo: string;
  mobileNo: string;
  email: string;
  panNo: string;
  tanNo: string;
  passportNo: string;
  gender: string;
  address1: string;
  address2: string;
  city: string;
  zip: string;
  country: string;
  state: string;
  threePCompanyName: string;
  threePEmplCode: string;
  /** Admin-assigned; used for upload validation (3P/DSA employees). */
  matchCode: string;
  threePEntity: string;
  businessCode: string;
  branchCode: string;
  gstTaxNo: string;
  bankName: string;
  ifscCode: string;
  bankAccountNumber: string;
  bankCity: string;
  bankCountry: string;
  swiftNo: string;
  ibanNo: string;
  doj: string;
  ira: string;
  remarks: string;
  status: string;
  exitDate: string;
  verifiedStatus: string;
  businessDeposit: string;
  sharingThreeP: string;
  sharingBlaunk: string;
  commissionSubscriber: string;
  commissionRenewal: string;

  references: { name: string; mobile: string; designation: string; city: string }[];
  /** Address proof image URL (persisted as employeePhotoUrl for API compatibility). */
  employeePhotoUrl: string;
  profileImageUrl: string;
  chqImageUrl: string;
  panImageUrl: string;

  // Legacy
  username: string;
  password: string;
  url: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
}

