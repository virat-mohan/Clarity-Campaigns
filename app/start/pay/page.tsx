"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { CAMPAIGN_FLOW_COPY, SLUG_TO_SKU } from "@/lib/data/campaign-flow-copy";
import { MARKET_OPTIONS } from "@/lib/data/campaign-brief-fields";
import { IND, type IndustryId } from "@/lib/data/industry-benchmarks";
import { useStartFlowStore } from "@/lib/store/start-flow-store";
import { goToStripe } from "@/lib/payments/stripe-links";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TalkToUsCta } from "@/components/talk-to-us-cta";
import { CheckCircle2 } from "lucide-react";

const SUPPORT_EMAIL = "hello@clarityhq.ai";

function PayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  const selectedSku = useStartFlowStore((s) => s.selectedSku);
  const brandBasics = useStartFlowStore((s) => s.brandBasics);
  const budget = useStartFlowStore((s) => s.budget);
  const setSelectedSku = useStartFlowStore((s) => s.setSelectedSku);

  const sku = (typeParam ? SLUG_TO_SKU[typeParam] : undefined) ?? selectedSku ?? undefined;

  const [changeRequest, setChangeRequest] = useState("");
  const [changeRequestSent, setChangeRequestSent] = useState(false);

  useEffect(() => {
    if (!sku) {
      router.replace("/start");
      return;
    }
    if (selectedSku !== sku) {
      setSelectedSku(sku);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku]);

  const ct = sku ? CAMPAIGN_TYPES[sku] : null;
  const copy = sku ? CAMPAIGN_FLOW_COPY[sku] : null;

  const marketLabel = useMemo(
    () => MARKET_OPTIONS.find((m) => m.value === brandBasics.country)?.label,
    [brandBasics.country]
  );
  const industryLabel = brandBasics.industry ? IND[brandBasics.industry as IndustryId]?.name : undefined;

  if (!sku || !ct || !copy) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-[13px] text-muted-foreground">
        Redirecting…
      </div>
    );
  }

  const adSpend = Number(budget.adSpendBudget) || 0;
  const total = copy.price + adSpend;

  function handleChangeRequest() {
    const subject = encodeURIComponent(`Change request — ${ct!.label}${brandBasics.brandName ? ` (${brandBasics.brandName})` : ""}`);
    const body = encodeURIComponent(changeRequest || "(no details provided)");
    // Section 7.1: "Submit to hello@clarityhq.ai or create a HubSpot ticket via form submission" —
    // no ticketing backend exists yet, so this opens a pre-filled email in the customer's mail client.
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setChangeRequestSent(true);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label text-[10px] text-primary mb-1">Review & pay</div>
        <h1 className="font-heading text-2xl font-semibold">{ct.label}</h1>
        <p className="text-[13px] text-muted-foreground mt-1">{copy.description}</p>
      </div>

      <div className="flex flex-col gap-4">
        <Card className="bg-paper border-paper-border text-paper-foreground">
          <CardContent className="pt-5">
            <div className="font-mono-label text-[9.5px] text-primary-hover mb-3">Campaign summary</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <div className="font-mono text-[9.5px] text-muted-foreground-2 mb-0.5">Campaign</div>
                <div className="text-[13px] font-semibold">{ct.label}</div>
              </div>
              <div>
                <div className="font-mono text-[9.5px] text-muted-foreground-2 mb-0.5">Brand</div>
                <div className="text-[13px] font-semibold">{brandBasics.brandName || "—"}</div>
              </div>
              <div>
                <div className="font-mono text-[9.5px] text-muted-foreground-2 mb-0.5">Market</div>
                <div className="text-[13px] font-semibold">{marketLabel ?? "—"}</div>
              </div>
              <div>
                <div className="font-mono text-[9.5px] text-muted-foreground-2 mb-0.5">Industry</div>
                <div className="text-[13px] font-semibold">{industryLabel ?? "—"}</div>
              </div>
              <div>
                <div className="font-mono text-[9.5px] text-muted-foreground-2 mb-0.5">Sprint</div>
                <div className="text-[13px] font-semibold">{copy.durationLabel}</div>
              </div>
              <div>
                <div className="font-mono text-[9.5px] text-muted-foreground-2 mb-0.5">Pod size</div>
                <div className="text-[13px] font-semibold">{copy.podSize} specialists</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="font-mono-label text-[9.5px] text-muted-foreground mb-3">Deliverables</div>
            <div className="flex flex-col gap-1.5">
              {copy.deliverables.map((d) => (
                <div key={d} className="flex items-start gap-2 text-[12.5px]">
                  <CheckCircle2 className="h-3.5 w-3.5 flex-none mt-0.5 text-secondary" />
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="font-mono-label text-[9.5px] text-muted-foreground mb-3">Order summary</div>
            <div className="flex flex-col gap-1.5 text-[12.5px]">
              <div className="flex items-center justify-between">
                <span>Campaign</span>
                <span className="font-mono">${copy.price}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Human Pod</span>
                <span className="font-mono">Included</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Brand Intel</span>
                <span className="font-mono">Included</span>
              </div>
              {adSpend > 0 && (
                <div className="flex items-center justify-between">
                  <span>Ad spend ({budget.cadence === "monthly" ? "monthly" : "one-time"})</span>
                  <span className="font-mono">${adSpend.toLocaleString()}</span>
                </div>
              )}
              <div className="mt-1.5 flex items-center justify-between border-t border-border pt-2 text-[14px] font-semibold">
                <span>Total</span>
                <span className="font-mono">${total.toLocaleString()}</span>
              </div>
            </div>
            {adSpend > 0 && (
              <p className="mt-2 text-[10.5px] text-muted-foreground-2">
                Ad spend is billed separately by the ad platforms — only the ${copy.price} campaign fee is charged today.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          {/* TODO: replace with real Stripe link once available — see lib/payments/stripe-links.ts */}
          <Button size="lg" className="flex-1" onClick={() => goToStripe(sku)}>
            Pay ${copy.price} — Start campaign →
          </Button>
          <TalkToUsCta variant="inline" />
        </div>
        <p className="text-center text-[10.5px] text-muted-foreground-2">
          Cards (Visa, Mastercard, Amex), plus UPI / net banking for India-based clients — via Stripe.
        </p>

        <Card className="bg-muted/40">
          <CardContent className="pt-4">
            <div className="font-mono-label text-[9px] text-muted-foreground mb-2">Need something changed first?</div>
            <Textarea
              placeholder="Tell us what to adjust before you pay…"
              value={changeRequest}
              onChange={(e) => setChangeRequest(e.target.value)}
            />
            <div className="mt-2 flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleChangeRequest} disabled={!changeRequest.trim()}>
                Request changes
              </Button>
              {changeRequestSent && (
                <span className="font-mono text-[10.5px] text-secondary">Sent to {SUPPORT_EMAIL}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 justify-center text-[10.5px] text-muted-foreground-2">
          <span>Secure checkout via Stripe</span>
          <span>·</span>
          <span>Campaign starts within a week — you&apos;ll hear from us in 48 hours</span>
          <span>·</span>
          <span>Human Pod assigned on payment</span>
          <span>·</span>
          {/* Full refund window per the Campaign FAQ ("Is there a refund policy?") */}
          <span>Full refund if you cancel within 48 hours, before your Campaign Lead is assigned</span>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <Link href={`/start/brief?type=${typeParam ?? ""}`}>
            <Button variant="outline">← Edit brief</Button>
          </Link>
          <span className="font-mono text-[10.5px] text-muted-foreground-2">{SUPPORT_EMAIL}</span>
        </div>
      </div>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-[13px]">Loading…</div>}>
      <PayPageContent />
    </Suspense>
  );
}
