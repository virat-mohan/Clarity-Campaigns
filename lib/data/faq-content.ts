// Verbatim content from "ClarityHQ — Campaign Page FAQ" (July 2026).
// These are policy/legal-adjacent answers (refunds, payment, guarantees) —
// copied as-is from the source document, not paraphrased.
//
// KNOWN CONFLICT: the source doc says the campaign goes live in 7 days of
// payment, but the shipped stats bar (components/start/stats-bar.tsx) and
// the clarityhq.ai homepage both say "3 days to live". This file uses the
// doc's numbers as instructed; items that state "7 days" are flagged below
// with `flagSevenDayConflict: true` and an inline comment. Not reconciled
// here — do not change stats-bar.tsx or any "3 days" copy as part of this.

export interface FaqItem {
  question: string;
  /** Paragraphs, in order, verbatim from the source document. */
  answer: string[];
  /** True if this answer states the "live in 7 days" claim — see the
   * file-level comment above re: the shipped "3 days to live" stat conflict. */
  flagSevenDayConflict?: boolean;
}

export interface FaqCategory {
  title: string;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: "THE CAMPAIGN",
    items: [
      {
        question: "What exactly do I get for $499?",
        answer: [
          "A complete, executed campaign — not a template, a strategy deck, or a set of recommendations. You get the brief, the assets, the distribution, the monitoring, and a performance report, all delivered by a dedicated Human Pod over 4 weeks.",
          "Every campaign includes: a Brand Intelligence brief built from your X-Ray, a 4-week execution plan with named process steps, a human team of 5–6 specialists, all deliverables (content, sequences, ads, or flows — depending on campaign type), and a sprint performance report.",
        ],
      },
      {
        question: 'What does "live in 7 days" mean?',
        // TODO: "live in 7 days" conflicts with the shipped "3 days to live" stat
        // (components/start/stats-bar.tsx) and the clarityhq.ai homepage — reconcile
        // once confirmed which number is correct. Not resolved in this task.
        flagSevenDayConflict: true,
        answer: [
          "Your campaign is live — meaning content published, ads running, or outreach sending — within 7 days of payment. Those first 7 days cover everything: brand book build, campaign strategy, communication plan, creative assets, your approval, and launch. One iteration per deliverable, approved before anything ships.",
          "Meaningful results follow in the 21 days after launch. That's the sprint window where the campaign runs, optimises, and reports.",
        ],
      },
      {
        question: "How is this different from a traditional full-stack agency?",
        // TODO: "live in 7 days" conflicts with the shipped "3 days to live" stat
        // (components/start/stats-bar.tsx) and the clarityhq.ai homepage — reconcile
        // once confirmed which number is correct. Not resolved in this task.
        flagSevenDayConflict: true,
        answer: [
          "Traditional full-stack agencies charge upwards of $999/month — often significantly more — with long onboarding windows, multi-week planning phases, and monthly retainer lock-ins before a single asset goes live.",
          "We charge $499, your campaign is live in 7 days, and you have meaningful results in 21 days. No retainer, no lock-in, no scope creep. One campaign, one sprint, one fixed price.",
        ],
      },
      {
        question: "Can I run more than one campaign at a time?",
        answer: [
          "Yes. Each campaign runs as an independent sprint with its own Human Pod. Many brands run an Acquisition campaign and a Conversion campaign simultaneously — the flywheel works faster when multiple motions are active.",
          "If you want to discuss running two or more campaigns in parallel, book a call and we'll recommend the right sequencing.",
        ],
      },
    ],
  },
  {
    title: "THE PROCESS",
    items: [
      {
        question: "What is the Brand Intelligence Layer and why does it matter?",
        answer: [
          "The Brand Intelligence Layer is how we turn your brand book, ICP, and channel data into a live brief that governs every campaign decision — copy tone, audience targeting, channel mix, visual direction. It's why campaigns built on this layer outperform generic ones: every asset is built for your brand, not a template.",
          "If you've already run a Brand X-Ray through our tool, the Layer is already started. If not, our team builds it in the first phase of your sprint as the foundation for everything that follows.",
        ],
      },
      {
        question: "What is the Human Pod?",
        answer: [
          "The Human Pod is the dedicated team of specialists who execute your campaign. Every Pod has 5–6 people — a Campaign Lead, a strategist for the campaign type, copywriters, designers or builders, and a QA reviewer. All drawn from our vetted network.",
          "Human-led, AI-enabled means the Pod uses AI tools to accelerate drafts, research, and production — but every output is reviewed, edited, and approved by a human before it reaches you or goes live. You never receive raw AI output.",
        ],
      },
      {
        question: "How much of my time does this require?",
        answer: [
          "Minimal. You complete the campaign brief (5 minutes), review and approve one iteration of each deliverable — the brand book, campaign strategy document, communication plan, and creative assets — and that's it. Everything is approved before it ships. No surprises, no back-and-forth.",
        ],
      },
      {
        question: "How does the approval process work?",
        answer: [
          "We follow a single additional iteration model. For each deliverable — the brand book we build, the campaign strategy we develop, the communication plan, and the creative assets — you receive one version, give one round of feedback, and we incorporate it. That deliverable is then approved and locked before we move to the next.",
          "Everything is approved before anything goes live. Your campaign launches on a foundation you've signed off on at every stage.",
        ],
      },
    ],
  },
  {
    title: "PRICING & PAYMENT",
    items: [
      {
        question: "Is the $499 the total cost, or are there other fees?",
        answer: [
          "$499 is the campaign fee — it covers everything the Human Pod does: strategy, brand book build, production, execution, and reporting. It does not include ad spend.",
          "For Performance Marketing campaigns, you'll need a separate media budget (we recommend a minimum of $300–500/month for meaningful results). For all other campaigns — Social Organic, Content-Led, Outbound Sales, and Customer Retention — there is no additional spend required unless you choose to add it.",
        ],
      },
      {
        question: "What payment methods do you accept?",
        answer: [
          "Payment is processed securely via Stripe. We accept all major credit and debit cards (Visa, Mastercard, American Express), and UPI / net banking for India-based clients.",
          "If you need an invoice before payment — for procurement or finance approval — reach out and we'll send one within 24 hours.",
        ],
      },
      {
        question: "Is there a refund policy?",
        answer: [
          "If you cancel within 48 hours of payment and before your Campaign Lead has been assigned, we'll refund in full. After the sprint begins, the campaign fee is non-refundable — but your Campaign Lead will work with you to resolve any concerns before reaching that point.",
          "We'd rather fix the problem than issue a refund. If something isn't working, tell us and we'll make it right.",
        ],
      },
    ],
  },
  {
    title: "RESULTS & PERFORMANCE",
    items: [
      {
        question: "What results can I expect?",
        answer: [
          "Results vary by campaign type, market, and brand maturity — but the plan screen in this flow shows market-specific benchmarks for your combination of industry and country before you commit to anything.",
          "As a reference: Outbound Sales typically delivers 8–20 qualified meetings in India, 5–15 in the US. Performance Marketing at $500 ad spend in India delivers 5–10 conversions. Social Organic delivers 200–500 new followers and 15,000–60,000 reach in India. These are benchmarks, not guarantees.",
        ],
      },
      {
        question: "Do you guarantee results?",
        answer: [
          "No — and any agency that does is not being straight with you. What we guarantee is execution: the right process, the right team, and the right inputs. Results depend on your brand, your market, your offer, and external factors we don't control.",
          "What we do commit to: every deliverable approved before launch, every KPI tracked and reported, and a clear view of what to improve in sprint 2 based on what sprint 1 showed.",
        ],
      },
      {
        question: "What happens after the 4-week sprint ends?",
        answer: [
          "You receive a sprint performance report on Day 28 — results vs benchmarks, what worked, what to optimise, and a recommendation for sprint 2.",
          "From there, you choose: run another $499 campaign, scale into a retainer, or pause. There is no automatic renewal and no obligation to continue. Most brands run 2–3 sprints before moving to a retainer — by which point the Brand Intelligence Layer is fully built and the campaigns are compounding.",
        ],
      },
    ],
  },
  {
    title: "CHOOSING THE RIGHT CAMPAIGN",
    items: [
      {
        question: "How do I know which campaign to choose?",
        answer: [
          "Start with the flywheel. If people don't know you exist — Acquisition (Social Organic or Content-Led). If people know you but aren't buying — Conversion (Outbound Sales or Performance Marketing). If buyers aren't coming back — Retention.",
          "If you've run a Brand X-Ray, your score tells you the same thing: below 60 → Acquisition first. 60–79 → Conversion. 80+ → any motion, led by Performance or Outbound.",
          "Still not sure? Book a 15-minute call and we'll recommend based on your brand.",
        ],
      },
      {
        question: "Is this only for D2C brands?",
        answer: [
          "No — though D2C is where we have the deepest track record. The campaigns work for any brand with a defined ICP: SaaS, professional services, hospitality, FMCG, fintech, and B2B businesses have all run campaigns through this system.",
          "The Outbound Sales campaign is particularly suited to B2B businesses with a named account book. Performance and Social Organic are built around D2C and consumer brand motions.",
        ],
      },
      {
        question: "Which markets do you work in?",
        answer: [
          "We currently support campaigns in India, United States, UAE / Gulf, United Kingdom, and Singapore / SEA. The KPI benchmarks in your plan are calibrated to your selected market.",
          "If your market isn't listed, talk to us — we work with brands in other markets on a case-by-case basis.",
        ],
      },
    ],
  },
];
