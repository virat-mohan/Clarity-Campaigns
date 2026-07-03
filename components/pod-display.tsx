"use client";

import { PodRow, rateForRole } from "@/lib/calc/staffing";
import { ROLE_LIBRARY } from "@/lib/data/role-library";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { fmtMoney } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

export function PodDisplay({
  pod,
  suggested,
  onChange,
  onReset,
}: {
  pod: PodRow[];
  suggested: PodRow[];
  onChange: (stepNumber: number, override: { role: string; hours: number; rate: number }) => void;
  onReset: (stepNumber: number) => void;
}) {
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
          return (
            <Card key={row.stepNumber}>
              <CardContent className="pt-4 pb-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-primary font-mono text-[9px] font-semibold text-primary-foreground">
                    {row.stepNumber}
                  </span>
                  <span className="font-heading text-[13px] font-semibold">{row.stepTitle}</span>
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
                          <SelectItem key={r.name} value={r.name}>{r.name} — ${r.rate}/hr</SelectItem>
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
