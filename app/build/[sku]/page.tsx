"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CAMPAIGN_TYPES, SkuId } from "@/lib/data/campaign-types";
import { useCampaignStore } from "@/lib/store/campaign-store";
import { useAdminStore } from "@/lib/store/admin-store";
import { buildAutoPod, applyPodOverrides } from "@/lib/calc/staffing";
import { buildSprintBreakdown } from "@/lib/calc/sprint";
import { computePricing, outcomeTargetFor } from "@/lib/calc/pricing";
import { buildBriefHtml, buildProposalHtml, downloadHtmlFile } from "@/lib/export/html-export";
import { StepIndicator } from "@/components/step-indicator";
import { BriefForm } from "@/components/brief-form";
import { PodDisplay } from "@/components/pod-display";
import { VendorTogglePanel } from "@/components/vendor-toggle-panel";
import { Timeline } from "@/components/timeline";
import { ResultsProjection } from "@/components/results-projection";
import { PricingSummary, vendorLinesFor } from "@/components/pricing-summary";
import { TalkToUsCta } from "@/components/talk-to-us-cta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";

const SUB_STEPS = [
  { key: "brief", label: "Brief" },
  { key: "pod", label: "Pod & Vendor" },
  { key: "timeline", label: "Timeline" },
  { key: "results", label: "Expected Results" },
  { key: "pricing", label: "Pricing" },
];

export default function BuildWizardPage() {
  const params = useParams<{ sku: string }>();
  const router = useRouter();
  const sku = params.sku as SkuId;
  const ct = CAMPAIGN_TYPES[sku];

  const brand = useCampaignStore((s) => s.brand);
  const config = useCampaignStore((s) => (ct ? s.getConfig(sku) : null));
  const updateConfig = useCampaignStore((s) => s.updateConfig);
  const setVendorToggle = useCampaignStore((s) => s.setVendorToggle);
  const setPodOverride = useCampaignStore((s) => s.setPodOverride);
  const resetPodOverride = useCampaignStore((s) => s.resetPodOverride);
  const setPodAssignment = useCampaignStore((s) => s.setPodAssignment);
  const clearPodAssignment = useCampaignStore((s) => s.clearPodAssignment);
  const addCustomVendor = useCampaignStore((s) => s.addCustomVendor);
  const updateCustomVendor = useCampaignStore((s) => s.updateCustomVendor);
  const removeCustomVendor = useCampaignStore((s) => s.removeCustomVendor);
  const approveTimeline = useCampaignStore((s) => s.approveTimeline);
  const adminVendors = useAdminStore((s) => s.vendors);

  const [stepIndex, setStepIndex] = useState(0);
  const prefilledRef = useRef(false);

  useEffect(() => {
    if (!prefilledRef.current && brand?.processed && config && !config.icp) {
      prefilledRef.current = true;
      updateConfig(sku, { icp: brand.icpSnippet });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand]);

  const suggestedPod = useMemo(
    () => (ct ? buildAutoPod(sku, config?.audienceSize ?? 0) : []),
    [ct, sku, config?.audienceSize]
  );
  const pod = useMemo(
    () => applyPodOverrides(suggestedPod, config?.podOverrides ?? {}),
    [suggestedPod, config?.podOverrides]
  );
  const sprintBreakdown = useMemo(
    () => (ct ? buildSprintBreakdown(sku, config?.sprints ?? 1) : null),
    [ct, sku, config?.sprints]
  );

  const vendorLines = useMemo(
    () => (config ? vendorLinesFor(config.vendorToggles, config.customVendors, adminVendors) : []),
    [config, adminVendors]
  );
  const pricing = useMemo(() => {
    if (!ct || !config) return null;
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
    });
  }, [ct, sku, config, pod, vendorLines]);

  if (!ct || !config) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Unknown campaign type.</p>
        <Button className="mt-4" onClick={() => router.push("/")}>Back to marketplace</Button>
      </div>
    );
  }

  const cfg = config;
  const assetTypes = cfg.assets.map((a) => a.type);
  const fileSlug = (cfg.name || sku).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, SUB_STEPS.length - 1));
  }
  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function handleExportBrief() {
    const html = buildBriefHtml(ct, cfg, pod, sprintBreakdown, vendorLines);
    downloadHtmlFile(`${fileSlug}-brief.html`, html);
  }
  function handleExportProposal() {
    if (!pricing) return;
    const html = buildProposalHtml(ct, cfg, pod, sprintBreakdown, pricing, vendorLines);
    downloadHtmlFile(`${fileSlug}-proposal.html`, html);
  }
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 border-b border-border pb-4">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <div className="font-mono-label text-[10px] text-primary mb-1">Building — {ct.label}</div>
            <h1 className="font-heading text-2xl font-semibold">{config.name || "Untitled campaign"}</h1>
            <p className="text-[13px] text-muted-foreground mt-1">{ct.desc}</p>
          </div>
          <div className="flex flex-none flex-col gap-1.5 sm:flex-row">
            <Button variant="outline" size="sm" onClick={handleExportBrief}>
              <Download className="h-3.5 w-3.5" /> Export Brief (HTML)
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportProposal} disabled={!pricing}>
              <Download className="h-3.5 w-3.5" /> Export Proposal (HTML)
            </Button>
          </div>
        </div>
      </div>

      <StepIndicator steps={SUB_STEPS} activeIndex={stepIndex} />

      <div className="mb-8">
        {stepIndex === 0 && (
          <BriefForm ct={ct} config={config} onChange={(p) => updateConfig(sku, p)} />
        )}

        {stepIndex === 1 && (
          <div className="flex flex-col gap-6">
            <Card className="bg-paper border-paper-border text-paper-foreground">
              <CardContent className="pt-5">
                <div className="font-mono-label text-[9.5px] text-primary-hover mb-3">Delivery Timing</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Weeks</Label>
                    <Input
                      type="number"
                      value={config.weeks}
                      onChange={(e) => updateConfig(sku, { weeks: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Sprints</Label>
                    <Input
                      type="number"
                      value={config.sprints}
                      onChange={(e) => updateConfig(sku, { sprints: Number(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <p className="mt-2 text-[11px] text-[#6a7280]">
                  Sprints group the process steps below into the Timeline step&apos;s sprint blocks.
                </p>
              </CardContent>
            </Card>
            <PodDisplay
              pod={pod}
              suggested={suggestedPod}
              assignments={cfg.podAssignments}
              onChange={(stepNumber, override) => setPodOverride(sku, stepNumber, override)}
              onReset={(stepNumber) => resetPodOverride(sku, stepNumber)}
              onAssign={(stepNumber, freelancerId) => setPodAssignment(sku, stepNumber, freelancerId)}
              onClearAssign={(stepNumber) => clearPodAssignment(sku, stepNumber)}
            />
            <VendorTogglePanel
              sku={sku}
              assetTypes={assetTypes}
              vendorToggles={config.vendorToggles}
              onToggle={(id, state) => setVendorToggle(sku, id, state)}
              customVendors={config.customVendors}
              onAddCustomVendor={() => addCustomVendor(sku)}
              onUpdateCustomVendor={(id, partial) => updateCustomVendor(sku, id, partial)}
              onRemoveCustomVendor={(id) => removeCustomVendor(sku, id)}
            />
          </div>
        )}

        {stepIndex === 2 && sprintBreakdown && (
          <Timeline
            breakdown={sprintBreakdown}
            approved={config.timelineApproved}
            onApprove={() => approveTimeline(sku)}
          />
        )}

        {stepIndex === 3 && (
          <ResultsProjection sku={sku} config={config} onChange={(p) => updateConfig(sku, p)} />
        )}

        {stepIndex === 4 && (
          <>
            {!config.timelineApproved && (
              <Card className="mb-4 border-destructive/40">
                <CardContent className="pt-4 text-[12.5px] text-destructive">
                  Timeline has not been approved yet. Go back and approve it before finalizing pricing.
                </CardContent>
              </Card>
            )}
            <PricingSummary sku={sku} config={config} pod={pod} onChange={(p) => updateConfig(sku, p)} />
          </>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-5">
        <Button variant="outline" onClick={goBack} disabled={stepIndex === 0}>
          Back
        </Button>
        <TalkToUsCta variant="inline" />
        {stepIndex < SUB_STEPS.length - 1 ? (
          <Button onClick={goNext}>Next</Button>
        ) : (
          <Button
            variant="secondary"
            disabled={!config.timelineApproved}
            onClick={() => router.push(`/checkout?sku=${sku}`)}
          >
            Proceed to checkout
          </Button>
        )}
      </div>
    </div>
  );
}
