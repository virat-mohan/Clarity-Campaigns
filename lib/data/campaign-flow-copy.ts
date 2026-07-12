// Copy for the new 4-screen campaign flow (Campaign Flow Product Brief, July 2026),
// Section 4 "Campaign Types — Full Specification". Kept separate from
// lib/data/campaign-types.ts (desc/channels there are still read by the
// existing cost-plus /build/[sku] flow) so this new flow's fixed-$499 copy
// can diverge without touching that flow's data.
import type { SkuId } from "./campaign-types";

export interface CampaignFlowCopy {
  description: string;
  goalLine: string;
  channels: string[];
  price: number;
  durationLabel: string;
  /** Section 4 "Deliverables" list, shown on the Pay screen with checkmarks. */
  deliverables: string[];
  /** "A dedicated team of 5–6 human experts" (brief Section 5.2) — kept as a
   * single number per SKU rather than the full Human Pod hours table, which
   * belongs to the (not-yet-built) Plan screen. */
  podSize: number;
}

export const CAMPAIGN_FLOW_COPY: Record<SkuId, CampaignFlowCopy> = {
  social: {
    description: "Platform-native content that builds compounding audience and demand — without ad spend.",
    goalLine: "Follower growth, brand presence, organic reach",
    channels: ["Instagram", "LinkedIn", "X (Twitter)", "YouTube"],
    price: 499,
    durationLabel: "4-week sprint",
    deliverables: [
      "Brand Intelligence content brief with BCP",
      "4-week content calendar",
      "16–20 branded posts (carousels, reels, statics)",
      "Caption copy for all posts",
      "Hashtag and distribution strategy",
      "Performance summary report",
    ],
    podSize: 6,
  },
  content: {
    description: "Authoritative content that ranks on search engines and AI answer engines. Compounds over time.",
    goalLine: "Organic search traffic, AI engine visibility, domain authority",
    channels: ["Blog", "LinkedIn", "Google", "AI Engines"],
    price: 499,
    durationLabel: "4-week sprint",
    deliverables: [
      "Keyword research + AEO topic map",
      "4–8 long-form articles (800–1,500 words each)",
      "Meta titles and descriptions for all pieces",
      "LinkedIn distribution post per article",
      "Google Search Console submission",
      "Performance tracking setup",
    ],
    podSize: 6,
  },
  abm: {
    description: "Multi-touch outreach to a named account book — email, LinkedIn, WhatsApp. Meetings in your calendar.",
    goalLine: "Qualified sales conversations, pipeline generation, meetings booked",
    channels: ["Email", "LinkedIn", "WhatsApp", "Smartlead"],
    price: 499,
    durationLabel: "4-week sprint",
    deliverables: [
      "ICP definition and buyer signals map",
      "Verified contact list (500 contacts)",
      "3-touch multi-channel sequence (email + LinkedIn + WhatsApp)",
      "Smartlead campaign setup and warmup",
      "Reply management and meeting booking",
      "Sprint performance report",
    ],
    podSize: 6,
  },
  performance: {
    description: "Paid media on Meta and Google, built on your brand ICP and voice. Tuned to a target ROAS from week one.",
    goalLine: "Revenue, ROAS, qualified traffic, lead generation",
    channels: ["Meta Ads", "Google Search", "Google Display", "YouTube Ads"],
    price: 499,
    durationLabel: "4-week sprint",
    deliverables: [
      "Audience strategy and targeting map",
      "15 ad creatives (static + video)",
      "Campaign structure and ad set architecture",
      "A/B testing framework",
      "Daily performance monitoring (28 days)",
      "ROAS and revenue performance report",
    ],
    podSize: 6,
  },
  retention: {
    description: "Behavioural email and WhatsApp flows that protect revenue you've already earned and extend customer LTV.",
    goalLine: "Repeat purchase rate, LTV increase, churn reduction",
    channels: ["Email Flows", "WhatsApp", "Klaviyo / HubSpot / Mailchimp"],
    price: 499,
    durationLabel: "4-week sprint",
    deliverables: [
      "Lifecycle audit and gap analysis",
      "RFM customer segmentation",
      "3–6 automated email flows (5–10 emails each)",
      "WhatsApp broadcast scripts (if selected)",
      "Platform setup and trigger configuration",
      "Revenue attribution report (day 28)",
    ],
    podSize: 6,
  },
};

// Deep-link slugs per brief Section 7.1 ("campaign.clarityhq.ai?type=outbound-sales").
export const SKU_TO_SLUG: Record<SkuId, string> = {
  abm: "outbound-sales",
  social: "social-organic",
  content: "content-led",
  performance: "performance-marketing",
  retention: "customer-retention",
};

export const SLUG_TO_SKU: Record<string, SkuId> = Object.fromEntries(
  Object.entries(SKU_TO_SLUG).map(([sku, slug]) => [slug, sku as SkuId])
) as Record<string, SkuId>;
