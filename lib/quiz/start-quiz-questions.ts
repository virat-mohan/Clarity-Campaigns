// Short quiz used on /start (ported from the self-contained HTML demo).
// Option values must still match lib/scoring/campaign-scoring.json keys.
import type { QuizAnswers } from "@/lib/scoring/types";

export interface StartQuizOption {
  value: string;
  label: string;
}

export interface StartQuizQuestion {
  key: keyof Pick<QuizAnswers, "primary_goal" | "business_type" | "biggest_challenge" | "timeline">;
  type: "single";
  short: string;
  label: string;
  helper?: string;
  options: StartQuizOption[];
}

export const START_QUIZ_QUESTIONS: StartQuizQuestion[] = [
  {
    key: "primary_goal",
    type: "single",
    short: "Goal",
    label: "What do you want to achieve?",
    options: [
      { value: "increase_revenue", label: "Increase Revenue" },
      { value: "generate_more_leads", label: "Generate Leads" },
      { value: "increase_brand_awareness", label: "Build Brand" },
      { value: "launch_new_product", label: "Launch Product" },
      { value: "increase_repeat_purchases", label: "Improve Retention" },
      { value: "grow_organic_traffic", label: "Grow Organic" },
    ],
  },
  {
    key: "business_type",
    type: "single",
    short: "Business",
    label: "What best describes your business?",
    options: [
      { value: "d2c", label: "D2C" },
      { value: "saas", label: "SaaS" },
      { value: "b2b_services", label: "B2B" },
      { value: "hospitality", label: "Hospitality" },
      { value: "healthcare", label: "Healthcare" },
      { value: "marketplace", label: "Marketplace" },
    ],
  },
  {
    key: "biggest_challenge",
    type: "single",
    short: "Challenge",
    label: "What is your biggest growth challenge?",
    options: [
      { value: "not_enough_visitors", label: "No Traffic" },
      { value: "visitors_dont_convert", label: "Low Conversion" },
      { value: "leads_dont_respond", label: "Poor Lead Quality" },
      { value: "customers_dont_return", label: "Low Repeat Purchases" },
      { value: "organic_traffic_poor", label: "Weak Organic Presence" },
      { value: "ads_not_profitable", label: "High CAC" },
    ],
  },
  {
    key: "timeline",
    type: "single",
    short: "Timeline",
    label: "How quickly do you need results?",
    options: [
      { value: "immediate", label: "Immediately" },
      { value: "30_days", label: "30 Days" },
      { value: "90_days", label: "90 Days" },
      { value: "long_term", label: "Long Term" },
    ],
  },
];
