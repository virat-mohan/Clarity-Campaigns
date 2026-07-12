"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { READINESS_QUESTIONS } from "@/lib/quiz/readiness-questions";
import type { ReadinessInputs, ReadinessResult } from "@/lib/scoring/types";

export function ReadinessStep({
  inputs,
  result,
  onToggle,
}: {
  inputs: ReadinessInputs;
  result: ReadinessResult;
  onToggle: (id: keyof ReadinessInputs, value: boolean) => void;
}) {
  return (
    <Card className="bg-paper border-paper-border text-paper-foreground">
      <CardContent className="pt-5">
        <div className="font-mono-label text-[9.5px] text-primary-hover mb-1">Before we recommend</div>
        <h2 className="font-heading text-lg font-semibold mb-1">What do you already have in place?</h2>
        <p className="text-[12.5px] text-muted-foreground-2 mb-4">
          Checking these off doesn&apos;t change your recommendation — it scores how ready you are to launch it.
        </p>

        <div className="mb-5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted-foreground-2">Readiness score</span>
            <span className="font-heading text-lg font-semibold text-primary">
              {result.overall} / {result.max}
            </span>
          </div>
          <Progress value={result.overall} />
        </div>

        <div className="flex flex-col gap-2.5">
          {READINESS_QUESTIONS.map((q) => {
            const checked = Boolean(inputs[q.id]);
            const maxPoints = result.components.find((c) => c.id === q.id)?.maxPoints ?? 0;
            return (
              <label
                key={q.id}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-[4px] border border-paper-border bg-paper px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <Checkbox checked={checked} onCheckedChange={(v) => onToggle(q.id, Boolean(v))} />
                  <div>
                    <div className="text-[12.5px] font-semibold text-paper-foreground">{q.label}</div>
                    <p className="text-[10.5px] text-muted-foreground-2">{q.helper}</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground-2">+{maxPoints}</span>
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
