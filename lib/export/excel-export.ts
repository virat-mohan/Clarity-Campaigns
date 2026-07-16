import * as XLSX from "xlsx";
import { Campaign } from "../store/campaign-store";
import { AdminClient, PodTemplateStep } from "../store/admin-store";
import { Freelancer } from "../store/admin-store";
import { SkuId, CAMPAIGN_TYPES } from "../data/campaign-types";
import { buildAutoPod, applyPodOverrides, podCost } from "../calc/staffing";
import { PodRow } from "../calc/staffing";

type TemplateMap = Record<SkuId, PodTemplateStep[]>;

function getPod(camp: Campaign, podTemplates: TemplateMap, podTemplatesCreativeOnly: TemplateMap): PodRow[] {
  const tpl = camp.config.creativesOnly
    ? podTemplatesCreativeOnly[camp.sku]
    : podTemplates[camp.sku];
  const suggested = buildAutoPod(
    camp.sku,
    camp.config.audienceSize,
    tpl,
    CAMPAIGN_TYPES[camp.sku]?.mode === "sales",
    camp.config.creativesOnly,
  );
  const active = suggested.filter((r) => !(camp.config.podExcluded ?? []).includes(r.stepNumber));
  const withOverrides = applyPodOverrides(active, camp.config.podOverrides ?? {});
  const extras = (camp.config.podExtraSteps ?? []).map((e, i) => ({
    stepNumber: 1000 + i,
    stepTitle: e.stepTitle,
    role: e.role,
    hours: e.hours,
    rate: e.rate,
    out: e.out,
  }));
  return [...withOverrides, ...extras];
}

function safeSheetName(name: string, index: number): string {
  const raw = name || `Campaign ${index + 1}`;
  return raw.replace(/[/\\?*[\]:]/g, "-").slice(0, 31);
}

export function buildCampaignWorkbook(
  campaigns: Campaign[],
  clients: AdminClient[],
  podTemplates: TemplateMap,
  podTemplatesCreativeOnly: TemplateMap,
  _freelancers: Freelancer[],
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));

  // ── Summary sheet ──────────────────────────────────────────────────────
  const summaryHeader = [
    "#", "Client", "Campaign Name", "Type", "Status", "Mode",
    "Channels", "Audience", "Weeks", "Sprints",
    "Pod Steps", "Pod Hours", "Pod Cost ($)", "Ad Spend ($)", "Est. Price (4×, $)",
  ];

  const summaryRows = campaigns.map((camp, i) => {
    const pod = getPod(camp, podTemplates, podTemplatesCreativeOnly);
    const totalHours = pod.reduce((s, r) => s + r.hours, 0);
    const cost = podCost(pod);
    const client = clientMap[camp.config.clientId] ?? null;
    return [
      i + 1,
      client?.name || camp.config.client || "—",
      camp.config.name || "Untitled",
      CAMPAIGN_TYPES[camp.sku]?.label || camp.sku,
      camp.status,
      camp.config.creativesOnly ? "Creative only" : "Full service",
      camp.config.channels.join(", "),
      camp.config.audienceSize,
      camp.config.weeks,
      camp.config.sprints,
      pod.length,
      totalHours,
      cost,
      camp.config.adSpend,
      cost * 4,
    ];
  });

  const summaryWs = XLSX.utils.aoa_to_sheet([summaryHeader, ...summaryRows]);
  // Column widths
  summaryWs["!cols"] = [
    { wch: 4 }, { wch: 22 }, { wch: 28 }, { wch: 18 }, { wch: 12 }, { wch: 14 },
    { wch: 28 }, { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 10 },
    { wch: 14 }, { wch: 12 }, { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // ── Per-campaign sheets ────────────────────────────────────────────────
  const usedNames = new Set<string>(["Summary"]);

  for (let idx = 0; idx < campaigns.length; idx++) {
    const camp = campaigns[idx];
    const pod = getPod(camp, podTemplates, podTemplatesCreativeOnly);
    const totalHours = pod.reduce((s, r) => s + r.hours, 0);
    const cost = podCost(pod);
    const client = clientMap[camp.config.clientId] ?? null;
    const ct = CAMPAIGN_TYPES[camp.sku];

    let sheetName = safeSheetName(camp.config.name || camp.sku, idx);
    if (usedNames.has(sheetName)) {
      sheetName = safeSheetName(`${sheetName}-${idx + 1}`, idx);
    }
    usedNames.add(sheetName);

    const rows: (string | number)[][] = [
      // Campaign info
      ["CAMPAIGN OVERVIEW"],
      ["Client", client?.name || camp.config.client || "—"],
      ["Campaign name", camp.config.name || "—"],
      ["Type", ct?.label || camp.sku],
      ["Status", camp.status],
      ["Mode", camp.config.creativesOnly ? "Creative only" : "Full service"],
      ["Objective", camp.config.objective || "—"],
      ["Selling / promoting", camp.config.sell || "—"],
      ["Goal", camp.config.goal || "—"],
      [],
      // Audience
      ["AUDIENCE & TARGETING"],
      ["Industry", camp.config.industry],
      [ct?.mode === "sales" ? "Contact list size" : "Audience size", camp.config.audienceSize],
      ...(ct?.mode === "sales"
        ? [
            ["ICP", camp.config.icp || "—"] as (string | number)[],
            ["Source", camp.config.source || "—"] as (string | number)[],
          ]
        : []),
      [],
      // Channels
      ["CHANNELS"],
      ["Channels", camp.config.channels.join(", ")],
      [],
      // Funnel & commercial
      ["FUNNEL & COMMERCIAL"],
      ["Qualified %", camp.config.qualifiedPct],
      ["Opportunity %", camp.config.opportunityPct],
      ["Close %", camp.config.closePct],
      ["ASP / deal value ($)", camp.config.asp],
      ["ASP unit", camp.config.aspUnit === "per_month" ? "per month" : camp.config.aspUnit === "per_year" ? "per year" : "per unit"],
      ["Ad spend ($)", camp.config.adSpend],
      ["Ad spend cadence", camp.config.adSpendCadence],
      [],
      // Delivery
      ["DELIVERY"],
      ["Owner", camp.config.owner || "—"],
      ["Weeks", camp.config.weeks],
      ["Sprints", camp.config.sprints],
      ...(camp.config.notes ? [["Notes", camp.config.notes] as (string | number)[]] : []),
      ...(camp.config.risks ? [["Risks / dependencies", camp.config.risks] as (string | number)[]] : []),
      [],
      // Pod
      ["POD"],
      ["#", "Step", "Role", "Hours", "Rate ($/hr)", "Cost ($)"],
      ...pod.map((r) => [r.stepNumber, r.stepTitle, r.role, r.hours, r.rate, r.hours * r.rate]),
      ["", "TOTAL", "", totalHours, "", cost],
      [],
      // Pricing
      ["PRICING"],
      ["Pod cost ($)", cost],
      ["Estimated price (4× markup, $)", cost * 4],
      ["Ad spend ($)", camp.config.adSpend],
      ["Grand total est. ($)", cost * 4 + camp.config.adSpend],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws["!cols"] = [
      { wch: 26 }, { wch: 40 }, { wch: 28 }, { wch: 8 }, { wch: 12 }, { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  return wb;
}

export function downloadCampaignExcel(
  campaigns: Campaign[],
  clients: AdminClient[],
  podTemplates: TemplateMap,
  podTemplatesCreativeOnly: TemplateMap,
  freelancers: Freelancer[],
): void {
  const wb = buildCampaignWorkbook(campaigns, clients, podTemplates, podTemplatesCreativeOnly, freelancers);
  XLSX.writeFile(wb, `clarity-campaigns-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
