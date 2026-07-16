"use client";

import Link from "next/link";
import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Recommendation } from "@/lib/scoring/types";
import { CAMPAIGN_ID_TO_SKU } from "@/lib/quiz/campaign-sku-map";

const STAGE_VARIANT = {
  Acquisition: "amber",
  Conversion: "sage",
  Retention: "coral",
} as const;

export function RecommendationCard({
  recommendation,
  confidenceLabel,
}: {
  recommendation: Recommendation;
  confidenceLabel?: string;
}) {
  const sku = CAMPAIGN_ID_TO_SKU[recommendation.campaign];
  const ct = CAMPAIGN_TYPES[sku];

  return (
    <Card className="flex flex-col justify-between transition-colors hover:border-primary/50">
      <CardContent className="pt-5">
        <div className="mb-3 flex items-center justify-between">
          <Badge variant={STAGE_VARIANT[ct.flywheelStage]}>{ct.flywheelStage}</Badge>
          <span className="font-mono text-[10px] uppercase text-muted-foreground-2">#{recommendation.rank} pick</span>
        </div>
        <h3 className="font-heading heading-2tone text-[17px] font-semibold mb-1.5">
          {(() => {
            const m = ct.label.match(/^(.*?)(\s*\(.*\))$/);
            return m ? (<>{m[1]}<span className="dim">{m[2]}</span></>) : ct.label;
          })()}
        </h3>
        {confidenceLabel && (
          <div className="mb-2 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-[10px] text-primary">
            {confidenceLabel}
          </div>
        )}
        <p className="text-[13px] text-muted-foreground leading-snug mb-3">{ct.desc}</p>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {ct.channels.map((c) => (
            <span
              key={c}
              className="font-mono text-[9px] px-1.5 py-0.5 rounded-[2px] bg-muted text-muted-foreground-2"
            >
              {c}
            </span>
          ))}
        </div>
        <Link href={`/build/new?sku=${sku}`} className="block">
          <Button className="w-full">Build this campaign</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
