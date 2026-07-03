"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SkuId, CAMPAIGN_TYPES } from "../data/campaign-types";
import type { OutcomeMetric, PriceMode } from "../calc/pricing";
import { industryFunnelBenchmark } from "../calc/reach";

export interface BrandContext {
  brandBookName: string;
  salesDataName: string;
  socialHandles: string;
  websiteUrl: string;
  processed: boolean;
  icpSnippet: string;
  brandBookSnippet: string;
}

export interface VendorToggleState {
  on: boolean;
  cost: number | null;
}

export interface CustomVendorLine {
  id: string;
  name: string;
  cost: number | null;
}

export interface CampaignConfig {
  client: string;
  name: string;
  objective: string;
  goal: string;
  sell: string;
  icp: string;
  audienceSize: number;
  source: string;
  industry: string;
  channels: string[];
  assets: { type: string; qty: number; rate: number; note?: string }[];
  emailSteps: number;
  liSteps: number;
  waSteps: number;
  qualifiedPct: number;
  opportunityPct: number;
  closePct: number;
  asp: number;
  adSpend: number;
  adSpendCadence: "monthly" | "onetime";
  owner: string;
  weeks: number;
  sprints: number;
  notes: string;
  risks: string;
  vendorToggles: Record<string, VendorToggleState>;
  customVendors: CustomVendorLine[];
  podOverrides: Record<number, { role: string; hours: number; rate: number }>;
  podAssignments: Record<number, string>;
  timelineApproved: boolean;
  priceMode: PriceMode;
  outcomeMetric: OutcomeMetric;
  outcomeCustomLabel: string;
  outcomeRate: number;
  outcomeDeltaRate: number;
  outcomeDeltaThreshold: number;
}

export type CampaignStatus = "draft" | "proposal-sent" | "active" | "reporting" | "completed";

export interface CampaignActuals {
  meetings?: number;
  leads?: number;
  deals?: number;
  revenue?: number;
  roas?: number;
  cpl?: number;
  notes?: string;
}

export interface Campaign {
  id: string;
  sku: SkuId;
  status: CampaignStatus;
  clientId?: string;
  createdAt: number;
  updatedAt: number;
  config: CampaignConfig;
  actuals?: CampaignActuals;
}

function buildDefaultConfig(sku: SkuId): CampaignConfig {
  const ct = CAMPAIGN_TYPES[sku];
  const defaultIndustry = ct.bestFitIndustries[0] ?? "d2c";
  const benchmark = industryFunnelBenchmark(defaultIndustry, ct.channels);
  return {
    client: "",
    name: "",
    objective: "Lead Generation",
    goal: "",
    sell: "",
    icp: "",
    audienceSize: 1000,
    source: "Account book",
    industry: defaultIndustry,
    channels: [...ct.channels],
    assets: [],
    emailSteps: 4,
    liSteps: 2,
    waSteps: 2,
    qualifiedPct: benchmark.qualifiedPct,
    opportunityPct: benchmark.opportunityPct,
    closePct: benchmark.closePct,
    asp: 2000,
    adSpend: 0,
    adSpendCadence: "monthly",
    owner: "",
    weeks: 8,
    sprints: 2,
    notes: "",
    risks: "",
    vendorToggles: {},
    customVendors: [],
    podOverrides: {},
    podAssignments: {},
    timelineApproved: false,
    priceMode: "fixed",
    outcomeMetric: "opportunity",
    outcomeCustomLabel: "",
    outcomeRate: 0,
    outcomeDeltaRate: 0,
    outcomeDeltaThreshold: 10,
  };
}

export interface OrderRecord {
  referenceNumber: string;
  campaignId: string;
  sku: SkuId;
  paidAt: string;
  grandTotal: number;
  fixedDueNow: number;
  variableNote: string | null;
}

function newCampaignId(): string {
  return `camp-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

// Update a campaign's config and touch updatedAt in one place.
function withConfig(campaigns: Campaign[], id: string, updater: (c: CampaignConfig) => Partial<CampaignConfig>): Campaign[] {
  return campaigns.map((c) =>
    c.id !== id ? c : { ...c, config: { ...c.config, ...updater(c.config) }, updatedAt: Date.now() }
  );
}

interface CampaignStoreState {
  brand: BrandContext | null;
  campaigns: Campaign[];
  lastOrder: OrderRecord | null;
  setBrand: (brand: BrandContext) => void;
  // campaign CRUD
  createCampaign: (sku: SkuId, clientId?: string) => string;
  duplicateCampaign: (id: string) => string;
  deleteCampaign: (id: string) => void;
  setStatus: (id: string, status: CampaignStatus) => void;
  updateActuals: (id: string, partial: Partial<CampaignActuals>) => void;
  // config mutations
  updateConfig: (id: string, partial: Partial<CampaignConfig>) => void;
  setVendorToggle: (id: string, vendorId: string, state: VendorToggleState) => void;
  setPodOverride: (id: string, stepNumber: number, override: { role: string; hours: number; rate: number }) => void;
  resetPodOverride: (id: string, stepNumber: number) => void;
  setPodAssignment: (id: string, stepNumber: number, freelancerId: string) => void;
  clearPodAssignment: (id: string, stepNumber: number) => void;
  addCustomVendor: (id: string) => void;
  updateCustomVendor: (id: string, vendorId: string, partial: Partial<Omit<CustomVendorLine, "id">>) => void;
  removeCustomVendor: (id: string, vendorId: string) => void;
  approveTimeline: (id: string) => void;
  setLastOrder: (order: OrderRecord) => void;
}

export const useCampaignStore = create<CampaignStoreState>()(
  persist(
    (set, get) => ({
      brand: null,
      campaigns: [],
      lastOrder: null,

      setBrand: (brand) => set({ brand }),

      createCampaign: (sku, clientId) => {
        const id = newCampaignId();
        const campaign: Campaign = {
          id,
          sku,
          status: "draft",
          clientId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          config: buildDefaultConfig(sku),
        };
        const brand = get().brand;
        if (brand?.processed && brand.icpSnippet) {
          campaign.config = { ...campaign.config, icp: brand.icpSnippet };
        }
        set((s) => ({ campaigns: [...s.campaigns, campaign] }));
        return id;
      },

      duplicateCampaign: (id) => {
        const source = get().campaigns.find((c) => c.id === id);
        if (!source) return id;
        const newId = newCampaignId();
        const copy: Campaign = {
          ...source,
          id: newId,
          status: "draft",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          config: {
            ...source.config,
            name: source.config.name ? `${source.config.name} (copy)` : "",
          },
          actuals: undefined,
        };
        set((s) => ({ campaigns: [...s.campaigns, copy] }));
        return newId;
      },

      deleteCampaign: (id) =>
        set((s) => ({ campaigns: s.campaigns.filter((c) => c.id !== id) })),

      setStatus: (id, status) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== id ? c : { ...c, status, updatedAt: Date.now() }
          ),
        })),

      updateActuals: (id, partial) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id !== id ? c : { ...c, actuals: { ...c.actuals, ...partial }, updatedAt: Date.now() }
          ),
        })),

      updateConfig: (id, partial) =>
        set((s) => ({ campaigns: withConfig(s.campaigns, id, () => partial) })),

      setVendorToggle: (id, vendorId, vendorState) =>
        set((s) => ({
          campaigns: withConfig(s.campaigns, id, (c) => ({
            vendorToggles: { ...c.vendorToggles, [vendorId]: vendorState },
          })),
        })),

      setPodOverride: (id, stepNumber, override) =>
        set((s) => ({
          campaigns: withConfig(s.campaigns, id, (c) => ({
            podOverrides: { ...c.podOverrides, [stepNumber]: override },
          })),
        })),

      resetPodOverride: (id, stepNumber) =>
        set((s) => ({
          campaigns: withConfig(s.campaigns, id, (c) => {
            const next = { ...c.podOverrides };
            delete next[stepNumber];
            return { podOverrides: next };
          }),
        })),

      setPodAssignment: (id, stepNumber, freelancerId) =>
        set((s) => ({
          campaigns: withConfig(s.campaigns, id, (c) => ({
            podAssignments: { ...c.podAssignments, [stepNumber]: freelancerId },
          })),
        })),

      clearPodAssignment: (id, stepNumber) =>
        set((s) => ({
          campaigns: withConfig(s.campaigns, id, (c) => {
            const next = { ...c.podAssignments };
            delete next[stepNumber];
            return { podAssignments: next };
          }),
        })),

      addCustomVendor: (id) =>
        set((s) => ({
          campaigns: withConfig(s.campaigns, id, (c) => ({
            customVendors: [
              ...c.customVendors,
              { id: `custom-${Date.now()}-${Math.round(Math.random() * 1000)}`, name: "", cost: null },
            ],
          })),
        })),

      updateCustomVendor: (id, vendorId, partial) =>
        set((s) => ({
          campaigns: withConfig(s.campaigns, id, (c) => ({
            customVendors: c.customVendors.map((v) => (v.id === vendorId ? { ...v, ...partial } : v)),
          })),
        })),

      removeCustomVendor: (id, vendorId) =>
        set((s) => ({
          campaigns: withConfig(s.campaigns, id, (c) => ({
            customVendors: c.customVendors.filter((v) => v.id !== vendorId),
          })),
        })),

      approveTimeline: (id) =>
        set((s) => ({
          campaigns: withConfig(s.campaigns, id, () => ({ timelineApproved: true })),
        })),

      setLastOrder: (order) => set({ lastOrder: order }),
    }),
    { name: "clarity-campaign-marketplace" }
  )
);
