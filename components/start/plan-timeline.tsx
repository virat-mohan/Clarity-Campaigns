import type { WeeklyProcessStep } from "@/lib/data/campaign-plan-details";
import { Card, CardContent } from "@/components/ui/card";

// Visual style mirrors components/timeline.tsx's sprint cards (header bar +
// content), adapted for the brief's Section 4 "4-Week Sprint Process" shape
// (title + description per week, no per-step role/day breakdown).
export function PlanTimeline({ steps }: { steps: WeeklyProcessStep[] }) {
  return (
    <div className="flex flex-col gap-3">
      {steps.map((step) => (
        <Card key={step.week}>
          <div className="flex items-center justify-between border-b border-border bg-muted px-4 py-2">
            <span className="font-heading text-[13px] font-semibold">Week {step.week} — {step.title}</span>
          </div>
          <CardContent className="pt-3 pb-3">
            <p className="text-[12px] text-muted-foreground leading-snug">{step.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
