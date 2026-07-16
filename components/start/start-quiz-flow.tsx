"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/lib/store/quiz-store";
import { useStartFlowStore } from "@/lib/store/start-flow-store";
import { START_QUIZ_QUESTIONS } from "@/lib/quiz/start-quiz-questions";
import { CAMPAIGN_ID_TO_SKU } from "@/lib/quiz/campaign-sku-map";
import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { SKU_TO_SLUG } from "@/lib/data/campaign-flow-copy";
import { getRecommendations, getStartFlowRoadmap } from "@/lib/scoring/recommendation-engine";
import { QuizLandingHero } from "@/components/start/quiz-landing-hero";
import { StartRecCard } from "@/components/start/start-rec-card";
import { TalkToUsCta } from "@/components/talk-to-us-cta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function StartQuizFlow() {
  const router = useRouter();
  const answers = useQuizStore((s) => s.answers);
  const stepIndex = useQuizStore((s) => s.stepIndex);
  const websiteUrl = useQuizStore((s) => s.websiteUrl);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const setStepIndex = useQuizStore((s) => s.setStepIndex);
  const setWebsiteUrl = useQuizStore((s) => s.setWebsiteUrl);
  const reset = useQuizStore((s) => s.reset);
  const updateBrandBasics = useStartFlowStore((s) => s.updateBrandBasics);
  const setSelectedSku = useStartFlowStore((s) => s.setSelectedSku);

  const totalSteps = START_QUIZ_QUESTIONS.length + 1; // + website
  const isQuestionStep = stepIndex < START_QUIZ_QUESTIONS.length;
  const isWebsiteStep = stepIndex === START_QUIZ_QUESTIONS.length;
  const isResultsStep = stepIndex > START_QUIZ_QUESTIONS.length;
  const currentQuestion = isQuestionStep ? START_QUIZ_QUESTIONS[stepIndex] : null;

  const recommendations = useMemo(() => getRecommendations(answers), [answers]);
  const roadmap = useMemo(() => getStartFlowRoadmap(answers), [answers]);

  function pickAndAdvance(key: (typeof START_QUIZ_QUESTIONS)[number]["key"], value: string) {
    setAnswer(key, value);
    setStepIndex(stepIndex + 1);
    window.scrollTo(0, 0);
  }

  function goBack() {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
      window.scrollTo(0, 0);
    }
  }

  function goToResults() {
    if (websiteUrl.trim()) {
      updateBrandBasics({ website: websiteUrl.trim() });
    }
    setStepIndex(START_QUIZ_QUESTIONS.length + 1);
    window.scrollTo(0, 0);
  }

  function startCampaign(sku: Parameters<typeof setSelectedSku>[0]) {
    setSelectedSku(sku);
    router.push(`/start/brief?type=${SKU_TO_SLUG[sku]}`);
  }

  function retake() {
    reset();
    window.scrollTo(0, 0);
  }

  const stepPills = (
    <div className="mb-[18px] flex flex-wrap gap-1.5">
      {START_QUIZ_QUESTIONS.map((q, i) => (
        <span
          key={q.key}
          className={cn(
            "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em]",
            i < stepIndex
              ? "border-secondary/50 text-secondary"
              : i === stepIndex
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground-2"
          )}
        >
          {q.short}
        </span>
      ))}
      <span
        className={cn(
          "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.06em]",
          stepIndex > START_QUIZ_QUESTIONS.length
            ? "border-secondary/50 text-secondary"
            : stepIndex === START_QUIZ_QUESTIONS.length
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground-2"
        )}
      >
        Website
      </span>
    </div>
  );

  if (isResultsStep) {
    const scoreSum = recommendations.top.reduce((a, r) => a + Math.max(r.score, 0), 0);

    return (
      <div className="mx-auto max-w-3xl px-4 pb-12 pt-9">
        <div className="mb-6 border-b border-border pb-4">
          <div className="font-mono-label mb-1 text-[10px] text-primary">
            Your recommendation · {recommendations.confidenceLabel}
          </div>
          <h1 className="font-heading text-2xl font-semibold">Here&apos;s where to start</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Scored from your answers across {START_QUIZ_QUESTIONS.length} questions. Top match first, with two strong
            alternatives.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3">
          {recommendations.top.map((rec, i) => {
            const sku = CAMPAIGN_ID_TO_SKU[rec.campaign];
            const matchPct =
              scoreSum > 0 ? Math.round((Math.max(rec.score, 0) / scoreSum) * 100) : 0;
            return (
              <StartRecCard
                key={rec.campaign}
                sku={sku}
                isTop={i === 0}
                matchPct={matchPct}
                onStart={() => startCampaign(sku)}
              />
            );
          })}
        </div>

        <div className="mb-4">
          <div className="font-mono-label mb-3 text-[9.5px] text-muted-foreground">Suggested roadmap</div>
          <div className="rounded-[var(--radius-card)] border border-border bg-card p-5">
            <p className="mb-3.5 text-[12px] text-muted-foreground">
              Your best match runs first — pick a longer plan to bundle in the next-best campaigns at a discount.
            </p>
            {roadmap.map((step, i) => {
              const sku = CAMPAIGN_ID_TO_SKU[step.campaign];
              const stageCap = step.stage.charAt(0).toUpperCase() + step.stage.slice(1);
              return (
                <div key={step.campaign} className="flex items-start gap-3 pb-3.5">
                  <div className="grid h-7 w-7 flex-none place-items-center rounded-full border border-border-strong font-mono text-[9px] font-semibold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 border-b border-border pb-3">
                    <div className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-muted-foreground-2">
                      {step.monthLabel} · {stageCap}
                    </div>
                    <div className="text-[13px] font-semibold">{CAMPAIGN_TYPES[sku].label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-border pt-[18px]">
          <Button variant="outline" onClick={retake}>
            ↺ Retake quiz
          </Button>
          <TalkToUsCta variant="inline" />
        </div>
      </div>
    );
  }

  if (isWebsiteStep) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-12 pt-9">
        <div className="font-mono-label mb-2.5 text-[10px] text-primary">
          Find your campaign · Step {totalSteps} of {totalSteps}
        </div>
        {stepPills}
        <h1 className="font-heading mb-1 text-[22px] font-semibold">
          Website URL{" "}
          <span className="text-[14px] font-normal text-muted-foreground-2">(optional)</span>
        </h1>
        <p className="mb-4 text-[12px] text-muted-foreground-2">
          No login required. If you&apos;ve already run a Brand X-Ray, we&apos;ll use that context automatically.
        </p>
        <Input
          placeholder="https://yourbrand.com"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
        />
        <div className="mt-[18px] flex items-center justify-between">
          <Button variant="outline" onClick={goBack}>
            ← Back
          </Button>
          <Button onClick={goToResults}>See my results →</Button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <>
      {stepIndex === 0 && <QuizLandingHero />}
      <div className="mx-auto max-w-3xl px-4 pb-12 pt-9">
        <div className="font-mono-label mb-2.5 text-[10px] text-primary">
          Find your campaign · Step {stepIndex + 1} of {totalSteps}
        </div>
        {stepPills}
        <h1 className="font-heading mb-1 text-[22px] font-semibold">{currentQuestion.label}</h1>
        {currentQuestion.helper ? (
          <p className="mb-4 text-[12px] text-muted-foreground-2">{currentQuestion.helper}</p>
        ) : (
          <div className="h-3" />
        )}
        <div>
          {currentQuestion.options.map((opt) => {
            const selected = answers[currentQuestion.key] === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => pickAndAdvance(currentQuestion.key, opt.value)}
                className={cn(
                  "mb-2 flex w-full items-center justify-between gap-2.5 rounded-[var(--radius)] border border-border-strong bg-card px-3.5 py-3 text-left text-[13px] font-medium text-foreground transition-colors hover:border-primary",
                  selected && "border-primary bg-primary/12 text-primary"
                )}
              >
                <span>{opt.label}</span>
                <span className={cn("font-bold text-primary", selected ? "opacity-100" : "opacity-0")}>✓</span>
              </button>
            );
          })}
        </div>
        <div className="mt-[18px] flex items-center justify-between">
          <Button variant="outline" onClick={goBack} disabled={stepIndex === 0}>
            ← Back
          </Button>
          <span className="text-[11px] text-muted-foreground-2">Pick one to continue</span>
        </div>
      </div>
    </>
  );
}
