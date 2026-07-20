import { GrowthFlywheelDiagram } from "@/components/growth-flywheel-diagram";
import { CampaignPlaybookAccordion } from "@/components/campaign-playbook-accordion";
import { Button } from "@/components/ui/button";
import { HUBSPOT_MEETING_LINK } from "@/components/talk-to-us-cta";

const HERO_STATS = [
  { v: "3 days", l: "brief to live" },
  { v: "4 weeks", l: "per sprint" },
  { v: "5", l: "campaign types" },
  { v: "5–6", l: "specialists per pod" },
];

const HOOK_CARDS = [
  {
    tag: "For agencies",
    title: "Your delivery bench, on demand",
    body: "Client sold, capacity short? Plug a campaign straight into your delivery pipeline — white-labelled, 3-day start, full pod attached. No hiring, no bench risk, no missed deadlines when volume spikes.",
  },
  {
    tag: "For brands",
    title: "Skip the search, start the sprint",
    body: "No in-house team, no agency shortlist, no 6-week onboarding. Tell us the goal — we match the campaign, assemble the pod, and you're live in 3 days.",
  },
];

const FLYWHEEL_CARDS = [
  {
    badgeClass: "bg-primary/[.12] text-primary border-primary/35",
    stage: "Acquisition",
    title: "Get found",
    body: "Build the audience and demand that don't exist yet — organic content, SEO, and AI-answer-engine visibility.",
  },
  {
    badgeClass: "bg-secondary/[.15] text-secondary border-secondary/35",
    stage: "Conversion",
    title: "Get chosen",
    body: "Turn attention into pipeline and revenue — outbound sales to a named account book, or performance media tuned to ROAS.",
  },
  {
    badgeClass: "bg-destructive/[.15] text-destructive border-destructive/35",
    stage: "Retention",
    title: "Get repeated",
    body: "Protect and extend revenue you've already earned — behavioural lifecycle flows across email and WhatsApp.",
  },
];

const MODEL_CARDS = [
  { v: "3 days", t: "To live", d: "Brief in, campaign live — not a proposal, an execution." },
  { v: "4 wks", t: "Sprint length", d: "Full end-to-end delivery, then a performance report on day 28." },
  { v: "AI", t: "Native AI engine", d: "Runs the research, drafting, targeting and distribution at machine speed." },
  { v: "5–6", t: "Human pod", d: "Specialists who brief, QA, and ship every deliverable against your brand." },
];

const MATCH_STEPS = [
  { num: "01", title: "You tell us the pain", body: "Goal, market, and where growth is stuck today." },
  { num: "02", title: "We take your ICP & brand book", body: "Plus a few targeted inputs, so we target the right customer, not a generic one." },
  { num: "03", title: "We match the campaign", body: "Your answers are scored against the flywheel to pick the right motion and sequence." },
  { num: "04", title: "Every sprint refines the next", body: "Sprint 1 results sharpen targeting and creative for sprint 2, and beyond." },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="font-mono-label mb-2.5 text-[11px] text-primary">{children}</div>;
}

function SectionHead({ eyebrow, title, body }: { eyebrow: string; title: React.ReactNode; body?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-[640px] text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-heading mb-2.5 text-[28px] font-semibold">{title}</h2>
      {body && <p className="text-[15px] text-muted-foreground">{body}</p>}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <>
      {/* ===== Hero ===== */}
      <section className="px-0 pb-14 pt-[76px] text-center">
        <div className="mx-auto max-w-[1080px] px-5">
          <Eyebrow>Campaigns · Native AI + Human Pod</Eyebrow>
          <h1 className="font-heading mx-auto mb-5 max-w-[820px] text-[clamp(30px,5vw,48px)] font-semibold leading-[1.12]">
            Every brand needs a different push. We diagnose it, then run it — live in 3 days.
          </h1>
          <p className="mx-auto mb-3.5 max-w-[640px] text-[17px] text-muted-foreground">
            Five campaign types, one flywheel: Acquisition, Conversion, Retention. Native AI moves at machine speed;
            a dedicated human pod checks and ships every deliverable. Full execution, 4-week sprint, no retainer
            required.
          </p>
          <p className="mx-auto mb-8 max-w-[640px] text-[15px] font-bold text-primary">
            You tell us the pain. We handle the rest.
          </p>
          <a href={HUBSPOT_MEETING_LINK} target="_blank" rel="noopener noreferrer">
            <Button variant="accent" size="lg" className="h-11 px-6 text-[14px]">
              Schedule a call →
            </Button>
          </a>
          <div className="mt-11 flex flex-wrap justify-center gap-9">
            {HERO_STATS.map((s) => (
              <div key={s.l} className="text-center">
                <div className="font-heading text-[26px] text-primary">{s.v}</div>
                <div className="mt-0.5 text-[11px] uppercase tracking-[0.08em] text-muted-foreground-2">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Built for how you work ===== */}
      <section className="border-t border-border py-14">
        <div className="mx-auto max-w-[1080px] px-5">
          <SectionHead
            eyebrow="Built for how you work"
            title="Delivery capacity when you need it, execution when you can't wait"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {HOOK_CARDS.map((h) => (
              <div key={h.tag} className="rounded-2xl border border-border bg-card p-6">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">{h.tag}</div>
                <h3 className="font-heading mb-2 text-[18px]">{h.title}</h3>
                <p className="text-[13.5px] text-muted-foreground">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Flywheel ===== */}
      <section className="border-t border-border py-14">
        <div className="mx-auto max-w-[1080px] px-5">
          <SectionHead
            eyebrow="The flywheel"
            title="Growth is one loop, not five separate agencies"
            body="Most brands are guessing which lever to pull. We start by placing you on the flywheel, then run the campaign that moves you forward fastest."
          />
          <div className="mb-9 flex justify-center">
            <GrowthFlywheelDiagram />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {FLYWHEEL_CARDS.map((f) => (
              <div key={f.stage} className="rounded-2xl border border-border bg-card p-[22px]">
                <span className={`mb-3 inline-block rounded-full border px-2.5 py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] ${f.badgeClass}`}>
                  {f.stage}
                </span>
                <h3 className="font-heading mb-1.5 text-[18px]">{f.title}</h3>
                <p className="text-[13.5px] text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How it runs ===== */}
      <section className="border-t border-border py-14">
        <div className="mx-auto max-w-[1080px] px-5">
          <SectionHead
            eyebrow="How it runs"
            title="Native AI for speed. A human pod for judgment."
            body="Every campaign pairs AI-run research, drafting, and distribution with a named team of specialists who review, QA, and own the outcome."
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {MODEL_CARDS.map((m) => (
              <div key={m.t} className="px-3 py-5 text-center">
                <div className="font-heading mb-1.5 text-[22px] text-primary">{m.v}</div>
                <div className="mb-1 text-[13px] font-bold">{m.t}</div>
                <div className="text-[12.5px] text-muted-foreground">{m.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How we match your campaign ===== */}
      <section className="border-t border-border py-14">
        <div className="mx-auto max-w-[1080px] px-5">
          <SectionHead
            eyebrow="How we match your campaign"
            title="You bring the pain point. We build the plan around it."
            body="No off-the-shelf package. Every campaign is matched to your brand from a short intake, then sequenced into a roadmap you control."
          />
          <div className="mb-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {MATCH_STEPS.map((m) => (
              <div key={m.num} className="rounded-[14px] border border-border bg-card p-[18px]">
                <div className="mb-1.5 font-mono text-[11px] font-bold text-primary">{m.num}</div>
                <h4 className="mb-1.5 text-[14.5px] font-semibold">{m.title}</h4>
                <p className="text-[12.5px] text-muted-foreground">{m.body}</p>
              </div>
            ))}
          </div>
          <div className="mx-auto max-w-[720px] rounded-[14px] border border-secondary/30 bg-secondary/[.08] px-[22px] py-[18px] text-center text-[14px]">
            Based on your match, we&apos;ll propose a <b className="text-secondary">3-month roadmap</b> — but you
            don&apos;t have to commit to all of it. Start with a single 4-week sprint and extend to 2 or 3 months as
            results come in.
          </div>
        </div>
      </section>

      {/* ===== The five campaigns ===== */}
      <section className="border-t border-border py-14">
        <div className="mx-auto max-w-[1080px] px-5">
          <SectionHead
            eyebrow="The five campaigns"
            title="Pick the one that matches where you are"
            body="Same process spine, different craft each week. Tap a campaign for the full 4-week plan, pod, and expected outcome."
          />
          <CampaignPlaybookAccordion />
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="border-t border-border px-5 py-16 pb-20 text-center">
        <div className="mx-auto max-w-[1080px]">
          <h2 className="font-heading mx-auto mb-3 max-w-[720px] text-[30px]">
            Tell us where you are. We&apos;ll tell you which campaign moves you forward — and run it in 3 days.
          </h2>
          <p className="mb-7 text-muted-foreground">
            15 minutes on a call. No deck, no retainer pitch — just your brand, your market, and the right lever to
            pull.
          </p>
          <a href={HUBSPOT_MEETING_LINK} target="_blank" rel="noopener noreferrer">
            <Button variant="accent" size="lg" className="h-11 px-6 text-[14px]">
              Schedule a call →
            </Button>
          </a>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-[12px] text-muted-foreground-2">
        © ClarityHQ · campaign.clarityhq.ai
      </footer>
    </>
  );
}
