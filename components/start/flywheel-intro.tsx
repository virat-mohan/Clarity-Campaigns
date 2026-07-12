import { FlywheelDiagram } from "@/components/flywheel-diagram";

// Colour-coding reuses the app's existing amber/sage/coral stage palette
// (see components/sku-card.tsx STAGE_VARIANT) rather than the brief's literal
// "steel" for Retention, since that token doesn't exist in this design system
// and the rest of the app already codes Retention as coral — consistency wins.
const TILES = [
  {
    key: "acquisition",
    label: "Acquisition",
    colorClass: "text-primary",
    borderClass: "border-primary/30",
    body: "Build the audience and demand that don't exist yet — organic content, SEO, and AI-answer visibility.",
  },
  {
    key: "conversion",
    label: "Conversion",
    colorClass: "text-secondary",
    borderClass: "border-secondary/30",
    body: "Turn attention into pipeline and revenue — outbound sales and performance media.",
  },
  {
    key: "retention",
    label: "Retention",
    colorClass: "text-destructive",
    borderClass: "border-destructive/30",
    body: "Protect and extend the revenue you've already earned — behavioural lifecycle flows.",
  },
];

export function FlywheelIntro() {
  return (
    <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[380px_1fr]">
      <div className="mx-auto w-full max-w-[320px]">
        <FlywheelDiagram />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {TILES.map((tile) => (
          <div key={tile.key} className={`rounded-[var(--radius-card)] border ${tile.borderClass} bg-card p-4`}>
            <div className={`font-mono-label text-[9px] ${tile.colorClass} mb-1.5`}>{tile.label}</div>
            <p className="text-[12px] text-muted-foreground leading-snug">{tile.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
