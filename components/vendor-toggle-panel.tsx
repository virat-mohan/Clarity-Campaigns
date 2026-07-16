"use client";

import { useAdminStore } from "@/lib/store/admin-store";
import { ASSET_TYPES, SkuId } from "@/lib/data/campaign-types";
import { VendorToggleState, CustomVendorLine, InfluencerEntry } from "@/lib/store/campaign-store";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, UserPlus } from "lucide-react";

function mediumFor(assetType: string): string | undefined {
  return ASSET_TYPES.find((a) => a.type === assetType)?.medium;
}

export function VendorTogglePanel({
  sku,
  assetTypes,
  vendorToggles,
  onToggle,
  customVendors,
  onAddCustomVendor,
  onUpdateCustomVendor,
  onRemoveCustomVendor,
  influencers,
  onAddInfluencer,
  onUpdateInfluencer,
  onRemoveInfluencer,
}: {
  sku: SkuId;
  assetTypes: string[];
  vendorToggles: Record<string, VendorToggleState>;
  onToggle: (vendorId: string, state: VendorToggleState) => void;
  customVendors: CustomVendorLine[];
  onAddCustomVendor: () => void;
  onUpdateCustomVendor: (id: string, partial: Partial<Omit<CustomVendorLine, "id">>) => void;
  onRemoveCustomVendor: (id: string) => void;
  influencers: InfluencerEntry[];
  onAddInfluencer: () => void;
  onUpdateInfluencer: (id: string, partial: Partial<Omit<InfluencerEntry, "id">>) => void;
  onRemoveInfluencer: (id: string) => void;
}) {
  const vendors = useAdminStore((s) => s.vendors);
  const hasVideoAsset = assetTypes.some((t) => mediumFor(t) === "Video");
  const hasImageAsset = assetTypes.some((t) => mediumFor(t) === "Design");

  // Influencer-type vendors are managed in their own section below
  const scopedVendors = vendors.filter(
    (v) => v.mediaType !== "influencer" && (v.skuScope.length === 0 || v.skuScope.includes(sku))
  );
  const visibleVendors = scopedVendors.filter((v) => {
    if (v.mediaType === "video") return hasVideoAsset;
    if (v.mediaType === "image") return hasImageAsset;
    return true;
  });
  const gatedCount = scopedVendors.length - visibleVendors.length;

  return (
    <div className="flex flex-col gap-6">
      {/* Admin-managed vendors */}
      <div>
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Vendor & specialist capacity
        </div>
        {gatedCount > 0 && (
          <p className="mb-3 text-[11px] text-muted-foreground-2">
            {gatedCount} vendor{gatedCount > 1 ? "s" : ""} hidden until a matching video or design asset is
            added to the brief.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {visibleVendors.map((v) => {
            const state = vendorToggles[v.id] ?? { on: false, cost: v.price };
            return (
              <Card key={v.id} className={state.on ? "border-primary/30" : ""}>
                <CardContent className="pt-3 pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[13px] font-semibold">{v.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {v.specialistArea} · {v.mediaType}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {state.on && (
                        <div className="w-32">
                          <Label className="mb-0.5 text-[11px]">{v.currency === "INR" ? "Cost (₹)" : "Cost ($)"}</Label>
                          <Input
                            type="number"
                            placeholder="TBD"
                            value={state.cost ?? ""}
                            onChange={(e) =>
                              onToggle(v.id, {
                                on: true,
                                cost: e.target.value === "" ? null : Number(e.target.value),
                              })
                            }
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={state.on}
                          onCheckedChange={(checked) => onToggle(v.id, { on: checked, cost: state.cost })}
                        />
                        {state.on && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => onToggle(v.id, { on: false, cost: state.cost })}
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {visibleVendors.length === 0 && (
            <p className="text-[12px] text-muted-foreground">No vendors available for this campaign type.</p>
          )}
        </div>
      </div>

      {/* Influencers */}
      <div>
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Influencers / UGC creators
        </div>
        <p className="text-[11px] text-muted-foreground mb-3">
          Add named influencers or UGC creators. Fee is billed at cost alongside ad spend.
        </p>
        <div className="flex flex-col gap-2">
          {influencers.map((inf) => (
            <Card key={inf.id}>
              <CardContent className="pt-3 pb-3">
                <div className="flex flex-wrap items-start gap-3">
                  <div className="flex-1 min-w-[160px]">
                    <Label className="mb-0.5 text-[11px]">Name / handle</Label>
                    <Input
                      placeholder="e.g. @username or Creator name"
                      value={inf.name}
                      onChange={(e) => onUpdateInfluencer(inf.id, { name: e.target.value })}
                    />
                  </div>
                  <div className="w-36">
                    <Label className="mb-0.5 text-[11px]">Price per post ($)</Label>
                    <Input
                      type="number"
                      placeholder="TBD"
                      value={inf.pricePerPost ?? ""}
                      onChange={(e) =>
                        onUpdateInfluencer(inf.id, {
                          pricePerPost: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-5 h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => onRemoveInfluencer(inf.id)}
                    title="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="mt-2">
                  <Label className="mb-0.5 text-[11px]">Brief / notes</Label>
                  <Textarea
                    placeholder="Content brief, usage rights, platform, number of posts…"
                    className="text-[12px] min-h-[60px]"
                    value={inf.note}
                    onChange={(e) => onUpdateInfluencer(inf.id, { note: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-2 gap-1.5" onClick={onAddInfluencer}>
          <UserPlus className="h-3.5 w-3.5" />
          Add influencer
        </Button>
      </div>

      {/* Custom vendors */}
      <div>
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Other vendors / specialists
        </div>
        <div className="flex flex-col gap-2">
          {customVendors.map((v) => (
            <Card key={v.id}>
              <CardContent className="pt-3 pb-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[160px]">
                    <Label className="mb-0.5 text-[11px]">Name</Label>
                    <Input
                      placeholder="e.g. Local translator, PR agency"
                      value={v.name}
                      onChange={(e) => onUpdateCustomVendor(v.id, { name: e.target.value })}
                    />
                  </div>
                  <div className="w-32">
                    <Label className="mb-0.5 text-[11px]">Cost ($/project)</Label>
                    <Input
                      type="number"
                      placeholder="TBD"
                      value={v.cost ?? ""}
                      onChange={(e) =>
                        onUpdateCustomVendor(v.id, {
                          cost: e.target.value === "" ? null : Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-end mb-0.5"
                    onClick={() => onRemoveCustomVendor(v.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Button variant="outline" size="sm" className="mt-2" onClick={onAddCustomVendor}>
          + Add vendor / specialist
        </Button>
      </div>
    </div>
  );
}
