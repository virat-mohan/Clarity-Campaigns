// Talent & Vendor Roster (seed data).
// Core pod rows are deduplicated from ROLE_LIBRARY in the uploaded HTML — always
// auto-staffed per SKU, shown here for reference/cost-basis only (not user-toggled).
// Retainer rows are from a June 2026 hiring-compensation chat (not in the HTML's
// role library) — offered as togglable add-on capacity.
// Vendor rows have no existing rate card in either source — built editable/TBD,
// matching how influencer costs are handled as placeholders in the source HTML.
export type EngagementType = "freelance-hourly" | "freelance-retainer" | "vendor-project";

export interface RosterEntry {
  id: string;
  name: string;
  dept: string;
  level: string;
  engagementType: EngagementType;
  rate: number | null; // null = TBD, editable
  rateUnit: string;
  togglable: boolean;
  source: string;
}

export const CORE_POD_ROSTER: RosterEntry[] = [
  { id: "engagement-lead", name: "Engagement Lead", dept: "Marketing", level: "Agency L1", engagementType: "freelance-hourly", rate: 55, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "marketing-strategy-lead", name: "Marketing Strategy Lead", dept: "Marketing", level: "Agency L2", engagementType: "freelance-hourly", rate: 42, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "paid-media-manager", name: "Paid Media Manager", dept: "Marketing", level: "Agency L3", engagementType: "freelance-hourly", rate: 32, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "content-seo-manager", name: "Content + SEO Manager", dept: "Marketing", level: "Agency L3", engagementType: "freelance-hourly", rate: 30, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "social-crm-manager", name: "Social + CRM Manager", dept: "Marketing", level: "Agency L3", engagementType: "freelance-hourly", rate: 28, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "analytics-manager", name: "Analytics Manager", dept: "Marketing", level: "Agency L3", engagementType: "freelance-hourly", rate: 32, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "paid-specialist", name: "Paid Specialist (Search + Social)", dept: "Marketing", level: "Agency L4", engagementType: "freelance-hourly", rate: 18, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "writer-seo-exec", name: "Writer + SEO Executive", dept: "Marketing", level: "Agency L4", engagementType: "freelance-hourly", rate: 16, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "social-email-exec", name: "Social + Email Executive", dept: "Marketing", level: "Agency L4", engagementType: "freelance-hourly", rate: 15, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "reporting-exec", name: "Reporting Executive", dept: "Marketing", level: "Agency L4", engagementType: "freelance-hourly", rate: 14, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "creative-designer", name: "Creative Pod – Designer", dept: "Marketing", level: "Agency Shared", engagementType: "freelance-hourly", rate: 22, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "creative-video-editor", name: "Creative Pod – Video Editor", dept: "Marketing", level: "Agency Shared", engagementType: "freelance-hourly", rate: 24, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "creative-copywriter", name: "Creative Pod – Copywriter", dept: "Marketing", level: "Agency Shared", engagementType: "freelance-hourly", rate: 20, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "outreach-engagement-lead", name: "Outreach Engagement Lead", dept: "Sales", level: "Agency L1", engagementType: "freelance-hourly", rate: 50, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "account-book-researcher", name: "Account Book Researcher", dept: "Sales", level: "Agency L2", engagementType: "freelance-hourly", rate: 28, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "outreach-copywriter", name: "Outreach Copywriter", dept: "Sales", level: "Agency L2", engagementType: "freelance-hourly", rate: 26, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "ae-assist-specialist", name: "AE Assist Specialist", dept: "Sales", level: "Agency L2", engagementType: "freelance-hourly", rate: 24, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "outreach-executor", name: "Outreach Executor", dept: "Sales", level: "Agency L3", engagementType: "freelance-hourly", rate: 18, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
  { id: "sales-analytics-executor", name: "Sales Analytics Executor", dept: "Sales", level: "Agency L3", engagementType: "freelance-hourly", rate: 22, rateUnit: "$/hr", togglable: false, source: "ROLE_LIBRARY (ClarityHQ Master Campaign Builder)" },
];

// Additional specialist capacity — freelance, monthly retainer. Not in the HTML's
// role library; offered as togglable add-on capacity, not part of the auto-staffed pod.
export const RETAINER_ROSTER: RosterEntry[] = [
  { id: "hubspot-crm-specialist", name: "HubSpot / CRM Specialist", dept: "Marketing Ops", level: "Freelance", engagementType: "freelance-retainer", rate: 12000, rateUnit: "₹ project fee", togglable: true, source: "June 2026 hiring compensation chat, Delhi NCR benchmarks (illustrative)" },
  { id: "operations-generalist", name: "Operations Generalist", dept: "Operations", level: "Part-time freelance", engagementType: "freelance-retainer", rate: 20000, rateUnit: "₹/mo", togglable: true, source: "June 2026 hiring compensation chat, Delhi NCR benchmarks (illustrative)" },
  { id: "data-analyst", name: "Data Analyst", dept: "Analytics", level: "Fractional/freelance", engagementType: "freelance-retainer", rate: 15000, rateUnit: "₹/mo", togglable: true, source: "June 2026 hiring compensation chat, Delhi NCR benchmarks (illustrative)" },
];

// Vendors — project basis, no fixed rate card exists. Editable/TBD.
export const VENDOR_ROSTER: RosterEntry[] = [
  { id: "ai-video-studio", name: "AI Video Generation Studio", dept: "Production", level: "Vendor", engagementType: "vendor-project", rate: null, rateUnit: "$/project", togglable: true, source: "No rate card — editable, matches influencer placeholder pattern in source HTML" },
  { id: "film-director", name: "Film Director", dept: "Production", level: "Vendor", engagementType: "vendor-project", rate: null, rateUnit: "$/project", togglable: true, source: "No rate card — editable, matches influencer placeholder pattern in source HTML" },
  { id: "photographer", name: "Photographer", dept: "Production", level: "Vendor", engagementType: "vendor-project", rate: null, rateUnit: "$/project", togglable: true, source: "No rate card — editable, matches influencer placeholder pattern in source HTML" },
  { id: "influencer-ugc-creator", name: "Influencer / UGC Creator", dept: "Production", level: "Vendor", engagementType: "vendor-project", rate: null, rateUnit: "$/project, tiered by followers", togglable: true, source: "Influencer rows in uploaded HTML (e.g. 85K-follower creator sample at $250)" },
];

export const ALL_ROSTER: RosterEntry[] = [...CORE_POD_ROSTER, ...RETAINER_ROSTER, ...VENDOR_ROSTER];

export function findRosterEntry(id: string): RosterEntry | undefined {
  return ALL_ROSTER.find((r) => r.id === id);
}

export function currencyForRoster(entry: RosterEntry): "USD" | "INR" {
  return entry.rateUnit.startsWith("₹") ? "INR" : "USD";
}
