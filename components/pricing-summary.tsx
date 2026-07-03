"use client";

import { SkuId } from "@/lib/data/campaign-types";
import { CampaignConfig, VendorToggleState, CustomVendorLine } from "@/lib/store/campaign-store";
import { PodRow } from "@/lib/calc/staffing";
import { computePricing, outcomeTargetFor, PriceMode, OutcomeMetric, VendorLine } from "@/lib/calc/pricing";
import { ALL_ROSTER, currencyForRoster } from "@/lib/data/talent-vendor-roster";
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
  customVendors: CustomVendorLine[] = []
): VendorLine[] {
  const rosterLines = ALL_ROSTER.filter((r) => r.togglable)
    .map((r) => ({ entry: r, state: vendorToggles[r.id] }))
    .filter((x): x is { entry: (typeof ALL_ROSTER)[number]; state: VendorToggleState } => !!x.state?.on)
    .map(({ entry, state }) => ({
      id: entry.id,
      name: entry.name,
      cost: state.cost ?? 0,
      currency: currencyForRoster(entry),
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
  const vendorLines = vendorLinesFor(config.vendorToggles, config.customVendors);

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
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label>Outcome metric this campaign is paid on</Label>
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
                  <Label>Custom outcome metric name</Label>
                  <Input
                    placeholder="e.g. demo completed, signup activated"
                    value={config.outcomeCustomLabel}
                    onChange={(e) => onChange({ outcomeCustomLabel: e.target.value })}
                  />
                </div>
              )}
              <div>
                <Label>Target outcomes (baseline, from funnel)</Label>
                <Input type="number" value={outcomeTarget} readOnly />
              </div>
              <div>
                <Label>Rate per outcome at target ($)</Label>
                <Input type="number" value={config.outcomeRate} onChange={(e) => onChange({ outcomeRate: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Delta bonus rate above target ($/outcome)</Label>
                <Input type="number" value={config.outcomeDeltaRate} onChange={(e) => onChange({ outcomeDeltaRate: Number(e.target.value) || 0 })} />
              </div>
              <div>
                <Label>Delta bonus threshold (% over target)</Label>
                <Input type="number" value={config.outcomeDeltaThreshold} onChange={(e) => onChange({ outcomeDeltaThreshold: Number(e.target.value) || 0 })} />
              </div>
            </div>
            <p className="mt-3 text-[11.5px] text-muted-foreground-2">
              Delta bonus of {fmtMoney(config.outcomeDeltaRate)}/{metricLabel} applies above {config.outcomeDeltaThreshold}% over target.
            </p>
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
