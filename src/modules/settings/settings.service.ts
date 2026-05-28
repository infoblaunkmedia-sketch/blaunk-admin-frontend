import type { ModulePermission } from '../../shared/types/auth.types';
import type { CaptchaEntry, IpEntry, PasscodeEntry, PermissionsMap } from './settings.types';
import { api } from '../../shared/services/apiService';

const PERMISSIONS_KEY = 'blaunk_permissions';
const CAPTCHA_KEY = 'blaunk_captcha';

// Permissions
export async function fetchAllPermissions(): Promise<PermissionsMap> {
  // Not used anymore for backend-driven rights, keep for legacy callers.
  try {
    const raw = localStorage.getItem(PERMISSIONS_KEY);
    return raw ? (JSON.parse(raw) as PermissionsMap) : {};
  } catch {
    return {};
  }
}

export async function savePermissions(employeeCode: string, perms: ModulePermission[]): Promise<void> {
  // Legacy no-op (replaced by saveRightsForEmployee).
  const all = await fetchAllPermissions();
  all[employeeCode] = perms;
  localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(all));
}

export async function fetchPermissionsForEmployee(code: string): Promise<ModulePermission[]> {
  const all = await fetchAllPermissions();
  return all[code] ?? [];
}

export type EmployeeOption = { id: string; code: string; name: string };

export async function fetchEmployeeOptions(type: 'employee' | '3pc' = 'employee'): Promise<EmployeeOption[]> {
  const res = await api.get<{ employees: EmployeeOption[] }>(`/api/employees/codes?type=${type}`);
  return res.employees || [];
}

export async function fetchRightsForEmployee(employeeCode: string, type: 'employee' | '3pc' = 'employee') {
  const res = await api.get<{ sections: string[] }>(`/api/rights/${type}/${encodeURIComponent(employeeCode)}`);
  return res.sections || [];
}

export async function saveRightsForEmployee(employeeCode: string, sections: string[], type: 'employee' | '3pc' = 'employee') {
  await api.post('/api/rights', { employeeCode, type, sections });
}

export type UserAdminInfo = {
  username: string;
  employeeCode: string;
  employeeType: 'employee' | '3pc';
  status: 'Active' | 'Disabled';
  passwordResetRequired: boolean;
  passwordIssuedAt: string | null;
  passwordIssuedBy: string;
  lastPasswordChangeAt: string | null;
};

export async function fetchUserAdminInfo(code: string, type: 'employee' | '3pc') {
  const res = await api.get<{ user: UserAdminInfo }>(
    `/api/staff-users/${encodeURIComponent(code)}?type=${type}`,
  );
  return res.user;
}

export async function setUserStatus(code: string, type: 'employee' | '3pc', status: 'Active' | 'Disabled') {
  await api.patch(`/api/staff-users/${encodeURIComponent(code)}/status?type=${type}`, { status });
}

export async function generateTempPassword(code: string, type: 'employee' | '3pc') {
  const res = await api.post<{ tempPassword: string }>(
    `/api/staff-users/${encodeURIComponent(code)}/temp-password?type=${type}`,
    {},
  );
  return res.tempPassword;
}

// Captcha
export async function fetchCaptchaEntries(): Promise<CaptchaEntry[]> {
  try {
    const raw = localStorage.getItem(CAPTCHA_KEY);
    if (raw) return JSON.parse(raw) as CaptchaEntry[];
  } catch { /* empty */ }
  return DEFAULT_CAPTCHA_ENTRIES;
}

export async function saveCaptchaEntry(entry: CaptchaEntry): Promise<void> {
  const entries = await fetchCaptchaEntries();
  const idx = entries.findIndex((e) => e.module === entry.module);
  if (idx >= 0) entries[idx] = entry;
  else entries.push(entry);
  localStorage.setItem(CAPTCHA_KEY, JSON.stringify(entries));
}

const DEFAULT_CAPTCHA_ENTRIES: CaptchaEntry[] = [
  { module: 'Login — Employee', code: '', updatedAt: '', updatedBy: '' },
  { module: 'Login — DSA', code: '', updatedAt: '', updatedBy: '' },
  { module: 'Media Upload', code: '', updatedAt: '', updatedBy: '' },
  { module: 'Reset Password', code: '', updatedAt: '', updatedBy: '' },
];

// Passcodes
export async function fetchPasscodeEntries(): Promise<PasscodeEntry[]> {
  return [
    { operation: 'Delete Record', code: '', updatedAt: '' },
    { operation: 'Approve Payout', code: '', updatedAt: '' },
    { operation: 'Export MIS', code: '', updatedAt: '' },
  ];
}

type AdminWhitelistRow = {
  id: string;
  ip_address: string;
  service_provider?: string;
  active?: boolean;
  added_by?: string;
  created_at?: string;
};

function mapAdminRowToIpEntry(r: AdminWhitelistRow): IpEntry {
  return {
    id: r.id,
    ip: r.ip_address ?? '',
    label: r.service_provider ?? '',
    addedBy: r.added_by?.trim() ? r.added_by : '—',
    addedAt: r.created_at ? new Date(r.created_at).toISOString() : '',
    status: r.active === false ? 'Inactive' : 'Active',
  };
}

/** Office IP whitelist (enforced by backend middleware on `/api/*`). Uses `/admin/*` routes (bypass whitelist). */
export async function fetchIpEntries(): Promise<IpEntry[]> {
  const base = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!base) {
    throw new Error('VITE_API_BASE_URL is not set — cannot load IP whitelist.');
  }
  const res = await api.get<{ list: AdminWhitelistRow[] }>('/admin/ip-list');
  return (res.list || []).map(mapAdminRowToIpEntry);
}

export async function createIpWhitelistEntry(params: {
  ip: string;
  label: string;
  status: IpEntry['status'];
  addedBy?: string;
}): Promise<IpEntry> {
  const res = await api.post<{ row: AdminWhitelistRow }>('/admin/add-ip', {
    service_provider: params.label.trim(),
    ip_address: params.ip.trim(),
    active: params.status === 'Active',
    ...(params.addedBy ? { added_by: params.addedBy } : {}),
  });
  return mapAdminRowToIpEntry(res.row);
}

export async function patchIpWhitelistEntry(
  id: string,
  patch: Partial<Pick<IpEntry, 'status' | 'label' | 'ip'>>,
): Promise<void> {
  const body: { active?: boolean; service_provider?: string; ip_address?: string } = {};
  if (patch.status !== undefined) body.active = patch.status === 'Active';
  if (patch.label !== undefined) body.service_provider = patch.label;
  if (patch.ip !== undefined) body.ip_address = patch.ip;
  await api.patch(`/admin/ip/${id}`, body);
}

export async function deleteIpEntry(id: string): Promise<void> {
  await api.delete(`/admin/delete-ip/${id}`);
}
