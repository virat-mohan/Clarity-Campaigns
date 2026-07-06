"use client";

import { useState } from "react";
import { PodRow, rateForRole } from "@/lib/calc/staffing";
import { ExtraPodStep } from "@/lib/store/campaign-store";
import { ROLE_LIBRARY } from "@/lib/data/role-library";
import { useAdminStore } from "@/lib/store/admin-store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { fmtMoney } from "@/lib/utils";
import { RotateCcw, User, Trash2 } from "lucide-react";

const UNASSIGNED = "__unassigned__";
const OTHER = "__other__";
const CUSTOM_PREFIX = "__custom__:";

export function PodDisplay({
  pod,
  suggested,
  assignments,
  podExcluded,
  podExtraSteps,
  onChange,
  onReset,
  onAssign,
  onClearAssign,
  onRemoveTemplateStep,
  onAddExtraStep,
  onUpdateExtraStep,
  onRemoveExtraStep,
}: {
  pod: PodRow[];
  suggested: PodRow[];
  assignments: Record<number, string>;
  podExcluded?: number[];
  podExtraSteps?: ExtraPodStep[];
  onChange: (stepNumber: number, override: { role: string; hours: number; rate: number }) => void;
  onReset: (stepNumber: number) => void;
  onAssign: (stepNumber: number, freelancerId: string) => void;
  onClearAssign: (stepNumber: number) => void;
  onRemoveTemplateStep?: (stepNumber: number) => void;
  onAddExtraStep?: () => void;
  onUpdateExtraStep?: (extraId: string, partial: Partial<Omit<ExtraPodStep, "id">>) => void;
  onRemoveExtraStep?: (extraId: string) => void;
}) {
  const freelancers = useAdminStore((s) => s.freelancers);
  const [customNames, setCustomNames] = useState<Record<number, string>>({});
  const [fromStepSelections, setFromStepSelections] = useState<Record<string, string>>({});

  // Template rows only (no extraId) — extra rows rendered separately
  const templateRows = pod.filter((r) => !r.extraId);
  const totalHours = pod.reduce((s, r) => s + r.hours, 0);
  const totalCost = pod.reduce((s, r) => s + r.hours * r.rate, 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono-label text-[9.5px] text-muted-foreground">
          Freelancer pod — role, hours &amp; rate suggested from this campaign&apos;s process standards, editable per step
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {templateRows.map((row, i) => {
          const std = suggested[i] ?? row;
          const isOverridden = row.role !== std.role || row.hours !== std.hours || row.rate !== std.rate;
          const roleOptions = ROLE_LIBRARY.some((r) => r.name === row.role)
            ? ROLE_LIBRARY
            : [{ name: row.role, dept: "Marketing" as const, level: "Shared", rate: row.rate }, ...ROLE_LIBRARY];

          const assignedId = assignments[row.stepNumber];
          const isCustom = assignedId?.startsWith(CUSTOM_PREFIX);
          const customName = isCustom ? assignedId.slice(CUSTOM_PREFIX.length) : undefined;
          const assignedFreelancer = !isCustom ? freelancers.find((f) => f.id === assignedId) : undefined;
          const matching = freelancers.filter((f) => f.role === row.role);
          const others = freelancers.filter((f) => f.role !== row.role);
          const selectValue = isCustom ? OTHER : (assignedId ?? UNASSIGNED);

          return (
            <Card key={row.stepNumber} className="bg-paper border-paper-border">
              <CardContent className="pt-4 pb-4 text-paper-foreground">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary font-mono text-[9px] font-semibold text-primary-foreground">
                    {row.stepNumber}
                  </span>
                  <span className="font-heading text-[13px] font-semibold flex-1">{row.stepTitle}</span>
                  {(assignedFreelancer || customName) && (
                    <span className="flex items-center gap-1 font-mono text-[10.5px] text-secondary">
                      <User className="h-3 w-3" /> {assignedFreelancer ? assignedFreelancer.name : customName}
                    </span>
                  )}
                  {onRemoveTemplateStep && (
                    <button
                      type="button"
                      onClick={() => onRemoveTemplateStep(row.stepNumber)}
                      className="ml-auto text-[10.5px] font-mono text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove step from this campaign"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="ml-7 mb-2 flex flex-wrap items-end gap-3">
                  <div className="w-56">
                    <Label className="mb-0.5">Role</Label>
                    <Select
                      value={row.role}
                      onValueChange={(newRole) => onChange(row.stepNumber, { role: newRole, hours: row.hours, rate: rateForRole(newRole) })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((r) => (
                          <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <Label className="mb-0.5">Hours</Label>
                    <Input
                      type="number"
                      value={row.hours}
                      onChange={(e) => onChange(row.stepNumber, { role: row.role, hours: Number(e.target.value) || 0, rate: row.rate })}
                    />
                  </div>
                  <div className="w-24">
                    <Label className="mb-0.5">Rate ($/hr)</Label>
                    <Input
                      type="number"
                      value={row.rate}
                      onChange={(e) => onChange(row.stepNumber, { role: row.role, hours: row.hours, rate: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground pb-2">
                    = {fmtMoney(row.hours * row.rate)}
                  </div>
                </div>
                <div className="ml-7 mb-2 w-64">
                  <Label className="mb-0.5">Assigned freelancer</Label>
                  <Select
                    value={selectValue}
                    onValueChange={(v) => {
                      if (v === UNASSIGNED) {
                        onClearAssign(row.stepNumber);
                        setCustomNames((prev) => { const n = { ...prev }; delete n[row.stepNumber]; return n; });
                      } else if (v === OTHER) {
                        setCustomNames((prev) => ({ ...prev, [row.stepNumber]: customNames[row.stepNumber] ?? "" }));
                        onAssign(row.stepNumber, CUSTOM_PREFIX + (customNames[row.stepNumber] ?? ""));
                      } else {
                        setCustomNames((prev) => { const n = { ...prev }; delete n[row.stepNumber]; return n; });
                        onAssign(row.stepNumber, v);
                      }
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                      {matching.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.name} — {f.role}</SelectItem>
                      ))}
                      {others.map((f) => (
                        <SelectItem key={f.id} value={f.id}>{f.name} — {f.role}</SelectItem>
                      ))}
                      <SelectItem value={OTHER}>Other (enter name)…</SelectItem>
                    </SelectContent>
                  </Select>
                  {(selectValue === OTHER || isCustom) && (
                    <Input
                      className="mt-1.5"
                      placeholder="Name"
                      value={customNames[row.stepNumber] ?? customName ?? ""}
                      onChange={(e) => {
                        setCustomNames((prev) => ({ ...prev, [row.stepNumber]: e.target.value }));
                        onAssign(row.stepNumber, CUSTOM_PREFIX + e.target.value);
                      }}
                    />
                  )}
                </div>
                {isOverridden && (
                  <div className="ml-7 mb-2">
                    <Button variant="ghost" size="sm" onClick={() => onReset(row.stepNumber)}>
                      <RotateCcw className="h-3 w-3" /> Reset to suggested ({std.role} · {std.hours} hrs @ ${std.rate}/hr)
                    </Button>
                  </div>
                )}
                <div className="ml-7 rounded-[3px] border-l-2 border-primary bg-muted px-2.5 py-2 text-[12px] text-muted-foreground">
                  {row.out}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Extra steps added by user */}
        {(podExtraSteps ?? []).map((extra) => {
          const roleInLibrary = ROLE_LIBRARY.some((r) => r.name === extra.role);
          const isCustomRole = !!extra.role && !roleInLibrary;
          // If role isn't in the library, map it to __other__ so the raw string never renders in the trigger
          const roleSelectValue = !extra.role ? "__nolerole__" : roleInLibrary ? extra.role : "__other_role__";
          const selectedFromStep = fromStepSelections[extra.id] ?? "";

          return (
            <Card key={extra.id} className="bg-paper border-paper-border border-dashed">
              <CardContent className="pt-4 pb-4 text-paper-foreground">
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-mono text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded">Custom</span>
                  <span className="flex-1 font-heading text-[13px] font-semibold">
                    {extra.stepTitle || <span className="text-muted-foreground italic">Untitled step</span>}
                  </span>
                  {onRemoveExtraStep && (
                    <button
                      type="button"
                      onClick={() => onRemoveExtraStep(extra.id)}
                      className="text-[10.5px] font-mono text-muted-foreground hover:text-destructive transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Role picker — auto-fills rate from ROLE_LIBRARY; "Other" allows free text */}
                <div className="mb-3 flex flex-wrap items-end gap-3">
                  <div className="w-64">
                    <Label className="mb-0.5">Role</Label>
                    <Select
                      value={roleSelectValue}
                      onValueChange={(v) => {
                        if (v === "__nolerole__") {
                          onUpdateExtraStep?.(extra.id, { role: "" });
                        } else if (v === "__other_role__") {
                          if (!isCustomRole) onUpdateExtraStep?.(extra.id, { role: "" });
                        } else {
                          const lib = ROLE_LIBRARY.find((r) => r.name === v);
                          onUpdateExtraStep?.(extra.id, { role: v, ...(lib ? { rate: lib.rate } : {}) });
                        }
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select role…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__nolerole__">Select role…</SelectItem>
                        {ROLE_LIBRARY.map((r) => (
                          <SelectItem key={r.name} value={r.name}>
                            {r.name} — ${r.rate}/hr
                          </SelectItem>
                        ))}
                        <SelectItem value="__other_role__">Other (enter name)…</SelectItem>
                      </SelectContent>
                    </Select>
                    {(roleSelectValue === "__other_role__" || isCustomRole) && (
                      <Input
                        className="mt-1.5"
                        placeholder="Role name"
                        value={extra.role}
                        onChange={(e) => onUpdateExtraStep?.(extra.id, { role: e.target.value })}
                      />
                    )}
                  </div>
                  <div className="w-24">
                    <Label className="mb-0.5">Hours</Label>
                    <Input
                      type="number"
                      value={extra.hours}
                      onChange={(e) => onUpdateExtraStep?.(extra.id, { hours: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="w-24">
                    <Label className="mb-0.5">Rate ($/hr)</Label>
                    <Input
                      type="number"
                      value={extra.rate}
                      onChange={(e) => onUpdateExtraStep?.(extra.id, { rate: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground pb-2">
                    = {fmtMoney(extra.hours * extra.rate)}
                  </div>
                </div>

                {/* Optional: pick a process step to auto-fill title + deliverable + hours */}
                {templateRows.length > 0 && (
                  <div className="mb-3">
                    <Label className="mb-0.5">From process step (optional — auto-fills title &amp; deliverable)</Label>
                    <Select
                      value={selectedFromStep || "__none__"}
                      onValueChange={(v) => {
                        setFromStepSelections((prev) => ({ ...prev, [extra.id]: v }));
                        if (v && v !== "__none__") {
                          const row = templateRows.find((r) => String(r.stepNumber) === v);
                          if (row) {
                            onUpdateExtraStep?.(extra.id, { stepTitle: row.stepTitle, out: row.out, hours: row.hours });
                          }
                        }
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="None — enter manually" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None — enter manually</SelectItem>
                        {templateRows.map((r) => (
                          <SelectItem key={r.stepNumber} value={String(r.stepNumber)}>
                            {r.stepNumber}. {r.stepTitle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <Label className="mb-0.5">Step title</Label>
                    <Input
                      value={extra.stepTitle}
                      placeholder="e.g. Brand Strategy Workshop"
                      onChange={(e) => onUpdateExtraStep?.(extra.id, { stepTitle: e.target.value })}
                    />
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <Label className="mb-0.5">Deliverable note</Label>
                    <Input
                      value={extra.out}
                      placeholder="What this step produces"
                      onChange={(e) => onUpdateExtraStep?.(extra.id, { out: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add freelancer + totals */}
      <div className="mt-3 flex items-center justify-between">
        {onAddExtraStep ? (
          <Button variant="outline" size="sm" onClick={onAddExtraStep}>
            + Add freelancer to pod
          </Button>
        ) : <div />}
        <div className="flex items-center gap-4 text-[12px]">
          <span className="text-muted-foreground font-mono">{totalHours} hrs total</span>
          <span className="font-semibold text-paper-foreground font-mono">{fmtMoney(totalCost)} cost basis</span>
        </div>
      </div>
    </div>
  );
}
