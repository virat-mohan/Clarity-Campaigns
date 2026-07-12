"use client";

import { cn } from "@/lib/utils";

export function PillSelect({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "font-mono text-[11px] px-3 py-2 rounded-full border transition-colors",
            value === opt.value
              ? "bg-paper-foreground text-paper border-paper-foreground"
              : "bg-transparent text-muted-foreground-2 border-paper-border hover:border-primary-hover"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
