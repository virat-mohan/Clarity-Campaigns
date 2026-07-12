import { UNIT_COSTS } from "../data/unit-costs";
import { SkuId } from "../data/campaign-types";
import { PodRow } from "./staffing";
import { computeAudienceFunnel } from "./reach";

export interface TechCostItem {
  tool: string;
  qty: string | number;
  monthly: number;
  note: string;
}

export interface TechCostResult {
  items: TechCostItem[];
  total: number;
}

// Ported from computeTechCost() in the source HTML — modelled only for ABM per
// source COGS_BASE. Other SKUs show $0 tech cost.
export function computeTechCost(input: {
  audience: number;
  channels: string[];
  emailSteps: number;
  liSteps: number;
  waSteps: number;
}): TechCostResult {
  const contacts = input.audience || 0;
  const hasEmail = input.channels.includes("Email");
  const hasLI = input.channels.includes("LinkedIn");
  const hasWA = input.channels.includes("WhatsApp");

  const items: TechCostItem[] = [];
  items.push({ tool: "AI Ark", qty: contacts.toLocaleString(), monthly: contacts * 1 * UNIT_COSTS.aiark.val, note: "Identify / de-anonymize accounts" });
  items.push({ tool: "Freckle", qty: (contacts * 2).toLocaleString(), monthly: contacts * 2 * UNIT_COSTS.freckle.val, note: "Buying signals + enrichment" });

  if (hasEmail) {
    const sends = contacts * input.emailSteps;
    const domainsScaled = Math.max(1, Math.ceil((contacts / 1000) * 4));
    items.push({ tool: "Domains", qty: domainsScaled, monthly: domainsScaled * (UNIT_COSTS.domain.val / 12), note: "Billed yearly, monthly-ized" });
    const mailboxBundles = Math.max(1, Math.ceil(((contacts / 1000) * 10) / 10));
    items.push({ tool: "Inboxkit", qty: mailboxBundles * 10, monthly: mailboxBundles * UNIT_COSTS.inboxkit.val, note: "Flat bundle of 10 mailboxes" });
    const smartleadPlans = Math.max(1, Math.ceil(sends / 6000));
    items.push({ tool: "Smartlead", qty: smartleadPlans, monthly: smartleadPlans * UNIT_COSTS.smartlead.val, note: "Sending software, 6k sends/plan" });
  }
  if (hasLI) {
    const liActions = contacts * input.liSteps;
    const linkupPlans = Math.max(1, Math.ceil(liActions / 500));
    items.push({ tool: "Linkup (LinkedIn)", qty: linkupPlans, monthly: linkupPlans * UNIT_COSTS.linkup.val, note: "LinkedIn accounts for daily caps" });
  }
  if (hasWA) {
    const waMsgs = contacts * input.waSteps;
    items.push({ tool: "WhatsApp", qty: waMsgs.toLocaleString(), monthly: waMsgs * UNIT_COSTS.whatsapp.val, note: "Per-message proxy" });
  }
  items.push({ tool: "Claude API", qty: 1, monthly: UNIT_COSTS.claude.val, note: "Next-best-action engine" });

  const total = items.reduce((sum, i) => sum + i.monthly, 0);
  return { items, total };
}

export interface AssetLine {
  type: string;
  qty: number;
  rate: number;
}

export interface VendorLine {
  id: string;
  name: string;
  cost: number;
  currency: "USD" | "INR";
  type?: "influencer";
}

export type PriceMode = "fixed" | "hybrid";
export type OutcomeMetric = "qualified" | "opportunity" | "closure" | "custom";

export interface PricingInput {
  sku: SkuId;
  pod: PodRow[];
  assets: AssetLine[];
  audience: number;
  channels: string[];
  emailSteps: number;
  liSteps: number;
  waSteps: number;
  adSpend: number;
  vendorLines: VendorLine[]; // toggled-on vendor costs, at-cost, never multiplied
  priceMode: PriceMode;
  outcomeMetric: OutcomeMetric;
  outcomeTarget: number; // auto-filled from funnel projection
  outcomeRate: number;
  outcomeDeltaRate: number;
  outcomeDeltaThreshold: number;
  markupFixed?: number;  // override default 4× multiplier
  markupHybrid?: number; // override default 3× multiplier for hybrid base
}

export interface PricingResult {
  podCost: number;
  assetCost: number;
  techCost: number;
  totalCost: number; // multiple-eligible cost only: pod + assets + tech
  fixedComponent: number; // 4x for "fixed", 3x for "hybrid"
  baselineVariable: number; // hybrid only: outcomeTarget * outcomeRate
  totalPrice: number; // fixedComponent + baselineVariable (hybrid) or 4x cost (fixed)
  adSpend: number; // separate, at-cost, never multiplied
  vendorCostUsd: number; // separate, at-cost, never multiplied (video/influencer vendors, USD)
  specialistCostInr: number; // separate, at-cost, never multiplied (retainer specialists, INR — kept out of USD total)
  grandTotal: number; // totalPrice + adSpend + vendorCostUsd (USD only; specialistCostInr shown separately)
  multiple: number;
}

// Ported pricing logic: Fixed = cost * 4. Fixed+Variable (hybrid) = cost * 3 fixed,
// plus a per-outcome rate up to target, with a higher delta rate above a manual
// threshold. Ad spend and vendor costs always sit outside this multiple.
export function computePricing(input: PricingInput): PricingResult {
  const podCostTotal = input.pod.reduce((sum, r) => sum + r.hours * r.rate, 0);
  const assetCost = input.assets.reduce((sum, a) => sum + a.qty * a.rate, 0);
  const techCost =
    input.sku === "abm"
      ? computeTechCost({
          audience: input.audience,
          channels: input.channels,
          emailSteps: input.emailSteps,
          liSteps: input.liSteps,
          waSteps: input.waSteps,
        }).total
      : 0;
  const totalCost = podCostTotal + assetCost + techCost;

  const vendorCostUsd = input.vendorLines
    .filter((v) => v.currency === "USD")
    .reduce((sum, v) => sum + (v.cost || 0), 0);
  const specialistCostInr = input.vendorLines
    .filter((v) => v.currency === "INR")
    .reduce((sum, v) => sum + (v.cost || 0), 0);

  const mFixed = input.markupFixed ?? 4;
  const mHybrid = input.markupHybrid ?? 3;

  let fixedComponent = 0;
  let baselineVariable = 0;
  let totalPrice = 0;
  let multiple: number = 4;

  if (input.priceMode === "fixed") {
    multiple = mFixed;
    fixedComponent = totalCost * mFixed;
    totalPrice = fixedComponent;
  } else {
    multiple = mHybrid;
    fixedComponent = totalCost * mHybrid;
    baselineVariable = input.outcomeTarget * input.outcomeRate;
    totalPrice = fixedComponent + baselineVariable;
  }

  return {
    podCost: podCostTotal,
    assetCost,
    techCost,
    totalCost,
    fixedComponent,
    baselineVariable,
    totalPrice,
    adSpend: input.adSpend,
    vendorCostUsd,
    specialistCostInr,
    grandTotal: totalPrice + input.adSpend + vendorCostUsd,
    multiple,
  };
}

// Auto-fills the hybrid pricing outcome target from the funnel projection, same as
// the source tool's readonly "Target outcomes (baseline, from funnel)" field.
export function outcomeTargetFor(
  metric: OutcomeMetric,
  funnelInput: { audienceSize: number; qualifiedPct: number; opportunityPct: number; closePct: number; asp: number }
): number {
  const funnel = computeAudienceFunnel(
    funnelInput.audienceSize,
    funnelInput.qualifiedPct,
    funnelInput.opportunityPct,
    funnelInput.closePct,
    funnelInput.asp
  );
  if (metric === "qualified") return funnel.qualified;
  if (metric === "closure") return funnel.closures;
  return funnel.opportunities; // opportunity + custom default, matching source behaviour
}
