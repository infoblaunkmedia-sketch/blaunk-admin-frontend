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
  npsEmployer: string;
  npsEmployee: string;

  // Bank
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  branch: string;

  // Backend bank-related fields
  medicalInsuranceNo: string;
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
  department: string;
  numberOfOpenings: number;
  description: string;
  requiredExperience: string;
  location: string;
  postedDate: string;
  status: 'Open' | 'Closed';
}

export type PayrollFilter = {
  financialYear: string;
  department: string;
  employeeCode: string;
  period: string;
  month: string;
};
