// Ported from ClarityHQ Master Campaign Builder (CT).
export type SkuId = "abm" | "social" | "content" | "performance" | "retention";

export type FlywheelStage = "Acquisition" | "Conversion" | "Retention";

export interface CampaignType {
  id: SkuId;
  label: string;
  mode: "sales" | "marketing";
  desc: string;
  channels: string[];
  flywheelStage: FlywheelStage;
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
  },
  social: {
    id: "social",
    label: "Social Organic",
    mode: "marketing",
    desc: "Platform-native content strategy across owned channels.",
    channels: ["Instagram", "LinkedIn", "X / Twitter", "YouTube"],
    flywheelStage: "Acquisition",
  },
  content: {
    id: "content",
    label: "Content-Led (SEO/AEO)",
    mode: "marketing",
    desc: "Ranking on search and AI answer engines through authoritative content.",
    channels: ["SEO / AEO", "Blog", "LinkedIn"],
    flywheelStage: "Acquisition",
  },
  performance: {
    id: "performance",
    label: "Performance / Paid 360",
    mode: "marketing",
    desc: "Paid media on Meta and Google with creatives and weekly optimisation.",
    channels: ["Meta Ads", "Google Ads", "Instagram"],
    flywheelStage: "Conversion",
  },
  retention: {
    id: "retention",
    label: "Retention / Lifecycle",
    mode: "sales",
    desc: "Behavioural email and WhatsApp flows for existing customers.",
    channels: ["Email", "WhatsApp"],
    flywheelStage: "Retention",
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
  { type: "Research Article", medium: "Text", size: "1500 words", unit: "-" },
  { type: "Case Study", medium: "Text", size: "-", unit: "-" },
  { type: "Static Ad", medium: "Design", size: "-", unit: "-" },
  { type: "X Post", medium: "Text", size: "-", unit: "-" },
  { type: "Slide", medium: "Design", size: "-", unit: "-" },
];

// Asset types that warrant showing the video vendor toggle panel (AI Video / Film Director / Photographer).
export const VIDEO_ASSET_TYPES = new Set(["Reel"]);
