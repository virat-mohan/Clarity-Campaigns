"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { QuestionDef } from "@/lib/quiz/quiz-questions";

export function QuizQuestionStep({
  question,
  value,
  onSelectSingle,
  onToggleMulti,
}: {
  question: QuestionDef;
  value: string | string[] | undefined;
  onSelectSingle: (value: string) => void;
  onToggleMulti: (value: string) => void;
}) {
  const isMulti = question.type === "multi";
  const selectedMulti = isMulti ? ((value as string[]) ?? []) : [];

  return (
    <Card className="bg-paper border-paper-border text-paper-foreground">
      <CardContent className="pt-5">
        <div className="font-mono-label text-[9.5px] text-primary-hover mb-1">
          {isMulti ? "Select all that apply" : "Select one"}
        </div>
        <h2 className="font-heading text-lg font-semibold mb-1">{question.label}</h2>
        {question.helper && (
          <p className="text-[12.5px] text-muted-foreground-2 mb-3">{question.helper}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {question.options.map((opt) => {
            const isSelected = isMulti ? selectedMulti.includes(opt.value) : value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => (isMulti ? onToggleMulti(opt.value) : onSelectSingle(opt.value))}
                className={cn(
                  "font-mono text-[11px] px-3 py-2 rounded-full border transition-colors text-left",
                  isSelected
                    ? "bg-paper-foreground text-paper border-paper-foreground"
                    : "bg-transparent text-muted-foreground-2 border-paper-border hover:border-primary-hover"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
