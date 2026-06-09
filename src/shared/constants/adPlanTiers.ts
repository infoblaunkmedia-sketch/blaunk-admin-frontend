import { MARKETING_AD_PLAN_OPTIONS, type MarketingAdPlanOption } from './marketingAdPlans';

/** Duration tiers shown in Media Upload / Sales when picking Bronze, Silver, etc. */
export const MEDIA_PLAN_TIERS = [
  'Bronze',
  'Silver',
  'Gold',
  'Diamond',
  'Platinum',
  'Infinity',
] as const;

export type MediaPlanTier = (typeof MEDIA_PLAN_TIERS)[number];

/**
 * Allowed duration tiers per Advertisement Plan category (Management → Plan Charges → Adv plan).
 * - Partner Spotlight: Bronze + Silver
 * - Explore & Slider: Silver only
 * - Exclusive & Trendy Star: all tiers
 */
export const AD_PLAN_ALLOWED_TIERS: Record<MarketingAdPlanOption, readonly MediaPlanTier[]> = {
  'Partner Spotlight': ['Bronze', 'Silver'],
  Explore: ['Silver'],
  Slider: ['Silver'],
  Exclusive: MEDIA_PLAN_TIERS,
  'Trendy Star': MEDIA_PLAN_TIERS,
};

export function isMarketingAdPlanOption(value: string): value is MarketingAdPlanOption {
  return (MARKETING_AD_PLAN_OPTIONS as readonly string[]).includes(value);
}

/** Resolve allowed Bronze/Silver/… options for a saved Adv plan category name. */
export function allowedTiersForAdPlan(adPlan: string): MediaPlanTier[] {
  const key = String(adPlan || '').trim();
  if (isMarketingAdPlanOption(key)) {
    return [...AD_PLAN_ALLOWED_TIERS[key]];
  }
  return [...MEDIA_PLAN_TIERS];
}
