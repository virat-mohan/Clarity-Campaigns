"use client";

import { SkuId } from "@/lib/data/campaign-types";
import { CampaignConfig, VendorToggleState, CustomVendorLine } from "@/lib/store/campaign-store";
import { PodRow } from "@/lib/calc/staffing";
import { computePricing, outcomeTargetFor, PriceMode, OutcomeMetric, VendorLine } from "@/lib/calc/pricing";
import { AdminVendor, useAdminStore } from "@/lib/store/admin-store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn, fmtMoney, fmtInr } from "@/lib/utils";

function outcomeMetricLabel(metric: OutcomeMetric, customLabel: string): string {
  if (metric === "qualified") return "qualified lead";
  if (metric === "opportunity") return "opportunity / meeting booked";
  if (metric === "closure") return "closed deal / purchase";
  return customLabel || "custom outcome";
}

export function vendorLinesFor(
  vendorToggles: Record<string, VendorToggleState>,
  customVendors: CustomVendorLine[] = [],
  adminVendors: AdminVendor[] = []
): VendorLine[] {
  const rosterLines = adminVendors
    .map((v) => ({ entry: v, state: vendorToggles[v.id] }))
    .filter((x): x is { entry: AdminVendor; state: VendorToggleState } => !!x.state?.on)
    .map(({ entry, state }) => ({
      id: entry.id,
      name: entry.name,
      cost: state.cost ?? 0,
      currency: entry.currency,
    }));
  const customLines = customVendors
    .filter((v) => v.name.trim().length > 0)
    .map((v) => ({ id: v.id, name: v.name, cost: v.cost ?? 0, currency: "USD" as const }));
  return [...rosterLines, ...customLines];
}

export function PricingSummary({
  sku,
  config,
  pod,
  onChange,
}: {
  sku: SkuId;
  config: CampaignConfig;
  pod: PodRow[];
  onChange: (partial: Partial<CampaignConfig>) => void;
}) {
  const outcomeTarget = outcomeTargetFor(config.outcomeMetric, {
    audienceSize: config.audienceSize,
    qualifiedPct: config.qualifiedPct,
    opportunityPct: config.opportunityPct,
    closePct: config.closePct,
    asp: config.asp,
  });
  const adminVendors = useAdminStore((s) => s.vendors);
  const vendorLines = vendorLinesFor(config.vendorToggles, config.customVendors, adminVendors);

  const pricing = computePricing({
    sku,
    pod,
    assets: config.assets,
    audience: config.audienceSize,
    channels: config.channels,
    emailSteps: config.emailSteps,
    liSteps: config.liSteps,
    waSteps: config.waSteps,
    adSpend: config.adSpend,
    vendorLines,
    priceMode: config.priceMode,
    outcomeMetric: config.outcomeMetric,
    outcomeTarget,
    outcomeRate: config.outcomeRate,
    outcomeDeltaRate: config.outcomeDeltaRate,
    outcomeDeltaThreshold: config.outcomeDeltaThreshold,
  });

  const metricLabel = outcomeMetricLabel(config.outcomeMetric, config.outcomeCustomLabel);

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["fixed", "hybrid"] as PriceMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => onChange({ priceMode: mode })}
            className={cn(
              "flex-1 rounded-[3px] border px-4 py-2 font-mono text-[11px] uppercase transition-colors",
              config.priceMode === mode
                ? "border-primary bg-primary/10 text-primary"
                : "border-border-strong text-muted-foreground hover:border-primary/50"
            )}
          >
            {mode === "fixed" ? "Fixed (4x cost)" : "Fixed + Variable"}
          </button>
        ))}
      </div>

      {config.priceMode === "hybrid" && (
        <Card className="mb-4 bg-paper border-paper-border text-paper-foreground">
          <CardContent className="pt-4">
            <div className="font-mono-label text-[9.5px] text-primary-hover mb-3">Variable payout structure</div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
              <div>
                <Label>Outcome metric</Label>
                <Select value={config.outcomeMetric} onValueChange={(v) => onChange({ outcomeMetric: v as OutcomeMetric })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="qualified">Qualified lead</SelectItem>
                    <SelectItem value="opportunity">Opportunity / meeting booked</SelectItem>
                    <SelectItem value="closure">Closed deal / purchase</SelectItem>
                    <SelectItem value="custom">Custom (define below)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {config.outcomeMetric === "custom" && (
                <div>
                  <Label>Custom metric name</Label>
                  <Input
                    placeholder="e.g. demo completed, signup activated"
                    value={config.outcomeCustomLabel}
                    onChange={(e) => onChange({ outcomeCustomLabel: e.target.value })}
                  />
                </div>
              )}
              <div>
                <Label>Target (auto from funnel — read only)</Label>
                <Input type="number" value={outcomeTarget} readOnly className="bg-muted/40 cursor-default" />
              </div>
              <div>
                <Label>Rate per {metricLabel} at or below target ($)</Label>
                <Input type="number" value={config.outcomeRate} onChange={(e) => onChange({ outcomeRate: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Bonus rate above threshold ($/extra {metricLabel})</Label>
                <Input type="number" value={config.outcomeDeltaRate} onChange={(e) => onChange({ outcomeDeltaRate: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Bonus kicks in above target by (% threshold)</Label>
                <Input type="number" value={config.outcomeDeltaThreshold} onChange={(e) => onChange({ outcomeDeltaThreshold: Number(e.target.value) || 0 })} />
              </div>
            </div>

            {/* Formula breakdown */}
            <div className="rounded-[3px] border border-paper-border bg-muted/30 p-3 mb-3 text-[12px]">
              <div className="font-mono-label text-[8.5px] text-muted-foreground mb-2">How it&apos;s calculated</div>
              <div className="space-y-1 text-foreground">
                <div><span className="text-muted-foreground w-36 inline-block">Fixed component</span> Cost × 3 = {fmtMoney(pricing.fixedComponent)}</div>
                <div><span className="text-muted-foreground w-36 inline-block">At-target variable</span> {outcomeTarget} {metricLabel}s × {fmtMoney(config.outcomeRate)} = {fmtMoney(pricing.baselineVariable)}</div>
                <div><span className="text-muted-foreground w-36 inline-block">Bonus threshold</span> Triggered above {config.outcomeDeltaThreshold}% over target ({Math.round(outcomeTarget * (1 + config.outcomeDeltaThreshold / 100))} {metricLabel}s)</div>
                <div><span className="text-muted-foreground w-36 inline-block">Bonus rate</span> {fmtMoney(config.outcomeDeltaRate)} per extra {metricLabel} above threshold</div>
              </div>
            </div>

            {/* Worked example */}
            {outcomeTarget > 0 && config.outcomeRate > 0 && (() => {
              const thresholdCount = Math.ceil(outcomeTarget * (1 + config.outcomeDeltaThreshold / 100));
              const exampleDelivered = Math.round(outcomeTarget * 1.3); // show 30% over target
              const aboveThreshold = Math.max(0, exampleDelivered - thresholdCount);
              const exampleDelta = aboveThreshold * config.outcomeDeltaRate;
              const exampleTotal = pricing.fixedComponent + pricing.baselineVariable + exampleDelta;
              return (
                <div className="rounded-[3px] border border-secondary/30 bg-secondary/5 p-3 text-[11.5px]">
                  <div className="font-mono-label text-[8.5px] text-secondary mb-2">Worked example — if you deliver {exampleDelivered} {metricLabel}s (30% above target)</div>
                  <div className="space-y-0.5 text-foreground">
                    <div className="flex justify-between"><span>Fixed (cost × 3)</span><span className="font-mono">{fmtMoney(pricing.fixedComponent)}</span></div>
                    <div className="flex justify-between"><span>At-target variable ({outcomeTarget} × {fmtMoney(config.outcomeRate)})</span><span className="font-mono">{fmtMoney(pricing.baselineVariable)}</span></div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Threshold at {config.outcomeDeltaThreshold}% above target → {thresholdCount} {metricLabel}s</span>
                    </div>
                    {aboveThreshold > 0 ? (
                      <div className="flex justify-between"><span>Bonus: {aboveThreshold} extra × {fmtMoney(config.outcomeDeltaRate)}</span><span className="font-mono text-secondary">+ {fmtMoney(exampleDelta)}</span></div>
                    ) : (
                      <div className="text-muted-foreground">No bonus — delivery doesn&apos;t clear the {config.outcomeDeltaThreshold}% threshold</div>
                    )}
                    <div className="flex justify-between border-t border-secondary/20 pt-1 mt-1 font-semibold"><span>Total invoice (variable portion)</span><span className="font-mono">{fmtMoney(pricing.fixedComponent + pricing.baselineVariable + exampleDelta)}</span></div>
                    <div className="flex justify-between text-muted-foreground text-[10.5px]"><span>+ ad spend + vendor costs on top (at cost)</span><span className="font-mono">{fmtMoney(pricing.adSpend + pricing.vendorCostUsd)}</span></div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-4">
          <div className="font-mono-label text-[9.5px] text-muted-foreground mb-3">Cost breakdown (multiple-eligible)</div>
          <table className="w-full text-[12.5px]">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-1.5 text-muted-foreground">Pod / HR cost</td>
                <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.podCost)}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-1.5 text-muted-foreground">Asset cost</td>
                <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.assetCost)}</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-1.5 text-muted-foreground">
                  Tech cost {sku !== "abm" && <span className="text-[10px]">(not modelled for this SKU)</span>}
                </td>
                <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.techCost)}</td>
              </tr>
              <tr className="border-b-2 border-primary/40 font-semibold">
                <td className="py-1.5">Total cost</td>
                <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.totalCost)}</td>
              </tr>
              {config.priceMode === "fixed" ? (
                <tr className="border-b border-border">
                  <td className="py-1.5 text-muted-foreground">Cost × 4</td>
                  <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.fixedComponent)}</td>
                </tr>
              ) : (
                <>
                  <tr className="border-b border-border">
                    <td className="py-1.5 text-muted-foreground">Cost × 3 (fixed component)</td>
                    <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.fixedComponent)}</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-1.5 text-muted-foreground">
                      Variable at target ({outcomeTarget} × {fmtMoney(config.outcomeRate)}/{metricLabel})
                    </td>
                    <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.baselineVariable)}</td>
                  </tr>
                </>
              )}
              <tr className="border-b-2 border-primary font-semibold text-primary">
                <td className="py-2">Client price ({config.priceMode})</td>
                <td className="py-2 text-right font-mono">{fmtMoney(pricing.totalPrice)}</td>
              </tr>
              <tr className="border-b border-dashed border-border">
                <td className="py-1.5 text-muted-foreground">Ad spend ({config.adSpendCadence}, at-cost, separate)</td>
                <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.adSpend)}</td>
              </tr>
              <tr className="border-b border-dashed border-border">
                <td className="py-1.5 text-muted-foreground">Vendor costs (at-cost, separate)</td>
                <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.vendorCostUsd)}</td>
              </tr>
              {pricing.specialistCostInr > 0 && (
                <tr className="border-b border-dashed border-border">
                  <td className="py-1.5 text-muted-foreground">Specialist retainer capacity (at-cost, separate, ₹)</td>
                  <td className="py-1.5 text-right font-mono">{fmtInr(pricing.specialistCostInr)}</td>
                </tr>
              )}
              <tr>
                <td className="py-2 font-heading text-[15px] font-semibold">Grand total (USD)</td>
                <td className="py-2 text-right font-heading text-[17px] font-semibold text-primary">
                  {fmtMoney(pricing.grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
