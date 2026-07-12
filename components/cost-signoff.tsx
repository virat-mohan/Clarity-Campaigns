"use client";

import { PodRow } from "@/lib/calc/staffing";
import { CampaignConfig } from "@/lib/store/campaign-store";
import { VendorLine } from "@/lib/calc/pricing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fmtMoney } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

function SectionHead({ title, total }: { title: string; total: number }) {
  return (
    <div className="flex items-center justify-between pb-2 border-b border-paper-border mb-2">
      <span className="font-mono-label text-[9.5px] text-primary-hover">{title}</span>
      <span className="font-mono text-[11.5px] font-semibold text-paper-foreground">{fmtMoney(total)}</span>
    </div>
  );
}

function Row({ label, sub, amount }: { label: string; sub?: string; amount: number }) {
  return (
    <div className="flex items-center gap-3 px-1 py-1.5 border-b border-dashed border-paper-border last:border-none text-[12.5px]">
      <span className="flex-1 text-paper-foreground">
        {label}
        {sub && <span className="ml-1.5 text-[10.5px] text-muted-foreground">{sub}</span>}
      </span>
      <span className="font-mono text-[12px] font-semibold text-paper-foreground">{fmtMoney(amount)}</span>
    </div>
  );
}

export function CostSignoff({
  pod,
  vendorLines,
  techCostTotal,
  config,
  costsApproved,
  onApproveCosts,
}: {
  pod: PodRow[];
  vendorLines: VendorLine[];
  techCostTotal: number;
  config: CampaignConfig;
  costsApproved: boolean;
  onApproveCosts: () => void;
}) {
  const podCost = pod.reduce((s, r) => s + r.hours * r.rate, 0);
  const vendorCost = vendorLines.reduce((s, v) => s + (v.cost ?? 0), 0);
  const adSpend = config.adSpend ?? 0;
  const grandTotal = podCost + vendorCost + techCostTotal + adSpend;

  return (
    <div className="flex flex-col gap-4">
      {costsApproved && (
        <Card className="border-secondary/40 bg-secondary/5">
          <CardContent className="pt-3 pb-3 flex items-center gap-2 text-[12.5px] text-secondary">
            <CheckCircle2 className="h-4 w-4 flex-none" />
            Costs approved — locked into Pricing. Go back to Brief &amp; Team or Vendors &amp; Timeline to make changes, then re-approve.
          </CardContent>
        </Card>
      )}

      {/* Freelancers */}
      <Card className="bg-paper border-paper-border">
        <CardContent className="pt-5 pb-4">
          <SectionHead title="Freelancer pod" total={podCost} />
          {pod.length === 0 ? (
            <p className="text-[12px] text-muted-foreground">No freelancers added. Go back to Brief &amp; Team to build the pod.</p>
          ) : (
            <div className="flex flex-col">
              {pod.map((row) => (
                <Row
                  key={row.extraId ?? row.stepNumber}
                  label={row.stepTitle || row.role}
                  sub={`${row.role} · ${row.hours}h @ $${row.rate}/h`}
                  amount={row.hours * row.rate}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendors & tools */}
      {vendorLines.length > 0 && (
        <Card className="bg-paper border-paper-border">
          <CardContent className="pt-5 pb-4">
            <SectionHead title="Vendors & tools" total={vendorCost} />
            <div className="flex flex-col">
              {vendorLines.map((v) => (
                <Row key={v.id} label={v.name} amount={v.cost ?? 0} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tech / platform costs (ABM only) */}
      {techCostTotal > 0 && (
        <Card className="bg-paper border-paper-border">
          <CardContent className="pt-5 pb-4">
            <SectionHead title="Tech / platform costs" total={techCostTotal} />
            <p className="text-[11px] text-muted-foreground">
              Computed from audience size and channel mix. Full breakdown in the Pricing step.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Ad spend */}
      {adSpend > 0 && (
        <Card className="bg-paper border-paper-border">
          <CardContent className="pt-5 pb-4">
            <SectionHead title="Ad spend" total={adSpend} />
            <p className="text-[10.5px] text-muted-foreground">
              {config.adSpendCadence === "monthly" ? "Monthly" : "One-time / campaign total"} · set in the Brief.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Grand total + approve */}
      <Card className="bg-paper border-paper-border">
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono-label text-[9.5px] text-primary-hover">Total cost of running</span>
            <span className="font-heading text-2xl font-semibold text-paper-foreground">{fmtMoney(grandTotal)}</span>
          </div>
          <div className="flex flex-col gap-1 mb-5">
            <div className="flex justify-between text-[11.5px] text-muted-foreground">
              <span>Freelancer pod</span><span className="font-mono">{fmtMoney(podCost)}</span>
            </div>
            {vendorCost > 0 && (
              <div className="flex justify-between text-[11.5px] text-muted-foreground">
                <span>Vendors &amp; tools</span><span className="font-mono">{fmtMoney(vendorCost)}</span>
              </div>
            )}
            {techCostTotal > 0 && (
              <div className="flex justify-between text-[11.5px] text-muted-foreground">
                <span>Tech / platform</span><span className="font-mono">{fmtMoney(techCostTotal)}</span>
              </div>
            )}
            {adSpend > 0 && (
              <div className="flex justify-between text-[11.5px] text-muted-foreground">
                <span>Ad spend</span><span className="font-mono">{fmtMoney(adSpend)}</span>
              </div>
            )}
          </div>
          {costsApproved ? (
            <div className="flex items-center gap-2 text-[12.5px] text-secondary">
              <CheckCircle2 className="h-4 w-4" /> Costs approved
            </div>
          ) : (
            <Button onClick={onApproveCosts} className="w-full">
              Approve costs — proceed to Expected Results &amp; Pricing
            </Button>
          )}
          {!costsApproved && (
            <p className="mt-2 text-[10.5px] text-muted-foreground text-center">
              Approving locks this budget into pricing. Go back to Brief &amp; Team or Vendors &amp; Timeline to make changes first.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
