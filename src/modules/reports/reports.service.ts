import { api } from '../../shared/services/apiService';

export type UploadSourceFilter = 'all' | 'vendor_direct' | 'admin_3p';

export type MisExportParams = {
  department: string;
  reportType: string;
  fromDate: string;
  toDate: string;
  uploadSource?: UploadSourceFilter;
  extraFilter?: string;
};

export async function fetchMisReportRows(params: MisExportParams): Promise<Record<string, unknown>[]> {
  const res = await api.post<{ rows: Record<string, unknown>[] }>('/api/reports/mis-export', {
    department: params.department,
    reportType: params.reportType,
    fromDate: params.fromDate,
    toDate: params.toDate,
    uploadSource: params.uploadSource || 'all',
    extraFilter: params.extraFilter || '',
  });
  return res.rows || [];
}
