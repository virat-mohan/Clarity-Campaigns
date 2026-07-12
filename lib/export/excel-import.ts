import * as XLSX from "xlsx";
import { CAMPAIGN_TYPES, SkuId, CAMPAIGN_TYPE_LIST } from "../data/campaign-types";
import { CampaignStatus } from "../store/campaign-store";

// Maps the human label back to SkuId (label may be an exact match or a substring)
function labelToSku(label: string): SkuId | null {
  const lower = label.toLowerCase().trim();
  for (const ct of CAMPAIGN_TYPE_LIST) {
    if (ct.label.toLowerCase() === lower) return ct.id;
  }
  // Fuzzy fallback — check if a known id appears in the label
  for (const ct of CAMPAIGN_TYPE_LIST) {
    if (lower.includes(ct.id)) return ct.id;
  }
  return null;
}

function toStatus(s: string): CampaignStatus {
  const valid: CampaignStatus[] = ["draft", "proposal-sent", "active", "reporting", "completed"];
  return valid.includes(s as CampaignStatus) ? (s as CampaignStatus) : "draft";
}

function toAspUnit(s: string): "per_unit" | "per_month" | "per_year" {
  if (s === "per month") return "per_month";
  if (s === "per year") return "per_year";
  return "per_unit";
}

function cellStr(v: unknown): string {
  if (v === undefined || v === null) return "";
  return String(v).trim();
}

function cellNum(v: unknown): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

// Convert a worksheet to an array of rows, each row an array of cell values
function sheetToRows(ws: XLSX.WorkSheet): unknown[][] {
  const range = XLSX.utils.decode_range(ws["!ref"] ?? "A1:A1");
  const rows: unknown[][] = [];
  for (let r = range.s.r; r <= range.e.r; r++) {
    const row: unknown[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })];
      row.push(cell?.v ?? undefined);
    }
    rows.push(row);
  }
  return rows;
}

export interface ImportedPodOverride {
  stepNumber: number;
  stepTitle: string;
  role: string;
  hours: number;
  rate: number;
}

export interface ImportedCampaign {
  clientName: string;
  name: string;
  sku: SkuId;
  status: CampaignStatus;
  creativesOnly: boolean;
  // Brief fields
  objective: string;
  sell: string;
  goal: string;
  industry: string;
  audienceSize: number;
  icp: string;
  source: string;
  channels: string[];
  qualifiedPct: number;
  opportunityPct: number;
  closePct: number;
  asp: number;
  aspUnit: "per_unit" | "per_month" | "per_year";
  adSpend: number;
  adSpendCadence: "monthly" | "onetime";
  owner: string;
  weeks: number;
  sprints: number;
  notes: string;
  risks: string;
  // Pod overrides derived from the exported pod table
  podOverrides: Record<number, { role: string; hours: number; rate: number }>;
}

export interface ImportResult {
  campaigns: ImportedCampaign[];
  errors: string[];
}

function parseCampaignSheet(ws: XLSX.WorkSheet, sheetName: string): ImportedCampaign | string {
  const rows = sheetToRows(ws);

  // Build a key → value lookup from rows that are [string, value]
  const kv: Record<string, string | number> = {};
  const podRows: ImportedPodOverride[] = [];
  let inPod = false;
  let pastPodHeader = false;

  for (const row of rows) {
    const col0 = cellStr(row[0]);
    const col1 = row[1];

    if (col0 === "POD") {
      inPod = true;
      continue;
    }
    if (inPod && !pastPodHeader && col0 === "#") {
      pastPodHeader = true; // skip the column header row
      continue;
    }
    if (inPod && pastPodHeader) {
      const stepNum = Number(row[0]);
      const title = cellStr(row[1]);
      if (title === "TOTAL" || title === "" || isNaN(stepNum)) {
        inPod = false; // end of pod section
        continue;
      }
      podRows.push({
        stepNumber: stepNum,
        stepTitle: title,
        role: cellStr(row[2]),
        hours: cellNum(row[3]),
        rate: cellNum(row[4]),
      });
      continue;
    }

    // Collect key-value pairs
    if (col0 && col0 !== "CAMPAIGN OVERVIEW" && col0 !== "AUDIENCE & TARGETING" &&
        col0 !== "CHANNELS" && col0 !== "FUNNEL & COMMERCIAL" && col0 !== "DELIVERY" &&
        col0 !== "PRICING" && col1 !== undefined) {
      kv[col0] = typeof col1 === "number" ? col1 : cellStr(col1);
    }
  }

  const clientName = cellStr(kv["Client"] ?? "");
  const typeLabel = cellStr(kv["Type"] ?? "");
  const sku = labelToSku(typeLabel);
  if (!sku) {
    return `Sheet "${sheetName}": unrecognised campaign type "${typeLabel}"`;
  }

  const channelsRaw = cellStr(kv["Channels"] ?? "");
  const channels = channelsRaw ? channelsRaw.split(",").map((c) => c.trim()).filter(Boolean) : [];

  // Build podOverrides from the exported pod table
  const podOverrides: Record<number, { role: string; hours: number; rate: number }> = {};
  for (const p of podRows) {
    podOverrides[p.stepNumber] = { role: p.role, hours: p.hours, rate: p.rate };
  }

  return {
    clientName,
    name: cellStr(kv["Campaign name"] ?? ""),
    sku,
    status: toStatus(cellStr(kv["Status"] ?? "draft")),
    creativesOnly: cellStr(kv["Mode"] ?? "") === "Creative only",
    objective: cellStr(kv["Objective"] ?? "Lead Generation"),
    sell: cellStr(kv["Selling / promoting"] ?? ""),
    goal: cellStr(kv["Goal"] ?? ""),
    industry: cellStr(kv["Industry"] ?? "d2c"),
    audienceSize: cellNum(kv["Audience size"] ?? kv["Contact list size"] ?? 1000),
    icp: cellStr(kv["ICP"] ?? ""),
    source: cellStr(kv["Source"] ?? "Account book"),
    channels,
    qualifiedPct: cellNum(kv["Qualified %"] ?? 30),
    opportunityPct: cellNum(kv["Opportunity %"] ?? 40),
    closePct: cellNum(kv["Close %"] ?? 25),
    asp: cellNum(kv["ASP / deal value ($)"] ?? 2000),
    aspUnit: toAspUnit(cellStr(kv["ASP unit"] ?? "per unit")),
    adSpend: cellNum(kv["Ad spend ($)"] ?? 0),
    adSpendCadence: cellStr(kv["Ad spend cadence"] ?? "monthly") === "onetime" ? "onetime" : "monthly",
    owner: cellStr(kv["Owner"] ?? ""),
    weeks: cellNum(kv["Weeks"] ?? 4),
    sprints: cellNum(kv["Sprints"] ?? 1),
    notes: cellStr(kv["Notes"] ?? ""),
    risks: cellStr(kv["Risks / dependencies"] ?? ""),
    podOverrides,
  };
}

export async function parseExcelImport(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });

  const campaigns: ImportedCampaign[] = [];
  const errors: string[] = [];

  for (const sheetName of wb.SheetNames) {
    if (sheetName === "Summary") continue;
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const result = parseCampaignSheet(ws, sheetName);
    if (typeof result === "string") {
      errors.push(result);
    } else {
      campaigns.push(result);
    }
  }

  return { campaigns, errors };
}
