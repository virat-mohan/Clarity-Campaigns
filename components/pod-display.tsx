"use client";

import { useState } from "react";
import { PodRow, rateForRole } from "@/lib/calc/staffing";
import { ROLE_LIBRARY } from "@/lib/data/role-library";
import { useAdminStore } from "@/lib/store/admin-store";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { fmtMoney } from "@/lib/utils";
import { RotateCcw, User } from "lucide-react";

const UNASSIGNED = "__unassigned__";
const OTHER = "__other__";
const CUSTOM_PREFIX = "__custom__:";

export function PodDisplay({
  pod,
  suggested,
  assignments,
  onChange,
  onReset,
  onAssign,
  onClearAssign,
}: {
  pod: PodRow[];
  suggested: PodRow[];
  assignments: Record<number, string>;
  onChange: (stepNumber: number, override: { role: string; hours: number; rate: number }) => void;
  onReset: (stepNumber: number) => void;
  onAssign: (stepNumber: number, freelancerId: string) => void;
  onClearAssign: (stepNumber: number) => void;
}) {
  const freelancers = useAdminStore((s) => s.freelancers);
  const [customNames, setCustomNames] = useState<Record<number, string>>({});
  const totalHours = pod.reduce((s, r) => s + r.hours, 0);
  const totalCost = pod.reduce((s, r) => s + r.hours * r.rate, 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-mono-label text-[9.5px] text-muted-foreground">
          Freelancer pod — role, hours &amp; rate suggested from this campaign&apos;s process standards, editable per step
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">
          {totalHours} hrs · {fmtMoney(totalCost)} cost basis
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {pod.map((row, i) => {
          const std = suggested[i];
          const isOverridden = row.role !== std.role || row.hours !== std.hours || row.rate !== std.rate;
          // A step's suggested role may be a shared-pool label (e.g. "Creative Pod")
          // that isn't an exact ROLE_LIBRARY entry — include it so the select always
          // has a matching option instead of rendering blank.
          const roleOptions = ROLE_LIBRARY.some((r) => r.name === row.role)
            ? ROLE_LIBRARY
            : [{ name: row.role, dept: "Marketing" as const, level: "Shared", rate: row.rate }, ...ROLE_LIBRARY];

          const assignedId = assignments[row.stepNumber];
          const isCustom = assignedId?.startsWith(CUSTOM_PREFIX);
          const customName = isCustom ? assignedId.slice(CUSTOM_PREFIX.length) : undefined;
          const assignedFreelancer = !isCustom ? freelancers.find((f) => f.id === assignedId) : undefined;
          const matching = freelancers.filter((f) => f.role === row.role);
          const others = freelancers.filter((f) => f.role !== row.role);

          // The select value: custom assignments show as OTHER sentinel
          const selectValue = isCustom ? OTHER : (assignedId ?? UNASSIGNED);

          return (
            <Card key={row.stepNumber} className="bg-paper border-paper-border">
              <CardContent className="pt-4 pb-4 text-paper-foreground">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary font-mono text-[9px] font-semibold text-primary-foreground">
                    {row.stepNumber}
                  </span>
                  <span className="font-heading text-[13px] font-semibold">{row.stepTitle}</span>
                  {(assignedFreelancer || customName) && (
                    <span className="flex items-center gap-1 font-mono text-[10.5px] text-secondary">
                      <User className="h-3 w-3" /> {assignedFreelancer ? assignedFreelancer.name : customName}
                    </span>
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
      </div>
    </div>
  );
}
