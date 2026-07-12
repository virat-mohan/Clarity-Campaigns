// The scoring engine (lib/scoring) identifies campaigns by CampaignId
// ("performance_marketing", "outbound_sales", ...), while the rest of the app
// identifies them by SkuId ("performance", "abm", ...) from lib/data/campaign-types.
// This maps between the two so quiz results can link into the existing SKU flow.
import type { CampaignId } from "@/lib/scoring/types";
import type { SkuId } from "@/lib/data/campaign-types";

export const CAMPAIGN_ID_TO_SKU: Record<CampaignId, SkuId> = {
  performance_marketing: "performance",
  outbound_sales: "abm",
  social_organic: "social",
  seo_aeo: "content",
  customer_retention: "retention",
};
