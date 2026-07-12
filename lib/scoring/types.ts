// Types for the campaign recommendation engine.
// Keep these in sync with the shape of campaign-scoring.json — if you add a
// question or a campaign there, the types below generally don't need to change
// since they're intentionally kept loose (Record<string, number>) so the JSON
// stays the single source of truth.

export type CampaignId =
  | "performance_marketing"
  | "outbound_sales"
  | "social_organic"
  | "seo_aeo"
  | "customer_retention";

export type FlywheelStage = "acquisition" | "conversion" | "retention";

/** Points awarded to each campaign for a given answer. Missing keys = 0. */
export type WeightMap = Partial<Record<CampaignId, number>>;

/**
 * The answers a user gives in the quiz. Extend this as new questions are added —
 * the engine reads whichever keys are present and ignores the rest, so partial
 * answers (e.g. a user drops off halfway) still produce a valid, if less
 * confident, recommendation.
 */
export interface QuizAnswers {
  primary_goal?: string;
  business_type?: string;
  business_stage?: string;
  biggest_challenge?: string;
  marketing_experience?: string;
  monthly_budget?: string;
  timeline?: string;
  primary_kpi?: string;
  /** Multi-select. Subset of ["paid_ads", "organic", "referrals"], or [] / ["none"] for "no marketing yet". */
  current_channels?: string[];
  /** Multi-select of assets the business is MISSING, e.g. ["missing_website", "missing_crm"]. */
  missing_assets?: string[];
}

/**
 * Which assets the business actually HAS, used only for the Readiness Score
 * (separate from missing_assets above, which only drives the small set of
 * score penalties the spec calls out explicitly).
 */
export type ReadinessComponentId =
  | "website"
  | "brand_guidelines"
  | "crm"
  | "analytics"
  | "tracking_pixel"
  | "creative_assets"
  | "product_catalogue"
  | "marketing_automation";

export type ReadinessInputs = Partial<Record<ReadinessComponentId, boolean>>;

export interface ReadinessResult {
  overall: number; // 0-100
  max: number; // 100
  components: Array<{
    id: ReadinessComponentId;
    label: string;
    points: number;
    maxPoints: number;
    present: boolean;
  }>;
}

export interface ScoredCampaign {
  id: CampaignId;
  score: number; // raw, can be negative after asset penalties
}

export interface Recommendation {
  campaign: CampaignId;
  score: number;
  rank: 1 | 2 | 3;
}

export interface RecommendationResult {
  top: Recommendation[]; // up to 3, sorted by score desc
  /** highest score / sum of top three scores. See note in engine.ts about the
   * spec's own worked example being internally inconsistent (41% vs "92% Match"). */
  confidence: number; // 0-1
  confidenceLabel: string; // e.g. "41% Match"
  allScores: ScoredCampaign[]; // every campaign, for debugging / admin views
}

export interface RoadmapStep {
  stage: FlywheelStage;
  campaign: CampaignId;
  monthLabel: string; // "Month 1", "Month 2", ...
}
