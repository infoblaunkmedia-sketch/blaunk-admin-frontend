export const COUNTRIES = [
  'India',
  'UAE',
  'UK',
  'USA',
  'Singapore',
  'Malaysia',
  'Thailand',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman',
  'Saudi Arabia',
  'Hong Kong',
  'Australia',
] as const;

export type Country = (typeof COUNTRIES)[number];

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const; 

export type IndianState = (typeof INDIAN_STATES)[number];

export const DEPARTMENTS = [
  'DSA',
  'Verifiers',
  'Retail Management',
] as const;

/** Legacy 3P department label stored before rename to DSA. */
export function normalizeThirdPartyDepartment(department: string): string {
  return department === 'Channel Partners' ? 'DSA' : department;
}

export type Department = (typeof DEPARTMENTS)[number];

/** Normal employee department list mirrors left sidebar modules. */
export const NORMAL_EMPLOYEE_DEPARTMENTS = [
  'Management',
  'Finance',
  'M & A',
  'Sales',
  'Company Secretary',
  'HR',
  'Payslip',
  'IT Dept',
  'Admin & Personnel',
  'Customer Care',
  'Retail Shop',
  'DSA',
  'Verifier',
  'RETAIL MANAGEMENT',
] as const;

export const DESIGNATIONS = [
  'Chairman',
  'CMD',
  'MD',
  'Director',
  'CEO',
  'CFO',
  'Country Head',
  'President',
  'V.P',
  'A.V.P',
  'Zonal Head',
  'Sr. Manager',
  'Manager',
  'Branch Manager',
  'Sr. Executive',
  'Executive',
  'Clerical',
  'Team Leader',
  'Field Staff',
  'Security',
  'Outsourcing',
  'Office Peon',
  'Front Desk',
  'Reception',
  'Housekeeping',
  'Area Manager',
] as const;

export type Designation = (typeof DESIGNATIONS)[number];

export const JOB_GRADE_OPTIONS = ['A', 'M', 'C', 'T', 'E'] as const;

export const MONTHLY_LEAVE_OPTIONS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'] as const;

export const BONUS_OPTIONS = [
  '1 Month',
  'Not Applicable',
  'On Basic Salary',
  'Pro-Data Base',
  'Performance Base',
  'Monthly Incentive',
  'Quarterly Incentive',
  'Yearly Incentive',
] as const;

export const PF_REQUEST_OPTIONS = ['YES', 'NO'] as const;

export const CTC_DIVISOR_OPTIONS = ['28', '30', '31'] as const;

export const CONFIRMATION_STATUS_OPTIONS = [
  'Pending',
  'Confirmed',
  'Extended Probation',
  'Not Applicable',
] as const;

/** Third-party (3P) credentials – status & verification */
export const THIRD_PARTY_STATUS_OPTIONS = ['Active', 'Exit', 'On Hold'] as const;
export const THIRD_PARTY_VERIFIED_STATUS_OPTIONS = ['Verified', 'Not Verified'] as const;
export const THIRD_PARTY_REMARK_OPTIONS = ['FNF', 'On Hold', 'Issue Pending'] as const;
/** 3P “Business” / legal entity (maps to threePEntity). */
export const THIRD_PARTY_ENTITY_OPTIONS = [
  'Individual',
  'Proprietorship',
  'Partnership',
  'LLP',
  'LTD',
  'Pvt Ltd',
  'Cooperative',
] as const;

export const GENDERS = ['Male', 'Female', 'Other'] as const;
export const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'] as const;
export const EMPLOYEE_STATUSES = ['Active', 'HOLD', 'EXIT'] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];
