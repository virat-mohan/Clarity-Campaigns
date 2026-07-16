"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ClientProfile {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  industry: string;
  website: string;
  brandBookFileName: string;
  icpText: string;
  createdAt: number;
}

interface ClientStoreState {
  profile: ClientProfile | null;
  upsertProfile: (partial: Partial<Omit<ClientProfile, "id" | "createdAt">>) => void;
  clearProfile: () => void;
}

function newClientId(): string {
  return `client-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

export const useClientStore = create<ClientStoreState>()(
  persist(
    (set, get) => ({
      profile: null,
      upsertProfile: (partial) => {
        const current = get().profile;
        if (current) {
          set({ profile: { ...current, ...partial } });
        } else {
          set({
            profile: {
              id: newClientId(),
              companyName: "",
              contactName: "",
              email: "",
              industry: "d2c",
              website: "",
              brandBookFileName: "",
              icpText: "",
              createdAt: Date.now(),
              ...partial,
            },
          });
        }
      },
      clearProfile: () => set({ profile: null }),
    }),
    { name: "clarity-client-data" }
  )
);
