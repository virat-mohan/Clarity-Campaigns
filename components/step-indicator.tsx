import { cn } from "@/lib/utils";

export interface WizardStep {
  key: string;
  label: string;
}

export function StepIndicator({
  steps,
  activeIndex,
  onStepClick,
}: {
  steps: WizardStep[];
  activeIndex: number;
  onStepClick?: (index: number) => void;
}) {
  return (
    <div className="flex items-start gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.key} className="relative flex-1 text-center">
          {i > 0 && (
            <div
              className={cn(
                "absolute top-[11px] right-1/2 h-0.5 w-full -z-10",
                i <= activeIndex ? "bg-secondary" : "bg-border-strong"
              )}
            />
          )}
          <button
            type="button"
            onClick={() => onStepClick?.(i)}
            className={cn(
              "mx-auto mb-1 flex h-[24px] w-[24px] items-center justify-center rounded-full font-mono text-[10px] transition-opacity",
              onStepClick ? "cursor-pointer hover:opacity-75" : "cursor-default",
              i < activeIndex && "bg-secondary text-primary-foreground",
              i === activeIndex && "bg-primary text-primary-foreground",
              i > activeIndex && "bg-muted border border-border-strong text-muted-foreground"
            )}
          >
            {i + 1}
          </button>
          <div
            className={cn(
              "text-[9.5px] font-medium tracking-wide",
              i <= activeIndex ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {step.label}
          </div>
        </div>
      ))}
    </div>
  );
}
