# ClarityHQ Campaign Marketplace

An internal discussion demo for a self-serve campaign marketplace: pick a campaign
type, fill in a brief, get an auto-staffed pod, a timeline, a results projection,
and transparent pricing — then a mock checkout.

**This is not production software.** It exists to make a build spec concrete
enough to react to in a discussion. Specifically:

- **All data is mocked and local.** There is no backend, no database, and no
  persistence beyond the browser's `localStorage` (via Zustand's `persist`
  middleware) so a demo session survives page navigation and refreshes.
- **No real payment processing.** `/checkout` has a "Pay Now" button that
  simulates a delay and returns a success state. No Razorpay, Stripe, or any
  other gateway is called.
- **Brand Intelligence is a hardcoded placeholder.** `/brand-foundation`
  "processes" mock upload fields and returns a fixed illustrative ICP/brand-book
  snippet, clearly labeled as such — it does not analyze anything you enter.
- **Two campaign types have no results model, on purpose.** Social Organic and
  Content-Led (SEO/AEO) show a labeled "Benchmark model in development" card at
  the Expected Results step instead of a fabricated number, because no such
  benchmark exists in the source material this demo was built from.
- **Vendor and specialist rates are a mix of real, illustrative, and TBD.** Core
  pod roles (hourly, USD) come from the source tool's role library. Retainer
  specialist capacity (₹, monthly/project) is illustrative, sourced from a
  hiring-compensation conversation, and kept in a separate currency line rather
  than folded into USD totals. Vendor rows (AI video, film director,
  photographer, influencer/UGC) have no existing rate card and are left blank /
  editable — never guessed.

## What's real

The calculation logic — auto-staffing scale, sprint/timeline breakdown, paid
reach projection, and the fixed (4x cost) / fixed+variable (3x cost + per-outcome
rate) pricing model — is ported directly from the internal ClarityHQ Master
Campaign Builder tool, not reinvented for this demo. See `lib/calc/` and
`lib/data/` for the ported logic and seed data, each annotated with what it was
ported from.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Hand-built shadcn/ui-style components (Radix primitives + CVA + Tailwind) —
  the shadcn CLI's remote registry wasn't reachable from this build environment,
  so components were written directly rather than scaffolded
- Zustand for the multi-step configurator state, persisted to `localStorage`
- Static TypeScript seed data in `lib/data/` — no database

## Structure

```
app/
  page.tsx                    Marketplace landing, 5 SKU cards
  brand-foundation/page.tsx   Step 1 — mock brand intelligence
  build/[sku]/page.tsx        Steps 2-8 — brief, pod & vendor, timeline, results, pricing
  checkout/page.tsx           Step 9 — order summary + mock payment
  confirmation/page.tsx       Post-payment confirmation
components/                   UI + feature components
lib/data/                     Seed data ported from the source HTML tool
lib/calc/                     Pricing, reach, staffing, and sprint logic
lib/store/                    Zustand store for wizard state
```

## Running locally

```
npm install
npm run dev
```

## Context

This build follows a 10-step customer flow spec and a source internal tool
(`ClarityHQ_Master_Campaign_Builder.html`) supplied for this session — ask
whoever shared this repo for those documents if you need the original spec.
