import { FlywheelDiagram } from "@/components/flywheel-diagram";

const TILES = [
  {
    key: "acquisition",
    label: "Acquisition",
    colorClass: "text-primary",
    body: "Build awareness and demand with content, SEO, and outreach that attract your ideal audience.",
  },
  {
    key: "conversion",
    label: "Conversion",
    colorClass: "text-secondary",
    body: "Turn interest into pipeline with offers, landing pages, and outbound sales that convert.",
  },
  {
    key: "retention",
    label: "Retention",
    colorClass: "text-destructive",
    body: "Protect revenue and expand it with onboarding, retention flows, and customer lifecycle campaigns.",
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
          <div key={tile.key}>
            <div className={`font-mono-label mb-1.5 text-[9px] ${tile.colorClass}`}>{tile.label}</div>
            <p className="text-[12px] leading-snug text-muted-foreground">{tile.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
