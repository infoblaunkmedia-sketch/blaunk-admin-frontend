export type EmployeeStatus = 'Active' | 'HOLD' | 'EXIT';

export type EmployeeReference = {
  name: string;
  mobile: string;
  designation: string;
  city: string;
};

export interface Employee {
  // Personal
  employeeCode: string;
  fullName: string;
  dob: string;
  gender: string;
  address: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  mobile: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  emergencyContactRelation: string;
  email: string;
  photoUrl?: string;

  // Employment
  department: string;
  designation: string;
  dateOfJoining: string;
  status: EmployeeStatus;
  remarks: string;

  // Backend-mapped employment fields
  doc: string; // date of confirmation (backend: doc)
  centreName: string;
  confirmationStatus: string;
  monthlyLeaves: string;
  jobGrade: string;
  uan: string;
  pf: string; // PF identifier/number (backend: pf)
  exitDate: string;
  pfRequest: string;
  bonus: string;
  /** ESI membership / insurance number (distinct from salary ESI %). */
  esiInsuranceNo: string;
  /** NPS subscriber / reference number (distinct from salary NPS amount). */
  npsSubscriptionNo: string;

  // Salary
  basicSalary: number;
  hra: number;
  lta: number;
  medicalAllowance: number;
  cea: number;
  foodAllowance: number;
  supplementaryAllowance: number;
  mea: number;
  pfEmployee: number;
  esi: number;
  healthInsurance: number;
  nps: number;
  professionalTax: number;
  gratuity: number;
  roundOff: number;
  monthlyCtc: number;
  perDayCtc: number;

  // Backend salary-related fields not previously modeled
  yearlyCtc: string;
  esiSalary: string;
  pfContribution: string;
  pfContributionEmployer: string;
  npsEmployer: string;
  npsEmployee: string;
  /** Days per month for per-day CTC (28, 30, or 31). */
  ctcDivisorDays: string;

  // Bank
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  /** Bank branch MICR (9 digits). */
  micrCode: string;
  branch: string;
  bankArea: string;
  bankCity: string;

  // Backend bank-related fields
  medicalInsuranceNo: string;
  medicalInsurer: string;
  gratuityNo: string;
  gratuityInsurer: string;
  pTax: string; // backend pTax (derived from professionalTax)

  // Documents
  aadhaarNumber: string;
  panNumber: string;

  // Backend document fields
  employeePhotoUrl?: string;
  employeeDocumentUrl: string;
  references: EmployeeReference[];

  createdAt?: string;
  updatedAt?: string;
}

export type EmployeeDraft = Partial<Employee>;

export interface Vacancy {
  id: string;
  jobTitle: string;
  requiredExperience: string;
  location: string;
  packageLpa: string;
  qualification: string;
  /** Resolved from global Careers apply-email setting when listing. */
  applyEmail?: string;
  numberOfOpenings: number;
}

export type PayrollFilter = {
  financialYear: string;
  department: string;
  employeeCode: string;
  period: string;
  month: string;
};
