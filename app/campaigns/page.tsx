"use client";

import Link from "next/link";
import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { CAMPAIGN_FLOW_COPY, SKU_TO_SLUG } from "@/lib/data/campaign-flow-copy";
import { useStartFlowStore } from "@/lib/store/start-flow-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STAGE_VARIANT = {
  Acquisition: "amber",
  Conversion: "sage",
  Retention: "coral",
} as const;

export default function CampaignsPage() {
  const selectedSku = useStartFlowStore((s) => s.selectedSku);
  const brandBasics = useStartFlowStore((s) => s.brandBasics);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-9">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label mb-1 text-[10px] text-primary">Workspace</div>
        <h1 className="font-heading text-2xl font-semibold">My Campaigns</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Campaigns you&apos;ve started in this browser. Data is saved locally.
        </p>
      </div>

      {selectedSku ? (
        <Card>
          <CardContent className="pt-5">
            <div className="mb-3 flex items-center justify-between">
              <Badge variant={STAGE_VARIANT[CAMPAIGN_TYPES[selectedSku].flywheelStage]}>
                {CAMPAIGN_TYPES[selectedSku].flywheelStage}
              </Badge>
              <span className="font-mono text-[10px] text-muted-foreground-2">In progress</span>
            </div>
            <h3 className="font-heading mb-0.5 text-[17px] font-semibold">
              {CAMPAIGN_TYPES[selectedSku].label}
            </h3>
            <p className="mb-3 text-[12.5px] text-muted-foreground">
              {brandBasics.brandName || "Untitled brand"} · {CAMPAIGN_FLOW_COPY[selectedSku].durationLabel} · $
              {CAMPAIGN_FLOW_COPY[selectedSku].price}
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href={`/start/brief?type=${SKU_TO_SLUG[selectedSku]}`}>
                <Button size="sm">Resume brief</Button>
              </Link>
              <Link href={`/start/plan?type=${SKU_TO_SLUG[selectedSku]}`}>
                <Button variant="outline" size="sm">
                  View plan
                </Button>
              </Link>
              <Link href={`/start/pay?type=${SKU_TO_SLUG[selectedSku]}`}>
                <Button variant="outline" size="sm">
                  Review & pay
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="px-5 py-9 text-center">
            <div className="font-heading mb-1.5 text-base font-semibold">No campaigns yet</div>
            <p className="mb-4 text-[12.5px] text-muted-foreground">
              Pick a campaign to start your first sprint — it&apos;ll show up here so you can pick up where you left
              off.
            </p>
            <Link href="/start">
              <Button>Browse campaigns →</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
