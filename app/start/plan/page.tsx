"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { CAMPAIGN_FLOW_COPY, SLUG_TO_SKU } from "@/lib/data/campaign-flow-copy";
import { CAMPAIGN_PLAN_DETAILS, GENERIC_KPI_BENCHMARK_NOTE } from "@/lib/data/campaign-plan-details";
import { MARKET_OPTIONS } from "@/lib/data/campaign-brief-fields";
import { IND, type IndustryId } from "@/lib/data/industry-benchmarks";
import { bundlePrice, DURATION_DISCOUNT_LABEL } from "@/lib/data/bundle-pricing";
import { useStartFlowStore } from "@/lib/store/start-flow-store";
import { useQuizStore } from "@/lib/store/quiz-store";
import { getStartFlowRoadmap } from "@/lib/scoring/recommendation-engine";
import { CAMPAIGN_ID_TO_SKU, SKU_TO_CAMPAIGN_ID } from "@/lib/quiz/campaign-sku-map";
import { PlanTimeline } from "@/components/start/plan-timeline";
import { PlanPodGrid } from "@/components/start/plan-pod-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function PlanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  const selectedSku = useStartFlowStore((s) => s.selectedSku);
  const brandBasics = useStartFlowStore((s) => s.brandBasics);
  const duration = useStartFlowStore((s) => s.duration);
  const setSelectedSku = useStartFlowStore((s) => s.setSelectedSku);
  const setDuration = useStartFlowStore((s) => s.setDuration);
  const quizAnswers = useQuizStore((s) => s.answers);

  const sku = (typeParam ? SLUG_TO_SKU[typeParam] : undefined) ?? selectedSku ?? undefined;

  useEffect(() => {
    if (!sku) {
      router.replace("/start");
      return;
    }
    if (selectedSku !== sku) {
      setSelectedSku(sku);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku]);

  const ct = sku ? CAMPAIGN_TYPES[sku] : null;
  const copy = sku ? CAMPAIGN_FLOW_COPY[sku] : null;
  const planDetails = sku ? CAMPAIGN_PLAN_DETAILS[sku] : null;

  const marketLabel = useMemo(
    () => MARKET_OPTIONS.find((m) => m.value === brandBasics.country)?.label,
    [brandBasics.country]
  );
  const industryLabel = brandBasics.industry ? IND[brandBasics.industry as IndustryId]?.name : undefined;

  const kpiText =
    brandBasics.country === "IN" || brandBasics.country === "US"
      ? planDetails?.kpiBenchmarks[brandBasics.country]
      : GENERIC_KPI_BENCHMARK_NOTE;

  const roadmap = useMemo(() => {
    if (!sku) return [];
    return getStartFlowRoadmap(quizAnswers, SKU_TO_CAMPAIGN_ID[sku]).slice(0, duration);
  }, [quizAnswers, sku, duration]);

  if (!sku || !ct || !copy || !planDetails) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-[13px] text-muted-foreground">
        Redirecting…
      </div>
    );
  }

  const totalHours = planDetails.humanPod.reduce((a, r) => a + r.hours, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label mb-1 text-[10px] text-primary">Your plan</div>
        <h1 className="font-heading text-2xl font-semibold">{ct.label}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Auto-generated from your brief — {copy.durationLabel}, {copy.podSize} specialists.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <div className="font-mono-label mb-3 text-[9.5px] text-muted-foreground">Duration</div>
          <div className="grid grid-cols-3 gap-2.5">
            {([1, 2, 3] as const).map((n) => {
              const price = bundlePrice(n);
              const active = duration === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setDuration(n)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 rounded-[var(--radius-card)] border border-border-strong bg-card px-2 py-3 transition-colors hover:border-primary",
                    active && "border-primary bg-primary/[0.08]"
                  )}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                    {n} month{n > 1 ? "s" : ""}
                  </span>
                  <span
                    className={cn(
                      "font-heading text-lg font-semibold",
                      active && "text-primary"
                    )}
                  >
                    ${price.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-secondary">{DURATION_DISCOUNT_LABEL[n]}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground-2">
            Commit to more months and save — the discount applies to the full bundle, billed today.
          </p>
        </div>

        <div>
          <div className="font-mono-label mb-3 text-[9.5px] text-muted-foreground">
            Your roadmap{duration > 1 ? ` — ${duration} months` : ""}
          </div>
          <Card className="border-paper-border bg-paper text-paper-foreground">
            <CardContent className="p-3 pt-3">
              {roadmap.map((step) => {
                const rsku = CAMPAIGN_ID_TO_SKU[step.campaign];
                const rct = CAMPAIGN_TYPES[rsku];
                const rcopy = CAMPAIGN_FLOW_COPY[rsku];
                const isCurrent = rsku === sku;
                return (
                  <div
                    key={`${step.monthLabel}-${step.campaign}`}
                    className="flex gap-3 border-b border-paper-border px-1 py-2.5 last:border-b-0"
                  >
                    <div
                      className={cn(
                        "w-[68px] flex-shrink-0 pt-0.5 font-mono text-[10px] font-semibold text-muted-foreground",
                        isCurrent && "text-primary-hover"
                      )}
                    >
                      {step.monthLabel}
                    </div>
                    <div>
                      <div className="mb-0.5 text-[13px] font-semibold text-paper-foreground">
                        {rct.label}
                        {isCurrent && (
                          <span className="ml-1.5 align-middle rounded bg-primary/12 px-1.5 py-px font-mono text-[8.5px] font-bold uppercase tracking-[0.05em] text-primary-hover">
                            this plan
                          </span>
                        )}
                      </div>
                      <div className="text-[11.5px] leading-[1.4] text-[#6b6353]">{rcopy.description}</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="font-mono-label mb-3 text-[9.5px] text-muted-foreground">
            Sprint timeline{" "}
            <span className="font-normal normal-case tracking-normal text-muted-foreground-2">
              — Month 1: {ct.label}
            </span>
          </div>
          <PlanTimeline steps={planDetails.weeklyProcess} />
        </div>

        <div>
          <div className="font-mono-label mb-3 text-[9.5px] text-muted-foreground">Human Pod</div>
          <Card className="border-paper-border bg-paper">
            <CardContent className="pt-5">
              <PlanPodGrid pod={planDetails.humanPod} />
              <div className="mt-3 text-right font-mono text-[11px] text-[#6b6353]">
                {totalHours} hrs total{duration > 1 ? " · Month 1 only" : ""}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="font-mono-label mb-3 text-[9.5px] text-muted-foreground">Expected results</div>
          <Card className="border-paper-border bg-paper text-paper-foreground">
            <CardContent className="pt-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {copy.goalLine.split(", ").map((metric) => (
                  <span
                    key={metric}
                    className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-[10px] text-primary"
                  >
                    {metric}
                  </span>
                ))}
              </div>
              <p className="text-[13px] leading-relaxed text-foreground">{kpiText}</p>
              <p className="mt-3 text-[10.5px] text-muted-foreground-2">
                Based on {industryLabel ?? "your"} benchmarks for {marketLabel ?? "your"} market. Actual results
                vary.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
        <Link href={`/start/brief?type=${typeParam ?? ""}`}>
          <Button variant="outline">← Edit brief</Button>
        </Link>
        <Link href={`/start/pay?type=${typeParam ?? ""}`}>
          <Button>Review & proceed →</Button>
        </Link>
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-[13px] text-muted-foreground">
          Loading…
        </div>
      }
    >
      <PlanPageContent />
    </Suspense>
  );
}
