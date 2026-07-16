import { CHANNEL_BENCH } from "../data/industry-benchmarks";
import { IND, IndustryId } from "../data/industry-benchmarks";

export interface ChannelReachRow {
  channel: string;
  impressions: number;
  clicks: number;
  leads: number;
  cpl: number;
}

export interface ReachResult {
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
  estCpl: number;
  qualifiedPct: number;
  opportunityPct: number;
  closurePct: number;
  rows: ChannelReachRow[];
}

// Ported from computeReach() in the source HTML. budget -> impressions/clicks/leads
// via IND + CHANNEL_BENCH, split evenly across selected paid channels, plus a
// spend-weighted funnel (qualified/opportunity/closure %).
export function computeReach(
  industryId: IndustryId,
  budget: number,
  selectedChannels: string[]
): ReachResult | null {
  const data = IND[industryId];
  if (!data) return null;

  const paidChannels = selectedChannels.filter((c) => {
    const bench = CHANNEL_BENCH[c];
    return bench && bench.paid;
  });

  if (budget <= 0 || paidChannels.length === 0) return null;

  const perChannelBudget = budget / paidChannels.length;
  let totalImpr = 0;
  let totalClicks = 0;
  let totalLeads = 0;
  let wQ = 0;
  let wO = 0;
  let wC = 0;
  const rows: ChannelReachRow[] = [];

  for (const ch of paidChannels) {
    const b = CHANNEL_BENCH[ch];
    if (!b.paid) continue;
    const midCPM = ((data.cpm[0] + data.cpm[1]) / 2) * b.cpmMult;
    const midCTR = ((data.ctl[0] + data.ctl[1]) / 2) * b.ctrMult;
    const midCVR = ((data.cvr[0] + data.cvr[1]) / 2) * b.cvrMult;
    const impr = Math.round((perChannelBudget / midCPM) * 1000);
    const clicks = Math.round((impr * midCTR) / 100);
    const leads = Math.round((clicks * midCVR) / 100);
    totalImpr += impr;
    totalClicks += clicks;
    totalLeads += leads;
    wQ += leads * data.funnel[0] * b.funnelMult[0];
    wO += leads * data.funnel[1] * b.funnelMult[1];
    wC += leads * data.funnel[2] * b.funnelMult[2];
    rows.push({ channel: ch, impressions: impr, clicks, leads, cpl: leads > 0 ? Math.round(perChannelBudget / leads) : 0 });
  }

  const qualifiedPct = Math.round((totalLeads > 0 ? wQ / totalLeads : data.funnel[0]) * 10) / 10;
  const opportunityPct = Math.round((totalLeads > 0 ? wO / totalLeads : data.funnel[1]) * 10) / 10;
  const closurePct = Math.round((totalLeads > 0 ? wC / totalLeads : data.funnel[2]) * 10) / 10;

  return {
    totalImpressions: totalImpr,
    totalClicks,
    totalLeads,
    estCpl: Math.round(budget / Math.max(totalLeads, 1)),
    qualifiedPct,
    opportunityPct,
    closurePct,
    rows,
  };
}

export interface FunnelBenchmark {
  qualifiedPct: number;
  opportunityPct: number;
  closePct: number;
}

// Suggests a funnel % benchmark for a SKU's locked channels in a given industry,
// by averaging each channel's CHANNEL_BENCH.funnelMult against IND[industry].funnel.
// Channels with no entry (or organic/unmodelled) are treated as neutral (1x) so
// they don't skew the benchmark — this is a lighter-weight version of the
// spend-weighted funnel in computeReach(), used to suggest a starting point
// wherever there's no ad-spend simulation driving it (it remains editable).
export function industryFunnelBenchmark(industryId: IndustryId, channels: string[]): FunnelBenchmark {
  const data = IND[industryId];
  if (!data || channels.length === 0) {
    return { qualifiedPct: data?.funnel[0] ?? 5, opportunityPct: data?.funnel[1] ?? 25, closePct: data?.funnel[2] ?? 20 };
  }

  const mults = channels.map((ch) => {
    const bench = CHANNEL_BENCH[ch];
    return bench && bench.paid ? bench.funnelMult : ([1, 1, 1] as [number, number, number]);
  });
  const avg = (i: number) => mults.reduce((sum, m) => sum + m[i], 0) / mults.length;

  return {
    qualifiedPct: Math.round(data.funnel[0] * avg(0) * 10) / 10,
    opportunityPct: Math.round(data.funnel[1] * avg(1) * 10) / 10,
    closePct: Math.round(data.funnel[2] * avg(2) * 10) / 10,
  };
}

export interface AudienceFunnelResult {
  audience: number;
  qualified: number;
  opportunities: number; // meetings / calls booked
  closures: number;
  revenuePotential: number;
}

// ABM/Outbound and Retention/Lifecycle: audience size x funnel conversion
// benchmarks -> qualified leads + meetings/calls booked. Same funnel math as
// the source's lu() live-output calc (q/o/c/rev), driven by manual % fields
// rather than the channel-benchmark model.
export function computeAudienceFunnel(
  audience: number,
  qualifiedPct: number,
  opportunityPct: number,
  closePct: number,
  asp: number
): AudienceFunnelResult {
  const qualified = (audience * qualifiedPct) / 100;
  const opportunities = (qualified * opportunityPct) / 100;
  const closures = (opportunities * closePct) / 100;
  return {
    audience,
    qualified: Math.round(qualified),
    opportunities: Math.round(opportunities),
    closures: Math.round(closures),
    revenuePotential: Math.round(closures * asp),
  };
}
