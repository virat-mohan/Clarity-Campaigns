"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { QuizAnswers, ReadinessInputs } from "@/lib/scoring/types";

interface QuizStoreState {
  answers: QuizAnswers;
  readiness: ReadinessInputs;
  stepIndex: number;
  /** Optional website captured on the short /start quiz (pre-fills brief). */
  websiteUrl: string;
  setAnswer: (key: keyof QuizAnswers, value: string) => void;
  toggleChannel: (channel: string) => void;
  toggleMissingAsset: (asset: string) => void;
  setReadinessInput: (id: keyof ReadinessInputs, value: boolean) => void;
  setStepIndex: (index: number) => void;
  setWebsiteUrl: (url: string) => void;
  reset: () => void;
}

const initialState = {
  answers: {} as QuizAnswers,
  readiness: {} as ReadinessInputs,
  stepIndex: 0,
  websiteUrl: "",
};

export const useQuizStore = create<QuizStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      setAnswer: (key, value) =>
        set((s) => ({ answers: { ...s.answers, [key]: value } })),

      toggleChannel: (channel) =>
        set((s) => {
          const current = s.answers.current_channels ?? [];
          if (channel === "none") {
            return { answers: { ...s.answers, current_channels: current.includes("none") ? [] : ["none"] } };
          }
          const withoutNone = current.filter((c) => c !== "none");
          const next = withoutNone.includes(channel)
            ? withoutNone.filter((c) => c !== channel)
            : [...withoutNone, channel];
          return { answers: { ...s.answers, current_channels: next } };
        }),

      toggleMissingAsset: (asset) =>
        set((s) => {
          const current = s.answers.missing_assets ?? [];
          const next = current.includes(asset) ? current.filter((a) => a !== asset) : [...current, asset];
          return { answers: { ...s.answers, missing_assets: next } };
        }),

      setReadinessInput: (id, value) =>
        set((s) => ({ readiness: { ...s.readiness, [id]: value } })),

      setStepIndex: (index) => set({ stepIndex: index }),

      setWebsiteUrl: (url) => set({ websiteUrl: url }),

      reset: () => set({ ...initialState }),
    }),
    { name: "clarity-recommendation-quiz" }
  )
);
