import { api } from '../../shared/services/apiService';

export type AnalyticsSummary = {
  totalUsers: number;
  totalSellers: { pending: number; approved: number; rejected: number; total: number };
  totalOrders: number;
  totalRevenue: number;
  totalGst: number;
  dsaPayoutTotal: number;
  dsaPayoutPending: number;
  dsaPayoutPendingCount?: number;
  referralCommissionTotal: number;
  pendingProductApprovals: number;
  pendingSellerApprovals: number;
};

export type ChartPoint = { date: string; count?: number; orders?: number; revenue?: number };

export type ChartsData = {
  newUsersByDay: { date: string; count: number }[];
  ordersByDay: { date: string; orders: number; revenue: number }[];
};

export async function fetchAnalyticsSummary() {
  const res = await api.get<{ summary: AnalyticsSummary }>('/api/analytics/summary');
  return res.summary;
}

export async function fetchAnalyticsCharts(range = '30d'): Promise<ChartsData> {
  const res = await api.get<{
    charts: { newUsersByDay: ChartPoint[]; ordersByDay: ChartPoint[] };
  }>(`/api/analytics/charts?range=${encodeURIComponent(range)}`);
  const { newUsersByDay, ordersByDay } = res.charts;
  return {
    newUsersByDay: (newUsersByDay || []).map((d) => ({
      date: d.date,
      count: Number(d.count ?? 0),
    })),
    ordersByDay: (ordersByDay || []).map((d) => ({
      date: d.date,
      orders: Number(d.orders ?? 0),
      revenue: Number(d.revenue ?? 0),
    })),
  };
}
