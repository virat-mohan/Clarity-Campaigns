import Link from "next/link";
import { CAMPAIGN_TYPES, SkuId } from "@/lib/data/campaign-types";
import { SkuCard } from "@/components/sku-card";
import { FlywheelDiagram } from "@/components/flywheel-diagram";
import { Button } from "@/components/ui/button";
import { TalkToUsCta } from "@/components/talk-to-us-cta";
import { ClipboardList, Users2, DollarSign, CalendarCheck, LineChart } from "lucide-react";

const PROCESS_STEPS = [
  {
    Icon: ClipboardList,
    title: "We start with your Brand Intelligence",
    body: "Brand book, sales data, channels, and website — condensed into a single ICP and voice profile before a single asset gets made. Every campaign is built on top of it, not from a blank page.",
  },
  {
    Icon: Users2,
    title: "You pick the growth motion, not the tactics",
    body: "Five campaign types, each mapped to one stage of the flywheel — acquisition, conversion, or retention. Pick the one that matches where your business actually needs momentum right now.",
  },
  {
    Icon: DollarSign,
    title: "We staff and price it in the open",
    body: "A right-sized pod of specialists is auto-suggested from the process itself — real hours, real rates, editable line by line. Pricing is cost-plus, shown as a breakdown, never a single opaque number.",
  },
  {
    Icon: CalendarCheck,
    title: "You approve the plan before anything moves",
    body: "Timeline, deliverables, and expected results are locked in and signed off before the fixed or base component is due — no surprises mid-flight.",
  },
  {
    Icon: LineChart,
    title: "We run it and report against our own projection",
    body: "Delivery is measured against the numbers we projected at build time, not vanity metrics chosen after the fact.",
  },
];

const FLYWHEEL_GROUPS: {
  stage: string;
  label: string;
  colorClass: string;
  borderClass: string;
  skus: SkuId[];
}[] = [
  {
    stage: "Acquisition",
    label: "ACQUISITION",
    colorClass: "text-primary",
    borderClass: "border-primary/30",
    skus: ["social", "content"],
  },
  {
    stage: "Conversion",
    label: "CONVERSION",
    colorClass: "text-secondary",
    borderClass: "border-secondary/30",
    skus: ["abm", "performance"],
  },
  {
    stage: "Retention",
    label: "RETENTION",
    colorClass: "text-destructive",
    borderClass: "border-destructive/30",
    skus: ["retention"],
  },
];

export default function MarketplacePage() {
  return (
    <>
      {/* ===== Section 1 · Hero + flywheel — CREAM ===== */}
      <section className="section-paper">
        <div className="mx-auto max-w-[1180px] px-4 py-14 lg:py-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_480px]">
            <div>
              <div className="font-mono-label text-[10px] text-primary mb-1">Campaign command centre</div>
              <h1 className="font-heading heading-2tone text-3xl font-semibold tracking-tight mb-3 leading-tight">
                Brand Intelligence <span className="dim">sits at the center of every campaign we build.</span>
              </h1>
              <p className="max-w-xl text-[13.5px] text-muted-foreground leading-relaxed mb-3">
                Growth isn&apos;t one motion — it&apos;s three, running continuously. <strong className="text-foreground">Acquisition</strong> brings
                the right people in. <strong className="text-foreground">Conversion</strong> turns attention into revenue.{" "}
                <strong className="text-foreground">Retention</strong> makes sure growth compounds instead of leaking out the
                bottom. We start every engagement by understanding your brand well enough to know which stage
                needs the work, then build a campaign for exactly that — not a generic package.
              </p>
              <p className="max-w-xl text-[13.5px] text-muted-foreground leading-relaxed mb-5">
                The process below is deliberately simple: five steps, transparent staffing and pricing at every
                one, and nothing moves without your sign-off.
              </p>
              <Link href="/brand-foundation">
                <Button size="lg">Start with your brand foundation</Button>
              </Link>
            </div>
            <div className="mx-auto w-full max-w-[480px]">
              <FlywheelDiagram />
            </div>
          </div>
        </div>
      </section>

      {/* ===== Section 2 · Five steps — DARK ===== */}
      <section className="section-dark rounded-t-[2.5rem] -mt-8 relative">
        <div className="mx-auto max-w-[1180px] px-4 py-14">
          <div className="mb-6">
            <div className="font-mono-label text-[10px] text-primary mb-1">How we approach it</div>
            <h2 className="font-heading heading-2tone text-xl font-semibold">Five steps <span className="dim">from brand to campaign</span></h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.title} className="rounded-[var(--radius-card)] border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary">
                    <step.Icon size={15} strokeWidth={1.75} />
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground-2">Step {i + 1}</span>
                </div>
                <h3 className="font-heading text-[13.5px] font-semibold mb-1.5 leading-snug">{step.title}</h3>
                <p className="text-[12px] text-muted-foreground leading-snug">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Section 3 · Pick the motion + campaign cards — CREAM ===== */}
      <section className="section-paper rounded-t-[2.5rem] -mt-8 relative">
        <div className="mx-auto max-w-[1180px] px-4 py-14">
          <div className="mb-6">
            <div className="font-mono-label text-[10px] text-primary mb-1">Campaign types we sell</div>
            <h2 className="font-heading heading-2tone text-xl font-semibold mb-1">Pick the motion <span className="dim">that matches your moment</span></h2>
            <p className="text-[12.5px] text-muted-foreground max-w-2xl">
              Every card maps to a stage of the flywheel above, with the kind of business it tends to work best
              for — not a hard rule, a starting point for the conversation.
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
                    <SkuCard key={skuId} ct={CAMPAIGN_TYPES[skuId]} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-[var(--radius-card)] border border-border-strong bg-card p-5 sm:flex-row sm:items-center">
            <div>
              <div className="font-mono-label text-[9px] text-primary mb-1">Not sure which campaign you need?</div>
              <p className="text-[13px] text-muted-foreground max-w-md">
                Answer a few questions about your business and we&apos;ll recommend the campaign types most likely
                to move the needle — plus a roadmap for what to build next.
              </p>
            </div>
            <div className="flex flex-none items-center gap-2">
              <Link href="/recommend">
                <Button size="sm">Take the quiz</Button>
              </Link>
              <TalkToUsCta variant="inline" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
