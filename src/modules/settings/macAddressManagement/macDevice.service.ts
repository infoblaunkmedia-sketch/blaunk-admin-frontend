import { api } from '../../../shared/services/apiService';

export type MacDeviceEntry = {
  id: string;
  macAddress: string;
  computerBrand: string;
  systemType: string;
  linkedType: 'employee' | '3pc' | '';
  linkedCode: string;
  linkedName: string;
  status: 'Active' | 'Inactive';
  approvedBy: string;
  addedBy: string;
  createdAt?: string;
};

type MacDeviceRow = {
  id: string;
  macAddress?: string;
  computerBrand?: string;
  systemType?: string;
  linkedType?: string;
  linkedCode?: string;
  linkedName?: string;
  status?: string;
  approvedBy?: string;
  addedBy?: string;
  createdAt?: string;
};

function mapRow(r: MacDeviceRow): MacDeviceEntry {
  return {
    id: r.id,
    macAddress: r.macAddress || '',
    computerBrand: r.computerBrand || '',
    systemType: r.systemType || '',
    linkedType: r.linkedType === '3pc' ? '3pc' : r.linkedType === 'employee' ? 'employee' : '',
    linkedCode: r.linkedCode || '',
    linkedName: r.linkedName || '',
    status: r.status === 'Inactive' ? 'Inactive' : 'Active',
    approvedBy: r.approvedBy || '',
    addedBy: r.addedBy || '',
    createdAt: r.createdAt,
  };
}

export async function fetchMacDevices(params?: {
  linkedType?: 'employee' | '3pc';
  linkedCode?: string;
}): Promise<MacDeviceEntry[]> {
  const qs = new URLSearchParams();
  if (params?.linkedType) qs.set('linkedType', params.linkedType);
  if (params?.linkedCode) qs.set('linkedCode', params.linkedCode);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const res = await api.get<{ list: MacDeviceRow[] }>(`/admin/mac-devices${suffix}`);
  return (res.list || []).map(mapRow);
}

export async function createMacDevice(payload: {
  macAddress: string;
  computerBrand?: string;
  systemType?: string;
  linkedType: 'employee' | '3pc';
  linkedCode: string;
  linkedName?: string;
  status?: MacDeviceEntry['status'];
}): Promise<MacDeviceEntry> {
  const res = await api.post<{ row: MacDeviceRow }>('/admin/add-mac-device', payload);
  return mapRow(res.row);
}

export async function patchMacDevice(
  id: string,
  patch: Partial<Pick<MacDeviceEntry, 'macAddress' | 'computerBrand' | 'systemType' | 'status'>>,
): Promise<MacDeviceEntry> {
  const res = await api.patch<{ row: MacDeviceRow }>(`/admin/mac-device/${id}`, patch);
  return mapRow(res.row);
}

export async function deleteMacDevice(id: string): Promise<void> {
  await api.delete(`/admin/delete-mac-device/${id}`);
}
