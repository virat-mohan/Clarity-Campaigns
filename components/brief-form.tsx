"use client";

import { CampaignType } from "@/lib/data/campaign-types";
import { CampaignConfig } from "@/lib/store/campaign-store";
import { ASSET_TYPES } from "@/lib/data/campaign-types";
import { INDUSTRY_LIST, IndustryId, ALL_CHANNELS } from "@/lib/data/industry-benchmarks";
import { industryFunnelBenchmark } from "@/lib/calc/reach";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const OBJECTIVES = [
  "Lead Generation",
  "Awareness",
  "Trust",
  "Sign Up",
  "Sale / Revenue",
  "Engagement",
  "Retention",
  "Referral / Advocacy",
];

const SOURCES = ["Account book", "ICP research", "Inbound / warm", "Network referral"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="bg-paper border-paper-border text-paper-foreground">
      <CardContent className="pt-5">
        <div className="font-mono-label text-[9.5px] text-primary-hover mb-3">{title}</div>
        {children}
      </CardContent>
    </Card>
  );
}

export function BriefForm({
  ct,
  config,
  onChange,
}: {
  ct: CampaignType;
  config: CampaignConfig;
  onChange: (partial: Partial<CampaignConfig>) => void;
}) {
  const isSales = ct.mode === "sales";
  const hasEmail = config.channels.includes("Email");
  const hasLI = config.channels.includes("LinkedIn");
  const hasWA = config.channels.includes("WhatsApp");

  function updateAsset(index: number, partial: Partial<{ type: string; qty: number; rate: number; note: string }>) {
    const next = [...config.assets];
    next[index] = { ...next[index], ...partial };
    onChange({ assets: next });
  }
  function addAsset() {
    onChange({ assets: [...config.assets, { type: ASSET_TYPES[0].type, qty: 1, rate: 0, note: "" }] });
  }
  function removeAsset(index: number) {
    onChange({ assets: config.assets.filter((_, i) => i !== index) });
  }

  function handleIndustryChange(industryId: string) {
    const benchmark = industryFunnelBenchmark(industryId as IndustryId, config.channels);
    onChange({
      industry: industryId,
      qualifiedPct: benchmark.qualifiedPct,
      opportunityPct: benchmark.opportunityPct,
      closePct: benchmark.closePct,
    });
  }

  function toggleChannel(channel: string) {
    const nextChannels = config.channels.includes(channel)
      ? config.channels.filter((c) => c !== channel)
      : [...config.channels, channel];
    const benchmark = industryFunnelBenchmark(config.industry as IndustryId, nextChannels);
    onChange({
      channels: nextChannels,
      qualifiedPct: benchmark.qualifiedPct,
      opportunityPct: benchmark.opportunityPct,
      closePct: benchmark.closePct,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Section title="Campaign Overview">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label>Client</Label>
            <Input value={config.client} onChange={(e) => onChange({ client: e.target.value })} />
          </div>
          <div>
            <Label>Campaign name</Label>
            <Input value={config.name} onChange={(e) => onChange({ name: e.target.value })} />
          </div>
          <div>
            <Label>Primary objective</Label>
            <Select value={config.objective} onValueChange={(v) => onChange({ objective: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {OBJECTIVES.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>What we&apos;re selling / promoting</Label>
            <Input value={config.sell} onChange={(e) => onChange({ sell: e.target.value })} />
          </div>
        </div>
        <div className="mt-3">
          <Label>Campaign goal / success definition</Label>
          <Textarea
            placeholder="What does winning look like for this campaign, in plain language?"
            value={config.goal}
            onChange={(e) => onChange({ goal: e.target.value })}
          />
        </div>
      </Section>

      <Section title="Audience & Targeting">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-3">
          <div>
            <Label>Industry / Category</Label>
            <Select value={config.industry} onValueChange={handleIndustryChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {INDUSTRY_LIST.map((i) => (
                  <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{isSales ? "Contact list size" : "Target audience size (drives staffing scale)"}</Label>
            <Input
              type="number"
              value={config.audienceSize}
              onChange={(e) => onChange({ audienceSize: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
        <p className="mb-3 text-[11px] text-[#6a7280]">
          Industry sets the suggested funnel benchmark below (Funnel &amp; Commercial) — you can still edit it there.
        </p>
        {isSales && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>ICP / Target Audience</Label>
              <Input value={config.icp} onChange={(e) => onChange({ icp: e.target.value })} />
            </div>
            <div>
              <Label>Source</Label>
              <Select value={config.source} onValueChange={(v) => onChange({ source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </Section>

      <Section title="Channels & Assets">
        <div className="mb-3">
          <Label>
            Channels <span className="normal-case text-[#6a7280]">(select any — {ct.label} typically uses {ct.channels.join(", ")})</span>
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_CHANNELS.map((c) => {
              const selected = config.channels.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleChannel(c)}
                  className={cn(
                    "font-mono text-[10.5px] px-2.5 py-1 rounded-full border transition-colors",
                    selected
                      ? "bg-paper-foreground text-paper border-paper-foreground"
                      : "bg-transparent text-[#6a7280] border-paper-border hover:border-primary-hover"
                  )}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {isSales && (hasEmail || hasLI || hasWA) && (
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {hasEmail && (
              <div>
                <Label>Email steps / contact</Label>
                <Input type="number" value={config.emailSteps} onChange={(e) => onChange({ emailSteps: Number(e.target.value) || 0 })} />
              </div>
            )}
            {hasLI && (
              <div>
                <Label>LinkedIn actions / contact</Label>
                <Input type="number" value={config.liSteps} onChange={(e) => onChange({ liSteps: Number(e.target.value) || 0 })} />
              </div>
            )}
            {hasWA && (
              <div>
                <Label>WhatsApp msgs / contact</Label>
                <Input type="number" value={config.waSteps} onChange={(e) => onChange({ waSteps: Number(e.target.value) || 0 })} />
              </div>
            )}
          </div>
        )}

        <Label>Deliverable assets</Label>
        <div className="flex flex-col gap-2">
          {config.assets.map((asset, i) => (
            <div key={i} className="border-b border-dashed border-paper-border pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Select value={asset.type} onValueChange={(v) => updateAsset(i, { type: v })}>
                  <SelectTrigger className="flex-1 min-w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ASSET_TYPES.map((a) => (
                      <SelectItem key={a.type} value={a.type}>{a.type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  className="w-20"
                  placeholder="Qty"
                  value={asset.qty}
                  onChange={(e) => updateAsset(i, { qty: Number(e.target.value) || 0 })}
                />
                <Input
                  type="number"
                  className="w-24"
                  placeholder="$/unit"
                  value={asset.rate}
                  onChange={(e) => updateAsset(i, { rate: Number(e.target.value) || 0 })}
                />
                <Button variant="outline" size="sm" onClick={() => removeAsset(i)}>Remove</Button>
              </div>
              <Input
                className="mt-1.5 text-[12px]"
                placeholder="Note — brief / reference / special instructions (optional)"
                value={asset.note ?? ""}
                onChange={(e) => updateAsset(i, { note: e.target.value })}
              />
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-2" onClick={addAsset}>+ Add asset</Button>
      </Section>

      <Section title="Funnel & Commercial">
        <p className="mb-2 text-[11px] text-[#6a7280]">
          Suggested from the {INDUSTRY_LIST.find((i) => i.id === config.industry)?.name} industry benchmark for
          this campaign&apos;s channels — editable.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label>Qualified %</Label>
            <Input type="number" value={config.qualifiedPct} onChange={(e) => onChange({ qualifiedPct: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>Opportunity %</Label>
            <Input type="number" value={config.opportunityPct} onChange={(e) => onChange({ opportunityPct: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>Close %</Label>
            <Input type="number" value={config.closePct} onChange={(e) => onChange({ closePct: Number(e.target.value) || 0 })} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label>ASP / Deal value ($)</Label>
            <Input type="number" value={config.asp} onChange={(e) => onChange({ asp: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>Ad spend budget ($)</Label>
            <Input type="number" value={config.adSpend} onChange={(e) => onChange({ adSpend: Number(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>Ad spend cadence</Label>
            <Select value={config.adSpendCadence} onValueChange={(v) => onChange({ adSpendCadence: v as "monthly" | "onetime" })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="onetime">One-time / campaign total</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-[#6a7280]">
          Ad spend is shown separately in pricing and is never folded into the cost multiple.
        </p>
      </Section>

      <Section title="Delivery">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label>Owner</Label>
            <Input value={config.owner} onChange={(e) => onChange({ owner: e.target.value })} />
          </div>
        </div>
        <p className="mt-2 text-[11px] text-[#6a7280]">
          Weeks and sprints are set in the Pod &amp; Vendor step, since they drive staffing and timeline together.
        </p>
        <div className="mt-3">
          <Label>Notes</Label>
          <Textarea placeholder="Context, constraints, specifics" value={config.notes} onChange={(e) => onChange({ notes: e.target.value })} />
        </div>
        <div className="mt-3">
          <Label>Risks / dependencies / client inputs needed</Label>
          <Textarea
            placeholder="e.g. waiting on brand assets, client must approve account list before send"
            value={config.risks}
            onChange={(e) => onChange({ risks: e.target.value })}
          />
        </div>
      </Section>
    </div>
  );
}
