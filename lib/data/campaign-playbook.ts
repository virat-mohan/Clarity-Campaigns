// Ported from the campaign.clarityhq.ai marketing page (campaign-preview.html).
// Keyed to the same SkuId used in campaign-types.ts.
import type { SkuId } from "./campaign-types";

export interface PlaybookStep {
  week: number;
  title: string;
  desc: string;
}

export type PodRole = [role: string, hours: number];

export interface CampaignPlaybook {
  steps: [PlaybookStep, PlaybookStep, PlaybookStep, PlaybookStep];
  pod: PodRole[];
  kpi: {
    IN: string;
    US: string;
  };
}

export const CAMPAIGN_PLAYBOOKS: Record<SkuId, CampaignPlaybook> = {
  social: {
    steps: [
      { week: 1, title: "Intelligence & Audit", desc: "Brand X-Ray, ICP mapping, competitor audit, content strategy" },
      { week: 2, title: "Content Architecture", desc: "Pillars, templates, copy framework, hooks" },
      { week: 3, title: "Production & Schedule", desc: "Assets, captions, calendar, review & approve" },
      { week: 4, title: "Publish & Optimise", desc: "Go live, engagement monitoring, next-sprint plan" },
    ],
    pod: [
      ["Campaign Lead", 8],
      ["Social Media Strategist", 5],
      ["Copywriter", 10],
      ["Graphic Designer", 10],
      ["Video Editor", 10],
      ["Brand QA", 4],
    ],
    kpi: {
      IN: "+200–500 followers, 20,000–60,000 reach, 3.5–5.5% engagement.",
      US: "+100–300 followers, 10,000–25,000 reach, 2–4% engagement.",
    },
  },
  content: {
    steps: [
      { week: 1, title: "Keyword & Topic Intelligence", desc: "Keyword research, AEO topic map, competitor audit" },
      { week: 2, title: "Content Planning", desc: "Outlines, internal linking, SEO structure" },
      { week: 3, title: "Content Production", desc: "Articles, meta copy, schema, formatting" },
      { week: 4, title: "Publish & Index", desc: "Live, Search Console submit, LinkedIn distribution" },
    ],
    pod: [
      ["Campaign Lead", 8],
      ["SEO Strategist", 5],
      ["Content Writer (×2)", 20],
      ["AEO Specialist", 6],
      ["Brand QA", 4],
    ],
    kpi: {
      IN: "4–8 articles live, 500–3,000 impressions/mo by week 8, page-1 for 2–3 keywords.",
      US: "4–8 articles live, 500–3,000 impressions/mo by week 8, page-1 for 2–3 keywords.",
    },
  },
  abm: {
    steps: [
      { week: 1, title: "ICP & List Build", desc: "ICP, account sourcing, contact verification, CRM setup" },
      { week: 2, title: "Sequence Build", desc: "3-touch copy, LinkedIn, WhatsApp scripts, Smartlead setup" },
      { week: 3, title: "Campaign Live", desc: "Sends, reply handling, follow-ups, meeting booking" },
      { week: 4, title: "Optimise & Report", desc: "A/B analysis, pipeline report, subsequence setup" },
    ],
    pod: [
      ["Campaign Lead", 8],
      ["Outbound Strategist", 8],
      ["Copywriter (B2B)", 10],
      ["List Builder", 12],
      ["SDR / Inbox Manager", 16],
      ["CRM Setup", 4],
    ],
    kpi: {
      IN: "45–60% open rate, 3–6% reply rate, 8–20 meetings booked.",
      US: "35–50% open rate, 2–4% reply rate, 5–15 meetings booked.",
    },
  },
  performance: {
    steps: [
      { week: 1, title: "Intelligence & Creative Brief", desc: "ICP mapping, audience build, landing page review" },
      { week: 2, title: "Creative Production", desc: "Ad creatives, copy variants, A/B framework" },
      { week: 3, title: "Campaign Launch", desc: "Ads live, budget pacing, daily monitoring" },
      { week: 4, title: "Optimise & Scale", desc: "A/B results, winner scaling, ROAS report" },
    ],
    pod: [
      ["Campaign Lead", 8],
      ["Paid Media Strategist", 12],
      ["Ad Copywriter", 8],
      ["Creative Designer", 12],
      ["Media Buyer", 10],
      ["Analytics & Reporting", 6],
    ],
    kpi: {
      IN: "$500 spend: ~12,000–18,000 impressions, 5–10 conversions, CPA $50–100.",
      US: "$500 spend: ~3,000–6,000 impressions, 1–3 conversions, CPA $150–500.",
    },
  },
  retention: {
    steps: [
      { week: 1, title: "Lifecycle Audit & Strategy", desc: "Flow audit, segment mapping, revenue leakage analysis" },
      { week: 2, title: "Flow Architecture & Copy", desc: "Email structure, WhatsApp scripts, copy per flow" },
      { week: 3, title: "Build & Test", desc: "Flows built, QA triggers, A/B subject lines" },
      { week: 4, title: "Launch & Monitor", desc: "Live, trigger monitoring, revenue tracking, report" },
    ],
    pod: [
      ["Campaign Lead", 8],
      ["Lifecycle Strategist", 8],
      ["Email Copywriter", 14],
      ["WhatsApp Script Writer", 6],
      ["Platform Builder", 12],
      ["QA & Analytics", 6],
    ],
    kpi: {
      IN: "35–55% open rate, 4–8% click rate, +15–25% repeat purchase rate.",
      US: "35–55% open rate, 4–8% click rate, +15–25% repeat purchase rate.",
    },
  },
};

// Display order for the marketplace accordion (matches campaign-preview.html).
export const CAMPAIGN_ORDER: SkuId[] = ["social", "content", "abm", "performance", "retention"];
