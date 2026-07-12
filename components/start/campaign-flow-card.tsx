"use client";

import Link from "next/link";
import type { CampaignType } from "@/lib/data/campaign-types";
import { CAMPAIGN_FLOW_COPY, SKU_TO_SLUG } from "@/lib/data/campaign-flow-copy";
import { Badge } from "@/components/ui/badge";

const STAGE_VARIANT = {
  Acquisition: "amber",
  Conversion: "sage",
  Retention: "coral",
} as const;

export function CampaignFlowCard({ ct }: { ct: CampaignType }) {
  const copy = CAMPAIGN_FLOW_COPY[ct.id];
  const slug = SKU_TO_SLUG[ct.id];

  return (
    <Link
      href={`/start/brief?type=${slug}`}
      className="group flex flex-col justify-between rounded-[var(--radius-card)] border border-border bg-card p-5 transition-colors hover:border-primary/50"
    >
      <div>
        <div className="mb-3 flex items-center justify-between">
          <Badge variant={STAGE_VARIANT[ct.flywheelStage]}>{ct.flywheelStage}</Badge>
          <span className="font-mono text-[10px] text-muted-foreground-2">{copy.durationLabel}</span>
        </div>
        <h3 className="font-heading text-[17px] font-semibold mb-1.5">{ct.label}</h3>
        <p className="text-[13px] text-muted-foreground leading-snug mb-2.5">{copy.description}</p>
        <p className="text-[11.5px] font-medium text-primary-hover mb-3">↗ {copy.goalLine}</p>
        <p className="font-mono text-[10px] text-muted-foreground-2 mb-5">{copy.channels.join(" · ")}</p>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-3">
        <span className="font-heading text-lg font-semibold text-foreground">${copy.price}</span>
        <span className="font-mono text-[11px] font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
          Start →
        </span>
      </div>
    </Link>
  );
}
