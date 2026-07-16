// Display copy for the recommendation quiz. Purely presentational — option
// values here must match the keys the scoring engine expects (see
// lib/scoring/campaign-scoring.json), but labels/order/helper text are free
// to change without touching the engine.
import type { QuizAnswers } from "@/lib/scoring/types";

export interface QuizOption {
  value: string;
  label: string;
}

interface QuestionBase {
  key: keyof Pick<
    QuizAnswers,
    | "primary_goal"
    | "business_type"
    | "business_stage"
    | "biggest_challenge"
    | "marketing_experience"
    | "monthly_budget"
    | "timeline"
    | "primary_kpi"
    | "current_channels"
    | "missing_assets"
  >;
  /** Short label for the step indicator pill. */
  short: string;
  /** Full question copy shown on the step itself. */
  label: string;
  helper?: string;
  options: QuizOption[];
}

export interface SingleQuestionDef extends QuestionBase {
  type: "single";
}

export interface MultiQuestionDef extends QuestionBase {
  type: "multi";
}

export type QuestionDef = SingleQuestionDef | MultiQuestionDef;

export const QUIZ_QUESTIONS: QuestionDef[] = [
  {
    key: "primary_goal",
    type: "single",
    short: "Goal",
    label: "What's your primary business goal right now?",
    options: [
      { value: "increase_revenue", label: "Increase overall revenue" },
      { value: "generate_more_leads", label: "Generate more leads" },
      { value: "launch_new_product", label: "Launch a new product" },
      { value: "increase_brand_awareness", label: "Increase brand awareness" },
      { value: "grow_organic_traffic", label: "Grow organic traffic" },
      { value: "increase_repeat_purchases", label: "Increase repeat purchases" },
      { value: "reduce_cac", label: "Reduce customer acquisition cost" },
      { value: "improve_conversion_rate", label: "Improve conversion rate" },
    ],
  },
  {
    key: "business_type",
    type: "single",
    short: "Business",
    label: "What type of business are you running?",
    options: [
      { value: "d2c", label: "D2C / eCommerce" },
      { value: "b2b_services", label: "B2B Services" },
      { value: "saas", label: "SaaS" },
      { value: "marketplace", label: "Marketplace" },
      { value: "hospitality", label: "Hospitality" },
      { value: "healthcare", label: "Healthcare" },
      { value: "retail", label: "Retail" },
    ],
  },
  {
    key: "business_stage",
    type: "single",
    short: "Stage",
    label: "What stage is the business at?",
    options: [
      { value: "startup", label: "Startup" },
      { value: "growing", label: "Growing" },
      { value: "scaling", label: "Scaling" },
      { value: "enterprise", label: "Enterprise" },
    ],
  },
  {
    key: "biggest_challenge",
    type: "single",
    short: "Challenge",
    label: "What's the biggest challenge you're facing?",
    options: [
      { value: "not_enough_visitors", label: "Not enough visitors / traffic" },
      { value: "visitors_dont_convert", label: "Visitors don't convert" },
      { value: "leads_dont_respond", label: "Leads don't respond" },
      { value: "sales_cycle_too_long", label: "Sales cycle is too long" },
      { value: "customers_dont_return", label: "Customers don't come back" },
      { value: "organic_traffic_poor", label: "Organic traffic is poor" },
      { value: "ads_not_profitable", label: "Ads aren't profitable" },
    ],
  },
  {
    key: "marketing_experience",
    type: "single",
    short: "Experience",
    label: "What's your marketing experience so far?",
    options: [
      { value: "never", label: "Never run marketing before" },
      { value: "agency", label: "Worked with an agency" },
      { value: "in_house", label: "Have an in-house team" },
    ],
  },
  {
    key: "monthly_budget",
    type: "single",
    short: "Budget",
    label: "What's your monthly marketing budget?",
    options: [
      { value: "below_500", label: "Below $500 / mo" },
      { value: "500_2k", label: "$500 – $2k / mo" },
      { value: "2k_5k", label: "$2k – $5k / mo" },
      { value: "5k_20k", label: "$5k – $20k / mo" },
      { value: "above_20k", label: "Above $20k / mo" },
    ],
  },
  {
    key: "timeline",
    type: "single",
    short: "Timeline",
    label: "How soon do you need results?",
    options: [
      { value: "immediate", label: "Immediate (ASAP)" },
      { value: "30_days", label: "Within 30 days" },
      { value: "90_days", label: "Within 90 days" },
      { value: "long_term", label: "Long-term (6+ months)" },
    ],
  },
  {
    key: "primary_kpi",
    type: "single",
    short: "KPI",
    label: "Which metric matters most to you?",
    options: [
      { value: "revenue", label: "Revenue" },
      { value: "roas", label: "ROAS" },
      { value: "pipeline", label: "Pipeline / meetings booked" },
      { value: "traffic", label: "Website traffic" },
      { value: "followers", label: "Social followers" },
      { value: "retention", label: "Retention rate" },
    ],
  },
  {
    key: "current_channels",
    type: "multi",
    short: "Channels",
    label: "Which acquisition channels are you currently using?",
    helper: "Select all that apply, or \"None yet\" if you're starting from scratch.",
    options: [
      { value: "paid_ads", label: "Paid Ads" },
      { value: "organic", label: "Organic / Content" },
      { value: "referrals", label: "Referrals" },
      { value: "none", label: "None yet — starting from scratch" },
    ],
  },
  {
    key: "missing_assets",
    type: "multi",
    short: "Assets",
    label: "Which of these are you currently missing?",
    helper: "Select anything you don't have yet — it's fine if none apply.",
    options: [
      { value: "missing_website", label: "A website" },
      { value: "missing_crm", label: "A CRM" },
      { value: "missing_analytics", label: "Analytics set up" },
      { value: "missing_brand_guidelines", label: "Brand guidelines" },
    ],
  },
];
