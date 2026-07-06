"use client";

import { useState } from "react";
import { CampaignConfig } from "@/lib/store/campaign-store";
import { useAdminStore } from "@/lib/store/admin-store";
import { SkuId } from "@/lib/data/campaign-types";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";

interface BriefImportProps {
  sku: SkuId;
  onFill: (partial: Partial<CampaignConfig>) => void;
}

export function BriefImport({ sku, onFill }: BriefImportProps) {
  const anthropicApiKey = useAdminStore((s) => s.anthropicApiKey);
  const [open, setOpen] = useState(true);
  const [briefText, setBriefText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filled, setFilled] = useState(false);

  async function handleParse() {
    if (briefText.trim().length < 10) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/parse-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefText, sku, apiKey: anthropicApiKey }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? "Failed to parse brief.");
        return;
      }
      const result = data.result as Partial<CampaignConfig>;
      // Sanitize: only pass through known safe fields
      const safe: Partial<CampaignConfig> = {};
      if (typeof result.client === "string") safe.client = result.client;
      if (typeof result.clientSpoc === "string") safe.clientSpoc = result.clientSpoc;
      if (typeof result.name === "string") safe.name = result.name;
      if (typeof result.objective === "string") safe.objective = result.objective;
      if (typeof result.goal === "string") safe.goal = result.goal;
      if (typeof result.sell === "string") safe.sell = result.sell;
      if (typeof result.icp === "string") safe.icp = result.icp;
      if (typeof result.audienceSize === "number" && result.audienceSize > 0)
        safe.audienceSize = result.audienceSize;
      if (typeof result.industry === "string") safe.industry = result.industry;
      if (Array.isArray(result.channels) && result.channels.length > 0)
        safe.channels = result.channels;
      if (Array.isArray(result.assets) && result.assets.length > 0)
        safe.assets = (result.assets as { type: string; qty: number; rate?: number; note?: string }[]).map(
          (a) => ({ type: a.type, qty: a.qty ?? 1, rate: a.rate ?? 0, note: a.note ?? "" })
        );
      if (typeof result.adSpend === "number" && result.adSpend >= 0) safe.adSpend = result.adSpend;
      if (typeof result.asp === "number" && result.asp > 0) safe.asp = result.asp;
      if (typeof result.owner === "string") safe.owner = result.owner;
      if (typeof result.notes === "string") safe.notes = result.notes;
      if (typeof result.risks === "string") safe.risks = result.risks;

      onFill(safe);
      setFilled(true);
      setOpen(false);
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="bg-paper border-paper-border text-paper-foreground mb-1">
      <CardContent className="pt-4 pb-3">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 text-left"
          onClick={() => setOpen((o) => !o)}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary flex-none" />
            <span className="text-[12.5px] font-semibold text-paper-foreground">
              {filled ? "Brief parsed — fields auto-filled" : "Paste a brief to auto-fill"}
            </span>
            {filled && (
              <span className="text-[10.5px] text-secondary font-medium ml-1">Done</span>
            )}
          </div>
          {open ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground flex-none" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-none" />
          )}
        </button>

        {open && (
          <div className="mt-3">
            <p className="text-[11px] text-muted-foreground-2 mb-2">
              Paste any free-text brief — email, doc, notes — and AI will extract the campaign details into the form below.
            </p>
            <Textarea
              className="min-h-[120px] text-[12.5px]"
              placeholder="e.g. We need a 3-month lead generation campaign for Acme Corp, a B2B SaaS company targeting mid-market CFOs across LinkedIn and email. Goal is 30 qualified meetings. Budget ₹5L/month ad spend, deal value ~$12,000..."
              value={briefText}
              onChange={(e) => setBriefText(e.target.value)}
              disabled={loading}
            />
            {error && (
              <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-destructive">
                <AlertCircle className="h-3.5 w-3.5 flex-none" />
                {error}
              </div>
            )}
            <div className="mt-2 flex items-center gap-2">
              <Button
                size="sm"
                className="gap-1.5"
                onClick={handleParse}
                disabled={loading || briefText.trim().length < 10}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {loading ? "Parsing…" : "Parse & fill"}
              </Button>
              {filled && (
                <span className="text-[11px] text-secondary">
                  Fields updated — review and adjust below.
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
