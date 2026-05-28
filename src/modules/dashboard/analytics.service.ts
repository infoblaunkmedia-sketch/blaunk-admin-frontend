import { api } from '../../shared/services/apiService';

export type AnalyticsSummary = {
  totalUsers: number;
  totalSellers: { pending: number; approved: number; rejected: number; total: number };
  totalOrders: number;
  totalRevenue: number;
  totalGst: number;
  dsaPayoutTotal: number;
  dsaPayoutPending: number;
  referralCommissionTotal: number;
  pendingProductApprovals: number;
  pendingSellerApprovals: number;
};

export type ChartPoint = { date: string; count?: number; orders?: number; revenue?: number };

export async function fetchAnalyticsSummary() {
  const res = await api.get<{ summary: AnalyticsSummary }>('/api/analytics/summary');
  return res.summary;
}

export async function fetchAnalyticsCharts(range = '30d') {
  const res = await api.get<{
    charts: { newUsersByDay: ChartPoint[]; ordersByDay: ChartPoint[] };
  }>(`/api/analytics/charts?range=${encodeURIComponent(range)}`);
  return res.charts;
}
