"use client";

import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { CAMPAIGN_FLOW_COPY } from "@/lib/data/campaign-flow-copy";
import type { SkuId } from "@/lib/data/campaign-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STAGE_VARIANT = {
  Acquisition: "amber",
  Conversion: "sage",
  Retention: "coral",
} as const;

export function StartRecCard({
  sku,
  isTop,
  matchPct,
  onStart,
}: {
  sku: SkuId;
  isTop: boolean;
  matchPct: number;
  onStart: () => void;
}) {
  const ct = CAMPAIGN_TYPES[sku];
  const copy = CAMPAIGN_FLOW_COPY[sku];

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border bg-card p-[18px]",
        isTop && "border-primary bg-primary/[0.06]"
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <Badge variant={STAGE_VARIANT[ct.flywheelStage]}>{isTop ? "Best match" : "Also strong"}</Badge>
        <span
          className={cn(
            "font-mono text-[11px]",
            isTop ? "text-primary" : "text-muted-foreground-2"
          )}
        >
          {matchPct}% match
        </span>
      </div>

      <div className="flex items-start justify-between">
        <h3
          className={cn(
            "font-heading mb-1 font-semibold",
            isTop ? "text-[19px]" : "text-base"
          )}
        >
          {ct.label}
        </h3>
        <DeliverablesHover label={ct.label} deliverables={copy.deliverables} />
      </div>

      <p className="mb-3 text-[12.5px] leading-[1.45] text-muted-foreground">{copy.description}</p>

      <div className="flex items-center justify-between">
        <span className="font-heading text-base font-semibold">${copy.price}</span>
        <Button variant={isTop ? "accent" : "outline"} size="sm" onClick={onStart}>
          {isTop ? "Start this campaign →" : "View →"}
        </Button>
      </div>
    </div>
  );
}

function DeliverablesHover({ label, deliverables }: { label: string; deliverables: string[] }) {
  return (
    <span className="relative ml-3 inline-block flex-shrink-0 group">
      <span
        tabIndex={0}
        className="inline-flex cursor-help items-center gap-1 whitespace-nowrap rounded-full border border-border-strong px-2.5 py-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.04em] text-muted-foreground-2 transition-colors group-hover:border-primary group-hover:bg-primary/8 group-hover:text-primary group-focus-within:border-primary group-focus-within:bg-primary/8 group-focus-within:text-primary"
      >
        ⓘ Deliverables
      </span>
      <div className="pointer-events-none invisible absolute top-[calc(100%+10px)] right-0 z-30 w-[280px] max-w-[80vw] translate-y-1 rounded-xl border border-paper-border bg-paper p-3.5 text-paper-foreground opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.45)] transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="absolute -top-1.5 right-[18px] h-3 w-3 rotate-45 border-l border-t border-paper-border bg-paper" />
        <div className="mb-2.5 border-b border-paper-border pb-2 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-primary-hover">
          {label} — what you get
        </div>
        {deliverables.map((d) => (
          <div key={d} className="mb-1.5 flex items-start gap-2 text-[12px] leading-[1.4] last:mb-0">
            <span className="mt-px flex-shrink-0 font-bold text-secondary">✓</span>
            <span>{d}</span>
          </div>
        ))}
      </div>
    </span>
  );
}
