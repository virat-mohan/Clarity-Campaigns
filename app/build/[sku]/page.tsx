"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { useCampaignStore, CampaignStatus, ExtraPodStep } from "@/lib/store/campaign-store";
import { useAdminStore } from "@/lib/store/admin-store";
import { buildAutoPod, applyPodOverrides } from "@/lib/calc/staffing";
import { buildSprintBreakdown } from "@/lib/calc/sprint";
import { computePricing, outcomeTargetFor } from "@/lib/calc/pricing";
import { buildBriefHtml, buildProposalHtml, downloadHtmlFile } from "@/lib/export/html-export";
import { StepIndicator } from "@/components/step-indicator";
import { BriefImport } from "@/components/brief-import";
import { BriefForm } from "@/components/brief-form";
import { PodDisplay } from "@/components/pod-display";
import { CostSignoff } from "@/components/cost-signoff";
import { VendorTogglePanel } from "@/components/vendor-toggle-panel";
import { Timeline } from "@/components/timeline";
import { ResultsProjection } from "@/components/results-projection";
import { PricingSummary, vendorLinesFor } from "@/components/pricing-summary";
import { CampaignStatusBadge } from "@/components/campaign-status-badge";
import { TalkToUsCta } from "@/components/talk-to-us-cta";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Download, CheckCircle2, Circle } from "lucide-react";

const SUB_STEPS = [
  { key: "brief", label: "Brief & Team" },
  { key: "vendors", label: "Vendors & Timeline" },
  { key: "costsignoff", label: "Cost Sign-off" },
  { key: "results", label: "Expected Results" },
  { key: "pricing", label: "Pricing" },
  { key: "reporting", label: "Reporting" },
];

const STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "proposal-sent", label: "Proposal Sent" },
  { value: "active", label: "Active" },
  { value: "reporting", label: "Reporting" },
  { value: "completed", label: "Completed" },
];

export default function BuildWizardPage() {
  const params = useParams<{ sku: string }>();
  const router = useRouter();
  // params.sku is now the campaign ID (folder kept as [sku] for Next.js routing)
  const campaignId = params.sku;

  const campaigns = useCampaignStore((s) => s.campaigns);
  const updateConfig = useCampaignStore((s) => s.updateConfig);
  const setVendorToggle = useCampaignStore((s) => s.setVendorToggle);
  const setPodOverride = useCampaignStore((s) => s.setPodOverride);
  const resetPodOverride = useCampaignStore((s) => s.resetPodOverride);
  const setPodAssignment = useCampaignStore((s) => s.setPodAssignment);
  const clearPodAssignment = useCampaignStore((s) => s.clearPodAssignment);
  const addCustomVendor = useCampaignStore((s) => s.addCustomVendor);
  const updateCustomVendor = useCampaignStore((s) => s.updateCustomVendor);
  const removeCustomVendor = useCampaignStore((s) => s.removeCustomVendor);
  const addInfluencer = useCampaignStore((s) => s.addInfluencer);
  const updateInfluencer = useCampaignStore((s) => s.updateInfluencer);
  const removeInfluencer = useCampaignStore((s) => s.removeInfluencer);
  const approveTimeline = useCampaignStore((s) => s.approveTimeline);
  const excludePodStep = useCampaignStore((s) => s.excludePodStep);
  const includePodStep = useCampaignStore((s) => s.includePodStep);
  const addPodExtraStep = useCampaignStore((s) => s.addPodExtraStep);
  const updatePodExtraStep = useCampaignStore((s) => s.updatePodExtraStep);
  const removePodExtraStep = useCampaignStore((s) => s.removePodExtraStep);
  const approveCosts = useCampaignStore((s) => s.approveCosts);
  const setStatus = useCampaignStore((s) => s.setStatus);
  const updateActuals = useCampaignStore((s) => s.updateActuals);

  const adminVendors = useAdminStore((s) => s.vendors);
  const adminPodTemplates = useAdminStore((s) => s.podTemplates);
  const adminPodTemplatesCO = useAdminStore((s) => s.podTemplatesCreativeOnly);
  const markupFixed = useAdminStore((s) => s.markupFixed);
  const markupHybrid = useAdminStore((s) => s.markupHybrid);

  const [stepIndex, setStepIndex] = useState(0);
  const prefilledRef = useRef(false);

  const campaign = campaigns.find((c) => c.id === campaignId);
  const config = campaign?.config ?? null;
  const sku = campaign?.sku ?? null;
  const ct = sku ? CAMPAIGN_TYPES[sku] : null;
  const templateSteps = sku
    ? (config?.creativesOnly ? adminPodTemplatesCO[sku] : adminPodTemplates[sku])
    : undefined;

  const brand = useCampaignStore((s) => s.brand);
  useEffect(() => {
    if (!prefilledRef.current && brand?.processed && config && !config.icp) {
      prefilledRef.current = true;
      updateConfig(campaignId, { icp: brand.icpSnippet });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand]);

  const suggestedPod = useMemo(
    () =>
      ct && sku
        ? buildAutoPod(
            sku,
            config?.audienceSize ?? 0,
            templateSteps,
            ct.mode === "sales",
            config?.creativesOnly ?? false,
          )
        : [],
    [ct, sku, config?.audienceSize, config?.creativesOnly, templateSteps]
  );

  // suggestedPodFiltered: exclude steps the user has removed
  const suggestedPodFiltered = useMemo(
    () => suggestedPod.filter((r) => !(config?.podExcluded ?? []).includes(r.stepNumber)),
    [suggestedPod, config?.podExcluded]
  );

  // Extra rows from user-added steps
  const extraPodRows = useMemo(
    () =>
      (config?.podExtraSteps ?? []).map((e, i): import("@/lib/calc/staffing").PodRow => ({
        stepNumber: 1000 + i,
        stepTitle: e.stepTitle,
        role: e.role,
        hours: e.hours,
        rate: e.rate,
        out: e.out,
        extraId: e.id,
      })),
    [config?.podExtraSteps]
  );

  const pod = useMemo(
    () => [...applyPodOverrides(suggestedPodFiltered, config?.podOverrides ?? {}), ...extraPodRows],
    [suggestedPodFiltered, config?.podOverrides, extraPodRows]
  );
  const sprintBreakdown = useMemo(
    () =>
      ct && sku
        ? buildSprintBreakdown(sku, config?.sprints ?? 1, templateSteps, config?.weeks || undefined)
        : null,
    [ct, sku, config?.sprints, templateSteps, config?.weeks]
  );

  const vendorLines = useMemo(
    () => (config ? vendorLinesFor(config.vendorToggles, config.customVendors, adminVendors, config.influencers) : []),
    [config, adminVendors]
  );
  const pricing = useMemo(() => {
    if (!ct || !config || !sku) return null;
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
  }, [ct, sku, config, pod, vendorLines, markupFixed, markupHybrid]);

  if (!ct || !config || !sku || !campaign) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Campaign not found.</p>
        <Button className="mt-4" onClick={() => router.push("/campaigns")}>Back to campaigns</Button>
      </div>
    );
  }

  const cfg = config;
  const assetTypes = cfg.assets.map((a) => a.type);
  const fileSlug = (cfg.name || sku).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  function goNext() { setStepIndex((i) => Math.min(i + 1, SUB_STEPS.length - 1)); }
  function goBack() { setStepIndex((i) => Math.max(i - 1, 0)); }

  function handleExportBrief() {
    const html = buildBriefHtml(ct!, cfg, pod, sprintBreakdown, vendorLines);
    downloadHtmlFile(`${fileSlug}-brief.html`, html);
  }
  function handleExportProposal() {
    if (!pricing) return;
    const html = buildProposalHtml(ct!, cfg, pod, sprintBreakdown, pricing, vendorLines);
    downloadHtmlFile(`${fileSlug}-proposal.html`, html);
  }

  // Completion checklist items
  const checks = [
    { label: "Campaign name", ok: cfg.name.trim().length > 0 },
    { label: "Client name", ok: cfg.client.trim().length > 0 },
    { label: "ICP defined", ok: cfg.icp.trim().length > 0 },
    { label: "At least one asset added", ok: cfg.assets.length > 0 },
    { label: "Timeline approved", ok: cfg.timelineApproved },
    { label: "Costs signed off", ok: cfg.costsApproved ?? false },
    ...(cfg.priceMode === "hybrid" ? [{ label: "Outcome rate set", ok: cfg.outcomeRate > 0 }] : []),
  ];
  const allChecked = checks.every((c) => c.ok);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 border-b border-border pb-4">
        <div className="mb-2 flex items-start justify-between gap-4">
          <div>
            <div className="font-mono-label text-[10px] text-primary mb-1">Building — {ct.label}</div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="font-heading text-2xl font-semibold">{cfg.name || "Untitled campaign"}</h1>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            <p className="text-[13px] text-muted-foreground mt-1">{ct.desc}</p>
          </div>
          <div className="flex flex-none flex-col gap-1.5 sm:flex-row">
            <Button variant="outline" size="sm" onClick={handleExportBrief}>
              <Download className="h-3.5 w-3.5" /> Brief
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportProposal} disabled={!pricing}>
              <Download className="h-3.5 w-3.5" /> Proposal
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push(`/proposal/${campaignId}`)}>
              Client view
            </Button>
          </div>
        </div>
      </div>

      <StepIndicator steps={SUB_STEPS} activeIndex={stepIndex} onStepClick={(i) => setStepIndex(i)} />

      <div className="mb-8">
        {stepIndex === 0 && (
          <div className="flex flex-col gap-3">
            <BriefImport sku={sku} onFill={(p) => updateConfig(campaignId, p)} />
            <BriefForm ct={ct} config={cfg} onChange={(p) => updateConfig(campaignId, p)} />
            <PodDisplay
              pod={pod}
              suggested={suggestedPodFiltered}
              assignments={cfg.podAssignments}
              podExcluded={cfg.podExcluded ?? []}
              podExtraSteps={cfg.podExtraSteps ?? []}
              onChange={(stepNumber, override) => setPodOverride(campaignId, stepNumber, override)}
              onReset={(stepNumber) => resetPodOverride(campaignId, stepNumber)}
              onAssign={(stepNumber, freelancerId) => setPodAssignment(campaignId, stepNumber, freelancerId)}
              onClearAssign={(stepNumber) => clearPodAssignment(campaignId, stepNumber)}
              onRemoveTemplateStep={(stepNumber) => excludePodStep(campaignId, stepNumber)}
              onAddExtraStep={() => addPodExtraStep(campaignId)}
              onUpdateExtraStep={(extraId, partial) => updatePodExtraStep(campaignId, extraId, partial)}
              onRemoveExtraStep={(extraId) => removePodExtraStep(campaignId, extraId)}
            />
          </div>
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
                      value={cfg.weeks}
                      onChange={(e) => updateConfig(campaignId, { weeks: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Sprints</Label>
                    <Input
                      type="number"
                      value={cfg.sprints}
                      onChange={(e) => updateConfig(campaignId, { sprints: Number(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            <VendorTogglePanel
              sku={sku}
              assetTypes={assetTypes}
              vendorToggles={cfg.vendorToggles}
              onToggle={(id, state) => setVendorToggle(campaignId, id, state)}
              customVendors={cfg.customVendors}
              onAddCustomVendor={() => addCustomVendor(campaignId)}
              onUpdateCustomVendor={(id, partial) => updateCustomVendor(campaignId, id, partial)}
              onRemoveCustomVendor={(id) => removeCustomVendor(campaignId, id)}
              influencers={cfg.influencers ?? []}
              onAddInfluencer={() => addInfluencer(campaignId)}
              onUpdateInfluencer={(influencerId, partial) => updateInfluencer(campaignId, influencerId, partial)}
              onRemoveInfluencer={(influencerId) => removeInfluencer(campaignId, influencerId)}
            />
            {sprintBreakdown && (
              <div>
                <div className="font-mono-label text-[9.5px] text-primary-hover mb-3">Timeline</div>
                <Timeline
                  breakdown={sprintBreakdown}
                  approved={cfg.timelineApproved}
                  onApprove={() => approveTimeline(campaignId)}
                />
              </div>
            )}
          </div>
        )}

        {stepIndex === 2 && (
          <CostSignoff
            pod={pod}
            vendorLines={vendorLines}
            techCostTotal={pricing?.techCost ?? 0}
            config={cfg}
            costsApproved={cfg.costsApproved ?? false}
            onApproveCosts={() => { approveCosts(campaignId); goNext(); }}
          />
        )}

        {stepIndex === 3 && (
          <ResultsProjection sku={sku} config={cfg} onChange={(p) => updateConfig(campaignId, p)} />
        )}

        {stepIndex === 4 && (
          <div className="flex flex-col gap-4">
            {!cfg.timelineApproved && (
              <Card className="border-destructive/40">
                <CardContent className="pt-4 text-[12.5px] text-destructive">
                  Timeline has not been approved yet. Go back to Vendors &amp; Timeline and approve it before finalizing pricing.
                </CardContent>
              </Card>
            )}
            {!cfg.costsApproved && (
              <Card className="border-amber-400/40 bg-amber-50/40">
                <CardContent className="pt-4 text-[12.5px] text-amber-800">
                  Costs have not been signed off yet. Go back to Cost Sign-off and approve the budget first.
                </CardContent>
              </Card>
            )}
            <PricingSummary sku={sku} config={cfg} pod={pod} onChange={(p) => updateConfig(campaignId, p)} />

            {/* Completion checklist */}
            <Card className="bg-paper border-paper-border">
              <CardContent className="pt-4 pb-3">
                <div className="font-mono-label text-[9px] text-muted-foreground mb-3">Before you proceed — checklist</div>
                <div className="flex flex-col gap-1.5">
                  {checks.map((c) => (
                    <div key={c.label} className="flex items-center gap-2 text-[12.5px]">
                      {c.ok
                        ? <CheckCircle2 className="h-3.5 w-3.5 flex-none text-secondary" />
                        : <Circle className="h-3.5 w-3.5 flex-none text-muted-foreground-2" />}
                      <span className={c.ok ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                    </div>
                  ))}
                </div>
                {!allChecked && (
                  <p className="mt-3 text-[11px] text-muted-foreground-2">
                    Complete the items above for a complete proposal and smooth checkout.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {stepIndex === 5 && (
          <div className="flex flex-col gap-4">
            <Card className="bg-paper border-paper-border">
              <CardContent className="pt-5">
                <div className="font-mono-label text-[9.5px] text-primary-hover mb-3">Campaign status</div>
                <div className="w-56">
                  <Select value={campaign.status} onValueChange={(v) => setStatus(campaignId, v as CampaignStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5">
                <div className="font-mono-label text-[9.5px] text-primary-hover mb-3">Actual results vs projection</div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                  {[
                    { key: "meetings", label: "Meetings booked" },
                    { key: "leads", label: "Leads generated" },
                    { key: "deals", label: "Deals closed" },
                    { key: "revenue", label: "Revenue attributed ($)" },
                    { key: "roas", label: "ROAS" },
                    { key: "cpl", label: "Cost per lead ($)" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <Label>{label}</Label>
                      <Input
                        type="number"
                        placeholder="—"
                        value={(campaign.actuals as Record<string, number | undefined>)?.[key] ?? ""}
                        onChange={(e) =>
                          updateActuals(campaignId, {
                            [key]: e.target.value === "" ? undefined : Number(e.target.value),
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <Label>Notes / learnings</Label>
                  <Input
                    placeholder="What worked, what didn't, what to change next time…"
                    value={campaign.actuals?.notes ?? ""}
                    onChange={(e) => updateActuals(campaignId, { notes: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-5">
        <Button variant="outline" onClick={goBack} disabled={stepIndex === 0}>Back</Button>
        <TalkToUsCta variant="inline" />
        {stepIndex < SUB_STEPS.length - 1 ? (
          stepIndex === 2 ? (
            // Cost sign-off step — Next button hidden; the "Approve costs" button advances
            null
          ) : stepIndex === 4 ? (
            <Button
              disabled={!cfg.timelineApproved || !cfg.costsApproved}
              onClick={() => router.push(`/checkout?id=${campaignId}`)}
            >
              Proceed to checkout
            </Button>
          ) : (
            <Button onClick={goNext}>Next</Button>
          )
        ) : (
          <Button variant="outline" onClick={() => router.push("/campaigns")}>
            Back to campaigns
          </Button>
        )}
      </div>
    </div>
  );
}
