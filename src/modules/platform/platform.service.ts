import type {
  SubscriptionPlan, AdPlan, CommissionConfig, Voucher,
  DsaLimitConfig, CurrencyRate,
} from './platform.types';
import { SUBSCRIPTION_PLAN_NAMES, AD_PLAN_TYPES } from './platform.types';

const SUB_PLANS_KEY = 'blaunk_sub_plans';
const AD_PLANS_KEY = 'blaunk_ad_plans';
const COMMISSION_KEY = 'blaunk_commission';
const VOUCHERS_KEY = 'blaunk_vouchers';
const DSA_LIMIT_KEY = 'blaunk_dsa_limit_config';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function loadArr<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]; }
  catch { return []; }
}
function persist(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data));
}

const DEFAULT_SUB_PLANS: SubscriptionPlan[] = SUBSCRIPTION_PLAN_NAMES.map((name) => ({
  name, mrp: 0, offerPrice: 0,
}));
const DEFAULT_AD_PLANS: AdPlan[] = AD_PLAN_TYPES.map((adType) => ({ adType, price: 0 }));
const DEFAULT_COMMISSION: CommissionConfig = { tour: 0, cake: 0, store: 0, gstRate: 0, bgtRate: 0 };
const DEFAULT_DSA_LIMIT: DsaLimitConfig = {
  globalCreditLimit: 0,
  currencyRates: [
    { country: 'UAE', currency: 'AED', rateToInr: 22.5 },
    { country: 'USA', currency: 'USD', rateToInr: 83 },
    { country: 'UK', currency: 'GBP', rateToInr: 105 },
    { country: 'Singapore', currency: 'SGD', rateToInr: 62 },
    { country: 'Malaysia', currency: 'MYR', rateToInr: 18 },
    { country: 'Qatar', currency: 'QAR', rateToInr: 23 },
    { country: 'Kuwait', currency: 'KWD', rateToInr: 270 },
    { country: 'Bahrain', currency: 'BHD', rateToInr: 220 },
  ],
};

// Subscription Plans
export async function fetchSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return load(SUB_PLANS_KEY, DEFAULT_SUB_PLANS);
}
export async function saveSubscriptionPlans(plans: SubscriptionPlan[]): Promise<void> {
  persist(SUB_PLANS_KEY, plans);
}

// Ad Plans
export async function fetchAdPlans(): Promise<AdPlan[]> {
  return load(AD_PLANS_KEY, DEFAULT_AD_PLANS);
}
export async function saveAdPlans(plans: AdPlan[]): Promise<void> {
  persist(AD_PLANS_KEY, plans);
}

// Commission
export async function fetchCommission(): Promise<CommissionConfig> {
  return load(COMMISSION_KEY, DEFAULT_COMMISSION);
}
export async function saveCommission(config: CommissionConfig): Promise<void> {
  persist(COMMISSION_KEY, config);
}

// Vouchers
export async function fetchVouchers(): Promise<Voucher[]> {
  return loadArr(VOUCHERS_KEY);
}
export async function saveVoucher(voucher: Voucher): Promise<void> {
  const all = loadArr<Voucher>(VOUCHERS_KEY);
  const idx = all.findIndex((v) => v.id === voucher.id);
  if (idx >= 0) all[idx] = voucher; else all.push(voucher);
  persist(VOUCHERS_KEY, all);
}
export async function deleteVoucher(id: string): Promise<void> {
  persist(VOUCHERS_KEY, loadArr<Voucher>(VOUCHERS_KEY).filter((v) => v.id !== id));
}
export function generateVoucherCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// DSA Limit Config
export async function fetchDsaLimitConfig(): Promise<DsaLimitConfig> {
  return load(DSA_LIMIT_KEY, DEFAULT_DSA_LIMIT);
}
export async function saveDsaLimitConfig(config: DsaLimitConfig): Promise<void> {
  persist(DSA_LIMIT_KEY, config);
}
export async function saveCurrencyRate(rate: CurrencyRate): Promise<void> {
  const config = await fetchDsaLimitConfig();
  const idx = config.currencyRates.findIndex((r) => r.country === rate.country);
  if (idx >= 0) config.currencyRates[idx] = rate;
  else config.currencyRates.push(rate);
  persist(DSA_LIMIT_KEY, config);
}
