"use client";

import { useEffect, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";

export function HelpTooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block align-middle">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ml-1 inline-flex h-[14px] w-[14px] items-center justify-center rounded-full border border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="h-2.5 w-2.5" />
      </button>
      {open && (
        <div className="absolute z-50 left-5 top-0 w-64 rounded-[4px] border border-border bg-card p-3 text-[11.5px] text-muted-foreground leading-relaxed shadow-md">
          {children}
        </div>
      )}
    </div>
  );
}
