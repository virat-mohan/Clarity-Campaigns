/** Duration bundle pricing for multi-month plans (HTML demo / start flow). */
export const BASE_CAMPAIGN_PRICE = 499;

export const DURATION_DISCOUNT_LABEL: Record<1 | 2 | 3, string> = {
  1: "No discount",
  2: "15% off",
  3: "20% off",
};

export function bundlePrice(months: number): number {
  const base = BASE_CAMPAIGN_PRICE;
  if (months >= 3) return Math.round(base * 3 * 0.8);
  if (months === 2) return Math.round(base * 2 * 0.85);
  return base;
}
