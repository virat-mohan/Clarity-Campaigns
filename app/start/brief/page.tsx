"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { CAMPAIGN_FLOW_COPY, SLUG_TO_SKU } from "@/lib/data/campaign-flow-copy";
import { CAMPAIGN_SPECIFIC_FIELDS, MARKET_OPTIONS, PRIMARY_GOAL_OPTIONS } from "@/lib/data/campaign-brief-fields";
import { INDUSTRY_LIST } from "@/lib/data/industry-benchmarks";
import { useStartFlowStore, type BriefPreset } from "@/lib/store/start-flow-store";
import { BriefSection } from "@/components/start/brief-section";
import { DynamicField } from "@/components/start/dynamic-field";
import { PillSelect } from "@/components/start/pill-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PRESET_OPTIONS: { value: BriefPreset; label: string }[] = [
  { value: "standard", label: "Standard — $499" },
  { value: "growth", label: "Growth — $499 + ad spend" },
  { value: "custom", label: "Custom" },
];

function BriefPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");
  const sku = typeParam ? SLUG_TO_SKU[typeParam] : undefined;

  const selectedSku = useStartFlowStore((s) => s.selectedSku);
  const preset = useStartFlowStore((s) => s.preset);
  const brandBasics = useStartFlowStore((s) => s.brandBasics);
  const targetCustomer = useStartFlowStore((s) => s.targetCustomer);
  const campaignSpecific = useStartFlowStore((s) => s.campaignSpecific);
  const budget = useStartFlowStore((s) => s.budget);
  const primaryGoal = useStartFlowStore((s) => s.primaryGoal);
  const setSelectedSku = useStartFlowStore((s) => s.setSelectedSku);
  const setPreset = useStartFlowStore((s) => s.setPreset);
  const updateBrandBasics = useStartFlowStore((s) => s.updateBrandBasics);
  const updateTargetCustomer = useStartFlowStore((s) => s.updateTargetCustomer);
  const setCampaignSpecificField = useStartFlowStore((s) => s.setCampaignSpecificField);
  const updateBudget = useStartFlowStore((s) => s.updateBudget);
  const setPrimaryGoal = useStartFlowStore((s) => s.setPrimaryGoal);
  const markBriefSubmitted = useStartFlowStore((s) => s.markBriefSubmitted);

  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!sku) {
      router.replace("/start");
      return;
    }
    if (selectedSku !== sku) {
      setSelectedSku(sku);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku]);

  const ct = sku ? CAMPAIGN_TYPES[sku] : null;
  const copy = sku ? CAMPAIGN_FLOW_COPY[sku] : null;
  const specificFields = useMemo(() => (sku ? CAMPAIGN_SPECIFIC_FIELDS[sku] : []), [sku]);

  if (!sku || !ct || !copy) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-[13px] text-muted-foreground">
        Redirecting…
      </div>
    );
  }

  const missingRequired = [
    !brandBasics.brandName.trim() && "Brand name",
    !brandBasics.country && "Country",
    !brandBasics.industry && "Industry",
  ].filter(Boolean) as string[];

  function handleBuildPlan() {
    if (missingRequired.length > 0) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    markBriefSubmitted();
    router.push(`/start/plan?type=${typeParam}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-28">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label text-[10px] text-primary mb-1">Campaign brief — 5 minute intake</div>
        <h1 className="font-heading text-2xl font-semibold">{ct.label}</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{copy.description}</p>
      </div>

      <div className="mb-6">
        <Label>Preset</Label>
        <PillSelect options={PRESET_OPTIONS} value={preset} onChange={(v) => setPreset(v as BriefPreset)} />
        {preset === "growth" && (
          <p className="mt-2 text-[11px] text-muted-foreground-2">
            Growth pairs the $499 campaign fee with a media budget you set in Section 4 below.
          </p>
        )}
        {preset === "custom" && (
          <p className="mt-2 text-[11px] text-muted-foreground-2">
            We&apos;ll tailor scope to your needs — add specifics in the fields below and we&apos;ll follow up.
          </p>
        )}
      </div>

      {showErrors && missingRequired.length > 0 && (
        <Card className="mb-4 border-destructive/40">
          <CardContent className="pt-4 text-[12.5px] text-destructive">
            Please fill in: {missingRequired.join(", ")} before continuing.
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        <BriefSection title="Brand basics">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Brand name <span className="text-destructive">*</span></Label>
              <Input value={brandBasics.brandName} onChange={(e) => updateBrandBasics({ brandName: e.target.value })} />
            </div>
            <div>
              <Label>Website</Label>
              <Input placeholder="https://" value={brandBasics.website} onChange={(e) => updateBrandBasics({ website: e.target.value })} />
            </div>
            <div>
              <Label>Country / market <span className="text-destructive">*</span></Label>
              <Select value={brandBasics.country || undefined} onValueChange={(v) => updateBrandBasics({ country: v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {MARKET_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Industry <span className="text-destructive">*</span></Label>
              <Select value={brandBasics.industry || undefined} onValueChange={(v) => updateBrandBasics({ industry: v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {INDUSTRY_LIST.map((i) => (
                    <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3">
            <Label>What does the brand do?</Label>
            <Textarea
              placeholder="A couple sentences is enough"
              value={brandBasics.whatBrandDoes}
              onChange={(e) => updateBrandBasics({ whatBrandDoes: e.target.value })}
            />
          </div>
        </BriefSection>

        <BriefSection title="Target customer">
          <div className="flex flex-col gap-3">
            <div>
              <Label>ICP description</Label>
              <Textarea
                placeholder="Who are we trying to reach?"
                value={targetCustomer.icpDescription}
                onChange={(e) => updateTargetCustomer({ icpDescription: e.target.value })}
              />
            </div>
            <div>
              <Label>Problem solved</Label>
              <Textarea
                placeholder="What problem does this solve for them?"
                value={targetCustomer.problemSolved}
                onChange={(e) => updateTargetCustomer({ problemSolved: e.target.value })}
              />
            </div>
            <div>
              <Label>Competitors</Label>
              <Input
                placeholder="Who else are they considering?"
                value={targetCustomer.competitors}
                onChange={(e) => updateTargetCustomer({ competitors: e.target.value })}
              />
            </div>
          </div>
        </BriefSection>

        <BriefSection title={`${ct.label} — campaign specifics`}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {specificFields.map((field) => (
              <DynamicField
                key={field.id}
                field={field}
                value={campaignSpecific[field.id] ?? ""}
                onChange={(value) => setCampaignSpecificField(field.id, value)}
              />
            ))}
          </div>
        </BriefSection>

        <BriefSection title="Budget" helper="Optional ad spend / media budget — separate from the $499 campaign fee.">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Ad spend / media budget ($)</Label>
              <Input
                type="number"
                value={budget.adSpendBudget}
                onChange={(e) => updateBudget({ adSpendBudget: e.target.value })}
              />
            </div>
            <div>
              <Label>Cadence</Label>
              <Select value={budget.cadence} onValueChange={(v) => updateBudget({ cadence: v as "monthly" | "onetime" })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="onetime">One-time / sprint total</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </BriefSection>

        <BriefSection title="Primary goal">
          <PillSelect options={PRIMARY_GOAL_OPTIONS} value={primaryGoal} onChange={setPrimaryGoal} />
        </BriefSection>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/start">
            <Button variant="outline">Back</Button>
          </Link>
          <div className="text-center">
            <div className="text-[12.5px] font-semibold text-foreground">{ct.label}</div>
            <div className="font-mono text-[10px] text-muted-foreground-2">${copy.price} · {copy.durationLabel}</div>
          </div>
          <Button onClick={handleBuildPlan}>Build my plan →</Button>
        </div>
      </div>
    </div>
  );
}

export default function BriefPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-[13px]">Loading…</div>}>
      <BriefPageContent />
    </Suspense>
  );
}
