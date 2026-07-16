"use client";

import Link from "next/link";
import { CAMPAIGN_TYPE_LIST } from "@/lib/data/campaign-types";
import { CAMPAIGN_FLOW_COPY } from "@/lib/data/campaign-flow-copy";
import { CAMPAIGN_PLAN_DETAILS } from "@/lib/data/campaign-plan-details";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminPage() {
  const roleCount = new Set(
    Object.values(CAMPAIGN_PLAN_DETAILS).flatMap((p) => p.humanPod.map((r) => r.role))
  ).size;

  const tiles = [
    ["5", "Campaign types"],
    ["$499", "Fixed price"],
    ["4 wks", "Sprint length"],
    [String(roleCount), "Pod roles"],
  ] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-9">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label mb-1 text-[10px] text-primary">Internal · Admin</div>
        <h1 className="font-heading text-2xl font-semibold">Operations overview</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Internal control panel (read-only snapshot in this demo). The full app manages freelancers, vendors,
          templates, and settings.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(([v, l]) => (
          <div
            key={l}
            className="rounded-[var(--radius-card)] border border-border bg-card px-4 py-3 text-center"
          >
            <div className="font-heading text-xl font-semibold text-primary">{v}</div>
            <div className="font-mono text-[9.5px] uppercase tracking-wide text-muted-foreground">{l}</div>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="font-mono-label mb-2.5 text-[9.5px] text-muted-foreground">Campaign catalogue</div>
          {CAMPAIGN_TYPE_LIST.map((ct) => (
            <div key={ct.id} className="mb-1.5 flex items-center justify-between text-[12.5px]">
              <span>
                {ct.label}{" "}
                <span className="text-[11px] text-muted-foreground-2">· {ct.flywheelStage}</span>
              </span>
              <span className="font-mono">${CAMPAIGN_FLOW_COPY[ct.id].price}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-[18px] flex items-center justify-between border-t border-border pt-[18px]">
        <Link href="/start">
          <Button variant="outline">← Back to site</Button>
        </Link>
      </div>
    </div>
  );
}
