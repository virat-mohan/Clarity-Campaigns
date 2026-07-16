import type { CampaignId } from "@/lib/scoring/types";
import type { SkuId } from "@/lib/data/campaign-types";

export const CAMPAIGN_ID_TO_SKU: Record<CampaignId, SkuId> = {
  performance_marketing: "performance",
  outbound_sales: "abm",
  social_organic: "social",
  seo_aeo: "content",
  customer_retention: "retention",
};

export const SKU_TO_CAMPAIGN_ID: Record<SkuId, CampaignId> = {
  performance: "performance_marketing",
  abm: "outbound_sales",
  social: "social_organic",
  content: "seo_aeo",
  retention: "customer_retention",
};
