export const SUBSCRIPTION_PLAN_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'] as const;
export type SubscriptionPlanName = typeof SUBSCRIPTION_PLAN_NAMES[number];

export const AD_PLAN_TYPES = ['Slider', 'Banner', 'Business Card', 'Trendy Star', 'Exclusive Videos'] as const;
export type AdPlanType = typeof AD_PLAN_TYPES[number];

export interface SubscriptionPlan {
  name: SubscriptionPlanName;
  mrp: number;
  offerPrice: number;
}

export interface AdPlan {
  adType: AdPlanType;
  price: number;
}

export interface CommissionConfig {
  tour: number;
  cake: number;
  store: number;
  gstRate: number;
  bgtRate: number;
}

export type VoucherUsageType = 'one-time-individual' | 'one-time-vendor';
export type VoucherStatus = 'Active' | 'Expired' | 'Redeemed';

export interface Voucher {
  id: string;
  code: string;
  planTier: SubscriptionPlanName;
  discount: number;
  usageType: VoucherUsageType;
  status: VoucherStatus;
  expiryDate: string;
  createdBy: string;
  createdAt: string;
}

export interface CurrencyRate {
  country: string;
  currency: string;
  rateToInr: number;
}

export interface DsaLimitConfig {
  globalCreditLimit: number;
  currencyRates: CurrencyRate[];
}
