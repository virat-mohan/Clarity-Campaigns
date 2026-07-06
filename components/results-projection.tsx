"use client";

import { useEffect } from "react";
import { SkuId } from "@/lib/data/campaign-types";
import { CampaignConfig } from "@/lib/store/campaign-store";
import { computeReach, computeAudienceFunnel } from "@/lib/calc/reach";
import { IndustryId } from "@/lib/data/industry-benchmarks";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { fmtMoney } from "@/lib/utils";

function Stat({ value, label, tone }: { value: string | number; label: string; tone?: "sage" }) {
  return (
    <div className="rounded-[3px] border border-border bg-card px-3 py-2.5 flex-1 min-w-[110px]">
      <div className={`font-heading text-xl font-semibold ${tone === "sage" ? "text-secondary" : "text-primary"}`}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

export function ResultsProjection({
  sku,
  config,
  onChange,
}: {
  sku: SkuId;
  config: CampaignConfig;
  onChange: (partial: Partial<CampaignConfig>) => void;
}) {
  const reachResult =
    sku === "performance" ? computeReach(config.industry as IndustryId, config.adSpend, config.channels) : null;

  // Once ad spend is entered, the channel+spend-weighted funnel here supersedes
  // the generic industry benchmark — synced back so pricing's outcome target
  // (and anything else funnel-dependent) stays consistent, same as the source
  // tool writing computeReach()'s output into the funnel % fields.
  useEffect(() => {
    if (
      reachResult &&
      (reachResult.qualifiedPct !== config.qualifiedPct ||
        reachResult.opportunityPct !== config.opportunityPct ||
        reachResult.closurePct !== config.closePct)
    ) {
      onChange({
        qualifiedPct: reachResult.qualifiedPct,
        opportunityPct: reachResult.opportunityPct,
        closePct: reachResult.closurePct,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reachResult?.qualifiedPct, reachResult?.opportunityPct, reachResult?.closurePct]);

  if (sku === "performance") {
    const result = reachResult;
    return (
      <div>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label>Ad spend ($/mo)</Label>
            <p className="text-[10.5px] text-muted-foreground mb-1">Same figure carried into Pricing — change here or in the Brief.</p>
            <Input
              type="number"
              value={config.adSpend}
              onChange={(e) => onChange({ adSpend: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
        {!result ? (
          <Card>
            <CardContent className="pt-4 text-[12.5px] text-muted-foreground">
              Enter a budget to estimate reach across this campaign&apos;s paid channels ({config.channels.join(", ")}).
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-3">
              <Stat value={result.totalImpressions.toLocaleString()} label="Impressions / mo" />
              <Stat value={result.totalClicks.toLocaleString()} label="Clicks / mo" />
              <Stat value={result.totalLeads.toLocaleString()} label="Leads / mo" tone="sage" />
              <Stat value={fmtMoney(result.estCpl)} label="Est. CPL" />
            </div>
            <Card className="mb-3">
              <CardContent className="pt-4">
                <div className="font-mono-label text-[9.5px] text-muted-foreground mb-2">
                  Per-channel split
                </div>
                {result.rows.map((r) => (
                  <div key={r.channel} className="flex justify-between border-b border-dashed border-border py-1.5 text-[12px] last:border-none">
                    <span>{r.channel}</span>
                    <span className="text-muted-foreground">
                      {r.impressions.toLocaleString()} impr · {r.clicks.toLocaleString()} clicks · {r.leads.toLocaleString()} leads · {fmtMoney(r.cpl)} CPL
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <p className="text-[11.5px] text-muted-foreground">
              Funnel benchmark: Qualified {result.qualifiedPct}%, Opportunity {result.opportunityPct}%, Close {result.closurePct}% — indexed per channel from platform benchmarks, and now driving the Funnel &amp; Commercial fields in the Brief.
            </p>
            <div className="mt-4 max-w-[320px]">
              <Label>ASP / Deal value ($)</Label>
              <p className="text-[10.5px] text-muted-foreground mb-1">Average sale price per closed deal.</p>
              <div className="flex gap-1.5">
                <Input type="number" value={config.asp} onChange={(e) => onChange({ asp: Number(e.target.value) || 0 })} className="flex-1 min-w-0" />
                <Select value={config.aspUnit ?? "per_unit"} onValueChange={(v) => onChange({ aspUnit: v as "per_unit" | "per_month" | "per_year" })}>
                  <SelectTrigger className="w-[120px] shrink-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_unit">per unit</SelectItem>
                    <SelectItem value="per_month">per month</SelectItem>
                    <SelectItem value="per_year">per year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              <Stat
                value={fmtMoney(
                  (result.totalLeads * (result.qualifiedPct / 100) * (result.opportunityPct / 100) * (result.closurePct / 100)) * config.asp
                )}
                label="Revenue potential"
                tone="sage"
              />
            </div>
          </>
        )}
      </div>
    );
  }

  if (sku === "abm" || sku === "retention") {
    const funnel = computeAudienceFunnel(config.audienceSize, config.qualifiedPct, config.opportunityPct, config.closePct, config.asp);
    return (
      <div>
        <div className="mb-3 flex flex-wrap gap-3">
          <Stat value={funnel.audience.toLocaleString()} label={sku === "abm" ? "Contacts" : "Customers targeted"} />
          <Stat value={funnel.qualified.toLocaleString()} label="Qualified leads" />
          <Stat value={funnel.opportunities.toLocaleString()} label="Meetings / calls booked" tone="sage" />
          <Stat value={funnel.closures.toLocaleString()} label="Closures" />
        </div>
        <Card>
          <CardContent className="pt-4">
            <div className="font-mono-label text-[9.5px] text-muted-foreground mb-2">Revenue potential</div>
            <div className="font-heading text-2xl font-semibold text-secondary">{fmtMoney(funnel.revenuePotential)}</div>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              {funnel.audience.toLocaleString()} audience × {config.qualifiedPct}% qualified × {config.opportunityPct}% opportunity × {config.closePct}% close × {fmtMoney(config.asp)} ASP ({config.aspUnit === "per_month" ? "per month" : config.aspUnit === "per_year" ? "per year" : "per unit"}).
            </p>
            <p className="mt-2 text-[11px] text-muted-foreground-2">
              Qualified/opportunity/close % are suggested from the industry benchmark in the Brief step — edit them there.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="border-dashed border-border-strong">
      <CardContent className="pt-5">
        <div className="font-mono-label text-[9.5px] text-primary mb-2">Benchmark model in development</div>
        <p className="text-[13px] text-muted-foreground">
          {sku === "social"
            ? "We don't yet have a reliable follower-growth or engagement benchmark model for organic social. Rather than fabricate a number, results tracking for this campaign type will be added once we have enough delivery data to benchmark against."
            : "We don't yet have a reliable organic-traffic or ranking benchmark model for content-led SEO/AEO. Rather than fabricate a number, results tracking for this campaign type will be added once we have enough delivery data to benchmark against."}
        </p>
      </CardContent>
    </Card>
  );
}
