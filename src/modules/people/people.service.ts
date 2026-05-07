import type { Employee, Vacancy, EmployeeReference } from './people.types';
import { logger } from '../../shared/utils/logger';

const EMP_KEY = 'blaunk_employees';
const VAC_KEY = 'blaunk_vacancies';

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
  bankAccountNumber?: string;
  medicalInsuranceNo?: string;
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
    npsEmployer: r.npsEmployer || '',
    npsEmployee: r.npsEmployee || '',

    accountHolderName: '',
    accountNumber: r.bankAccountNumber || '',
    ifsc: r.ifscCode || '',
    bankName: r.bankName || '',
    branch: '',

    medicalInsuranceNo: r.medicalInsuranceNo || '',
    pTax: r.pTax || '',

    aadhaarNumber: r.aadhaar || '',
    panNumber: r.pan || '',

    employeeDocumentUrl: r.employeeDocumentUrl || '',
    references: r.references || [],

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
    bankAccountNumber: emp.accountNumber,
    medicalInsuranceNo: emp.medicalInsuranceNo,
    doj: emp.dateOfJoining,
    doc: emp.doc,
    centreName: emp.centreName,
    confirmationStatus: emp.confirmationStatus,
    monthlyLeaves: emp.monthlyLeaves,
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
    npsEmployer: emp.npsEmployer,
    npsEmployee: emp.npsEmployee,
    roundOff: String(emp.roundOff ?? ''),
    ctcMonthly: String(emp.monthlyCtc ?? ''),
    ctcPerDay: String(emp.perDayCtc ?? ''),
    gratuity: String(emp.gratuity ?? ''),
    references: emp.references || [],
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
  if (!res.ok) throw new Error(await res.text());
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
    throw new Error(text || 'Failed to save employee');
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
  if (!res.ok) throw new Error(await res.text());
}

export async function generateEmployeeCode(existing: Employee[]): Promise<string> {
  const codes = existing.map((e) => e.employeeCode).filter((c) => /^E\d+$/.test(c));
  const max = codes.reduce((acc, c) => Math.max(acc, parseInt(c.slice(1), 10)), 0);
  return `E${String(max + 1).padStart(4, '0')}`;
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
  if (!res.ok) throw new Error(await res.text());
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
  if (!res.ok) throw new Error(await res.text());
  const json = (await res.json()) as GetEmployeeResponse;
  return toEmployee(json.record);
}

// Vacancies
export async function fetchVacancies(): Promise<Vacancy[]> {
  try {
    const raw = localStorage.getItem(VAC_KEY);
    return raw ? (JSON.parse(raw) as Vacancy[]) : [];
  } catch {
    return [];
  }
}

export async function saveVacancy(vac: Vacancy): Promise<void> {
  const all = await fetchVacancies();
  const idx = all.findIndex((v) => v.id === vac.id);
  if (idx >= 0) all[idx] = vac;
  else all.push(vac);
  localStorage.setItem(VAC_KEY, JSON.stringify(all));
}

export async function deleteVacancy(id: string): Promise<void> {
  const all = await fetchVacancies();
  localStorage.setItem(VAC_KEY, JSON.stringify(all.filter((v) => v.id !== id)));
}
