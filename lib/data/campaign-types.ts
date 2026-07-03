// Ported from ClarityHQ Master Campaign Builder (CT).
import type { IndustryId } from "./industry-benchmarks";

export type SkuId = "abm" | "social" | "content" | "performance" | "retention";

export type FlywheelStage = "Acquisition" | "Conversion" | "Retention";

export interface CampaignType {
  id: SkuId;
  label: string;
  mode: "sales" | "marketing";
  desc: string;
  channels: string[];
  flywheelStage: FlywheelStage;
  // Editorial guidance on what kind of business this motion fits — not a
  // numeric benchmark, just marketing judgment referencing the industries
  // already modelled in industry-benchmarks.ts.
  fitRationale: string;
  bestFitIndustries: IndustryId[];
}

// Flywheel stage is a manual editorial mapping (Acquisition / Conversion / Retention),
// not sourced from the HTML tool — it doesn't model funnel stage.
export const CAMPAIGN_TYPES: Record<SkuId, CampaignType> = {
  abm: {
    id: "abm",
    label: "ABM / Outbound",
    mode: "sales",
    desc: "Multi-touch outbound via email, LinkedIn, and WhatsApp on a fixed account book.",
    channels: ["Email", "LinkedIn", "WhatsApp"],
    flywheelStage: "Conversion",
    fitRationale:
      "High-value, longer sales-cycle businesses, where a well-researched, personal conversation with a named account outperforms broad reach.",
    bestFitIndustries: ["realestate", "finance", "saas"],
  },
  social: {
    id: "social",
    label: "Social Organic",
    mode: "marketing",
    desc: "Platform-native content strategy across owned channels.",
    channels: ["Instagram", "LinkedIn", "X / Twitter", "YouTube"],
    flywheelStage: "Acquisition",
    fitRationale:
      "Brands built on visual identity, taste, or community, where consistent presence compounds into demand over time.",
    bestFitIndustries: ["d2c", "fnb", "health"],
  },
  content: {
    id: "content",
    label: "Content-Led (SEO/AEO)",
    mode: "marketing",
    desc: "Ranking on search and AI answer engines through authoritative content.",
    channels: ["SEO / AEO", "Blog", "LinkedIn"],
    flywheelStage: "Acquisition",
    fitRationale:
      "Considered-purchase categories where buyers research extensively before deciding, and being the trusted answer wins the deal.",
    bestFitIndustries: ["saas", "finance", "edu"],
  },
  performance: {
    id: "performance",
    label: "Performance / Paid 360",
    mode: "marketing",
    desc: "Paid media on Meta and Google with creatives and weekly optimisation.",
    channels: ["Meta Ads", "Google Ads", "Instagram"],
    flywheelStage: "Conversion",
    fitRationale:
      "Businesses with a clear, trackable conversion event, where paid spend can be tuned toward a target cost-per-lead or ROAS.",
    bestFitIndustries: ["d2c", "fmcg", "realestate"],
  },
  retention: {
    id: "retention",
    label: "Retention / Lifecycle",
    mode: "sales",
    desc: "Behavioural email and WhatsApp flows for existing customers.",
    channels: ["Email", "WhatsApp"],
    flywheelStage: "Retention",
    fitRationale:
      "Businesses that live on repeat behaviour — repurchase, renewal, or continued engagement — rather than one-time acquisition.",
    bestFitIndustries: ["d2c", "fnb", "finance"],
  },
};

export const CAMPAIGN_TYPE_LIST: CampaignType[] = Object.values(CAMPAIGN_TYPES);

export interface AssetTypeDef {
  type: string;
  medium: "Text" | "Design" | "Video";
  size: string;
  unit: string;
}

// Ported from ASSET_TYPES in the source HTML.
export const ASSET_TYPES: AssetTypeDef[] = [
  { type: "Blog Post", medium: "Text", size: "500 words", unit: "Medium post" },
  { type: "Carousel", medium: "Design", size: "6 images", unit: "LI Post" },
  { type: "Reel", medium: "Video", size: "30 Sec", unit: "-" },
  { type: "Video", medium: "Video", size: "60-90 Sec", unit: "-" },
  { type: "Research Article", medium: "Text", size: "1500 words", unit: "-" },
  { type: "Case Study", medium: "Text", size: "-", unit: "-" },
  { type: "Static Ad", medium: "Design", size: "-", unit: "-" },
  { type: "X Post", medium: "Text", size: "-", unit: "-" },
  { type: "Slide", medium: "Design", size: "-", unit: "-" },
];
