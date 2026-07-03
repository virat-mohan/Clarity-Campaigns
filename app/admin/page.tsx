"use client";

import { useMemo, useState } from "react";
import { useAdminStore, VendorMediaType } from "@/lib/store/admin-store";
import { CAMPAIGN_TYPES, CAMPAIGN_TYPE_LIST, SkuId } from "@/lib/data/campaign-types";
import { ROLE_LIBRARY } from "@/lib/data/role-library";
import { useCampaignStore } from "@/lib/store/campaign-store";
import { buildAutoPod, applyPodOverrides } from "@/lib/calc/staffing";
import { buildSprintBreakdown } from "@/lib/calc/sprint";
import { buildFreelancerCallHtml, downloadHtmlFile } from "@/lib/export/html-export";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const MEDIA_TYPES: VendorMediaType[] = ["video", "image", "other"];

export default function AdminPage() {
  const freelancers = useAdminStore((s) => s.freelancers);
  const addFreelancer = useAdminStore((s) => s.addFreelancer);
  const updateFreelancer = useAdminStore((s) => s.updateFreelancer);
  const removeFreelancer = useAdminStore((s) => s.removeFreelancer);

  const vendors = useAdminStore((s) => s.vendors);
  const addVendor = useAdminStore((s) => s.addVendor);
  const updateVendor = useAdminStore((s) => s.updateVendor);
  const removeVendor = useAdminStore((s) => s.removeVendor);

  const campaignConfigs = useCampaignStore((s) => s.configs);
  const getConfig = useCampaignStore((s) => s.getConfig);

  const [tab, setTab] = useState("freelancers");
  const [biddingSku, setBiddingSku] = useState<SkuId>("abm");

  const biddingConfig = campaignConfigs[biddingSku] ?? getConfig(biddingSku);
  const biddingCt = CAMPAIGN_TYPES[biddingSku];

  const biddingPod = useMemo(() => {
    const suggested = buildAutoPod(biddingSku, biddingConfig.audienceSize);
    return applyPodOverrides(suggested, biddingConfig.podOverrides ?? {});
  }, [biddingSku, biddingConfig]);

  const biddingSprintBreakdown = useMemo(
    () => buildSprintBreakdown(biddingSku, biddingConfig.sprints ?? 1),
    [biddingSku, biddingConfig]
  );

  function handleExportBidding() {
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label text-[10px] text-primary mb-1">Internal — no auth in this demo</div>
        <h1 className="font-heading text-2xl font-semibold">Admin</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Manage the named freelancer roster, vendor list, and export freelancer call-for-bids documents.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="freelancers">Freelancers</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="bidding">Freelancer Call for Bids</TabsTrigger>
        </TabsList>

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
                      <Input value={v.specialistArea} onChange={(e) => updateVendor(v.id, { specialistArea: e.target.value })} />
                    </div>
                    <div className="w-32">
                      <Label>Media type</Label>
                      <Select value={v.mediaType} onValueChange={(mt) => updateVendor(v.id, { mediaType: mt as VendorMediaType })}>
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
                        onChange={(e) => updateVendor(v.id, { price: e.target.value === "" ? null : Number(e.target.value) })}
                      />
                    </div>
                    <div className="w-24">
                      <Label>Currency</Label>
                      <Select value={v.currency} onValueChange={(c) => updateVendor(v.id, { currency: c as "USD" | "INR" })}>
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
                      SKU scope <span className="normal-case text-[#8a8578]">(none selected = all campaign types)</span>
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

        <TabsContent value="bidding">
          <p className="mb-4 text-[12.5px] text-muted-foreground">
            Generate a call-for-bids document for a campaign. The document lists every pod role with its
            deliverable, indicative rate, and timeline window — with blank bid fields for each freelancer to
            fill in. Freelancer assignments made in the campaign builder are reflected as &quot;provisionally
            assigned&quot; so unassigned roles are clearly open.
          </p>

          <Card className="mb-4 bg-paper border-paper-border">
            <CardContent className="pt-5">
              <div className="font-mono-label text-[9.5px] text-primary-hover mb-3">Select campaign</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <Label>Campaign type</Label>
                  <Select value={biddingSku} onValueChange={(v) => setBiddingSku(v as SkuId)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CAMPAIGN_TYPE_LIST.map((ct) => (
                        <SelectItem key={ct.id} value={ct.id}>{ct.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Campaign name</Label>
                  <Input
                    readOnly
                    value={biddingConfig.name || "(untitled — configure in campaign builder)"}
                    className="text-muted-foreground"
                  />
                </div>
              </div>

              {biddingConfig.client && (
                <p className="mt-2 text-[11.5px] text-muted-foreground">
                  Client: <strong>{biddingConfig.client}</strong> · {biddingPod.length} pod steps ·{" "}
                  {biddingConfig.weeks} weeks · {biddingConfig.sprints} sprints
                </p>
              )}

              <div className="mt-4 border-t border-paper-border pt-4">
                <div className="font-mono-label text-[9.5px] text-muted-foreground mb-2">Pod preview</div>
                <div className="flex flex-col gap-1">
                  {biddingPod.map((row) => {
                    const assignedId = biddingConfig.podAssignments?.[row.stepNumber];
                    const assignedFreelancer = freelancers.find((f) => f.id === assignedId);
                    return (
                      <div key={row.stepNumber} className="flex items-center gap-2 text-[12px]">
                        <span className="font-mono text-[10px] text-muted-foreground w-5 text-right">{row.stepNumber}</span>
                        <span className="flex-1 text-foreground">{row.stepTitle}</span>
                        <span className="text-muted-foreground">{row.role}</span>
                        {assignedFreelancer ? (
                          <span className="font-mono text-[10px] text-primary">{assignedFreelancer.name}</span>
                        ) : (
                          <span className="font-mono text-[10px] text-secondary">Open</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleExportBidding}>
            <Download className="h-3.5 w-3.5" />
            Export Freelancer Call for Bids (HTML)
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
