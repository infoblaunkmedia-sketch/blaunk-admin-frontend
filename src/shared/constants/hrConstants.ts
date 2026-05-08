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
  'Human Resources',
  'Finance',
  'Operations',
  'Sales',
  'Marketing',
  'IT',
  'Legal',
  'Admin',
  'Customer Care',
  'Company Secretary',
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const DESIGNATIONS = [
  'Director',
  'Manager',
  'Senior Executive',
  'Executive',
  'Assistant',
  'Intern',
  'Analyst',
  'Team Lead',
  'Vice President',
  'Chief Executive Officer',
  'Chief Financial Officer',
  'Chief Technology Officer',
  'Chief Operating Officer',
] as const;

export type Designation = (typeof DESIGNATIONS)[number];

export const GENDERS = ['Male', 'Female', 'Other'] as const;
export const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'] as const;
export const EMPLOYEE_STATUSES = ['Active', 'HOLD', 'EXIT'] as const;
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];
