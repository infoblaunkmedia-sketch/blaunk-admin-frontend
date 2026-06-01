import type {
  SubscriptionPlan, AdPlan, CommissionConfig, Voucher,
  DsaLimitConfig, CurrencyRate,
  ProductPlanChargesConfig, AdPlanChargesConfig, AdPlanChargeRow,
} from './platform.types';
import { SUBSCRIPTION_PLAN_NAMES, AD_PLAN_TYPES } from './platform.types';

const SUB_PLANS_KEY = 'blaunk_sub_plans';
const AD_PLANS_KEY = 'blaunk_ad_plans';
const PRODUCT_PLAN_CHARGES_KEY = 'blaunk_product_plan_charges';
const AD_PLAN_CHARGES_KEY = 'blaunk_ad_plan_charges';
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

const DEFAULT_PRODUCT_PLAN_ROWS = [
  { name: 'Bronze', duration: '3 M Validity', subscription: 300, renewalFees: 300, maxMrp: 300, offer: 'TRY FREE FOR 7 DAYS' },
  { name: 'Silver', duration: '6 M Validity', subscription: 300, renewalFees: 300, maxMrp: 300, offer: 'TRY FREE FOR 7 DAYS' },
  { name: 'Gold', duration: '1 Yr Validity', subscription: 500, renewalFees: 500, maxMrp: 500, offer: 'TRY FREE FOR 7 DAYS' },
  { name: 'Diamond', duration: '1 Yr Validity', subscription: 999, renewalFees: 999, maxMrp: 999, offer: 'TRY FREE FOR 7 DAYS' },
  { name: 'Platinum', duration: '2 Yr Validity', subscription: 1999, renewalFees: 1999, maxMrp: 1999, offer: 'FREE 1 M VIDEO ADS' },
];

const DEFAULT_AD_PLAN_ROWS = [
  { name: 'Bronze', duration: '3M Validity', basicFees: 300, assuranceFees: 0 },
  { name: 'Silver', duration: '6M Validity', basicFees: 300, assuranceFees: 0 },
  { name: 'Gold', duration: '1Yr Validity', basicFees: 500, assuranceFees: 0 },
  { name: 'Diamond', duration: '1Yr Validity', basicFees: 999, assuranceFees: 0 },
  { name: 'Platinum', duration: '2Yr Validity', basicFees: 1999, assuranceFees: 0 },
];

/** Media Upload plan label → row name in saved ad plan charges (localStorage). */
const AD_PLAN_TIER_ALIASES: Record<string, string> = {
  Bronze: 'Bronze',
  Standard: 'Bronze',
};

function normalizeAdPlanRows(rows: AdPlanChargeRow[]): AdPlanChargeRow[] {
  return rows.map((r) => {
    if (r.name === 'Standard') return { ...r, name: 'Bronze' };
    return r;
  });
}

const DEFAULT_PRODUCT_PLAN_CHARGES: ProductPlanChargesConfig = {
  productPlan: '',
  rows: DEFAULT_PRODUCT_PLAN_ROWS,
};

const DEFAULT_AD_PLAN_CHARGES: AdPlanChargesConfig = {
  adPlan: '',
  rows: DEFAULT_AD_PLAN_ROWS,
};

/** Maps Media Upload tab names to Advertisement Plan charge keys (Marketing & Ads categories). */
export const MEDIA_TAB_TO_AD_PLAN: Record<string, string> = {
  Slider: 'Slider',
  Explore: 'Explore',
  'Trendy Star': 'Trendy Star',
  Exclusive: 'Exclusive',
  'Global Store': 'Partner Spotlight',
  'New Launch': 'Partner Spotlight',
  GIFF: 'Partner Spotlight',
  'Tour Package': 'Partner Spotlight',
  'Partner Spotlight': 'Partner Spotlight',
};

export function planLabelToTier(planLabel: string): string {
  const m = String(planLabel || '').match(/^(\w+)/);
  if (!m) return planLabel;
  if (m[1] === 'Premium') return 'Platinum';
  return m[1];
}
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

// Plan Charges (Product + Advertisement tables)
export async function fetchProductPlanCharges(): Promise<ProductPlanChargesConfig> {
  return load(PRODUCT_PLAN_CHARGES_KEY, DEFAULT_PRODUCT_PLAN_CHARGES);
}
export async function saveProductPlanCharges(config: ProductPlanChargesConfig): Promise<void> {
  persist(PRODUCT_PLAN_CHARGES_KEY, config);
  const plans: SubscriptionPlan[] = config.rows
    .filter((r) => SUBSCRIPTION_PLAN_NAMES.includes(r.name as SubscriptionPlan['name']))
    .map((r) => ({ name: r.name as SubscriptionPlan['name'], mrp: r.maxMrp, offerPrice: r.subscription }));
  if (plans.length) persist(SUB_PLANS_KEY, plans);
}

export async function fetchAdPlanCharges(): Promise<AdPlanChargesConfig> {
  const config = load(AD_PLAN_CHARGES_KEY, DEFAULT_AD_PLAN_CHARGES);
  return { ...config, rows: normalizeAdPlanRows(config.rows) };
}
export async function saveAdPlanCharges(config: AdPlanChargesConfig): Promise<void> {
  persist(AD_PLAN_CHARGES_KEY, config);
  if (config.adPlan && AD_PLAN_TYPES.includes(config.adPlan as typeof AD_PLAN_TYPES[number])) {
    const adType = config.adPlan as typeof AD_PLAN_TYPES[number];
    const existing = await fetchAdPlans();
    const price = config.rows[0]?.basicFees ?? 0;
    const idx = existing.findIndex((p) => p.adType === adType);
    const next = [...existing];
    if (idx >= 0) next[idx] = { adType, price };
    else next.push({ adType, price });
    persist(AD_PLANS_KEY, next);
  }
}

export async function resolveAdPlanFees(mediaTab: string, planLabel: string): Promise<Pick<AdPlanChargeRow, 'basicFees' | 'assuranceFees'>> {
  const config = await fetchAdPlanCharges();
  const tier = planLabelToTier(planLabel);
  const lookupNames = [
    tier,
    AD_PLAN_TIER_ALIASES[tier],
    tier === 'Bronze' ? 'Standard' : undefined,
  ].filter(Boolean) as string[];
  let row: AdPlanChargeRow | undefined;
  for (const name of lookupNames) {
    row = config.rows.find((r) => r.name.toLowerCase() === name.toLowerCase());
    if (row) break;
  }
  if (row) return { basicFees: row.basicFees, assuranceFees: row.assuranceFees };
  return { basicFees: 0, assuranceFees: 0 };
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
