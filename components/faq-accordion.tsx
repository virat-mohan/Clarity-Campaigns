"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/lib/data/faq-content";

export function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "mb-2 overflow-hidden rounded-[var(--radius)] border border-border bg-card",
        open && "open"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-[15px] py-[13px] text-left text-[13px] font-semibold text-foreground"
      >
        <span>
          {item.question}
          {item.flagSevenDayConflict && (
            <span
              title="Conflicts with the '3 days to live' stat"
              className="flag ml-1.5 inline-block align-middle rounded-[3px] border border-destructive/30 bg-destructive/12 px-1.5 py-px font-mono text-[8.5px] text-destructive"
            >
              7-day note
            </span>
          )}
        </span>
        <span
          className={cn(
            "flex-none text-muted-foreground-2 transition-transform",
            open && "rotate-180"
          )}
        >
          ⌄
        </span>
      </button>
      {open && (
        <div className="px-[15px] pb-[13px] text-[12.5px] leading-[1.65] text-muted-foreground">
          {item.answer.map((paragraph, i) => (
            <p key={i} className="mb-2 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
