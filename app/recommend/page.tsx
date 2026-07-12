"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/lib/store/quiz-store";
import { QUIZ_QUESTIONS } from "@/lib/quiz/quiz-questions";
import { StepIndicator, type WizardStep } from "@/components/step-indicator";
import { QuizQuestionStep } from "@/components/quiz/quiz-question-step";
import { ReadinessStep } from "@/components/quiz/readiness-step";
import { RecommendationCard } from "@/components/quiz/recommendation-card";
import { RoadmapTimeline } from "@/components/quiz/roadmap-timeline";
import { TalkToUsCta } from "@/components/talk-to-us-cta";
import { Button } from "@/components/ui/button";
import { calculateReadiness, getRecommendations, getRoadmap } from "@/lib/scoring/recommendation-engine";
import type { QuizAnswers } from "@/lib/scoring/types";

const READINESS_STEP_KEY = "readiness";
const RESULTS_STEP_KEY = "results";

export default function RecommendPage() {
  const router = useRouter();
  const answers = useQuizStore((s) => s.answers);
  const readiness = useQuizStore((s) => s.readiness);
  const stepIndex = useQuizStore((s) => s.stepIndex);
  const setAnswer = useQuizStore((s) => s.setAnswer);
  const toggleChannel = useQuizStore((s) => s.toggleChannel);
  const toggleMissingAsset = useQuizStore((s) => s.toggleMissingAsset);
  const setReadinessInput = useQuizStore((s) => s.setReadinessInput);
  const setStepIndex = useQuizStore((s) => s.setStepIndex);
  const reset = useQuizStore((s) => s.reset);

  const steps: WizardStep[] = useMemo(
    () => [
      ...QUIZ_QUESTIONS.map((q) => ({ key: q.key, label: q.short })),
      { key: READINESS_STEP_KEY, label: "Readiness" },
      { key: RESULTS_STEP_KEY, label: "Results" },
    ],
    []
  );

  const readinessResult = useMemo(() => calculateReadiness(readiness), [readiness]);
  const recommendations = useMemo(() => getRecommendations(answers), [answers]);
  const roadmap = useMemo(() => getRoadmap(answers), [answers]);

  const isQuestionStep = stepIndex < QUIZ_QUESTIONS.length;
  const isReadinessStep = stepIndex === QUIZ_QUESTIONS.length;
  const isResultsStep = stepIndex === steps.length - 1;
  const currentQuestion = isQuestionStep ? QUIZ_QUESTIONS[stepIndex] : null;

  const canAdvance = currentQuestion
    ? currentQuestion.type === "single"
      ? Boolean(answers[currentQuestion.key])
      : true
    : true;

  function goNext() {
    setStepIndex(Math.min(stepIndex + 1, steps.length - 1));
  }
  function goBack() {
    setStepIndex(Math.max(stepIndex - 1, 0));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label text-[10px] text-primary mb-1">Not sure which campaign you need?</div>
        <h1 className="font-heading text-2xl font-semibold">Find your campaign</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Answer a few questions about your business and we&apos;ll recommend the campaign types most likely to
          move the needle.
        </p>
      </div>

      <StepIndicator steps={steps} activeIndex={stepIndex} onStepClick={(i) => setStepIndex(i)} />

      <div className="mb-8">
        {currentQuestion && (
          <QuizQuestionStep
            question={currentQuestion}
            value={answers[currentQuestion.key as keyof QuizAnswers] as string | string[] | undefined}
            onSelectSingle={(value) => setAnswer(currentQuestion.key, value)}
            onToggleMulti={(value) =>
              currentQuestion.key === "current_channels" ? toggleChannel(value) : toggleMissingAsset(value)
            }
          />
        )}

        {isReadinessStep && (
          <ReadinessStep inputs={readiness} result={readinessResult} onToggle={setReadinessInput} />
        )}

        {isResultsStep && (
          <div className="flex flex-col gap-8">
            <div>
              <div className="font-mono-label text-[9.5px] text-primary-hover mb-3">Top recommendations</div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {recommendations.top.map((rec) => (
                  <RecommendationCard
                    key={rec.campaign}
                    recommendation={rec}
                    confidenceLabel={rec.rank === 1 ? recommendations.confidenceLabel : undefined}
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="font-mono-label text-[9.5px] text-primary-hover mb-3">Your roadmap</div>
              <RoadmapTimeline steps={roadmap} />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border pt-5">
        <Button variant="outline" onClick={goBack} disabled={stepIndex === 0}>Back</Button>
        <TalkToUsCta variant="inline" />
        {!isResultsStep ? (
          <Button onClick={goNext} disabled={!canAdvance}>Next</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={reset}>Start over</Button>
            <Button onClick={() => router.push("/")}>Back to marketplace</Button>
          </div>
        )}
      </div>
    </div>
  );
}
