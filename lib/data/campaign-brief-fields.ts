// Screen 2 "Section 3 — Campaign-specific fields: varies by campaign type" per
// the brief only points at Section 4's process/deliverables — it doesn't name
// literal form fields. These are inferred from what each campaign type's
// process actually needs to kick off (see Section 4 "Week 1" steps per SKU),
// kept optional per the brief's validation rule. Confirm with product before
// these drive delivery ops.
import type { SkuId } from "./campaign-types";

export interface BriefFieldOption {
  value: string;
  label: string;
}

export interface BriefFieldDef {
  id: string;
  label: string;
  type: "text" | "textarea" | "number" | "select";
  placeholder?: string;
  options?: BriefFieldOption[];
}

export const CAMPAIGN_SPECIFIC_FIELDS: Record<SkuId, BriefFieldDef[]> = {
  social: [
    {
      id: "priority_platform",
      label: "Which platform matters most?",
      type: "select",
      options: [
        { value: "instagram", label: "Instagram" },
        { value: "linkedin", label: "LinkedIn" },
        { value: "x", label: "X (Twitter)" },
        { value: "youtube", label: "YouTube" },
        { value: "no_preference", label: "No preference" },
      ],
    },
    { id: "content_tone", label: "Tone of voice", type: "text", placeholder: "e.g. playful, expert, premium" },
    {
      id: "posting_frequency",
      label: "Preferred posting frequency",
      type: "select",
      options: [
        { value: "3_week", label: "3x / week" },
        { value: "5_week", label: "5x / week" },
        { value: "daily", label: "Daily" },
      ],
    },
  ],
  content: [
    { id: "target_keywords", label: "Target keywords or topics", type: "textarea", placeholder: "What should we rank for?" },
    { id: "existing_blog_url", label: "Existing blog URL (if any)", type: "text", placeholder: "https://" },
    {
      id: "content_frequency",
      label: "Articles per month you'd like",
      type: "select",
      options: [
        { value: "2", label: "2 articles" },
        { value: "4", label: "4 articles" },
        { value: "8", label: "8 articles" },
      ],
    },
  ],
  abm: [
    { id: "target_titles", label: "Target job titles / personas", type: "text", placeholder: "e.g. VP Marketing, Head of Growth" },
    { id: "deal_size", label: "Average deal size ($)", type: "number" },
    {
      id: "account_list_source",
      label: "Do you have an account list already?",
      type: "select",
      options: [
        { value: "have_list", label: "Yes, I have a list" },
        { value: "need_sourcing", label: "No, source it for me" },
      ],
    },
  ],
  performance: [
    {
      id: "ad_platform_preference",
      label: "Preferred ad platform",
      type: "select",
      options: [
        { value: "meta", label: "Meta" },
        { value: "google", label: "Google" },
        { value: "both", label: "Both" },
        { value: "no_preference", label: "No preference" },
      ],
    },
    { id: "landing_page_url", label: "Landing page URL", type: "text", placeholder: "https://" },
    { id: "target_cpa_roas", label: "Target CPA or ROAS (if known)", type: "text" },
  ],
  retention: [
    { id: "current_esp", label: "Current email/CRM platform", type: "text", placeholder: "e.g. Klaviyo, HubSpot, Mailchimp" },
    { id: "list_size", label: "Customer list size", type: "number" },
    { id: "repeat_purchase_rate", label: "Current repeat purchase rate (if known)", type: "text", placeholder: "e.g. 18%" },
  ],
};

export const MARKET_OPTIONS: BriefFieldOption[] = [
  { value: "IN", label: "India" },
  { value: "US", label: "United States" },
  { value: "AE", label: "UAE" },
  { value: "UK", label: "United Kingdom" },
  { value: "SG", label: "Singapore" },
];

export const PRIMARY_GOAL_OPTIONS: BriefFieldOption[] = [
  { value: "awareness", label: "Awareness" },
  { value: "lead_gen", label: "Lead gen" },
  { value: "direct_sales", label: "Direct sales" },
  { value: "retention", label: "Retention" },
  { value: "pipeline", label: "Pipeline" },
];
