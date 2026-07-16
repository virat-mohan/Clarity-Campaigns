"use client";

import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RoadmapStep } from "@/lib/scoring/types";
import { CAMPAIGN_ID_TO_SKU } from "@/lib/quiz/campaign-sku-map";

const STAGE_VARIANT = {
  acquisition: "amber",
  conversion: "sage",
  retention: "coral",
} as const;

const STAGE_LABEL = {
  acquisition: "Acquisition",
  conversion: "Conversion",
  retention: "Retention",
} as const;

export function RoadmapTimeline({ steps }: { steps: RoadmapStep[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {steps.map((step) => {
        const sku = CAMPAIGN_ID_TO_SKU[step.campaign];
        const ct = CAMPAIGN_TYPES[sku];
        return (
          <Card key={step.campaign}>
            <CardContent className="flex items-center gap-4 pt-4 pb-4">
              <span className="font-mono text-[11px] text-primary flex-none w-[68px]">{step.monthLabel}</span>
              <div className="flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <Badge variant={STAGE_VARIANT[step.stage]}>{STAGE_LABEL[step.stage]}</Badge>
                  <span className="font-heading text-[13.5px] font-semibold">{ct.label}</span>
                </div>
                <p className="text-[11.5px] text-muted-foreground leading-snug">{ct.desc}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
