// Ported from IND and CHANNEL_BENCH in the source HTML.
export type IndustryId =
  | "d2c"
  | "saas"
  | "fmcg"
  | "fnb"
  | "finance"
  | "health"
  | "edu"
  | "realestate";

export interface IndustryBenchmark {
  id: IndustryId;
  name: string;
  cpm: [number, number];
  ctl: [number, number]; // CTR %
  cvr: [number, number]; // CVR %
  funnel: [number, number, number]; // [qualified%, opportunity%, closure%]
}

export const IND: Record<IndustryId, IndustryBenchmark> = {
  d2c: { id: "d2c", name: "D2C / E-commerce", cpm: [80, 200], ctl: [1.2, 2.5], cvr: [1.5, 3.5], funnel: [3, 30, 15] },
  saas: { id: "saas", name: "SaaS / B2B Tech", cpm: [200, 500], ctl: [0.5, 1.2], cvr: [2, 5], funnel: [8, 35, 20] },
  fmcg: { id: "fmcg", name: "FMCG / Consumer", cpm: [50, 120], ctl: [0.8, 1.5], cvr: [0.8, 2], funnel: [2, 25, 10] },
  fnb: { id: "fnb", name: "F&B / Hospitality", cpm: [60, 150], ctl: [1.0, 2.0], cvr: [1.5, 4], funnel: [4, 30, 20] },
  finance: { id: "finance", name: "Finance / Fintech", cpm: [300, 700], ctl: [0.4, 0.9], cvr: [1.5, 4], funnel: [6, 40, 25] },
  health: { id: "health", name: "Health / Wellness", cpm: [100, 250], ctl: [0.8, 1.8], cvr: [2, 5], funnel: [4, 35, 18] },
  edu: { id: "edu", name: "Education / EdTech", cpm: [80, 180], ctl: [1.0, 2.2], cvr: [3, 7], funnel: [5, 40, 22] },
  realestate: { id: "realestate", name: "Real Estate", cpm: [150, 350], ctl: [0.3, 0.8], cvr: [0.5, 1.5], funnel: [5, 45, 30] },
};

export const INDUSTRY_LIST: IndustryBenchmark[] = Object.values(IND);

export interface ChannelBenchPaid {
  paid: true;
  cpmMult: number;
  ctrMult: number;
  cvrMult: number;
  funnelMult: [number, number, number];
}
export interface ChannelBenchOrganic {
  paid: false;
}
export type ChannelBenchEntry = ChannelBenchPaid | ChannelBenchOrganic;

// Per-channel index vs the industry baseline above. paid:false channels
// (owned/organic) don't consume ad budget and aren't part of the paid-reach split.
export const CHANNEL_BENCH: Record<string, ChannelBenchEntry> = {
  "Meta Ads": { paid: true, cpmMult: 1.0, ctrMult: 1.0, cvrMult: 1.0, funnelMult: [1.0, 1.0, 1.0] },
  Instagram: { paid: true, cpmMult: 0.9, ctrMult: 1.1, cvrMult: 0.9, funnelMult: [0.9, 0.95, 0.9] },
  "Google Ads": { paid: true, cpmMult: 1.6, ctrMult: 1.4, cvrMult: 1.3, funnelMult: [1.15, 1.05, 1.1] },
  YouTube: { paid: true, cpmMult: 0.7, ctrMult: 0.55, cvrMult: 0.8, funnelMult: [0.95, 1.0, 0.95] },
  LinkedIn: { paid: true, cpmMult: 2.2, ctrMult: 0.6, cvrMult: 1.4, funnelMult: [1.3, 1.2, 1.25] },
  "X / Twitter": { paid: true, cpmMult: 0.8, ctrMult: 0.7, cvrMult: 0.85, funnelMult: [0.9, 0.9, 0.9] },
  Email: { paid: false },
  WhatsApp: { paid: false },
  "SEO / AEO": { paid: false },
};

// Every channel available to select in a brief, regardless of campaign type.
export const ALL_CHANNELS: string[] = Object.keys(CHANNEL_BENCH);
