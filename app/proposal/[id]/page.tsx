"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useCampaignStore } from "@/lib/store/campaign-store";
import { useAdminStore } from "@/lib/store/admin-store";
import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { buildAutoPod, applyPodOverrides } from "@/lib/calc/staffing";
import { buildSprintBreakdown } from "@/lib/calc/sprint";
import { computePricing, outcomeTargetFor } from "@/lib/calc/pricing";
import { vendorLinesFor } from "@/components/pricing-summary";
import { TalkToUsCta } from "@/components/talk-to-us-cta";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fmtMoney } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

function outcomeMetricLabel(metric: string, custom: string) {
  if (metric === "qualified") return "qualified leads";
  if (metric === "opportunity") return "meetings booked / opportunities";
  if (metric === "closure") return "closed deals";
  return custom || "agreed outcome metric";
}

export default function ProposalPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const campaign = useCampaignStore((s) => s.campaigns.find((c) => c.id === id));
  const adminVendors = useAdminStore((s) => s.vendors);
  const podTemplates = useAdminStore((s) => s.podTemplates);
  const markupFixed = useAdminStore((s) => s.markupFixed);
  const markupHybrid = useAdminStore((s) => s.markupHybrid);

  const config = campaign?.config ?? null;
  const sku = campaign?.sku ?? null;
  const ct = sku ? CAMPAIGN_TYPES[sku] : null;

  const templateSteps = sku ? podTemplates[sku] : undefined;

  const pod = useMemo(() => {
    if (!sku || !config) return [];
    const suggested = buildAutoPod(sku, config.audienceSize, templateSteps);
    return applyPodOverrides(suggested, config.podOverrides ?? {});
  }, [sku, config, templateSteps]);

  const sprintBreakdown = useMemo(
    () => (sku && config ? buildSprintBreakdown(sku, config.sprints ?? 1, templateSteps) : null),
    [sku, config, templateSteps]
  );

  const pricing = useMemo(() => {
    if (!sku || !config) return null;
    const vendorLines = vendorLinesFor(config.vendorToggles, config.customVendors, adminVendors);
    const outcomeTarget = outcomeTargetFor(config.outcomeMetric, {
      audienceSize: config.audienceSize,
      qualifiedPct: config.qualifiedPct,
      opportunityPct: config.opportunityPct,
      closePct: config.closePct,
      asp: config.asp,
    });
    return computePricing({
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
      markupFixed,
      markupHybrid,
    });
  }, [sku, config, pod, adminVendors, markupFixed, markupHybrid]);

  if (!campaign || !config || !ct || !pricing) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <p className="text-muted-foreground text-[13px]">Proposal not found.</p>
        <Link href="/campaigns">
          <Button className="mt-4" variant="outline">My Campaigns</Button>
        </Link>
      </div>
    );
  }

  const metricLabel = outcomeMetricLabel(config.outcomeMetric, config.outcomeCustomLabel);
  const uniqueRoles = Array.from(new Set(pod.map((p) => p.role)));

  // Deliverables from active template steps
  const deliverables = templateSteps
    ? templateSteps.filter((s) => s.active && s.deliverable).map((s) => s.deliverable)
    : pod.map((p) => p.stepTitle).filter(Boolean);

  const funnelSteps = [
    { label: "Target accounts / contacts", value: config.audienceSize.toLocaleString() },
    { label: "Qualified leads (est.)", value: Math.round(config.audienceSize * config.qualifiedPct / 100).toLocaleString() },
    { label: "Meetings / opportunities (est.)", value: Math.round(config.audienceSize * config.qualifiedPct / 100 * config.opportunityPct / 100).toLocaleString() },
    { label: "Closed deals (est.)", value: Math.round(config.audienceSize * config.qualifiedPct / 100 * config.opportunityPct / 100 * config.closePct / 100).toLocaleString() },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-border">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-[10px] text-primary mb-1 uppercase tracking-wide">
              Campaign Proposal
            </div>
            <h1 className="font-heading text-2xl font-semibold">
              {config.name || ct.label}
            </h1>
            {config.client && (
              <p className="text-[13px] text-muted-foreground mt-1">Prepared for {config.client}</p>
            )}
          </div>
          <TalkToUsCta />
        </div>
      </div>

      {/* Campaign summary */}
      <Card className="mb-5">
        <CardContent className="pt-5">
          <div className="font-mono-label text-[9.5px] text-primary mb-3">Campaign Overview</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <div>
              <div className="text-[10px] text-muted-foreground-2 font-mono uppercase tracking-wide mb-0.5">Type</div>
              <div className="text-[13px]">{ct.label}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground-2 font-mono uppercase tracking-wide mb-0.5">Objective</div>
              <div className="text-[13px]">{config.objective || "Lead Generation"}</div>
            </div>
            {config.channels.length > 0 && (
              <div className="sm:col-span-2">
                <div className="text-[10px] text-muted-foreground-2 font-mono uppercase tracking-wide mb-0.5">Channels</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {config.channels.map((ch) => (
                    <span key={ch} className="font-mono text-[9.5px] px-1.5 py-0.5 rounded-[2px] bg-muted border border-border">
                      {ch}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {config.goal && (
              <div className="sm:col-span-2">
                <div className="text-[10px] text-muted-foreground-2 font-mono uppercase tracking-wide mb-0.5">Goals</div>
                <div className="text-[13px]">{config.goal}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {sprintBreakdown && (
        <Card className="mb-5">
          <CardContent className="pt-5">
            <div className="font-mono-label text-[9.5px] text-primary mb-3">Timeline</div>
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
              <div>
                <div className="font-heading text-xl font-semibold">{config.weeks}</div>
                <div className="text-[11px] text-muted-foreground">weeks</div>
              </div>
              <div>
                <div className="font-heading text-xl font-semibold">{config.sprints}</div>
                <div className="text-[11px] text-muted-foreground">sprints</div>
              </div>
              <div>
                <div className="font-heading text-xl font-semibold">{sprintBreakdown.totalDays}</div>
                <div className="text-[11px] text-muted-foreground">elapsed days</div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {sprintBreakdown.sprints.map((sprint) => (
                <div key={sprint.n} className="flex items-center gap-2 text-[12px]">
                  <span className="font-mono text-[10px] text-muted-foreground w-14 shrink-0">
                    Sprint {sprint.n}
                  </span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/50 rounded-full"
                      style={{ width: `${Math.min(100, (sprint.days / (sprintBreakdown.totalDays || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground shrink-0">{sprint.days}d</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team / Pod roles (no rates shown) */}
      {uniqueRoles.length > 0 && (
        <Card className="mb-5">
          <CardContent className="pt-5">
            <div className="font-mono-label text-[9.5px] text-primary mb-3">Team Involved</div>
            <div className="flex flex-wrap gap-2">
              {uniqueRoles.map((role) => (
                <span key={role} className="font-mono text-[10.5px] px-2.5 py-1 rounded-[3px] bg-muted border border-border">
                  {role}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deliverables */}
      {deliverables.length > 0 && (
        <Card className="mb-5">
          <CardContent className="pt-5">
            <div className="font-mono-label text-[9.5px] text-primary mb-3">Deliverables</div>
            <ul className="flex flex-col gap-2">
              {deliverables.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-[12.5px]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-secondary shrink-0 mt-0.5" />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Expected Results */}
      <Card className="mb-5">
        <CardContent className="pt-5">
          <div className="font-mono-label text-[9.5px] text-primary mb-3">Expected Results</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {funnelSteps.map((step) => (
              <div key={step.label} className="rounded-[4px] bg-muted px-3 py-2.5 text-center">
                <div className="font-heading text-[18px] font-semibold">{step.value}</div>
                <div className="text-[10.5px] text-muted-foreground leading-snug mt-0.5">{step.label}</div>
              </div>
            ))}
          </div>
          {config.asp > 0 && (
            <p className="mt-3 text-[12px] text-muted-foreground">
              At an average deal size of {fmtMoney(config.asp)}{config.aspUnit === "per_month" ? "/mo" : config.aspUnit === "per_year" ? "/yr" : ""}, this campaign targets an estimated pipeline of{" "}
              <strong className="text-foreground">
                {fmtMoney(
                  Math.round(config.audienceSize * config.qualifiedPct / 100 * config.opportunityPct / 100 * config.closePct / 100) * config.asp
                )}
              </strong>.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="mb-5">
        <CardContent className="pt-5">
          <div className="font-mono-label text-[9.5px] text-primary mb-3">Investment</div>
          <table className="w-full text-[12.5px]">
            <tbody>
              <tr className="border-b border-border">
                <td className="py-1.5 text-muted-foreground">
                  Campaign fee ({config.priceMode === "hybrid" ? "fixed base" : "fixed"})
                </td>
                <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.totalPrice)}</td>
              </tr>
              {pricing.adSpend > 0 && (
                <tr className="border-b border-border">
                  <td className="py-1.5 text-muted-foreground">Ad spend (media budget)</td>
                  <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.adSpend)}</td>
                </tr>
              )}
              {pricing.vendorCostUsd > 0 && (
                <tr className="border-b border-border">
                  <td className="py-1.5 text-muted-foreground">Specialist / vendor costs</td>
                  <td className="py-1.5 text-right font-mono">{fmtMoney(pricing.vendorCostUsd)}</td>
                </tr>
              )}
              <tr>
                <td className="py-2 font-heading text-[15px] font-semibold">Total investment</td>
                <td className="py-2 text-right font-heading text-[17px] font-semibold text-primary">
                  {fmtMoney(pricing.grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
          {config.priceMode === "hybrid" && (
            <p className="mt-3 rounded-[3px] border border-primary/30 bg-primary/5 px-3 py-2 text-[12px] text-primary">
              A variable success component is billed on completion, based on {metricLabel} delivered above the agreed threshold.
            </p>
          )}
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="rounded-[6px] border border-secondary/30 bg-secondary/5 px-5 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="font-heading text-[15px] font-semibold mb-0.5">Ready to move forward?</div>
          <p className="text-[12.5px] text-muted-foreground">
            Let&apos;s schedule a call to finalise the brief and kick off your campaign.
          </p>
        </div>
        <TalkToUsCta />
      </div>

      <p className="mt-6 text-center text-[10.5px] text-muted-foreground-2">
        This proposal is generated by ClarityHQ · Confidential
      </p>
    </div>
  );
}
