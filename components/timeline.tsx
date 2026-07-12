"use client";

import { SprintBreakdown } from "@/lib/calc/sprint";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export function Timeline({
  breakdown,
  approved,
  onApprove,
}: {
  breakdown: SprintBreakdown;
  approved: boolean;
  onApprove: () => void;
}) {
  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="font-heading text-xl font-semibold text-primary">{breakdown.totalDays}</div>
            <div className="font-mono text-[10px] text-muted-foreground">Total elapsed days</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="font-heading text-xl font-semibold text-primary">{breakdown.approxWeeks}</div>
            <div className="font-mono text-[10px] text-muted-foreground">Approx. weeks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="font-heading text-xl font-semibold text-primary">{breakdown.sprints.length}</div>
            <div className="font-mono text-[10px] text-muted-foreground">Sprints</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        {breakdown.sprints.map((sprint) => (
          <Card key={sprint.n}>
            <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2">
              <span className="font-heading text-[13px] font-semibold">Sprint {sprint.n}</span>
              <span className="font-mono text-[10px] text-muted-foreground">{sprint.days} days</span>
            </div>
            <CardContent className="pt-3 pb-3">
              {sprint.rows.map((row, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[80px_1fr_auto] items-start gap-2 border-b border-dashed border-border py-1.5 last:border-none"
                >
                  <span className="font-mono text-[10.5px] text-primary">{row.rangeLabel}</span>
                  <span className="text-[12px]">{row.stepTitle}</span>
                  <span className="font-mono text-[10px] text-secondary text-right whitespace-nowrap">{row.role}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between rounded-[4px] border border-border bg-card p-4">
        <div>
          <div className="font-mono-label text-[9.5px] text-muted-foreground mb-1">Approval gate</div>
          <p className="text-[12.5px] text-muted-foreground">
            Pricing is finalized only after this timeline is approved.
          </p>
        </div>
        {approved ? (
          <span className="flex items-center gap-2 font-mono text-[11px] text-secondary">
            <CheckCircle2 className="h-4 w-4" /> Timeline approved
          </span>
        ) : (
          <Button onClick={onApprove}>Approve timeline</Button>
        )}
      </div>
    </div>
  );
}
