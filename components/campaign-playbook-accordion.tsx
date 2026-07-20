"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { CAMPAIGN_PLAYBOOKS, CAMPAIGN_ORDER } from "@/lib/data/campaign-playbook";
import { cn } from "@/lib/utils";

const STAGE_BADGE: Record<string, string> = {
  Acquisition: "bg-primary/[.12] text-primary border-primary/35",
  Conversion: "bg-secondary/[.15] text-secondary border-secondary/35",
  Retention: "bg-destructive/[.15] text-destructive border-destructive/35",
};

export function CampaignPlaybookAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      {CAMPAIGN_ORDER.map((skuId) => {
        const ct = CAMPAIGN_TYPES[skuId];
        const playbook = CAMPAIGN_PLAYBOOKS[skuId];
        const isOpen = openId === skuId;
        const totalHrs = playbook.pod.reduce((sum, [, hrs]) => sum + hrs, 0);

        return (
          <div key={skuId} className="mb-4 rounded-[20px] border border-border bg-card px-6 py-6 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={cn(
                    "inline-block rounded-full border px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.08em]",
                    STAGE_BADGE[ct.flywheelStage]
                  )}
                >
                  {ct.flywheelStage}
                </span>
                <div>
                  <h3 className="font-heading text-[19px]">{ct.label}</h3>
                  <p className="mt-1.5 max-w-[600px] text-[13.5px] text-muted-foreground">{ct.desc}</p>
                </div>
              </div>
              <button
                onClick={() => setOpenId(isOpen ? null : skuId)}
                className="flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-border-strong px-4 text-[12.5px] font-semibold hover:border-primary hover:text-primary"
              >
                Plan &amp; pod
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")} />
              </button>
            </div>

            {isOpen && (
              <div className="mt-[22px] grid grid-cols-1 gap-6 border-t border-border pt-[22px] lg:grid-cols-[1.1fr_1fr]">
                <div>
                  <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground-2">
                    4-week process
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {playbook.steps.map((s) => (
                      <div key={s.week} className="rounded-[10px] border border-border bg-background p-2.5">
                        <div className="mb-0.5 text-[10px] font-bold text-primary">WEEK {s.week}</div>
                        <div className="mb-0.5 text-[12px] font-bold">{s.title}</div>
                        <div className="text-[11px] leading-snug text-muted-foreground-2">{s.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground-2">
                    Human pod
                  </div>
                  {playbook.pod.map(([role, hrs]) => (
                    <div key={role} className="flex justify-between border-b border-border py-1.5 text-[13px] last:border-b-0">
                      <span>{role}</span>
                      <span className="font-mono text-[12px] text-primary">{hrs} hrs</span>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 text-[12.5px] text-muted-foreground-2">
                    <span>Total pod effort</span>
                    <span>{totalHrs} hrs</span>
                  </div>
                  <div className="mt-4 rounded-[10px] border border-primary/20 bg-primary/[.06] px-3.5 py-3 text-[13px]">
                    <b className="text-primary">Expected outcome:</b> {playbook.kpi.IN}
                    <span className="mt-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground-2">
                      Illustrative example — adjusted to your industry &amp; geography on the call
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
