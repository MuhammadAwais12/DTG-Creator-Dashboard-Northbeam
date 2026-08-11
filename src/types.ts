export type DateRange = '7d' | '14d' | '30d' | '90d';

export interface AdMetric {
  adId: string;
  adName: string;
  channel: string;
  spend: number;
  convValue: number;
  orders: number;
  adImageUrl?: string;
  videoUrl?: string;
  // Computed fields (or calculated by frontend/backend)
  roas?: number;
  aov?: number;
  estCommission?: number;
}

export interface KpiMetrics {
  totalSpend: number;
  convValue: number;
  roas: number;
  aov: number;
  estCommission: number;
  totalOrders: number;
}

export interface CreatorUser {
  name: string;
  code: string;
}
