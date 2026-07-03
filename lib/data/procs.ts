import { SkuId } from "./campaign-types";

// Ported from PROCS in the source HTML.
// role + baseHrs (effort, scaled by audience) + days (elapsed calendar days) + outcome ("out")
export interface ProcStep {
  n: number;
  t: string;
  d: string;
  role: string;
  baseHrs: number;
  days: number;
  out: string;
}

export const PROCS: Record<SkuId, ProcStep[]> = {
  abm: [
    { n: 1, t: "ICP + Account Book", d: "Define ICP, pull list, enrich with intent signals.", role: "Account Book Researcher", baseHrs: 18, days: 4, out: "Deliver a segmented, enriched account book matching the approved ICP, ready for client sign-off before any outreach begins." },
    { n: 2, t: "Campaign Brief", d: "Strategy, messaging framework, sequence plan. Gate: approved before production.", role: "Marketing Strategy Lead", baseHrs: 8, days: 3, out: "Produce an approved campaign brief covering audience, messaging angle, and sequence plan, signed off before copy production starts." },
    { n: 3, t: "Copy Production", d: "Email sequence, LinkedIn DM variants, WhatsApp follow-up copy.", role: "Outreach Copywriter", baseHrs: 10, days: 3, out: "Write the full multi-touch sequence (email + LinkedIn + WhatsApp where applicable) with at least one A/B variant per touch, BCP-compliant." },
    { n: 4, t: "Technical Setup", d: "Domain warm-up, sequencing platform, CRM pipeline.", role: "Outreach Executor", baseHrs: 10, days: 5, out: "Load all contacts into the sequencing platform, complete domain/inbox warmup, and confirm zero tracking gaps before go-live." },
    { n: 5, t: "Launch + Monitor", d: "Go live across Email, LinkedIn, WhatsApp. Monitor rates.", role: "Outreach Executor", baseHrs: 30, days: 14, out: "Execute the planned sends on schedule, monitor open/reply/bounce rates daily, and keep bounce rate under 5% per domain." },
    { n: 6, t: "Reply Handling + Booking", d: "Personalised follow-up. Route to call. Log in CRM.", role: "Outreach Engagement Lead", baseHrs: 14, days: 14, out: "Respond to every positive reply within 2 hours, book qualified meetings, and log full context in CRM for the client's sales team." },
    { n: 7, t: "Weekly Reporting", d: "Plan vs actual across the funnel. Tune.", role: "Sales Analytics Executor", baseHrs: 5, days: 7, out: "Deliver a weekly funnel report (sent, opened, replied, meetings booked) every Monday with no missed weeks." },
    { n: 8, t: "Optimise + Iterate", d: "Kill underperforming variants. Expand if hit rate is good.", role: "Marketing Strategy Lead", baseHrs: 6, days: 5, out: "Identify underperforming sequence variants, propose a revised v2, and recommend whether to expand to the next contact batch." },
  ],
  social: [
    { n: 1, t: "Platform Audit", d: "Review current content, engagement, competitor benchmarks.", role: "Social + CRM Manager", baseHrs: 6, days: 3, out: "Deliver an audit identifying content gaps and 3 specific opportunities vs category benchmark." },
    { n: 2, t: "Content Strategy", d: "Pillars, formats, frequency, tone.", role: "Marketing Strategy Lead", baseHrs: 7, days: 3, out: "Produce an approved content strategy doc covering pillars, formats, and posting cadence before calendar build." },
    { n: 3, t: "Content Calendar", d: "Month-view calendar with caption copy and visual briefs.", role: "Social + Email Executive", baseHrs: 8, days: 4, out: "Deliver a client-approved 30-day calendar with caption copy and visual brief per post, 2 weeks ahead of go-live." },
    { n: 4, t: "Creative Production", d: "Design statics, reels, carousels. BCP check each piece.", role: "Creative Pod", baseHrs: 18, days: 7, out: "Produce all planned creative assets, BCP-checked, with first draft delivered within 4 working days of brief." },
    { n: 5, t: "Publish + Engage", d: "Schedule, publish, reply to comments and DMs.", role: "Social + Email Executive", baseHrs: 12, days: 21, out: "Publish on schedule with zero missed dates and clear all comments/DMs within 4 business hours." },
    { n: 6, t: "Weekly Reporting", d: "Reach, impressions, engagement, follower growth.", role: "Reporting Executive", baseHrs: 4, days: 7, out: "Deliver weekly reach, impressions, engagement rate, and follower growth vs target." },
  ],
  content: [
    { n: 1, t: "Keyword + AEO Research", d: "High-value keywords and AI answer engine queries.", role: "Content + SEO Manager", baseHrs: 9, days: 4, out: "Deliver a prioritised keyword and AEO opportunity map ranked by difficulty and volume." },
    { n: 2, t: "Content Brief", d: "Per-article brief: query, angle, structure, links.", role: "Marketing Strategy Lead", baseHrs: 5, days: 3, out: "Produce approved article briefs (query, angle, structure, word count) for the planned batch." },
    { n: 3, t: "Article Writing", d: "Draft, revision, voice check, internal linking.", role: "Writer + SEO Executive", baseHrs: 20, days: 7, out: "Deliver first drafts within 3 working days of brief, passing brand voice check before submission." },
    { n: 4, t: "On-Page SEO", d: "Title tags, meta, structure, schema, AEO formatting.", role: "Content + SEO Manager", baseHrs: 8, days: 3, out: "Apply full on-page SEO and AEO formatting to every article before publish, with zero gaps." },
    { n: 5, t: "Publish + Index", d: "Publish to CMS, submit to GSC, build backlinks.", role: "Writer + SEO Executive", baseHrs: 6, days: 4, out: "Publish all articles, submit to Search Console, and secure 2-3 backlinks per article." },
    { n: 6, t: "Monthly Reporting", d: "Rankings, organic traffic, AEO citations, leads.", role: "Reporting Executive", baseHrs: 4, days: 5, out: "Deliver a monthly report on rankings, organic traffic, AEO citations, and content-attributed leads." },
  ],
  performance: [
    { n: 1, t: "Audience + Funnel Design", d: "Segment audiences, funnel stages, attribution model.", role: "Marketing Strategy Lead", baseHrs: 8, days: 3, out: "Produce an approved paid media strategy with TOFU/MOFU/BOFU audience segments and attribution model." },
    { n: 2, t: "Creative Production", d: "Static ads and reel hooks, 3-5 variants per angle.", role: "Creative Pod", baseHrs: 18, days: 6, out: "Deliver 3-5 BCP-checked creative variants per angle, ready for campaign setup." },
    { n: 3, t: "Account + Campaign Setup", d: "Meta BM, Google Ads, pixel, conversion events.", role: "Paid Media Manager", baseHrs: 8, days: 3, out: "Set up all campaigns with verified tracking, zero untagged campaigns, ready to launch." },
    { n: 4, t: "Launch + Weekly Optimise", d: "Cut losers, scale winners, refresh creative monthly.", role: "Paid Specialist (Search + Social)", baseHrs: 16, days: 21, out: "Keep budget pacing within 5% of plan, implement minimum 3 optimisations per campaign per week." },
    { n: 5, t: "Reporting + Attribution", d: "Weekly CPL/CPA/ROAS/CTR. Monthly full attribution.", role: "Analytics Manager", baseHrs: 6, days: 7, out: "Deliver weekly performance reporting and a monthly attribution summary against client-agreed targets." },
  ],
  retention: [
    { n: 1, t: "Lifecycle Mapping", d: "Map customer journey: activation, habit, at-risk, churned.", role: "Social + CRM Manager", baseHrs: 7, days: 3, out: "Deliver a lifecycle map identifying key trigger points and the proposed flows for each." },
    { n: 2, t: "Flow Strategy", d: "Welcome, post-purchase, win-back, VIP, re-engagement.", role: "Marketing Strategy Lead", baseHrs: 5, days: 3, out: "Produce an approved flow architecture doc covering all planned lifecycle sequences." },
    { n: 3, t: "Copy + Creative", d: "All email and WhatsApp copy, headers, hero images.", role: "Outreach Copywriter", baseHrs: 14, days: 5, out: "Write and design all copy and creative assets for every flow, BCP-compliant." },
    { n: 4, t: "Technical Build", d: "Set up flows, test all triggers.", role: "Social + CRM Manager", baseHrs: 12, days: 5, out: "Build and test all flows in the chosen platform with zero broken triggers before go-live." },
    { n: 5, t: "Optimise + A/B", d: "A/B test subject lines, CTAs, timing.", role: "Analytics Manager", baseHrs: 5, days: 14, out: "Run A/B tests on subject lines, CTAs, and timing, delivering a monthly lift report with winning variants." },
    { n: 6, t: "Monthly Reporting", d: "Open rate, CTR, attributed revenue, AOV uplift.", role: "Reporting Executive", baseHrs: 3, days: 5, out: "Deliver monthly reporting on open rate, CTR, attributed revenue, and AOV uplift." },
  ],
};
