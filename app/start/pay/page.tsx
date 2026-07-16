"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { CAMPAIGN_FLOW_COPY, SLUG_TO_SKU } from "@/lib/data/campaign-flow-copy";
import { MARKET_OPTIONS } from "@/lib/data/campaign-brief-fields";
import { IND, type IndustryId } from "@/lib/data/industry-benchmarks";
import { BASE_CAMPAIGN_PRICE, bundlePrice, DURATION_DISCOUNT_LABEL } from "@/lib/data/bundle-pricing";
import { useStartFlowStore } from "@/lib/store/start-flow-store";
import { useQuizStore } from "@/lib/store/quiz-store";
import { getStartFlowRoadmap } from "@/lib/scoring/recommendation-engine";
import { CAMPAIGN_ID_TO_SKU, SKU_TO_CAMPAIGN_ID } from "@/lib/quiz/campaign-sku-map";
import { goToStripe } from "@/lib/payments/stripe-links";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TalkToUsCta } from "@/components/talk-to-us-cta";
import { TermsModal } from "@/components/terms-modal";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SUPPORT_EMAIL = "hello@clarityhq.ai";

function PayPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get("type");

  const selectedSku = useStartFlowStore((s) => s.selectedSku);
  const brandBasics = useStartFlowStore((s) => s.brandBasics);
  const budget = useStartFlowStore((s) => s.budget);
  const duration = useStartFlowStore((s) => s.duration);
  const setSelectedSku = useStartFlowStore((s) => s.setSelectedSku);
  const setDuration = useStartFlowStore((s) => s.setDuration);
  const quizAnswers = useQuizStore((s) => s.answers);

  const sku = (typeParam ? SLUG_TO_SKU[typeParam] : undefined) ?? selectedSku ?? undefined;

  const [changeRequest, setChangeRequest] = useState("");
  const [changeRequestSent, setChangeRequestSent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

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

  const roadmap = useMemo(() => {
    if (!sku) return [];
    return getStartFlowRoadmap(quizAnswers, SKU_TO_CAMPAIGN_ID[sku]).slice(0, duration);
  }, [quizAnswers, sku, duration]);

  if (!sku || !ct || !copy) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-[13px] text-muted-foreground">
        Redirecting…
      </div>
    );
  }

  const adSpend = Number(budget.adSpendBudget) || 0;
  const campaignPrice = bundlePrice(duration);
  const subtotal = BASE_CAMPAIGN_PRICE * duration;
  const discountAmt = subtotal - campaignPrice;
  const total = campaignPrice + adSpend;

  function handleChangeRequest() {
    const subject = encodeURIComponent(
      `Change request — ${ct!.label}${brandBasics.brandName ? ` (${brandBasics.brandName})` : ""}`
    );
    const body = encodeURIComponent(changeRequest || "(no details provided)");
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setChangeRequestSent(true);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label mb-1 text-[10px] text-primary">Review & pay</div>
        <h1 className="font-heading text-2xl font-semibold">{ct.label}</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">{copy.description}</p>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="pt-5">
            <div className="font-mono-label mb-3 text-[9.5px] text-primary">Commit & save</div>
            <div className="grid grid-cols-3 gap-2.5">
              {([1, 2, 3] as const).map((n) => {
                const price = bundlePrice(n);
                const active = duration === n;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setDuration(n)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 rounded-[var(--radius-card)] border border-border-strong bg-card px-2 py-3 transition-colors hover:border-primary",
                      active && "border-primary bg-primary/[0.08]"
                    )}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                      {n} month{n > 1 ? "s" : ""}
                    </span>
                    <span className={cn("font-heading text-lg font-semibold", active && "text-primary")}>
                      ${price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-secondary">{DURATION_DISCOUNT_LABEL[n]}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground-2">
              Commit to more months and save — the discount applies to the full bundle, billed today.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="font-mono-label mb-3 text-[9.5px] text-primary">Campaign summary</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Campaign", ct.label],
                ["Brand", brandBasics.brandName || "—"],
                ["Market", marketLabel ?? "—"],
                ["Industry", industryLabel ?? "—"],
                ["Duration", `${duration} month${duration > 1 ? "s" : ""}`],
                ["Pod size", `${copy.podSize} specialists`],
              ].map(([k, v]) => (
                <div key={k}>
                  <div className="mb-0.5 font-mono text-[9.5px] text-muted-foreground-2">{k}</div>
                  <div className="text-[13px] font-semibold">{v}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {duration > 1 && (
          <Card>
            <CardContent className="pt-5">
              <div className="font-mono-label mb-3 text-[9.5px] text-primary">
                Your {duration}-month roadmap
              </div>
              {roadmap.map((step) => {
                const rsku = CAMPAIGN_ID_TO_SKU[step.campaign];
                const rct = CAMPAIGN_TYPES[rsku];
                return (
                  <div
                    key={`${step.monthLabel}-${step.campaign}`}
                    className="mb-1.5 flex items-center justify-between text-[12.5px]"
                  >
                    <span>
                      {step.monthLabel} — {rct.label}
                    </span>
                    <span className="font-mono text-muted-foreground-2">
                      {rsku === sku ? "this brief" : "scoped at kickoff"}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="pt-5">
            <div className="font-mono-label mb-3 text-[9.5px] text-muted-foreground">
              Deliverables — Month 1
            </div>
            <div className="flex flex-col gap-1.5">
              {copy.deliverables.map((d) => (
                <div key={d} className="flex items-start gap-2 text-[12.5px]">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-secondary" />
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="font-mono-label mb-3 text-[9.5px] text-muted-foreground">Order summary</div>
            <div className="flex flex-col gap-1.5 text-[12.5px]">
              <div className="flex items-center justify-between">
                <span>Campaign{duration > 1 ? ` (${duration} months)` : ""}</span>
                <span className="font-mono">${subtotal.toLocaleString()}</span>
              </div>
              {duration > 1 && (
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Bundle discount ({DURATION_DISCOUNT_LABEL[duration]})</span>
                  <span className="font-mono text-secondary">−${discountAmt.toLocaleString()}</span>
                </div>
              )}
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
                Ad spend is billed separately by the ad platforms — only the $
                {campaignPrice.toLocaleString()} campaign fee is charged today.
              </p>
            )}
          </CardContent>
        </Card>

        <label className="flex items-start gap-2 text-[12px] text-muted-foreground">
          <Checkbox
            checked={agreedToTerms}
            onCheckedChange={(v) => setAgreedToTerms(v === true)}
            className="mt-0.5"
          />
          I have read and agree to the <TermsModal />
        </label>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button
            size="lg"
            className="flex-1"
            disabled={!agreedToTerms}
            onClick={() => goToStripe(sku)}
          >
            Pay ${campaignPrice.toLocaleString()} — Start campaign →
          </Button>
          <TalkToUsCta variant="inline" />
        </div>
        <p className="text-center text-[10.5px] text-muted-foreground-2">
          Cards (Visa, Mastercard, Amex), plus UPI / net banking for India-based clients — via Stripe.
        </p>

        <Card className="bg-muted/40">
          <CardContent className="pt-4">
            <div className="font-mono-label mb-2 text-[9px] text-muted-foreground">
              Need something changed first?
            </div>
            <Textarea
              placeholder="Tell us what to adjust before you pay…"
              value={changeRequest}
              onChange={(e) => setChangeRequest(e.target.value)}
            />
            <div className="mt-2 flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleChangeRequest}
                disabled={!changeRequest.trim()}
              >
                Request changes
              </Button>
              {changeRequestSent && (
                <span className="font-mono text-[10.5px] text-secondary">Sent to {SUPPORT_EMAIL}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10.5px] text-muted-foreground-2">
          <span>Secure checkout via Stripe</span>
          <span>·</span>
          <span>Campaign starts within a week — you&apos;ll hear from us in 48 hours</span>
          <span>·</span>
          <span>Human Pod assigned on payment</span>
          <span>·</span>
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
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-[13px] text-muted-foreground">
          Loading…
        </div>
      }
    >
      <PayPageContent />
    </Suspense>
  );
}
