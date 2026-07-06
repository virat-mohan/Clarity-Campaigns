"use client";

import { useState } from "react";
import { PodRow, rateForRole } from "@/lib/calc/staffing";
import { CampaignConfig, ExtraPodStep } from "@/lib/store/campaign-store";
import { VendorLine } from "@/lib/calc/pricing";
import { ROLE_LIBRARY } from "@/lib/data/role-library";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { fmtMoney } from "@/lib/utils";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

function SectionHead({ title, total }: { title: string; total: number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-paper-border">
      <span className="font-mono-label text-[9.5px] text-primary-hover">{title}</span>
      <span className="font-mono text-[11.5px] font-semibold text-paper-foreground">{fmtMoney(total)}</span>
    </div>
  );
}

export function CostSignoff({
  pod,
  suggestedPod,
  vendorLines,
  config,
  costsApproved,
  onTogglePodStep,
  onChangePodRow,
  onResetPodRow,
  onAddExtraStep,
  onUpdateExtraStep,
  onRemoveExtraStep,
  onApproveCosts,
}: {
  pod: PodRow[];
  suggestedPod: PodRow[];
  vendorLines: VendorLine[];
  config: CampaignConfig;
  costsApproved: boolean;
  onTogglePodStep: (stepNumber: number, excluded: boolean) => void;
  onChangePodRow: (stepNumber: number, override: { role: string; hours: number; rate: number }) => void;
  onResetPodRow: (stepNumber: number) => void;
  onAddExtraStep: () => void;
  onUpdateExtraStep: (extraId: string, partial: Partial<Omit<ExtraPodStep, "id">>) => void;
  onRemoveExtraStep: (extraId: string) => void;
  onApproveCosts: () => void;
}) {
  const [expandedStep, setExpandedStep] = useState<number | string | null>(null);

  const excluded = config.podExcluded ?? [];
  const extraSteps = config.podExtraSteps ?? [];

  // Template pod rows (not extra)
  const templateRows = pod.filter((r) => !r.extraId);
  const activeTemplateRows = templateRows.filter((r) => !excluded.includes(r.stepNumber));
  const activeExtraRows = pod.filter((r) => r.extraId);

  const podCost = activeTemplateRows.reduce((s, r) => s + r.hours * r.rate, 0)
    + activeExtraRows.reduce((s, r) => s + r.hours * r.rate, 0);
  const vendorCost = vendorLines.reduce((s, v) => s + (v.cost ?? 0), 0);
  const adSpend = config.adSpend ?? 0;
  const grandTotal = podCost + vendorCost + adSpend;

  function toggleExpand(key: number | string) {
    setExpandedStep((prev) => (prev === key ? null : key));
  }

  return (
    <div className="flex flex-col gap-4">
      {costsApproved && (
        <Card className="border-secondary/40 bg-secondary/5">
          <CardContent className="pt-3 pb-3 flex items-center gap-2 text-[12.5px] text-secondary">
            <CheckCircle2 className="h-4 w-4 flex-none" />
            Costs approved — this budget is locked into Pricing. Go back to change anything and re-approve.
          </CardContent>
        </Card>
      )}

      {/* Pod / Freelancer costs */}
      <Card className="bg-paper border-paper-border">
        <CardContent className="pt-5 pb-4">
          <SectionHead title="Freelancer pod" total={podCost} />

          <div className="mt-3 flex flex-col gap-1">
            {templateRows.map((row) => {
              const isExcluded = excluded.includes(row.stepNumber);
              const isExpanded = expandedStep === row.stepNumber;
              const std = suggestedPod.find((s) => s.stepNumber === row.stepNumber) ?? row;
              const roleOptions = ROLE_LIBRARY.some((r) => r.name === row.role)
                ? ROLE_LIBRARY
                : [{ name: row.role, dept: "Marketing" as const, level: "Shared", rate: row.rate }, ...ROLE_LIBRARY];

              return (
                <div key={row.stepNumber} className={`rounded-[4px] border border-paper-border transition-opacity ${isExcluded ? "opacity-40" : ""}`}>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <Switch
                      checked={!isExcluded}
                      onCheckedChange={(checked) => onTogglePodStep(row.stepNumber, !checked)}
                      className="flex-none"
                    />
                    <span className="grid h-4 w-4 flex-none place-items-center rounded-full bg-primary/20 font-mono text-[8px] text-primary">
                      {row.stepNumber}
                    </span>
                    <span className="flex-1 text-[12.5px] font-medium text-paper-foreground">{row.stepTitle}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {row.role} · {row.hours}h @ ${row.rate}/h
                    </span>
                    <span className="font-mono text-[12px] font-semibold text-paper-foreground w-20 text-right">
                      {isExcluded ? "—" : fmtMoney(row.hours * row.rate)}
                    </span>
                    {!isExcluded && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(row.stepNumber)}
                        className="text-muted-foreground hover:text-paper-foreground transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                  {isExpanded && !isExcluded && (
                    <div className="border-t border-paper-border px-3 pb-3 pt-2 flex flex-wrap items-end gap-3">
                      <div className="w-48">
                        <Label className="mb-0.5">Role</Label>
                        <select
                          className="w-full rounded-[4px] border border-input bg-[#f4efe6] px-2 py-1.5 text-[12px] text-paper-foreground"
                          value={row.role}
                          onChange={(e) => onChangePodRow(row.stepNumber, { role: e.target.value, hours: row.hours, rate: rateForRole(e.target.value) })}
                        >
                          {roleOptions.map((r) => <option key={r.name} value={r.name}>{r.name}</option>)}
                        </select>
                      </div>
                      <div className="w-20">
                        <Label className="mb-0.5">Hours</Label>
                        <Input
                          type="number"
                          value={row.hours}
                          onChange={(e) => onChangePodRow(row.stepNumber, { role: row.role, hours: Number(e.target.value) || 0, rate: row.rate })}
                        />
                      </div>
                      <div className="w-24">
                        <Label className="mb-0.5">Rate ($/hr)</Label>
                        <Input
                          type="number"
                          value={row.rate}
                          onChange={(e) => onChangePodRow(row.stepNumber, { role: row.role, hours: row.hours, rate: Number(e.target.value) || 0 })}
                        />
                      </div>
                      {(row.role !== std.role || row.hours !== std.hours || row.rate !== std.rate) && (
                        <Button variant="ghost" size="sm" onClick={() => onResetPodRow(row.stepNumber)}>
                          Reset
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Extra steps */}
            {extraSteps.map((extra) => {
              const isExpanded = expandedStep === extra.id;
              return (
                <div key={extra.id} className="rounded-[4px] border border-dashed border-paper-border">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <span className="font-mono text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">Custom</span>
                    <span className="flex-1 text-[12.5px] font-medium text-paper-foreground">
                      {extra.stepTitle || <span className="italic text-muted-foreground">Untitled</span>}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {extra.role} · {extra.hours}h @ ${extra.rate}/h
                    </span>
                    <span className="font-mono text-[12px] font-semibold text-paper-foreground w-20 text-right">
                      {fmtMoney(extra.hours * extra.rate)}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleExpand(extra.id)}
                      className="text-muted-foreground hover:text-paper-foreground transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveExtraStep(extra.id)}
                      className="text-[10.5px] font-mono text-muted-foreground hover:text-destructive transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-paper-border px-3 pb-3 pt-2 flex flex-wrap items-end gap-3">
                      <div className="flex-1 min-w-[140px]">
                        <Label className="mb-0.5">Title</Label>
                        <Input
                          value={extra.stepTitle}
                          onChange={(e) => onUpdateExtraStep(extra.id, { stepTitle: e.target.value })}
                        />
                      </div>
                      <div className="w-40">
                        <Label className="mb-0.5">Role</Label>
                        <Input
                          list="role-options-co"
                          value={extra.role}
                          onChange={(e) => onUpdateExtraStep(extra.id, { role: e.target.value })}
                        />
                        <datalist id="role-options-co">
                          {ROLE_LIBRARY.map((r) => <option key={r.name} value={r.name} />)}
                        </datalist>
                      </div>
                      <div className="w-20">
                        <Label className="mb-0.5">Hours</Label>
                        <Input
                          type="number"
                          value={extra.hours}
                          onChange={(e) => onUpdateExtraStep(extra.id, { hours: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="w-24">
                        <Label className="mb-0.5">Rate ($/hr)</Label>
                        <Input
                          type="number"
                          value={extra.rate}
                          onChange={(e) => onUpdateExtraStep(extra.id, { rate: Number(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button variant="outline" size="sm" className="mt-3" onClick={onAddExtraStep}>
            + Add step
          </Button>
        </CardContent>
      </Card>

      {/* Vendor / tool costs */}
      {vendorLines.length > 0 && (
        <Card className="bg-paper border-paper-border">
          <CardContent className="pt-5 pb-4">
            <SectionHead title="Vendors & tools" total={vendorCost} />
            <div className="mt-3 flex flex-col gap-1">
              {vendorLines.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-1 py-1.5 border-b border-dashed border-paper-border last:border-none text-[12.5px]">
                  <span className="text-paper-foreground">{v.name}</span>
                  <span className="font-mono font-semibold text-paper-foreground">{fmtMoney(v.cost ?? 0)}</span>
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10.5px] text-muted-foreground">
              Edit individual vendors in the Vendors &amp; Timeline step.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Ad spend */}
      {adSpend > 0 && (
        <Card className="bg-paper border-paper-border">
          <CardContent className="pt-5 pb-4">
            <SectionHead title="Ad spend" total={adSpend} />
            <p className="mt-2 text-[10.5px] text-muted-foreground">
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
              Approving locks this cost into the pricing calculation. You can still go back and change it.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
