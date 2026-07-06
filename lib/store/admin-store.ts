"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CORE_POD_ROSTER, RETAINER_ROSTER, VENDOR_ROSTER } from "../data/talent-vendor-roster";
import { SkuId } from "../data/campaign-types";
import { PROCS } from "../data/procs";
import { ROLE_LIBRARY } from "../data/role-library";

export interface Freelancer {
  id: string;
  name: string;
  role: string; // job / title — matches a ROLE_LIBRARY role name where possible, but editable/freeform
  dept: string;
  rate: number; // $/hr
}

export type VendorMediaType = "video" | "image" | "influencer" | "other";

export interface AdminVendor {
  id: string;
  name: string;
  specialistArea: string;
  mediaType: VendorMediaType;
  price: number | null; // per project; null = TBD
  currency: "USD" | "INR";
  skuScope: SkuId[]; // [] = applies to every campaign type
}

export interface PodTemplateStep {
  id: string;
  stepNumber: number;
  title: string;
  role: string;
  hours: number; // base hours for this step (not audience-scaled)
  rate: number;  // $/hr
  days: number;  // calendar days allocated
  deliverable: string;
  active: boolean; // inactive steps are excluded from pod, timeline, and bidding
}

// Seed freelancers — one named person per core role, so the admin panel and pod
// builder start with realistic data. Names are illustrative placeholders.
const SEED_NAMES = [
  "Priya Nair", "Rohan Malhotra", "Ananya Iyer", "Kabir Sethi", "Meera Chawla",
  "Arjun Kapoor", "Divya Menon", "Nikhil Bhatia", "Tara Fernandes", "Vikram Rao",
  "Isha Kulkarni", "Rahul Bose", "Simran Kaur", "Aditya Varma", "Neha Joshi",
  "Karan Thakur", "Pooja Reddy", "Siddharth Chandra", "Ritu Desai",
];

function buildSeedFreelancers(): Freelancer[] {
  return CORE_POD_ROSTER.map((role, i) => ({
    id: `freelancer-${role.id}`,
    name: SEED_NAMES[i % SEED_NAMES.length],
    role: role.name,
    dept: role.dept,
    rate: role.rate ?? 25,
  }));
}

const VENDOR_MEDIA_TYPE: Record<string, VendorMediaType> = {
  "ai-video-studio": "video",
  "film-director": "video",
  photographer: "image",
  "influencer-ugc-creator": "influencer",
};

function buildSeedVendors(): AdminVendor[] {
  const vendorRows: AdminVendor[] = VENDOR_ROSTER.map((v) => ({
    id: v.id,
    name: v.name,
    specialistArea: v.name,
    mediaType: VENDOR_MEDIA_TYPE[v.id] ?? "other",
    price: v.rate,
    currency: "USD",
    skuScope: [],
  }));
  const retainerRows: AdminVendor[] = RETAINER_ROSTER.map((v) => ({
    id: v.id,
    name: v.name,
    specialistArea: v.name,
    mediaType: "other",
    price: v.rate,
    currency: "INR",
    skuScope: [],
  }));
  return [...vendorRows, ...retainerRows];
}

function rateFromLibrary(roleName: string): number {
  return ROLE_LIBRARY.find((r) => r.name === roleName)?.rate ?? 25;
}

function buildSeedPodTemplates(): Record<SkuId, PodTemplateStep[]> {
  const result: Partial<Record<SkuId, PodTemplateStep[]>> = {};
  for (const [sku, steps] of Object.entries(PROCS)) {
    result[sku as SkuId] = steps.map((step) => ({
      id: `tpl-${sku}-${step.n}`,
      stepNumber: step.n,
      title: step.t,
      role: step.role,
      hours: step.baseHrs,
      rate: rateFromLibrary(step.role),
      days: step.days,
      deliverable: step.out,
      active: true,
    }));
  }
  return result as Record<SkuId, PodTemplateStep[]>;
}

// Creative-only templates: planning & production steps only, plus a Handoff step.
// Client runs execution, monitoring, and reporting themselves.
const CREATIVES_ONLY_SEED: Record<SkuId, Array<Omit<PodTemplateStep, "id">>> = {
  abm: [
    { stepNumber: 1, title: "ICP + Account Book", role: "Account Book Researcher", hours: 18, rate: 0, days: 4, deliverable: "Deliver a segmented, enriched account book matching the approved ICP, ready for client execution.", active: true },
    { stepNumber: 2, title: "Campaign Brief", role: "Marketing Strategy Lead", hours: 8, rate: 0, days: 3, deliverable: "Produce an approved campaign brief covering audience, messaging angle, and sequence plan.", active: true },
    { stepNumber: 3, title: "Copy Production", role: "Outreach Copywriter", hours: 10, rate: 0, days: 3, deliverable: "Write the full multi-touch sequence (email + LinkedIn + WhatsApp where applicable) with A/B variants, BCP-compliant.", active: true },
    { stepNumber: 4, title: "Handoff to Client", role: "Marketing Strategy Lead", hours: 3, rate: 0, days: 1, deliverable: "Hand off account book, approved copy, and sequence plan with a brief walkthrough session for the client's team.", active: true },
  ],
  social: [
    { stepNumber: 1, title: "Platform Audit", role: "Social + CRM Manager", hours: 6, rate: 0, days: 3, deliverable: "Deliver an audit identifying content gaps and 3 specific opportunities vs category benchmark.", active: true },
    { stepNumber: 2, title: "Content Strategy", role: "Marketing Strategy Lead", hours: 7, rate: 0, days: 3, deliverable: "Produce an approved content strategy doc covering pillars, formats, and posting cadence.", active: true },
    { stepNumber: 3, title: "Content Calendar", role: "Social + Email Executive", hours: 8, rate: 0, days: 4, deliverable: "Deliver a client-approved 30-day calendar with caption copy and visual brief per post.", active: true },
    { stepNumber: 4, title: "Creative Production", role: "Creative Pod", hours: 18, rate: 0, days: 7, deliverable: "Produce all planned creative assets (statics, reels, carousels), BCP-checked, ready for scheduling.", active: true },
    { stepNumber: 5, title: "Handoff to Client", role: "Social + CRM Manager", hours: 3, rate: 0, days: 1, deliverable: "Hand off calendar, creative assets, and scheduling guide with walkthrough for client's publishing team.", active: true },
  ],
  content: [
    { stepNumber: 1, title: "Keyword + AEO Research", role: "Content + SEO Manager", hours: 9, rate: 0, days: 4, deliverable: "Deliver a prioritised keyword and AEO opportunity map ranked by difficulty and volume.", active: true },
    { stepNumber: 2, title: "Content Brief", role: "Marketing Strategy Lead", hours: 5, rate: 0, days: 3, deliverable: "Produce approved article briefs (query, angle, structure, word count) for the planned batch.", active: true },
    { stepNumber: 3, title: "Article Writing", role: "Writer + SEO Executive", hours: 20, rate: 0, days: 7, deliverable: "Deliver final-draft articles passing brand voice check, ready for client to publish.", active: true },
    { stepNumber: 4, title: "On-Page SEO", role: "Content + SEO Manager", hours: 8, rate: 0, days: 3, deliverable: "Apply full on-page SEO and AEO formatting to every article, with a publish-ready checklist.", active: true },
    { stepNumber: 5, title: "Handoff to Client", role: "Content + SEO Manager", hours: 2, rate: 0, days: 1, deliverable: "Hand off all articles with SEO annotations and a publishing guide for the client's CMS team.", active: true },
  ],
  performance: [
    { stepNumber: 1, title: "Audience + Funnel Design", role: "Marketing Strategy Lead", hours: 8, rate: 0, days: 3, deliverable: "Produce an approved paid media strategy with TOFU/MOFU/BOFU audience segments and attribution model.", active: true },
    { stepNumber: 2, title: "Creative Production", role: "Creative Pod", hours: 18, rate: 0, days: 6, deliverable: "Deliver 3-5 BCP-checked creative variants per angle — static ads and reel hooks — ready for client to upload.", active: true },
    { stepNumber: 3, title: "Handoff to Client", role: "Marketing Strategy Lead", hours: 3, rate: 0, days: 1, deliverable: "Hand off creative assets, audience brief, and campaign setup guide for client's media buyer.", active: true },
  ],
  retention: [
    { stepNumber: 1, title: "Lifecycle Mapping", role: "Social + CRM Manager", hours: 7, rate: 0, days: 3, deliverable: "Deliver a lifecycle map identifying key trigger points and the proposed flows for each.", active: true },
    { stepNumber: 2, title: "Flow Strategy", role: "Marketing Strategy Lead", hours: 5, rate: 0, days: 3, deliverable: "Produce an approved flow architecture doc covering all planned lifecycle sequences.", active: true },
    { stepNumber: 3, title: "Copy + Creative", role: "Outreach Copywriter", hours: 14, rate: 0, days: 5, deliverable: "Write and design all copy and creative assets for every flow, BCP-compliant, ready for client's ESP setup.", active: true },
    { stepNumber: 4, title: "Handoff to Client", role: "Social + CRM Manager", hours: 3, rate: 0, days: 1, deliverable: "Hand off all flow copy, creative assets, and a technical setup guide for the client's CRM/ESP team.", active: true },
  ],
};

function buildSeedPodTemplatesCreativeOnly(): Record<SkuId, PodTemplateStep[]> {
  const result: Partial<Record<SkuId, PodTemplateStep[]>> = {};
  for (const [sku, steps] of Object.entries(CREATIVES_ONLY_SEED)) {
    result[sku as SkuId] = steps.map((step) => ({
      ...step,
      id: `tpl-co-${sku}-${step.stepNumber}`,
      rate: rateFromLibrary(step.role),
    }));
  }
  return result as Record<SkuId, PodTemplateStep[]>;
}

interface AdminStoreState {
  freelancers: Freelancer[];
  vendors: AdminVendor[];
  podTemplates: Record<SkuId, PodTemplateStep[]>;
  podTemplatesCreativeOnly: Record<SkuId, PodTemplateStep[]>;
  anthropicApiKey: string;
  setAnthropicApiKey: (key: string) => void;
  markupFixed: number;   // client price multiplier for fixed-price campaigns (default 4)
  markupHybrid: number;  // cost multiplier for the fixed base in hybrid campaigns (default 3)
  setMarkupFixed: (v: number) => void;
  setMarkupHybrid: (v: number) => void;
  addFreelancer: () => void;
  updateFreelancer: (id: string, partial: Partial<Omit<Freelancer, "id">>) => void;
  removeFreelancer: (id: string) => void;
  addVendor: () => void;
  updateVendor: (id: string, partial: Partial<Omit<AdminVendor, "id">>) => void;
  removeVendor: (id: string) => void;
  addTemplateStep: (sku: SkuId) => void;
  updateTemplateStep: (sku: SkuId, id: string, partial: Partial<Omit<PodTemplateStep, "id">>) => void;
  removeTemplateStep: (sku: SkuId, id: string) => void;
  toggleTemplateStep: (sku: SkuId, id: string) => void;
  addTemplateStepCO: (sku: SkuId) => void;
  updateTemplateStepCO: (sku: SkuId, id: string, partial: Partial<Omit<PodTemplateStep, "id">>) => void;
  removeTemplateStepCO: (sku: SkuId, id: string) => void;
  toggleTemplateStepCO: (sku: SkuId, id: string) => void;
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

export const useAdminStore = create<AdminStoreState>()(
  persist(
    (set) => ({
      freelancers: buildSeedFreelancers(),
      vendors: buildSeedVendors(),
      podTemplates: buildSeedPodTemplates(),
      podTemplatesCreativeOnly: buildSeedPodTemplatesCreativeOnly(),
      anthropicApiKey: "",
      setAnthropicApiKey: (key) => set({ anthropicApiKey: key }),
      markupFixed: 4,
      markupHybrid: 3,
      setMarkupFixed: (v) => set({ markupFixed: Math.max(1, Math.min(10, v)) }),
      setMarkupHybrid: (v) => set({ markupHybrid: Math.max(1, Math.min(10, v)) }),
      addFreelancer: () =>
        set((state) => ({
          freelancers: [
            ...state.freelancers,
            { id: newId("freelancer"), name: "", role: "", dept: "Marketing", rate: 0 },
          ],
        })),
      updateFreelancer: (id, partial) =>
        set((state) => ({
          freelancers: state.freelancers.map((f) => (f.id === id ? { ...f, ...partial } : f)),
        })),
      removeFreelancer: (id) =>
        set((state) => ({ freelancers: state.freelancers.filter((f) => f.id !== id) })),
      addVendor: () =>
        set((state) => ({
          vendors: [
            ...state.vendors,
            { id: newId("vendor"), name: "", specialistArea: "", mediaType: "other", price: null, currency: "USD", skuScope: [] },
          ],
        })),
      updateVendor: (id, partial) =>
        set((state) => ({ vendors: state.vendors.map((v) => (v.id === id ? { ...v, ...partial } : v)) })),
      removeVendor: (id) => set((state) => ({ vendors: state.vendors.filter((v) => v.id !== id) })),
      addTemplateStep: (sku) =>
        set((state) => {
          const existing = state.podTemplates[sku] ?? [];
          const maxNum = existing.reduce((m, s) => Math.max(m, s.stepNumber), 0);
          const newStep: PodTemplateStep = {
            id: newId("tpl"),
            stepNumber: maxNum + 1,
            title: "",
            role: "",
            hours: 8,
            rate: 25,
            days: 3,
            deliverable: "",
            active: true,
          };
          return {
            podTemplates: { ...state.podTemplates, [sku]: [...existing, newStep] },
          };
        }),
      updateTemplateStep: (sku, id, partial) =>
        set((state) => ({
          podTemplates: {
            ...state.podTemplates,
            [sku]: (state.podTemplates[sku] ?? []).map((s) =>
              s.id === id ? { ...s, ...partial } : s
            ),
          },
        })),
      removeTemplateStep: (sku, id) =>
        set((state) => ({
          podTemplates: {
            ...state.podTemplates,
            [sku]: (state.podTemplates[sku] ?? []).filter((s) => s.id !== id),
          },
        })),
      toggleTemplateStep: (sku, id) =>
        set((state) => ({
          podTemplates: {
            ...state.podTemplates,
            [sku]: (state.podTemplates[sku] ?? []).map((s) =>
              s.id === id ? { ...s, active: !s.active } : s
            ),
          },
        })),
      addTemplateStepCO: (sku) =>
        set((state) => {
          const existing = state.podTemplatesCreativeOnly[sku] ?? [];
          const maxNum = existing.reduce((m, s) => Math.max(m, s.stepNumber), 0);
          const newStep: PodTemplateStep = {
            id: newId("tpl-co"),
            stepNumber: maxNum + 1,
            title: "",
            role: "",
            hours: 8,
            rate: 25,
            days: 3,
            deliverable: "",
            active: true,
          };
          return {
            podTemplatesCreativeOnly: { ...state.podTemplatesCreativeOnly, [sku]: [...existing, newStep] },
          };
        }),
      updateTemplateStepCO: (sku, id, partial) =>
        set((state) => ({
          podTemplatesCreativeOnly: {
            ...state.podTemplatesCreativeOnly,
            [sku]: (state.podTemplatesCreativeOnly[sku] ?? []).map((s) =>
              s.id === id ? { ...s, ...partial } : s
            ),
          },
        })),
      removeTemplateStepCO: (sku, id) =>
        set((state) => ({
          podTemplatesCreativeOnly: {
            ...state.podTemplatesCreativeOnly,
            [sku]: (state.podTemplatesCreativeOnly[sku] ?? []).filter((s) => s.id !== id),
          },
        })),
      toggleTemplateStepCO: (sku, id) =>
        set((state) => ({
          podTemplatesCreativeOnly: {
            ...state.podTemplatesCreativeOnly,
            [sku]: (state.podTemplatesCreativeOnly[sku] ?? []).map((s) =>
              s.id === id ? { ...s, active: !s.active } : s
            ),
          },
        })),
    }),
    {
      name: "clarity-admin-data",
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Partial<AdminStoreState>;
        if (version < 2 && !state.podTemplatesCreativeOnly) {
          state.podTemplatesCreativeOnly = buildSeedPodTemplatesCreativeOnly();
        }
        return state;
      },
    }
  )
);
