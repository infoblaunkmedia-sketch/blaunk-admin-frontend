import { api } from '../../../shared/services/apiService';
import { parseApiErrorBody } from '../../../shared/utils/apiErrorMessage';
import type { ThirdPartyCredential } from './thirdPartyCredentials.types';

type RecordDto = {
  _id: string;
  department?: string;
  name: string;
  aadharNo?: string;
  mobileNo?: string;
  email?: string;
  panNo?: string;
  tanNo?: string;
  passportNo?: string;
  gender?: string;
  address1?: string;
  address2?: string;
  city?: string;
  zip?: string;
  country?: string;
  state?: string;
  threePCompanyName?: string;
  threePEmplCode?: string;
  matchCode?: string | null;
  threePEntity?: string;
  businessCode?: string;
  branchCode?: string;
  gstTaxNo?: string;
  bankName?: string;
  ifscCode?: string;
  bankAccountNumber?: string;
  bankCity?: string;
  bankCountry?: string;
  swiftNo?: string;
  ibanNo?: string;
  doj?: string;
  ira?: string;
  remarks?: string;
  status?: string;
  exitDate?: string;
  verifiedStatus?: string;
  businessDeposit?: string;
  businessDepositCurrency?: string;
  verifierFees?: string;
  sharingThreeP?: string;
  sharingBlaunk?: string;
  commissionSubscriber?: string;
  commissionRenewal?: string;
  references?: { name?: string; mobile?: string; designation?: string; city?: string }[];
  employeePhotoUrl?: string;
  profileImageUrl?: string;
  chqImageUrl?: string;
  panImageUrl?: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

function toRecord(dto: RecordDto): ThirdPartyCredential {
  return {
    id: dto._id,
    department: dto.department || '',
    name: dto.name || '',
    aadharNo: dto.aadharNo || '',
    mobileNo: dto.mobileNo || '',
    email: dto.email || '',
    panNo: dto.panNo || '',
    tanNo: dto.tanNo || '',
    passportNo: dto.passportNo || '',
    gender: dto.gender || '',
    address1: dto.address1 || '',
    address2: dto.address2 || '',
    city: dto.city || '',
    zip: dto.zip || '',
    country: dto.country || '',
    state: dto.state || '',
    threePCompanyName: dto.threePCompanyName || '',
    threePEmplCode: dto.threePEmplCode || '',
    matchCode: dto.matchCode || '',
    threePEntity: dto.threePEntity || '',
    businessCode: dto.businessCode || '',
    branchCode: dto.branchCode || '',
    gstTaxNo: dto.gstTaxNo || '',
    bankName: dto.bankName || '',
    ifscCode: dto.ifscCode || '',
    bankAccountNumber: dto.bankAccountNumber || '',
    bankCity: dto.bankCity || '',
    bankCountry: dto.bankCountry || '',
    swiftNo: dto.swiftNo || '',
    ibanNo: dto.ibanNo || '',
    doj: dto.doj || '',
    ira: dto.ira || '',
    remarks: dto.remarks || '',
    status: dto.status || '',
    exitDate: dto.exitDate || '',
    verifiedStatus: dto.verifiedStatus || '',
    businessDeposit: dto.businessDeposit || '',
    businessDepositCurrency: dto.businessDepositCurrency || 'INR',
    verifierFees: dto.verifierFees || '',
    sharingThreeP: dto.sharingThreeP || '',
    sharingBlaunk: dto.sharingBlaunk || '',
    commissionSubscriber: dto.commissionSubscriber || '',
    commissionRenewal: dto.commissionRenewal || '',
    references: (dto.references || []).map((r) => ({
      name: r?.name || '',
      mobile: r?.mobile || '',
      designation: r?.designation || '',
      city: r?.city || '',
    })),
    employeePhotoUrl: dto.employeePhotoUrl || '',
    profileImageUrl: dto.profileImageUrl || '',
    chqImageUrl: dto.chqImageUrl || '',
    panImageUrl: dto.panImageUrl || '',
    username: dto.username || '',
    password: dto.password || '',
    url: dto.url || '',
    notes: dto.notes || '',
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

export async function fetchThirdPartyCredentials(): Promise<ThirdPartyCredential[]> {
  const res = await api.get<{ records: RecordDto[] }>('/api/3p-credentials');
  return (res.records || []).map(toRecord);
}

export async function fetchThirdPartyCredentialById(id: string): Promise<ThirdPartyCredential> {
  const res = await api.get<{ record: RecordDto }>(
    `/api/3p-credentials/${encodeURIComponent(id)}`,
  );
  if (!res.record) throw new Error('3P credential not found.');
  return toRecord(res.record);
}

export async function saveThirdPartyCredential(payload: Omit<ThirdPartyCredential, 'createdAt' | 'updatedAt'>) {
  const { matchCode: _matchCode, ...rest } = payload;
  const body = {
    ...(rest.id ? { id: rest.id } : {}),
    ...rest,
  };

  const res = await api.post<{ record: RecordDto }>('/api/3p-credentials', body);
  return toRecord(res.record);
}

export async function deleteThirdPartyCredential(id: string) {
  await api.delete(`/api/3p-credentials/${encodeURIComponent(id)}`);
}

export async function upload3pImage(file: File): Promise<string> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) throw new Error('VITE_API_BASE_URL is not configured');
  const token = sessionStorage.getItem('authToken');
  const form = new FormData();
  form.append('image', file);

  const res = await fetch(`${base}/api/upload/image`, {
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

export async function fetchNextThreePcEmployeeCode(): Promise<string> {
  const res = await api.get<{ code?: string }>('/api/employees/next-code?type=3pc');
  return String(res.code || '').trim().toUpperCase();
}

