"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FaqItem } from "@/lib/data/faq-content";

// No accordion primitive exists in components/ui/ (no @radix-ui/react-accordion
// dependency either) — simple expand/collapse per item, matching the app's
// card/border visual language rather than pulling in a new dependency.
export function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border last:border-none">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-3.5 text-left"
      >
        <span className="text-[13.5px] font-semibold text-foreground">{item.question}</span>
        <ChevronDown
          className={cn("h-4 w-4 flex-none text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="pb-4 flex flex-col gap-2.5">
          {item.answer.map((paragraph, i) => (
            <p key={i} className="text-[12.5px] text-muted-foreground leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
