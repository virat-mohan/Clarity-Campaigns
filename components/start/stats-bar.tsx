const STATS = [
  { value: "$499", label: "fixed" },
  { value: "3 days", label: "to live" },
  { value: "5", label: "campaign types" },
  { value: "0", label: "retainers needed" },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {STATS.map((stat) => (
        <div key={stat.label} className="rounded-[var(--radius-card)] border border-border bg-card px-4 py-3 text-center">
          <div className="font-heading text-xl font-semibold text-primary">{stat.value}</div>
          <div className="font-mono text-[9.5px] uppercase tracking-wide text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
