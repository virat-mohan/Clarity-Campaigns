"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCampaignStore, CampaignStatus } from "@/lib/store/campaign-store";
import { CAMPAIGN_TYPES } from "@/lib/data/campaign-types";
import { CampaignStatusBadge } from "@/components/campaign-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, ExternalLink, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_TABS: { value: "all" | CampaignStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "proposal-sent", label: "Proposal Sent" },
  { value: "active", label: "Active" },
  { value: "reporting", label: "Reporting" },
  { value: "completed", label: "Completed" },
];

export default function CampaignsPage() {
  const campaigns = useCampaignStore((s) => s.campaigns);
  const duplicateCampaign = useCampaignStore((s) => s.duplicateCampaign);
  const deleteCampaign = useCampaignStore((s) => s.deleteCampaign);
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | CampaignStatus>("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = filter === "all" ? campaigns : campaigns.filter((c) => c.status === filter);
  const sorted = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);

  function handleDuplicate(id: string) {
    const newId = duplicateCampaign(id);
    router.push(`/build/${newId}`);
  }

  function handleDelete(id: string) {
    if (deleting === id) {
      deleteCampaign(id);
      setDeleting(null);
    } else {
      setDeleting(id);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-start justify-between border-b border-border pb-4 gap-4">
        <div>
          <div className="font-mono-label text-[10px] text-primary mb-1">Campaign workspace</div>
          <h1 className="font-heading text-2xl font-semibold">My Campaigns</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} total
          </p>
        </div>
        {/* This page lists the old cost-plus flow's campaigns (useCampaignStore) — link into
            that builder specifically, not the new /start flow which uses a separate store. */}
        <Link href="/classic">
          <Button>+ New Campaign</Button>
        </Link>
      </div>

      <div className="flex gap-1.5 mb-6 flex-wrap">
        {STATUS_TABS.map((t) => {
          const count =
            t.value === "all"
              ? campaigns.length
              : campaigns.filter((c) => c.status === t.value).length;
          return (
            <button
              key={t.value}
              onClick={() => setFilter(t.value)}
              className={cn(
                "font-mono text-[10.5px] px-3 py-1.5 rounded-full border transition-colors",
                filter === t.value
                  ? "bg-primary/15 text-primary border-primary/50"
                  : "bg-transparent text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
              )}
            >
              {t.label}{" "}
              <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {sorted.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-[13px]">
          {filter === "all" ? (
            <>
              No campaigns yet.{" "}
              <Link href="/classic" className="text-primary underline underline-offset-2">
                Browse the marketplace
              </Link>{" "}
              to create one.
            </>
          ) : (
            `No ${filter} campaigns.`
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((c) => {
            const ct = CAMPAIGN_TYPES[c.sku];
            const isConfirmingDelete = deleting === c.id;
            return (
              <Card
                key={c.id}
                className={cn(
                  "hover:border-primary/40 transition-colors",
                  isConfirmingDelete && "border-destructive/40"
                )}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <CampaignStatusBadge status={c.status} />
                        <span className="font-mono text-[9.5px] text-primary px-1.5 py-0.5 rounded-[2px] bg-primary/10 border border-primary/25">
                          {ct.label}
                        </span>
                      </div>
                      <div className="font-heading text-[15px] font-semibold">
                        {c.config.name || (
                          <span className="text-muted-foreground font-normal">Untitled campaign</span>
                        )}
                      </div>
                      <div className="text-[11.5px] text-muted-foreground mt-0.5 flex flex-wrap gap-x-2">
                        {c.config.client && <span className="font-medium text-foreground">{c.config.client}</span>}
                        <span>
                          {new Date(c.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {c.config.weeks ? <span>{c.config.weeks}w · {c.config.sprints} sprint{c.config.sprints !== 1 ? "s" : ""}</span> : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      <Link href={`/build/${c.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 font-mono text-[10px] h-7">
                          <Pencil className="h-3 w-3" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/proposal/${c.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="gap-1.5 font-mono text-[10px] h-7">
                          <ExternalLink className="h-3 w-3" />
                          Proposal
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleDuplicate(c.id)}
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("h-7 px-2 font-mono text-[10px] gap-1", isConfirmingDelete ? "text-destructive" : "text-muted-foreground")}
                        onClick={() => handleDelete(c.id)}
                        title={isConfirmingDelete ? "Click again to confirm delete" : "Delete"}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {isConfirmingDelete && "Confirm?"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
