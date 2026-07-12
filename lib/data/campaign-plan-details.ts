// Screen 3 ("Your Plan") data, per the Campaign Flow Product Brief Section 4
// "Campaign Types — Full Specification". Kept separate from
// lib/data/campaign-flow-copy.ts (Screens 1/2/4 copy) since this is
// Plan-screen-specific: the weekly sprint process, the full Human Pod
// hours table, and KPI benchmark copy.
import type { SkuId } from "./campaign-types";

export interface WeeklyProcessStep {
  week: number;
  title: string;
  description: string;
}

export interface HumanPodRole {
  role: string;
  hours: number;
}

// The brief's Section 4 KPI benchmarks are only ever given for India and US —
// Section 7.3 lists 5 markets (IN/US/AE/UK/SG) but AE/UK/SG have no benchmark
// copy anywhere in the doc. Screen 3 falls back to this for those markets.
// TODO: add AE/UK/SG benchmark copy once available.
export const GENERIC_KPI_BENCHMARK_NOTE =
  "Benchmarks for this market are being calibrated — ask your account lead for current ranges.";

export interface CampaignPlanDetails {
  weeklyProcess: WeeklyProcessStep[];
  humanPod: HumanPodRole[];
  kpiBenchmarks: Record<"IN" | "US", string>;
}

export const CAMPAIGN_PLAN_DETAILS: Record<SkuId, CampaignPlanDetails> = {
  social: {
    weeklyProcess: [
      { week: 1, title: "Intelligence & Audit", description: "Brand X-Ray → ICP mapping, competitor audit, content strategy" },
      { week: 2, title: "Content Architecture", description: "Content pillars, template design, copy framework, hook development" },
      { week: 3, title: "Production & Schedule", description: "Asset creation, caption writing, content calendar, review & approve" },
      { week: 4, title: "Publish & Optimise", description: "Go live, engagement monitoring, performance review, next sprint plan" },
    ],
    humanPod: [
      { role: "Campaign Lead", hours: 8 },
      { role: "Social Media Strategist", hours: 5 },
      { role: "Copywriter", hours: 10 },
      { role: "Graphic Designer", hours: 10 },
      { role: "Video Editor", hours: 10 },
      { role: "Brand QA", hours: 4 },
    ],
    kpiBenchmarks: {
      IN: "+200–500 followers, 20,000–60,000 reach, 3.5–5.5% engagement rate.",
      US: "+100–300 followers, 10,000–25,000 reach, 2–4% engagement.",
    },
  },
  content: {
    weeklyProcess: [
      { week: 1, title: "Keyword & Topic Intelligence", description: "Keyword research, AEO topic mapping, competitor content audit" },
      { week: 2, title: "Content Planning", description: "Article outlines, internal linking strategy, SEO structure" },
      { week: 3, title: "Content Production", description: "Articles written, meta copy, schema markup, images & formatting" },
      { week: 4, title: "Publish & Index", description: "Content live, submit to Google Search Console, LinkedIn distribution, tracking" },
    ],
    humanPod: [
      { role: "Campaign Lead", hours: 8 },
      { role: "SEO Strategist", hours: 5 },
      { role: "Content Writer (×2)", hours: 20 },
      { role: "AEO Specialist", hours: 6 },
      { role: "Brand QA", hours: 4 },
    ],
    // Brief gives one KPI set for this campaign, not split by market.
    kpiBenchmarks: {
      IN: "4–8 articles published, 500–3,000 impressions/month by week 8, Page 1 ranking for 2–3 target keywords, featured in 3–5 AI answer engine responses.",
      US: "4–8 articles published, 500–3,000 impressions/month by week 8, Page 1 ranking for 2–3 target keywords, featured in 3–5 AI answer engine responses.",
    },
  },
  abm: {
    weeklyProcess: [
      { week: 1, title: "ICP & List Build", description: "ICP definition, account sourcing, contact verification, CRM setup" },
      { week: 2, title: "Sequence Build", description: "Outreach copy (3 touches), LinkedIn profile, WhatsApp scripts, Smartlead setup" },
      { week: 3, title: "Campaign Live", description: "Day 0 sends, reply handling, follow-up sequencing, meeting booking" },
      { week: 4, title: "Optimise & Report", description: "A/B analysis, reply classification, pipeline report, subsequence setup" },
    ],
    humanPod: [
      { role: "Campaign Lead", hours: 8 },
      { role: "Outbound Strategist", hours: 8 },
      { role: "Copywriter (B2B)", hours: 10 },
      { role: "List Builder", hours: 12 },
      { role: "SDR / Inbox Manager", hours: 16 },
      { role: "CRM Setup", hours: 4 },
    ],
    kpiBenchmarks: {
      IN: "45–60% open rate, 3–6% reply rate, 8–20 meetings booked.",
      US: "35–50% open rate, 2–4% reply rate, 5–15 meetings booked.",
    },
  },
  performance: {
    weeklyProcess: [
      { week: 1, title: "Intelligence & Creative Brief", description: "ICP mapping, audience build, creative brief, landing page review" },
      { week: 2, title: "Creative Production", description: "Ad creatives (static + video), copy variants, A/B testing framework" },
      { week: 3, title: "Campaign Launch", description: "Ads live, budget pacing, daily monitoring, optimisation signals" },
      { week: 4, title: "Optimise & Scale", description: "A/B results, winning creative scaling, ROAS report, sprint 2 recommendations" },
    ],
    humanPod: [
      { role: "Campaign Lead", hours: 8 },
      { role: "Paid Media Strategist", hours: 12 },
      { role: "Ad Copywriter", hours: 8 },
      { role: "Creative Designer", hours: 12 },
      { role: "Media Buyer", hours: 10 },
      { role: "Analytics & Reporting", hours: 6 },
    ],
    kpiBenchmarks: {
      IN: "$500 budget: ~12,000–18,000 impressions, ~250–400 clicks, 5–10 conversions, CPA $50–100.",
      US: "$500 budget: ~3,000–6,000 impressions, ~60–120 clicks, 1–3 conversions, CPA $150–500.",
    },
  },
  retention: {
    weeklyProcess: [
      { week: 1, title: "Lifecycle Audit & Strategy", description: "Flow audit, segment mapping, lifecycle stage definition, revenue leakage analysis" },
      { week: 2, title: "Flow Architecture & Copy", description: "Email flow structure, WhatsApp scripts, copy per flow, design brief" },
      { week: 3, title: "Build & Test", description: "Flows built in platform, QA all triggers, A/B subject lines, test sends" },
      { week: 4, title: "Launch & Monitor", description: "Flows live, trigger monitoring, open/click/revenue tracking, report" },
    ],
    humanPod: [
      { role: "Campaign Lead", hours: 8 },
      { role: "Lifecycle Strategist", hours: 8 },
      { role: "Email Copywriter", hours: 14 },
      { role: "WhatsApp Script Writer", hours: 6 },
      { role: "Platform Builder", hours: 12 },
      { role: "QA & Analytics", hours: 6 },
    ],
    // Brief gives one KPI set for this campaign, not split by market.
    kpiBenchmarks: {
      IN: "35–55% email open rate, 4–8% click rate, +15–25% repeat purchase rate, 2–5× campaign cost in recovered revenue within 90 days.",
      US: "35–55% email open rate, 4–8% click rate, +15–25% repeat purchase rate, 2–5× campaign cost in recovered revenue within 90 days.",
    },
  },
};
