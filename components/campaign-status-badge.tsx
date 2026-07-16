import { CampaignStatus } from "@/lib/store/campaign-store";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<CampaignStatus, { label: string; cls: string }> = {
  draft:           { label: "Draft",          cls: "bg-muted text-muted-foreground-2 border-border" },
  "proposal-sent": { label: "Proposal Sent",  cls: "bg-primary/10 text-primary border-primary/30" },
  active:          { label: "Active",         cls: "bg-secondary/10 text-secondary border-secondary/30" },
  reporting:       { label: "Reporting",      cls: "bg-amber-50 text-amber-700 border-amber-200" },
  completed:       { label: "Completed",      cls: "bg-muted text-foreground border-border-strong" },
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const { label, cls } = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={cn("font-mono text-[9.5px] px-2 py-0.5 rounded-[3px] border", cls)}>
      {label}
    </span>
  );
}
