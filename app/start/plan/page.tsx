"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { CAMPAIGN_FLOW_COPY, SLUG_TO_SKU } from "@/lib/data/campaign-flow-copy";
import { CAMPAIGN_PLAN_DETAILS, GENERIC_KPI_BENCHMARK_NOTE } from "@/lib/data/campaign-plan-details";
import { MARKET_OPTIONS } from "@/lib/data/campaign-brief-fields";
import { IND, type IndustryId } from "@/lib/data/industry-benchmarks";
import { useStartFlowStore } from "@/lib/store/start-flow-store";
import { PlanTimeline } from "@/components/start/plan-timeline";
import { PlanPodGrid } from "@/components/start/plan-pod-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function PlanPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  const selectedSku = useStartFlowStore((s) => s.selectedSku);
  const brandBasics = useStartFlowStore((s) => s.brandBasics);
  const setSelectedSku = useStartFlowStore((s) => s.setSelectedSku);

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
          <div className="font-mono-label mb-3 text-[9.5px] text-muted-foreground">Sprint timeline</div>
          <PlanTimeline steps={planDetails.weeklyProcess} />
        </div>

        <div>
          <div className="font-mono-label mb-3 text-[9.5px] text-muted-foreground">Human Pod</div>
          <Card>
            <CardContent className="pt-5">
              <PlanPodGrid pod={planDetails.humanPod} />
              <div className="mt-3 text-right font-mono text-[11px] text-muted-foreground">
                {totalHours} hrs total
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="font-mono-label mb-3 text-[9.5px] text-muted-foreground">Expected results</div>
          <Card>
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
