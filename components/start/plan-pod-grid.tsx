import type { HumanPodRole } from "@/lib/data/campaign-plan-details";

// Static read-only view, styled after components/pod-display.tsx's card
// look (paper background, primary accent) — that component's editing/
// assignment logic is wired to the old cost-plus store and isn't reused here.
export function PlanPodGrid({ pod }: { pod: HumanPodRole[] }) {
  const totalHours = pod.reduce((sum, r) => sum + r.hours, 0);

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {pod.map((row) => (
          <div
            key={row.role}
            className="flex items-center justify-between rounded-[4px] border-l-2 border-primary bg-paper px-3 py-2.5"
          >
            <span className="text-[12.5px] font-semibold text-paper-foreground">{row.role}</span>
            <span className="font-mono text-[11px] text-muted-foreground-2">{row.hours} hrs</span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-right font-mono text-[11px] text-muted-foreground">{totalHours} hrs total</div>
    </div>
  );
}
