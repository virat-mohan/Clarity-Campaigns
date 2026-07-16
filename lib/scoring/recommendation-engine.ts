import scoringConfig from "./campaign-scoring.json";
import type {
  CampaignId,
  QuizAnswers,
  ReadinessInputs,
  ReadinessResult,
  RecommendationResult,
  RoadmapStep,
  ScoredCampaign,
  WeightMap,
} from "./types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const CAMPAIGNS = scoringConfig.campaigns as CampaignId[];

function emptyScoreMap(): Record<CampaignId, number> {
  return CAMPAIGNS.reduce((acc, id) => {
    acc[id] = 0;
    return acc;
  }, {} as Record<CampaignId, number>);
}

function addWeights(target: Record<CampaignId, number>, weights: WeightMap | undefined) {
  if (!weights) return;
  for (const [campaignId, points] of Object.entries(weights)) {
    if (campaignId in target) {
      target[campaignId as CampaignId] += points as number;
    }
  }
}

/**
 * Q5 (current_channels) is the one question the spec doesn't define a clean
 * formula for — see the "_description" note next to `current_channels` in
 * campaign-scoring.json. This resolves an answer to one of the explicitly
 * documented combinations, or a neutral (all-zero) result otherwise.
 */
function resolveChannelWeights(selected: string[] | undefined): WeightMap {
  const q = scoringConfig.questions.current_channels;
  const combos = q.explicitCombinations as Record<string, WeightMap>;

  const clean = (selected ?? []).filter((c) => c !== "none");
  if (clean.length === 0) return combos.none ?? {};
  if (clean.length === 1) {
    const only = clean[0];
    if (only && combos[only]) return combos[only];
  }

  // Undocumented multi-channel combination (e.g. paid_ads + referrals together).
  // Deliberately neutral rather than guessing — flag to product owner and add
  // a worked example + explicit entry above once the real answer is known.
  return {};
}

/**
 * Applies the Q8 asset penalties that are meant to affect the RECOMMENDATION
 * score. missing_brand_guidelines is intentionally excluded here — per the
 * spec it should only affect the Readiness Score, not campaign scores.
 */
function resolveAssetScorePenalties(missingAssets: string[] | undefined): WeightMap {
  const penalties = scoringConfig.questions.assets_available.scorePenalties as Record<string, WeightMap>;
  const result: WeightMap = {};
  for (const assetKey of missingAssets ?? []) {
    const penalty = penalties[assetKey];
    if (!penalty) continue; // e.g. missing_brand_guidelines — readiness-only, skip here
    for (const [campaignId, points] of Object.entries(penalty)) {
      result[campaignId as CampaignId] = (result[campaignId as CampaignId] ?? 0) + (points as number);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// 1. calculateScores
// ---------------------------------------------------------------------------

/**
 * Runs every answered question's weights through the scoring config and
 * returns a raw score per campaign. Unanswered questions simply contribute
 * nothing — partial quiz completion still produces a valid result.
 */
export function calculateScores(answers: QuizAnswers): Record<CampaignId, number> {
  const scores = emptyScoreMap();
  const questions = scoringConfig.questions as unknown as Record<string, { options: Record<string, WeightMap> }>;

  const singleAnswerQuestions: Array<keyof QuizAnswers> = [
    "primary_goal",
    "business_type",
    "business_stage",
    "biggest_challenge",
    "marketing_experience",
    "monthly_budget",
    "timeline",
    "primary_kpi",
  ];

  for (const key of singleAnswerQuestions) {
    const answerValue = answers[key] as string | undefined;
    if (!answerValue) continue;
    const question = questions[key as string];
    const weights: WeightMap | undefined = question?.options?.[answerValue];
    addWeights(scores, weights);
  }

  addWeights(scores, resolveChannelWeights(answers.current_channels));
  addWeights(scores, resolveAssetScorePenalties(answers.missing_assets));

  return scores;
}

// ---------------------------------------------------------------------------
// 2. calculateReadiness
// ---------------------------------------------------------------------------

const READINESS_LABELS: Record<string, string> = {
  website: "Website",
  brand_guidelines: "Brand Guidelines",
  crm: "CRM",
  analytics: "Analytics",
  tracking_pixel: "Tracking Pixel",
  creative_assets: "Creative Assets",
  product_catalogue: "Product Catalogue",
  marketing_automation: "Marketing Automation",
};

/**
 * Readiness is calculated separately from campaign scores (per spec).
 * `inputs` should reflect what the business actually HAS; missing components
 * simply don't contribute their points. missing_brand_guidelines (from Q8, if
 * you want the quiz answer to double as a readiness input) reduces readiness
 * directly rather than the recommendation score.
 */
export function calculateReadiness(inputs: ReadinessInputs): ReadinessResult {
  const components = scoringConfig.readiness.components as Record<string, number>;
  const rows = Object.entries(components).map(([id, maxPoints]) => {
    const present = Boolean(inputs[id as keyof ReadinessInputs]);
    return {
      id: id as ReadinessResult["components"][number]["id"],
      label: READINESS_LABELS[id] ?? id,
      points: present ? maxPoints : 0,
      maxPoints,
      present,
    };
  });

  const overall = rows.reduce((sum, r) => sum + r.points, 0);

  return {
    overall,
    max: scoringConfig.readiness.maxScore,
    components: rows,
  };
}

// ---------------------------------------------------------------------------
// 3. getRecommendations
// ---------------------------------------------------------------------------

/**
 * NOTE on confidence: the spec's own worked example computes
 * confidence = highest / (sum of top 3) = 82 / (82+60+55) = 41%, then says
 * "Display '92% Match'" for that same example — those two numbers don't
 * reconcile from the given inputs. This implements the literal formula
 * (41%-style) and labels it "X% Match". If a different display-side rescale
 * is actually wanted (e.g. stretching the 33%-100% possible range up to
 * 0-100%), that needs to be confirmed and can be added as a small transform
 * at the bottom of this function — it's isolated on purpose.
 */
export function getRecommendations(answers: QuizAnswers): RecommendationResult {
  const scores = calculateScores(answers);

  const allScores: ScoredCampaign[] = CAMPAIGNS
    .map((id) => ({ id, score: scores[id] }))
    .sort((a, b) => b.score - a.score);

  const top = allScores.slice(0, 3).map((s, i) => ({
    campaign: s.id,
    score: s.score,
    rank: (i + 1) as 1 | 2 | 3,
  }));

  const topThreeSum = top.reduce((sum, r) => sum + Math.max(r.score, 0), 0);
  const highest = Math.max(top[0]?.score ?? 0, 0);
  const confidence = topThreeSum > 0 ? highest / topThreeSum : 0;

  return {
    top,
    confidence,
    confidenceLabel: `${Math.round(confidence * 100)}% Match`,
    allScores,
  };
}

// ---------------------------------------------------------------------------
// 4. getRoadmap
// ---------------------------------------------------------------------------

/**
 * NOTE: the spec's worked roadmap example (Performance -> Retention -> SEO ->
 * Social) doesn't actually follow its own stated rule (Acquire -> Convert ->
 * Retain), since Performance Marketing is a Conversion-stage campaign, not
 * Acquisition. This implements the STATED rule using flywheelStage from the
 * config, picking the best-scoring campaign within each stage in turn. Flag
 * the example to the spec author if a different literal order was intended.
 */
export function getRoadmap(answers: QuizAnswers): RoadmapStep[] {
  const scores = calculateScores(answers);
  const stageOrder = scoringConfig.roadmap.stageOrder as Array<"acquisition" | "conversion" | "retention">;
  const flywheelStage = scoringConfig.flywheelStage as Record<CampaignId, "acquisition" | "conversion" | "retention">;

  const steps: RoadmapStep[] = [];
  let month = 1;

  for (const stage of stageOrder) {
    const campaignsInStage = CAMPAIGNS
      .filter((id) => flywheelStage[id] === stage)
      .sort((a, b) => scores[b] - scores[a]);

    for (const campaign of campaignsInStage) {
      steps.push({
        stage,
        campaign,
        monthLabel: `Month ${month}`,
      });
      month += 1;
    }
  }

  return steps;
}

/**
 * Start-flow roadmap used on /start results + plan/pay duration bundles.
 * Orders by quiz top matches (not flywheel stage order), optionally locking
 * the selected SKU as Month 1 — matches the HTML demo behaviour.
 */
export function getStartFlowRoadmap(
  answers: QuizAnswers,
  selectedCampaignId?: CampaignId
): RoadmapStep[] {
  const rec = getRecommendations(answers);
  const flywheelStage = scoringConfig.flywheelStage as Record<CampaignId, "acquisition" | "conversion" | "retention">;
  let ordered = rec.top.map((r) => r.campaign);
  if (selectedCampaignId) {
    ordered = [selectedCampaignId, ...ordered.filter((id) => id !== selectedCampaignId)];
  }
  return ordered.slice(0, 3).map((campaign, i) => ({
    stage: flywheelStage[campaign],
    campaign,
    monthLabel: `Month ${i + 1}`,
  }));
}
