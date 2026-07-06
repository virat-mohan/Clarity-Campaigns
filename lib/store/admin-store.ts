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

interface AdminStoreState {
  freelancers: Freelancer[];
  vendors: AdminVendor[];
  podTemplates: Record<SkuId, PodTemplateStep[]>;
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
    }),
    { name: "clarity-admin-data" }
  )
);
