export const SUBSCRIPTION_PLAN_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'] as const;
export type SubscriptionPlanName = typeof SUBSCRIPTION_PLAN_NAMES[number];

import { MARKETING_AD_PLAN_OPTIONS } from '../../shared/constants/marketingAdPlans';

export const AD_PLAN_TYPES = MARKETING_AD_PLAN_OPTIONS;
export type AdPlanType = (typeof MARKETING_AD_PLAN_OPTIONS)[number];

export interface SubscriptionPlan {
  name: SubscriptionPlanName;
  mrp: number;
  offerPrice: number;
}

export interface AdPlan {
  adType: AdPlanType;
  price: number;
}

export interface ProductPlanChargeRow {
  id?: string;
  name: string;
  duration: string;
  subscription: number;
  renewalFees: number;
  maxMrp: number;
  offer: string;
}

export interface AdPlanChargeRow {
  name: string;
  duration: string;
  basicFees: number;
  assuranceFees: number;
}

export interface ProductPlanChargesConfig {
  productPlan: string;
  rows: ProductPlanChargeRow[];
}

export interface AdPlanChargesConfig {
  adPlan: string;
  rows: AdPlanChargeRow[];
}

export interface CommissionConfig {
  tour: number;
  cake: number;
  store: number;
  boutique: number;
  bgt: number;
  hotel: number;
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
