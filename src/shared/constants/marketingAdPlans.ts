/** Advertisement plan types (Marketing & Ads media categories). */
export const MARKETING_AD_PLAN_OPTIONS = [
  'Partner Spotlight',
  'Explore',
  'Slider',
  'Exclusive',
  'Trendy Star',
] as const;

export type MarketingAdPlanOption = (typeof MARKETING_AD_PLAN_OPTIONS)[number];
