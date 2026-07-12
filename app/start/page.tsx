import { Suspense } from "react";
import Link from "next/link";
import { CAMPAIGN_TYPES, SkuId } from "@/lib/data/campaign-types";
import { CampaignFlowCard } from "@/components/start/campaign-flow-card";
import { StatsBar } from "@/components/start/stats-bar";
import { FlywheelIntro } from "@/components/start/flywheel-intro";
import { TalkToUsCta } from "@/components/talk-to-us-cta";
import { UrlPrefill } from "@/components/start/url-prefill";
import { Button } from "@/components/ui/button";

const FLYWHEEL_GROUPS: { stage: string; label: string; colorClass: string; borderClass: string; skus: SkuId[] }[] = [
  { stage: "Acquisition", label: "ACQUISITION", colorClass: "text-primary", borderClass: "border-primary/30", skus: ["social", "content"] },
  { stage: "Conversion", label: "CONVERSION", colorClass: "text-secondary", borderClass: "border-secondary/30", skus: ["abm", "performance"] },
  { stage: "Retention", label: "RETENTION", colorClass: "text-destructive", borderClass: "border-destructive/30", skus: ["retention"] },
];

export default function StartPage() {
  return (
    <>
      <Suspense fallback={null}>
        <UrlPrefill />
      </Suspense>
      <section className="section-paper">
        <div className="mx-auto max-w-[1180px] px-4 py-14 lg:py-16">
          <div className="max-w-2xl mb-8">
            <div className="font-mono-label text-[10px] text-primary mb-2">campaign.clarityhq.ai</div>
            <h1 className="font-heading heading-2tone text-3xl font-semibold tracking-tight mb-3 leading-tight">
              One campaign. Built right. <span className="dim">Live in under a week.</span>
            </h1>
            <p className="text-[13.5px] text-muted-foreground leading-relaxed">
              Every campaign is grounded in your Brand Intelligence Layer — your brand book, ICP, and channel voice.
            </p>
          </div>
          <StatsBar />
        </div>
      </section>

      <section className="section-dark rounded-t-[2.5rem] -mt-8 relative">
        <div className="mx-auto max-w-[1180px] px-4 py-14">
          <div className="mb-6">
            <div className="font-mono-label text-[10px] text-primary mb-1">How it works</div>
            <h2 className="font-heading heading-2tone text-xl font-semibold">
              Acquisition <span className="dim">→ Conversion → Retention</span>
            </h2>
          </div>
          <FlywheelIntro />
        </div>
      </section>

      <section className="section-paper rounded-t-[2.5rem] -mt-8 relative">
        <div className="mx-auto max-w-[1180px] px-4 py-14">
          <div className="mb-6">
            <div className="font-mono-label text-[10px] text-primary mb-1">Choose your campaign</div>
            <h2 className="font-heading heading-2tone text-xl font-semibold mb-1">Five campaigns. <span className="dim">One fixed price.</span></h2>
            <p className="text-[12.5px] text-muted-foreground max-w-2xl">
              Every card maps to a stage of the flywheel above. Pick one — the whole card is the start button.
            </p>
          </div>

          <div className="flex flex-col gap-8">
            {FLYWHEEL_GROUPS.map((group) => (
              <div key={group.stage}>
                <div className={`flex items-center gap-3 mb-3 pb-2 border-b ${group.borderClass}`}>
                  <span className={`font-mono-label text-[9px] ${group.colorClass}`}>{group.label}</span>
                </div>
                <div className={`grid grid-cols-1 gap-4 ${group.skus.length === 1 ? "sm:grid-cols-1 max-w-sm" : "sm:grid-cols-2"}`}>
                  {group.skus.map((skuId) => (
                    <CampaignFlowCard key={skuId} ct={CAMPAIGN_TYPES[skuId]} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-[var(--radius-card)] border border-border-strong bg-card p-5 sm:flex-row sm:items-center">
            <div className="font-mono-label text-[10px] text-muted-foreground">Not sure which campaign you need?</div>
            <div className="flex flex-none items-center gap-2">
              <Link href="/recommend">
                <Button size="sm">Take the quiz</Button>
              </Link>
              <TalkToUsCta variant="inline" />
            </div>
          </div>

          <div className="mt-3 text-center">
            <Link href="/faq" className="text-[11px] text-muted-foreground-2 underline underline-offset-2 hover:text-foreground">
              Questions? Read the FAQ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
