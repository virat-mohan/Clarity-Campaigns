// Placeholders for the Pay screen's Stripe integration, per brief Section
// 7.1 ("Payment / Stripe — Replace placeholder in goToStripe() function with
// live Stripe Payment Link URL") and Section 7.4 ("Create one Stripe Payment
// Link per campaign type — 5 links total — at $499"). All five currently
// point at the same placeholder so the Pay screen is wireable and testable
// today; swapping in real links later is a one-line edit per campaign below,
// not a refactor of goToStripe() or its caller.
import type { SkuId } from "@/lib/data/campaign-types";

const STRIPE_PLACEHOLDER_LINK = "https://buy.stripe.com/test_placeholder";

export const STRIPE_LINKS: Record<SkuId, string> = {
  social: STRIPE_PLACEHOLDER_LINK, // TODO: replace with real Stripe link once available
  content: STRIPE_PLACEHOLDER_LINK, // TODO: replace with real Stripe link once available
  abm: STRIPE_PLACEHOLDER_LINK, // TODO: replace with real Stripe link once available
  performance: STRIPE_PLACEHOLDER_LINK, // TODO: replace with real Stripe link once available
  retention: STRIPE_PLACEHOLDER_LINK, // TODO: replace with real Stripe link once available
};

/**
 * Sends the customer to the Stripe Payment Link for their campaign type.
 * Named to match the brief's Section 7.1 `goToStripe()` reference so the
 * eventual live-link swap (and any webhook wiring around it) is a drop-in.
 */
export function goToStripe(campaignId: string) {
  const link = STRIPE_LINKS[campaignId as SkuId] ?? STRIPE_PLACEHOLDER_LINK;
  window.location.href = link;
}
