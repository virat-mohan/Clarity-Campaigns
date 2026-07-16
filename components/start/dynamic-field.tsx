"use client";

import type { BriefFieldDef } from "@/lib/data/campaign-brief-fields";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function DynamicField({
  field,
  value,
  onChange,
}: {
  field: BriefFieldDef;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{field.label}</Label>
      {field.type === "textarea" ? (
        <Textarea placeholder={field.placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === "select" ? (
        <Select value={value || undefined} onValueChange={onChange}>
          <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          type={field.type === "number" ? "number" : "text"}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
