"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SkuId } from "@/lib/data/campaign-types";

export type BriefPreset = "standard" | "growth" | "custom";

export interface BrandBasics {
  brandName: string;
  website: string;
  country: string;
  industry: string;
  whatBrandDoes: string;
}

export interface TargetCustomer {
  icpDescription: string;
  problemSolved: string;
  competitors: string;
}

export interface Budget {
  adSpendBudget: string;
  cadence: "monthly" | "onetime";
}

/**
 * Captured from ?brand=&score=&name= on /start per brief Section 7.2 — the
 * HubSpot email sequence's {{brand_name}}/{{brand_xray_score}}/{{firstname}}
 * tokens, appended to the campaign.clarityhq.ai link. No email sequence
 * sends these yet (HubSpot workflow isn't wired up), so this sits unused
 * until then; see components/start/url-prefill.tsx for where it's read.
 */
export interface LeadContext {
  brand: string;
  score: string;
  name: string;
}

interface StartFlowState {
  selectedSku: SkuId | null;
  preset: BriefPreset;
  /** Plan duration in months (1–3). Resets to 1 when a new SKU is selected. */
  duration: 1 | 2 | 3;
  brandBasics: BrandBasics;
  targetCustomer: TargetCustomer;
  campaignSpecific: Record<string, string>;
  budget: Budget;
  primaryGoal: string;
  briefSubmitted: boolean;
  leadContext: LeadContext;
  setSelectedSku: (sku: SkuId) => void;
  setPreset: (preset: BriefPreset) => void;
  setDuration: (months: 1 | 2 | 3) => void;
  updateBrandBasics: (partial: Partial<BrandBasics>) => void;
  updateTargetCustomer: (partial: Partial<TargetCustomer>) => void;
  setCampaignSpecificField: (fieldId: string, value: string) => void;
  updateBudget: (partial: Partial<Budget>) => void;
  setPrimaryGoal: (value: string) => void;
  markBriefSubmitted: () => void;
  /** Records the lead-context URL params and, if `brand` is present and the
   * brand name field hasn't been typed into yet, pre-fills it. */
  applyLeadContext: (params: Partial<LeadContext>) => void;
  resetBrief: () => void;
}

const emptyBrandBasics: BrandBasics = { brandName: "", website: "", country: "", industry: "", whatBrandDoes: "" };
const emptyTargetCustomer: TargetCustomer = { icpDescription: "", problemSolved: "", competitors: "" };
const emptyBudget: Budget = { adSpendBudget: "", cadence: "monthly" };
const emptyLeadContext: LeadContext = { brand: "", score: "", name: "" };

export const useStartFlowStore = create<StartFlowState>()(
  persist(
    (set) => ({
      selectedSku: null,
      preset: "standard",
      duration: 1,
      brandBasics: emptyBrandBasics,
      targetCustomer: emptyTargetCustomer,
      campaignSpecific: {},
      budget: emptyBudget,
      primaryGoal: "",
      briefSubmitted: false,
      leadContext: emptyLeadContext,

      setSelectedSku: (sku) => set({ selectedSku: sku, briefSubmitted: false, duration: 1 }),
      setPreset: (preset) => set({ preset }),
      setDuration: (months) => set({ duration: months }),
      updateBrandBasics: (partial) =>
        set((s) => ({ brandBasics: { ...s.brandBasics, ...partial } })),
      updateTargetCustomer: (partial) =>
        set((s) => ({ targetCustomer: { ...s.targetCustomer, ...partial } })),
      setCampaignSpecificField: (fieldId, value) =>
        set((s) => ({ campaignSpecific: { ...s.campaignSpecific, [fieldId]: value } })),
      updateBudget: (partial) => set((s) => ({ budget: { ...s.budget, ...partial } })),
      setPrimaryGoal: (value) => set({ primaryGoal: value }),
      markBriefSubmitted: () => set({ briefSubmitted: true }),

      applyLeadContext: (params) =>
        set((s) => ({
          leadContext: { ...s.leadContext, ...params },
          brandBasics:
            params.brand && !s.brandBasics.brandName
              ? { ...s.brandBasics, brandName: params.brand }
              : s.brandBasics,
        })),

      resetBrief: () =>
        set({
          selectedSku: null,
          preset: "standard",
          duration: 1,
          brandBasics: emptyBrandBasics,
          targetCustomer: emptyTargetCustomer,
          campaignSpecific: {},
          budget: emptyBudget,
          primaryGoal: "",
          briefSubmitted: false,
          leadContext: emptyLeadContext,
        }),
    }),
    { name: "clarity-start-flow" }
  )
);
