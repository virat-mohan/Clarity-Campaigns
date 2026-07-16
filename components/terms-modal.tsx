"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "Payment",
    body: "The $499 campaign fee is charged at checkout via Stripe. Third-party costs — ad spend, influencer fees, photography, video, and other vendor spend — are separate, passed through at zero markup, and invoiced after your Campaign Lead confirms vendor selection.",
  },
  {
    title: "Refunds",
    body: "Full refund available within 48 hours of payment if your Campaign Lead has not yet been assigned. Once the sprint begins the $499 fee is non-refundable. If something isn't working, contact us — we will fix it before a refund becomes necessary.",
  },
  {
    title: "Deliverables and IP",
    body: "All campaign assets — copy, creative, strategy documents, and reports — are owned by you on delivery. ClarityHQ retains no rights to your deliverables. We may reference the engagement type (not brand-specific detail) for our own case studies unless you request otherwise.",
  },
  {
    title: "Data and privacy",
    body: "Brand information, uploaded documents, and brief inputs are used solely to deliver your campaign. We do not share your data with third parties beyond vendors confirmed by your Campaign Lead. Files uploaded to your campaign record are stored securely and deleted 90 days after sprint completion.",
  },
  {
    title: "Results and liability",
    body: "ClarityHQ does not guarantee specific campaign outcomes. KPI estimates shown on the plan screen are based on industry benchmarks for your selected market and category — they are indicative, not contractual. ClarityHQ's liability is limited to the $499 campaign fee paid. We are not liable for ad spend, influencer fees, or other third-party costs committed on your instruction.",
  },
  {
    title: "Cancellation and changes",
    body: "You may request changes to campaign scope before assets are produced. Significant scope changes after production has begun may require a revised sprint plan. If ClarityHQ is unable to deliver the campaign as briefed, a full refund will be issued. There are no automatic renewals — each campaign sprint is a standalone engagement.",
  },
];

export function TermsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="underline underline-offset-2 hover:text-primary"
      >
        Terms of Service
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-[var(--radius-card)] border border-border-strong bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="font-heading text-base font-semibold">Terms of service</h2>
                <p className="font-mono text-[10px] text-muted-foreground-2">Effective July 2026</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-muted-foreground-2 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className="terms-scroll min-h-0 flex-1 overflow-y-auto px-5 py-4"
              style={{ scrollbarWidth: "thin", scrollbarGutter: "stable" }}
            >
              <div className="font-mono-label mb-3 text-[9.5px] text-primary">Key terms</div>
              <div className="flex flex-col gap-3.5">
                {SECTIONS.map((s) => (
                  <div key={s.title}>
                    <div className="mb-1 text-[12.5px] font-semibold">{s.title}</div>
                    <p className="text-[12px] leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border px-5 py-3.5">
              <p className="text-[10.5px] leading-relaxed text-muted-foreground-2">
                By proceeding to checkout you agree to these terms. Full terms available at clarityhq.ai/terms.
                Questions: hello@clarityhq.ai
              </p>
              <Button size="sm" className="mt-3 w-full" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
