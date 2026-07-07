"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAdminStore, AdminClient, VendorMediaType } from "@/lib/store/admin-store";
import { CAMPAIGN_TYPES, CAMPAIGN_TYPE_LIST, SkuId } from "@/lib/data/campaign-types";
import { ROLE_LIBRARY } from "@/lib/data/role-library";
import { useCampaignStore } from "@/lib/store/campaign-store";
import { buildAutoPod, applyPodOverrides } from "@/lib/calc/staffing";
import { buildSprintBreakdown } from "@/lib/calc/sprint";
import { buildFreelancerCallHtml, downloadHtmlFile, downloadAllClientHtmls } from "@/lib/export/html-export";
import { downloadCampaignExcel } from "@/lib/export/excel-export";
import { parseExcelImport, ImportedCampaign } from "@/lib/export/excel-import";
import { CampaignStatusBadge } from "@/components/campaign-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Trash2, Download, ExternalLink } from "lucide-react";
import { cn, fmtMoney } from "@/lib/utils";

const MEDIA_TYPES: VendorMediaType[] = ["video", "image", "influencer", "other"];

export default function AdminPage() {
  const freelancers = useAdminStore((s) => s.freelancers);
  const addFreelancer = useAdminStore((s) => s.addFreelancer);
  const updateFreelancer = useAdminStore((s) => s.updateFreelancer);
  const removeFreelancer = useAdminStore((s) => s.removeFreelancer);

  const vendors = useAdminStore((s) => s.vendors);
  const addVendor = useAdminStore((s) => s.addVendor);
  const updateVendor = useAdminStore((s) => s.updateVendor);
  const removeVendor = useAdminStore((s) => s.removeVendor);

  const clients = useAdminStore((s) => s.clients);
  const addClient = useAdminStore((s) => s.addClient);
  const updateClient = useAdminStore((s) => s.updateClient);
  const removeClient = useAdminStore((s) => s.removeClient);

  const podTemplates = useAdminStore((s) => s.podTemplates);
  const addTemplateStep = useAdminStore((s) => s.addTemplateStep);
  const updateTemplateStep = useAdminStore((s) => s.updateTemplateStep);
  const removeTemplateStep = useAdminStore((s) => s.removeTemplateStep);
  const toggleTemplateStep = useAdminStore((s) => s.toggleTemplateStep);

  const podTemplatesCreativeOnly = useAdminStore((s) => s.podTemplatesCreativeOnly);
  const addTemplateStepCO = useAdminStore((s) => s.addTemplateStepCO);
  const updateTemplateStepCO = useAdminStore((s) => s.updateTemplateStepCO);
  const removeTemplateStepCO = useAdminStore((s) => s.removeTemplateStepCO);
  const toggleTemplateStepCO = useAdminStore((s) => s.toggleTemplateStepCO);

  const markupFixed = useAdminStore((s) => s.markupFixed);
  const markupHybrid = useAdminStore((s) => s.markupHybrid);
  const setMarkupFixed = useAdminStore((s) => s.setMarkupFixed);
  const setMarkupHybrid = useAdminStore((s) => s.setMarkupHybrid);
  const anthropicApiKey = useAdminStore((s) => s.anthropicApiKey);
  const setAnthropicApiKey = useAdminStore((s) => s.setAnthropicApiKey);

  const campaigns = useCampaignStore((s) => s.campaigns);
  const createCampaign = useCampaignStore((s) => s.createCampaign);
  const updateConfig = useCampaignStore((s) => s.updateConfig);
  const setStatus = useCampaignStore((s) => s.setStatus);

  const [tab, setTab] = useState("freelancers");
  const [biddingCampaignId, setBiddingCampaignId] = useState<string>("");
  const [importPreview, setImportPreview] = useState<ImportedCampaign[] | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<string>("");
  const [templateSku, setTemplateSku] = useState<SkuId>("abm");
  const [templateMode, setTemplateMode] = useState<"fullservice" | "creativesonly">("fullservice");

  // Bidding — resolve campaign from new store
  const biddingCampaign = campaigns.find((c) => c.id === biddingCampaignId) ?? campaigns[0] ?? null;
  const biddingConfig = biddingCampaign?.config ?? null;
  const biddingSku = biddingCampaign?.sku ?? "abm";
  const biddingCt = CAMPAIGN_TYPES[biddingSku];
  const biddingTemplateSteps = podTemplates[biddingSku];

  const biddingPod = useMemo(() => {
    if (!biddingConfig) return [];
    const suggested = buildAutoPod(biddingSku, biddingConfig.audienceSize, biddingTemplateSteps);
    return applyPodOverrides(suggested, biddingConfig.podOverrides ?? {});
  }, [biddingSku, biddingConfig, biddingTemplateSteps]);

  const biddingSprintBreakdown = useMemo(
    () =>
      biddingConfig
        ? buildSprintBreakdown(biddingSku, biddingConfig.sprints ?? 1, biddingTemplateSteps)
        : null,
    [biddingSku, biddingConfig, biddingTemplateSteps]
  );

  const templateSteps = useMemo(() => {
    const source = templateMode === "creativesonly" ? podTemplatesCreativeOnly : podTemplates;
    return [...(source[templateSku] ?? [])].sort((a, b) => a.stepNumber - b.stepNumber);
  }, [podTemplates, podTemplatesCreativeOnly, templateSku, templateMode]);

  const tplAdd = templateMode === "creativesonly" ? addTemplateStepCO : addTemplateStep;
  const tplUpdate = templateMode === "creativesonly" ? updateTemplateStepCO : updateTemplateStep;
  const tplRemove = templateMode === "creativesonly" ? removeTemplateStepCO : removeTemplateStep;
  const tplToggle = templateMode === "creativesonly" ? toggleTemplateStepCO : toggleTemplateStep;

  function handleExportBidding() {
    if (!biddingConfig || !biddingSprintBreakdown) return;
    const fileSlug = (biddingConfig.name || biddingSku)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const html = buildFreelancerCallHtml(
      biddingCt,
      biddingConfig,
      biddingPod,
      biddingSprintBreakdown,
      freelancers,
      biddingConfig.podAssignments ?? {}
    );
    downloadHtmlFile(`${fileSlug}-freelancer-call.html`, html);
  }

  function toggleSkuScope(vendorId: string, sku: SkuId, current: SkuId[]) {
    const next = current.includes(sku) ? current.filter((s) => s !== sku) : [...current, sku];
    updateVendor(vendorId, { skuScope: next });
  }

  function handleExportExcel() {
    downloadCampaignExcel(campaigns, clients, podTemplates, podTemplatesCreativeOnly, freelancers);
  }

  function handleExportClientHtmls() {
    downloadAllClientHtmls(clients, campaigns, podTemplates, podTemplatesCreativeOnly);
  }

  async function handleImportFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus("");
    setImportErrors([]);
    setImportPreview(null);
    try {
      const result = await parseExcelImport(file);
      setImportPreview(result.campaigns);
      setImportErrors(result.errors);
    } catch (err) {
      setImportErrors([`Failed to read file: ${String(err)}`]);
    }
    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  function handleConfirmImport() {
    if (!importPreview || importPreview.length === 0) return;
    let created = 0;

    for (const imp of importPreview) {
      // Find or create client
      let clientId = "";
      const existing = clients.find(
        (c) => c.name.toLowerCase().trim() === imp.clientName.toLowerCase().trim()
      );
      if (existing) {
        clientId = existing.id;
      } else if (imp.clientName) {
        // addClient creates a blank client; we need its id — use a temp approach
        addClient();
        // The new client is appended last
        const newClient = useAdminStore.getState().clients.at(-1);
        if (newClient) {
          clientId = newClient.id;
          updateClient(clientId, { name: imp.clientName });
        }
      }

      const id = createCampaign(imp.sku, clientId || undefined);
      updateConfig(id, {
        client: imp.clientName,
        clientId,
        name: imp.name,
        objective: imp.objective,
        sell: imp.sell,
        goal: imp.goal,
        industry: imp.industry,
        audienceSize: imp.audienceSize,
        icp: imp.icp,
        source: imp.source,
        channels: imp.channels,
        qualifiedPct: imp.qualifiedPct,
        opportunityPct: imp.opportunityPct,
        closePct: imp.closePct,
        asp: imp.asp,
        aspUnit: imp.aspUnit,
        adSpend: imp.adSpend,
        adSpendCadence: imp.adSpendCadence,
        owner: imp.owner,
        weeks: imp.weeks,
        sprints: imp.sprints,
        notes: imp.notes,
        risks: imp.risks,
        creativesOnly: imp.creativesOnly,
        podOverrides: imp.podOverrides,
      });
      setStatus(id, imp.status);
      created++;
    }

    setImportStatus(`${created} campaign${created !== 1 ? "s" : ""} imported successfully.`);
    setImportPreview(null);
    setImportErrors([]);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label text-[10px] text-primary mb-1">Internal — no auth in this demo</div>
        <h1 className="font-heading text-2xl font-semibold">Admin</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Manage freelancers, vendors, pod templates, pricing settings, and client accounts.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="templates">Campaign Templates</TabsTrigger>
          <TabsTrigger value="bidding">Freelancer Call for Bids</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>

        {/* ── Freelancers ── */}
        <TabsContent value="freelancers">
          <p className="mb-4 text-[12.5px] text-muted-foreground">
            Named freelancers, each tied to a job/role and hourly rate. These can be pulled onto a pod card
            while building a campaign, so the plan shows real people instead of just role titles.
          </p>
          <div className="flex flex-col gap-2">
            {freelancers.map((f) => (
              <Card key={f.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[150px]">
                      <Label>Name</Label>
                      <Input value={f.name} onChange={(e) => updateFreelancer(f.id, { name: e.target.value })} />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <Label>Role / job</Label>
                      <Input
                        list="role-library-options"
                        value={f.role}
                        onChange={(e) => updateFreelancer(f.id, { role: e.target.value })}
                      />
                    </div>
                    <div className="w-36">
                      <Label>Dept</Label>
                      <Input value={f.dept} onChange={(e) => updateFreelancer(f.id, { dept: e.target.value })} />
                    </div>
                    <div className="w-28">
                      <Label>Rate ($/hr)</Label>
                      <Input
                        type="number"
                        value={f.rate}
                        onChange={(e) => updateFreelancer(f.id, { rate: Number(e.target.value) || 0 })}
                      />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeFreelancer(f.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <datalist id="role-library-options">
            {ROLE_LIBRARY.map((r) => (
              <option key={r.name} value={r.name} />
            ))}
          </datalist>
          <Button variant="outline" size="sm" className="mt-3" onClick={addFreelancer}>
            + Add freelancer
          </Button>
        </TabsContent>

        {/* ── Vendors ── */}
        <TabsContent value="vendors">
          <p className="mb-4 text-[12.5px] text-muted-foreground">
            Vendors and specialist capacity, priced per project. Scope to specific campaign types, or leave
            unscoped to make a vendor available everywhere. Media type (video/image) gates visibility to
            campaigns that actually have that kind of asset in the brief.
          </p>
          <div className="flex flex-col gap-2">
            {vendors.map((v) => (
              <Card key={v.id}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-wrap items-end gap-3 mb-3">
                    <div className="flex-1 min-w-[150px]">
                      <Label>Name</Label>
                      <Input value={v.name} onChange={(e) => updateVendor(v.id, { name: e.target.value })} />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <Label>Specialist area</Label>
                      <Input
                        value={v.specialistArea}
                        onChange={(e) => updateVendor(v.id, { specialistArea: e.target.value })}
                      />
                    </div>
                    <div className="w-32">
                      <Label>Media type</Label>
                      <Select
                        value={v.mediaType}
                        onValueChange={(mt) => updateVendor(v.id, { mediaType: mt as VendorMediaType })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MEDIA_TYPES.map((mt) => (
                            <SelectItem key={mt} value={mt}>{mt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-28">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        placeholder="TBD"
                        value={v.price ?? ""}
                        onChange={(e) =>
                          updateVendor(v.id, {
                            price: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="w-24">
                      <Label>Currency</Label>
                      <Select
                        value={v.currency}
                        onValueChange={(c) => updateVendor(v.id, { currency: c as "USD" | "INR" })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="INR">INR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeVendor(v.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div>
                    <Label className="mb-1">
                      SKU scope{" "}
                      <span className="normal-case text-[#8a8578]">
                        (none selected = all campaign types)
                      </span>
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {CAMPAIGN_TYPE_LIST.map((ct) => {
                        const selected = v.skuScope.includes(ct.id);
                        return (
                          <button
                            key={ct.id}
                            type="button"
                            onClick={() => toggleSkuScope(v.id, ct.id, v.skuScope)}
                            className={cn(
                              "font-mono text-[10px] px-2 py-1 rounded-[3px] border transition-colors",
                              selected
                                ? "bg-paper-foreground text-paper border-paper-foreground"
                                : "bg-transparent text-muted-foreground-2 border-border-strong hover:border-primary-hover"
                            )}
                          >
                            {ct.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3" onClick={addVendor}>
            + Add vendor
          </Button>
        </TabsContent>

        {/* ── Campaign Templates ── */}
        <TabsContent value="templates">
          <p className="mb-4 text-[12.5px] text-muted-foreground">
            Define the exact roles, hours, day allocations, and deliverables for each campaign type.
            Toggle steps active or inactive to include or exclude them from pod planning, the sprint
            timeline, and the freelancer call-for-bids document. Changes here feed directly into the
            campaign builder and bidding export.
          </p>

          <Card className="mb-5 bg-paper border-paper-border">
            <CardContent className="pt-5 pb-4">
              <div className="font-mono-label text-[9.5px] text-primary-hover mb-3">Select campaign type</div>
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-64">
                  <Select value={templateSku} onValueChange={(v) => setTemplateSku(v as SkuId)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CAMPAIGN_TYPE_LIST.map((ct) => (
                        <SelectItem key={ct.id} value={ct.id}>{ct.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex rounded-[4px] border border-paper-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setTemplateMode("fullservice")}
                    className={cn(
                      "px-3 py-1.5 text-[11px] font-mono transition-colors",
                      templateMode === "fullservice"
                        ? "bg-paper-foreground text-paper"
                        : "bg-transparent text-muted-foreground hover:bg-paper-border"
                    )}
                  >
                    Full Service
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateMode("creativesonly")}
                    className={cn(
                      "px-3 py-1.5 text-[11px] font-mono transition-colors border-l border-paper-border",
                      templateMode === "creativesonly"
                        ? "bg-paper-foreground text-paper"
                        : "bg-transparent text-muted-foreground hover:bg-paper-border"
                    )}
                  >
                    Creatives Only
                  </button>
                </div>
              </div>
              {templateMode === "creativesonly" && (
                <p className="mt-2 text-[11px] text-[#6a7280]">
                  Creatives-only template: planning &amp; production steps only. Client runs execution, monitoring, and reporting.
                </p>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground">
                {templateSteps.filter((s) => s.active).length} active step
                {templateSteps.filter((s) => s.active).length !== 1 ? "s" : ""} ·{" "}
                {templateSteps.length} total
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            {templateSteps.map((step) => (
              <Card key={step.id} className={cn("transition-opacity", !step.active && "opacity-50")}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col items-center gap-1 pb-0.5">
                      <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wide">
                        Active
                      </span>
                      <Switch
                        checked={step.active}
                        onCheckedChange={() => tplToggle(templateSku, step.id)}
                      />
                    </div>
                    <div className="w-14">
                      <Label>Step #</Label>
                      <Input
                        type="number"
                        value={step.stepNumber}
                        onChange={(e) =>
                          tplUpdate(templateSku, step.id, {
                            stepNumber: Number(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-[130px]">
                      <Label>Title</Label>
                      <Input
                        value={step.title}
                        onChange={(e) => tplUpdate(templateSku, step.id, { title: e.target.value })}
                      />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <Label>Role</Label>
                      <Input
                        list="role-library-options-tpl"
                        value={step.role}
                        onChange={(e) => tplUpdate(templateSku, step.id, { role: e.target.value })}
                      />
                    </div>
                    <div className="w-20">
                      <Label>Hours</Label>
                      <Input
                        type="number"
                        value={step.hours}
                        onChange={(e) =>
                          tplUpdate(templateSku, step.id, {
                            hours: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="w-24">
                      <Label>Rate ($/hr)</Label>
                      <Input
                        type="number"
                        value={step.rate}
                        onChange={(e) =>
                          tplUpdate(templateSku, step.id, {
                            rate: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <div className="w-20">
                      <Label>Days</Label>
                      <Input
                        type="number"
                        value={step.days}
                        onChange={(e) =>
                          tplUpdate(templateSku, step.id, {
                            days: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => tplRemove(templateSku, step.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="mt-3">
                    <Label>Deliverable / expected output</Label>
                    <Input
                      value={step.deliverable}
                      placeholder="What this step produces for the client"
                      onChange={(e) =>
                        tplUpdate(templateSku, step.id, { deliverable: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <datalist id="role-library-options-tpl">
            {ROLE_LIBRARY.map((r) => (
              <option key={r.name} value={r.name} />
            ))}
          </datalist>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => tplAdd(templateSku)}
          >
            + Add step
          </Button>
        </TabsContent>

        {/* ── Freelancer Call for Bids ── */}
        <TabsContent value="bidding">
          <p className="mb-4 text-[12.5px] text-muted-foreground">
            Generate a call-for-bids document for a campaign. The document lists every pod role with its
            deliverable, indicative rate, and timeline window — with blank bid fields for each freelancer to
            fill in. Freelancer assignments made in the campaign builder are reflected as
            &quot;provisionally assigned&quot; so unassigned roles are clearly open.
          </p>

          <Card className="mb-4 bg-paper border-paper-border">
            <CardContent className="pt-5">
              <div className="font-mono-label text-[9.5px] text-primary-hover mb-3">Select campaign</div>

              {campaigns.length === 0 ? (
                <p className="text-[12.5px] text-muted-foreground">
                  No campaigns yet.{" "}
                  <Link href="/" className="text-primary underline underline-offset-2">
                    Create one in the marketplace
                  </Link>
                  .
                </p>
              ) : (
                <>
                  <div className="w-full max-w-sm mb-3">
                    <Label>Campaign</Label>
                    <Select
                      value={biddingCampaign?.id ?? ""}
                      onValueChange={(v) => setBiddingCampaignId(v)}
                    >
                      <SelectTrigger><SelectValue placeholder="Select a campaign…" /></SelectTrigger>
                      <SelectContent>
                        {campaigns.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.config.name || "(Untitled)"} — {CAMPAIGN_TYPES[c.sku].label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {biddingCampaign && biddingConfig && (
                    <>
                      {biddingConfig.client && (
                        <p className="mb-3 text-[11.5px] text-muted-foreground">
                          Client: <strong>{biddingConfig.client}</strong> · {biddingPod.length} pod steps ·{" "}
                          {biddingConfig.weeks} weeks · {biddingConfig.sprints} sprints
                        </p>
                      )}

                      <div className="border-t border-paper-border pt-4">
                        <div className="font-mono-label text-[9.5px] text-muted-foreground mb-2">Pod preview</div>
                        <div className="flex flex-col gap-1">
                          {biddingPod.map((row) => {
                            const assignedId = biddingConfig.podAssignments?.[row.stepNumber];
                            const assignedFreelancer = freelancers.find((f) => f.id === assignedId);
                            return (
                              <div key={row.stepNumber} className="flex items-center gap-2 text-[12px]">
                                <span className="font-mono text-[10px] text-muted-foreground w-5 text-right">
                                  {row.stepNumber}
                                </span>
                                <span className="flex-1 text-foreground">{row.stepTitle}</span>
                                <span className="text-muted-foreground">{row.role}</span>
                                <span className="font-mono text-[10px] text-muted-foreground-2">
                                  {row.hours}h @ ${row.rate}/hr
                                </span>
                                {assignedFreelancer ? (
                                  <span className="font-mono text-[10px] text-primary">
                                    {assignedFreelancer.name}
                                  </span>
                                ) : (
                                  <span className="font-mono text-[10px] text-secondary">Open</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleExportBidding} disabled={!biddingCampaign}>
            <Download className="h-3.5 w-3.5" />
            Export Freelancer Call for Bids (HTML)
          </Button>
        </TabsContent>

        {/* ── Settings ── */}
        <TabsContent value="settings">
          <p className="mb-6 text-[12.5px] text-muted-foreground">
            Global pricing multipliers applied when computing client-facing campaign fees. These override
            the hardcoded defaults throughout the pricing step and checkout.
          </p>

          <div className="max-w-lg flex flex-col gap-6">
            <Card className="bg-paper border-paper-border">
              <CardContent className="pt-5 text-paper-foreground">
                <div className="font-mono-label text-[9.5px] text-primary mb-1">Anthropic API key</div>
                <p className="text-[11px] text-muted-foreground-2 mb-3">
                  Used server-side to parse campaign briefs. Stored in your browser only — never committed or sent anywhere else.
                  Get a key at <span className="font-medium text-foreground">console.anthropic.com</span>.
                </p>
                <Label>API key</Label>
                <Input
                  type="password"
                  placeholder="sk-ant-api03-..."
                  value={anthropicApiKey}
                  onChange={(e) => setAnthropicApiKey(e.target.value)}
                  className="font-mono mt-1"
                />
                {anthropicApiKey && (
                  <p className="mt-2 text-[11px] text-secondary">Key saved — brief parsing will use this key.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-paper border-paper-border">
              <CardContent className="pt-5 text-paper-foreground">
                <div className="font-mono-label text-[9.5px] text-primary mb-4">Markup multipliers</div>

                <div className="flex flex-col gap-5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label>Fixed-price markup</Label>
                      <span className="font-mono text-[13px] font-semibold text-primary">{markupFixed}×</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={0.5}
                      value={markupFixed}
                      onChange={(e) => setMarkupFixed(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Client price = total cost × {markupFixed}× for fixed-rate campaigns.
                      Default 4×.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Label>Hybrid base markup</Label>
                      <span className="font-mono text-[13px] font-semibold text-primary">{markupHybrid}×</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={0.5}
                      value={markupHybrid}
                      onChange={(e) => setMarkupHybrid(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Base component = total cost × {markupHybrid}× for hybrid (fixed + variable) campaigns.
                      Default 3×.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/40">
              <CardContent className="pt-4 pb-4">
                <div className="text-[11.5px] text-muted-foreground">
                  Changes take effect immediately across all campaign pricing steps and the checkout page.
                  They are persisted in browser storage along with all other admin data.
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Clients ── */}
        <TabsContent value="clients">
          <p className="mb-4 text-[12.5px] text-muted-foreground">
            Manage your client list. Clients added here appear in the campaign wizard&apos;s Client dropdown.
          </p>

          {/* Admin-managed client list */}
          <div className="flex flex-col gap-3 mb-6">
            {clients.length === 0 && (
              <div className="py-10 text-center text-muted-foreground text-[13px] border border-dashed border-border rounded-[6px]">
                No clients yet. Click &ldquo;Add client&rdquo; to create your first one.
              </div>
            )}
            {clients.map((c: AdminClient) => {
              const clientCampaigns = campaigns.filter((camp) => camp.config.clientId === c.id);
              return (
                <Card key={c.id} className="bg-paper border-paper-border">
                  <CardContent className="pt-4 pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                      <div>
                        <Label className="mb-0.5">Company name <span className="text-destructive">*</span></Label>
                        <Input
                          value={c.name}
                          placeholder="Acme Corp"
                          onChange={(e) => updateClient(c.id, { name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="mb-0.5">Contact name</Label>
                        <Input
                          value={c.contactName}
                          placeholder="Jane Smith"
                          onChange={(e) => updateClient(c.id, { contactName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="mb-0.5">Contact email</Label>
                        <Input
                          type="email"
                          value={c.contactEmail}
                          placeholder="jane@acme.com"
                          onChange={(e) => updateClient(c.id, { contactEmail: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="mb-0.5">Industry</Label>
                        <Input
                          value={c.industry}
                          placeholder="e.g. SaaS, Real Estate"
                          onChange={(e) => updateClient(c.id, { industry: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10.5px] text-muted-foreground">
                        {clientCampaigns.length} campaign{clientCampaigns.length !== 1 ? "s" : ""}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-destructive hover:text-destructive"
                        onClick={() => removeClient(c.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={addClient}>+ Add client</Button>
        </TabsContent>

        {/* ── Exports ── */}
        <TabsContent value="exports">
          <p className="mb-6 text-[12.5px] text-muted-foreground">
            Download all campaign data in bulk. The Excel export creates one workbook with a summary sheet
            and one tab per campaign. The client HTMLs generate one standalone HTML file per client, listing
            all their campaigns with pod and pricing — ready to share.
          </p>

          {campaigns.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-[13px] border border-dashed border-border rounded-[6px]">
              No campaigns yet.{" "}
              <Link href="/" className="text-primary underline underline-offset-2">
                Create one in the marketplace
              </Link>
              .
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-w-xl">
              <Card className="bg-paper border-paper-border">
                <CardContent className="pt-5 pb-5">
                  <div className="font-mono-label text-[9.5px] text-primary-hover mb-1">Excel workbook</div>
                  <p className="text-[12.5px] text-muted-foreground mb-3">
                    Downloads <strong>clarity-campaigns-{new Date().toISOString().slice(0, 10)}.xlsx</strong> with
                    a Summary sheet and one tab per campaign ({campaigns.length} campaigns).
                  </p>
                  <Button onClick={handleExportExcel}>
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Export all campaigns — Excel (.xlsx)
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-paper border-paper-border">
                <CardContent className="pt-5 pb-5">
                  <div className="font-mono-label text-[9.5px] text-primary-hover mb-1">Client HTML files</div>
                  <p className="text-[12.5px] text-muted-foreground mb-3">
                    Downloads one HTML file per client listing all their campaigns, pod, and pricing.
                    {" "}
                    {clients.filter((cl) => campaigns.some((c) => c.config.clientId === cl.id)).length} client
                    {clients.filter((cl) => campaigns.some((c) => c.config.clientId === cl.id)).length !== 1 ? "s" : ""} with campaigns.
                  </p>
                  <div className="flex flex-col gap-1.5 mb-4">
                    {clients
                      .filter((cl) => campaigns.some((c) => c.config.clientId === cl.id))
                      .map((cl) => {
                        const count = campaigns.filter((c) => c.config.clientId === cl.id).length;
                        return (
                          <div key={cl.id} className="flex items-center gap-2 text-[12px]">
                            <ExternalLink className="h-3 w-3 text-muted-foreground flex-none" />
                            <span className="font-medium">{cl.name}</span>
                            <span className="text-muted-foreground">— {count} campaign{count !== 1 ? "s" : ""}</span>
                          </div>
                        );
                      })}
                  </div>
                  <Button variant="outline" onClick={handleExportClientHtmls}>
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Export client HTMLs (one per client)
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Import ── */}
          <div className="mt-8 border-t border-border pt-8 max-w-xl">
            <div className="font-mono-label text-[9.5px] text-primary mb-1">Import from Excel</div>
            <p className="text-[12.5px] text-muted-foreground mb-4">
              Upload a <strong>.xlsx</strong> file exported from this app (by you or someone else).
              Each campaign tab is parsed and created here — clients that don&apos;t exist yet are
              created automatically. Existing campaigns are not touched.
            </p>

            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <div className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-[12.5px] font-medium hover:bg-accent transition-colors">
                <Download className="h-3.5 w-3.5 rotate-180" />
                Choose .xlsx file…
              </div>
              <input
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="sr-only"
                onChange={handleImportFileChange}
              />
            </label>

            {importErrors.length > 0 && (
              <div className="mt-3 p-3 rounded-[4px] bg-destructive/10 border border-destructive/20">
                {importErrors.map((e, i) => (
                  <p key={i} className="text-[12px] text-destructive">{e}</p>
                ))}
              </div>
            )}

            {importPreview && importPreview.length > 0 && (
              <div className="mt-4">
                <p className="text-[12.5px] font-semibold mb-2">
                  Ready to import {importPreview.length} campaign{importPreview.length !== 1 ? "s" : ""}:
                </p>
                <div className="flex flex-col gap-1 mb-4 max-h-60 overflow-y-auto">
                  {importPreview.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-[12px] border-b border-paper-border pb-1">
                      <span className="font-mono text-[10px] text-muted-foreground w-5 text-right">{i + 1}</span>
                      <span className="font-medium flex-1">{c.name || "(Untitled)"}</span>
                      <span className="text-muted-foreground">{c.clientName || "—"}</span>
                      <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">{c.sku}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleConfirmImport}>
                    Import {importPreview.length} campaign{importPreview.length !== 1 ? "s" : ""}
                  </Button>
                  <Button variant="outline" onClick={() => { setImportPreview(null); setImportErrors([]); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {importStatus && (
              <p className="mt-3 text-[12.5px] text-secondary font-medium">{importStatus}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
