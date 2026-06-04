import type { Employee, Vacancy, EmployeeReference } from './people.types';
import { CTC_DIVISOR_OPTIONS } from '../../shared/constants/hrConstants';
import { logger } from '../../shared/utils/logger';
import { parseApiErrorBody } from '../../shared/utils/apiErrorMessage';
import { api } from '../../shared/services/apiService';

const EMP_KEY = 'blaunk_employees';
type EmployeeCredentialsRecord = {
  pan: string;
  employeeName?: string;
  mobile?: string;
  email?: string;
  aadhaar?: string;
  empCode?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  state?: string;
  gender?: string;
  yearlyCtc?: string;
  department?: string;
  designation?: string;
  bankName?: string;
  ifscCode?: string;
  micrCode?: string;
  bankAccountNumber?: string;
  medicalInsuranceNo?: string;
  medicalInsurer?: string;
  gratuityNo?: string;
  gratuityInsurer?: string;
  bonus?: string;
  pfRequest?: string;
  esiInsuranceNo?: string;
  npsSubscriptionNo?: string;
  ctcDivisorDays?: string;
  pfContributionEmployer?: string;
  bankArea?: string;
  bankCity?: string;
  doj?: string;
  doc?: string;
  centreName?: string;
  confirmationStatus?: string;
  monthlyLeaves?: string;
  nps?: string;
  esi?: string;
  jobGrade?: string;
  uan?: string;
  pf?: string;
  remarks?: string;
  status?: string;
  exitDate?: string;
  basicSalary?: string;
  hra?: string;
  lta?: string;
  medicalAllowance?: string;
  cea?: string;
  foodAllowance?: string;
  supplementaryAllowance?: string;
  mea?: string;
  pTax?: string;
  healthInsurance?: string;
  esiSalary?: string;
  pfContribution?: string;
  npsEmployer?: string;
  npsEmployee?: string;
  roundOff?: string;
  ctcMonthly?: string;
  ctcPerDay?: string;
  gratuity?: string;
  references?: EmployeeReference[];
  employeePhotoUrl?: string;
  employeeDocumentUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ListEmployeesResponse = { records: EmployeeCredentialsRecord[] };
type SaveEmployeeResponse = { record: EmployeeCredentialsRecord };
type GetEmployeeResponse = { record: EmployeeCredentialsRecord };

function n(v: unknown): number {
  const x = typeof v === 'string' ? Number(v) : (v as number);
  return Number.isFinite(x) ? x : 0;
}

function toEmployee(r: EmployeeCredentialsRecord): Employee {
  return {
    employeeCode: r.empCode || '',
    fullName: r.employeeName || '',
    dob: '',
    gender: r.gender || '',
    address: r.address || '',
    city: r.city || '',
    state: r.state || '',
    country: r.country || '',
    pincode: r.zip || '',
    mobile: r.mobile || '',
    emergencyContactName: '',
    emergencyContactNumber: '',
    emergencyContactRelation: '',
    email: r.email || '',
    photoUrl: r.employeePhotoUrl || '',
    employeePhotoUrl: r.employeePhotoUrl || '',

    department: r.department || '',
    designation: r.designation || '',
    dateOfJoining: r.doj || '',
    status: (r.status as Employee['status']) || 'Active',
    remarks: r.remarks || '',

    doc: r.doc || '',
    centreName: r.centreName || '',
    confirmationStatus: r.confirmationStatus || '',
    monthlyLeaves: r.monthlyLeaves || '',
    jobGrade: r.jobGrade || '',
    uan: r.uan || '',
    pf: r.pf || '',
    exitDate: r.exitDate || '',
    pfRequest: r.pfRequest || '',
    bonus: r.bonus || '',
    esiInsuranceNo: r.esiInsuranceNo || '',
    npsSubscriptionNo: r.npsSubscriptionNo || '',

    basicSalary: n(r.basicSalary),
    hra: n(r.hra),
    lta: n(r.lta),
    medicalAllowance: n(r.medicalAllowance),
    cea: n(r.cea),
    foodAllowance: n(r.foodAllowance),
    supplementaryAllowance: n(r.supplementaryAllowance),
    mea: n(r.mea),
    pfEmployee: 0,
    esi: n(r.esi),
    healthInsurance: n(r.healthInsurance),
    nps: n(r.nps),
    professionalTax: n(r.pTax),
    gratuity: n(r.gratuity),
    roundOff: n(r.roundOff),
    monthlyCtc: n(r.ctcMonthly),
    perDayCtc: n(r.ctcPerDay),

    yearlyCtc: r.yearlyCtc || '',
    esiSalary: r.esiSalary || '',
    pfContribution: r.pfContribution || '',
    pfContributionEmployer: r.pfContributionEmployer || '',
    npsEmployer: r.npsEmployer || '',
    npsEmployee: r.npsEmployee || '',
    ctcDivisorDays: (() => {
      const v = String(r.ctcDivisorDays || '').trim();
      return (CTC_DIVISOR_OPTIONS as readonly string[]).includes(v) ? v : CTC_DIVISOR_OPTIONS[0];
    })(),

    accountHolderName: '',
    accountNumber: r.bankAccountNumber || '',
    ifsc: r.ifscCode || '',
    bankName: r.bankName || '',
    micrCode: r.micrCode || '',
    branch: r.bankArea || '',
    bankArea: r.bankArea || '',
    bankCity: r.bankCity || '',

    medicalInsuranceNo: r.medicalInsuranceNo || '',
    medicalInsurer: r.medicalInsurer || '',
    gratuityNo: r.gratuityNo || '',
    gratuityInsurer: r.gratuityInsurer || '',
    pTax: r.pTax || '',

    aadhaarNumber: r.aadhaar || '',
    panNumber: r.pan || '',

    employeeDocumentUrl: r.employeeDocumentUrl || '',
    references: (r.references || []).map((ref) => ({
      name: ref?.name || '',
      mobile: ref?.mobile || '',
      designation: ref?.designation || '',
      city: ref?.city || '',
    })),

    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

function toPayload(emp: Employee) {
  return {
    pan: String(emp.panNumber || '').trim().toUpperCase(),
    employeeName: emp.fullName,
    mobile: emp.mobile,
    email: emp.email,
    aadhaar: emp.aadhaarNumber,
    empCode: emp.employeeCode,
    address: emp.address,
    city: emp.city,
    zip: emp.pincode,
    country: emp.country,
    state: emp.state,
    gender: emp.gender,
    yearlyCtc: emp.yearlyCtc,
    department: emp.department,
    designation: emp.designation,
    bankName: emp.bankName,
    ifscCode: emp.ifsc,
    micrCode: emp.micrCode,
    bankAccountNumber: emp.accountNumber,
    medicalInsuranceNo: emp.medicalInsuranceNo,
    doj: emp.dateOfJoining,
    doc: emp.doc,
    centreName: emp.centreName,
    confirmationStatus: emp.confirmationStatus,
    monthlyLeaves: emp.monthlyLeaves,
    medicalInsurer: emp.medicalInsurer,
    gratuityNo: emp.gratuityNo,
    gratuityInsurer: emp.gratuityInsurer,
    bonus: emp.bonus,
    pfRequest: emp.pfRequest,
    esiInsuranceNo: emp.esiInsuranceNo,
    npsSubscriptionNo: emp.npsSubscriptionNo,
    ctcDivisorDays: emp.ctcDivisorDays,
    nps: String(emp.nps ?? ''),
    esi: String(emp.esi ?? ''),
    jobGrade: emp.jobGrade,
    uan: emp.uan,
    pf: emp.pf,
    remarks: emp.remarks,
    status: emp.status,
    exitDate: emp.exitDate,
    basicSalary: String(emp.basicSalary ?? ''),
    hra: String(emp.hra ?? ''),
    lta: String(emp.lta ?? ''),
    medicalAllowance: String(emp.medicalAllowance ?? ''),
    cea: String(emp.cea ?? ''),
    foodAllowance: String(emp.foodAllowance ?? ''),
    supplementaryAllowance: String(emp.supplementaryAllowance ?? ''),
    mea: String(emp.mea ?? ''),
    pTax: String(emp.professionalTax ?? ''),
    healthInsurance: String(emp.healthInsurance ?? ''),
    esiSalary: emp.esiSalary,
    pfContribution: emp.pfContribution,
    pfContributionEmployer: emp.pfContributionEmployer,
    npsEmployer: emp.npsEmployer,
    npsEmployee: emp.npsEmployee,
    bankArea: emp.bankArea,
    bankCity: emp.bankCity,
    roundOff: String(emp.roundOff ?? ''),
    ctcMonthly: String(emp.monthlyCtc ?? ''),
    ctcPerDay: String(emp.perDayCtc ?? ''),
    gratuity: String(emp.gratuity ?? ''),
    references: (emp.references || []).map((r) => ({
      name: r.name || '',
      mobile: r.mobile || '',
      designation: r.designation || '',
      city: r.city || '',
    })),
    employeePhotoUrl: emp.photoUrl || emp.employeePhotoUrl || '',
    employeeDocumentUrl: emp.employeeDocumentUrl || '',
  };
}

// Employees
export async function fetchEmployees(): Promise<Employee[]> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) return [];
  const res = await fetch(`${base}/api/employee-credentials?limit=1000`, {
    headers: {
      'Content-Type': 'application/json',
      ...(sessionStorage.getItem('authToken')
        ? { Authorization: `Bearer ${sessionStorage.getItem('authToken')}` }
        : {}),
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    throw new Error(parseApiErrorBody(t, res.status));
  }
  const json = (await res.json()) as ListEmployeesResponse;
  return (json.records || []).map(toEmployee);
}

export async function saveEmployee(emp: Employee): Promise<void> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) throw new Error('VITE_API_BASE_URL is not configured');
  if (!emp.panNumber?.trim()) throw new Error('PAN is required');

  const payload = toPayload(emp);
  const token = sessionStorage.getItem('authToken');
  const res = await fetch(`${base}/api/employee-credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    logger.error('saveEmployee failed', text);
    throw new Error(parseApiErrorBody(text, res.status) || 'Failed to save employee');
  }
  await res.json().catch(() => ({} as SaveEmployeeResponse));
}

export async function deleteEmployee(pan: string): Promise<void> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) throw new Error('VITE_API_BASE_URL is not configured');
  const token = sessionStorage.getItem('authToken');
  const res = await fetch(`${base}/api/employee-credentials/${encodeURIComponent(pan)}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    throw new Error(parseApiErrorBody(t, res.status));
  }
}

export async function generateEmployeeCode(): Promise<string> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) throw new Error('VITE_API_BASE_URL is not configured');
  const token = sessionStorage.getItem('authToken');
  const res = await fetch(`${base}/api/employees/next-code?type=employee`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    throw new Error(parseApiErrorBody(t, res.status));
  }
  const json = (await res.json()) as { code?: string };
  return String(json.code || '').trim().toUpperCase();
}

export async function uploadEmployeeDocument(file: File): Promise<string> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) throw new Error('VITE_API_BASE_URL is not configured');
  const token = sessionStorage.getItem('authToken');
  const form = new FormData();
  form.append('document', file);

  const res = await fetch(`${base}/api/upload/employee-document`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: form,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    throw new Error(parseApiErrorBody(t, res.status));
  }
  const json = (await res.json()) as { url?: string };
  if (!json.url) throw new Error('Upload failed (missing url)');
  return String(json.url);
}

export async function fetchEmployeeByPan(pan: string): Promise<Employee> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) throw new Error('VITE_API_BASE_URL is not configured');
  const token = sessionStorage.getItem('authToken');
  const res = await fetch(`${base}/api/employee-credentials/${encodeURIComponent(pan)}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => res.statusText);
    throw new Error(parseApiErrorBody(t, res.status));
  }
  const json = (await res.json()) as GetEmployeeResponse;
  return toEmployee(json.record);
}

// Vacancies
type VacancyDto = {
  id: string;
  jobTitle?: string;
  numberOfOpenings?: number;
  requiredExperience?: string;
  location?: string;
  packageLpa?: string;
  qualification?: string;
  applyEmail?: string;
};

function mapVacancy(dto: VacancyDto): Vacancy {
  return {
    id: dto.id,
    jobTitle: dto.jobTitle || '',
    numberOfOpenings: Number(dto.numberOfOpenings || 0),
    requiredExperience: dto.requiredExperience || '',
    location: dto.location || '',
    packageLpa: dto.packageLpa || '',
    qualification: dto.qualification || '',
    applyEmail: dto.applyEmail || 'careers@blaunk.com',
  };
}

export async function fetchVacancies(): Promise<Vacancy[]> {
  const res = await api.get<{ records: VacancyDto[] }>(
    `/api/vacancies?_=${Date.now()}`,
  );
  return (res.records || [])
    .map(mapVacancy)
    .filter((v) => v.id && /^[a-f\d]{24}$/i.test(v.id));
}

export async function saveVacancy(vac: Vacancy): Promise<Vacancy> {
  const body = {
    ...(vac.id && /^[a-f\d]{24}$/i.test(vac.id) ? { id: vac.id } : {}),
    jobTitle: vac.jobTitle.trim(),
    numberOfOpenings: vac.numberOfOpenings,
    requiredExperience: vac.requiredExperience.trim(),
    location: vac.location.trim(),
    packageLpa: vac.packageLpa.trim(),
    qualification: vac.qualification.trim(),
    applyEmail: (vac.applyEmail || 'careers@blaunk.com').trim(),
  };
  const res = await api.post<{ record: VacancyDto }>('/api/vacancies', body);
  if (!res.record) throw new Error('Save succeeded but no record was returned.');
  return mapVacancy(res.record);
}

export async function deleteVacancy(id: string): Promise<void> {
  await api.delete(`/api/vacancies/${encodeURIComponent(id)}`);
}
