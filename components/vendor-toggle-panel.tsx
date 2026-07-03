"use client";

import { RETAINER_ROSTER, VENDOR_ROSTER, RosterEntry } from "@/lib/data/talent-vendor-roster";
import { VIDEO_ASSET_TYPES } from "@/lib/data/campaign-types";
import { VendorToggleState, CustomVendorLine } from "@/lib/store/campaign-store";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const VIDEO_VENDOR_IDS = new Set(["ai-video-studio", "film-director", "photographer"]);

export function VendorTogglePanel({
  assetTypes,
  vendorToggles,
  onToggle,
  customVendors,
  onAddCustomVendor,
  onUpdateCustomVendor,
  onRemoveCustomVendor,
}: {
  assetTypes: string[];
  vendorToggles: Record<string, VendorToggleState>;
  onToggle: (vendorId: string, state: VendorToggleState) => void;
  customVendors: CustomVendorLine[];
  onAddCustomVendor: () => void;
  onUpdateCustomVendor: (id: string, partial: Partial<Omit<CustomVendorLine, "id">>) => void;
  onRemoveCustomVendor: (id: string) => void;
}) {
  const hasVideoAsset = assetTypes.some((t) => VIDEO_ASSET_TYPES.has(t));
  const visibleVendors: RosterEntry[] = [
    ...RETAINER_ROSTER,
    ...VENDOR_ROSTER.filter((v) => !VIDEO_VENDOR_IDS.has(v.id) || hasVideoAsset),
  ];

  return (
    <div>
      <div className="font-mono-label text-[9.5px] text-muted-foreground mb-2">
        Vendor & specialist capacity — toggle on to add
      </div>
      {!hasVideoAsset && (
        <p className="mb-3 text-[11px] text-muted-foreground-2">
          AI Video Generation, Film Director, and Photographer unlock once a Reel or video asset is
          added to the brief.
        </p>
      )}
      <div className="flex flex-col gap-2">
        {visibleVendors.map((v) => {
          const state = vendorToggles[v.id] ?? { on: false, cost: v.rate };
          return (
            <Card key={v.id}>
              <CardContent className="pt-3 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-heading text-[13px] font-semibold">{v.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground-2">
                      {v.dept} · {v.engagementType.replace("-", " ")} · {v.source}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <Label className="mb-0.5">{v.rateUnit.startsWith("₹") ? "Cost (₹)" : "Cost ($)"}</Label>
                      <Input
                        type="number"
                        placeholder="TBD"
                        value={state.cost ?? ""}
                        disabled={!state.on}
                        onChange={(e) =>
                          onToggle(v.id, {
                            on: state.on,
                            cost: e.target.value === "" ? null : Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <Switch
                      checked={state.on}
                      onCheckedChange={(checked) => onToggle(v.id, { on: checked, cost: state.cost })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-5">
        <div className="font-mono-label text-[9.5px] text-muted-foreground mb-2">
          Any other vendor or specialist
        </div>
        <div className="flex flex-col gap-2">
          {customVendors.map((v) => (
            <Card key={v.id}>
              <CardContent className="pt-3 pb-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[160px]">
                    <Label className="mb-0.5">Name</Label>
                    <Input
                      placeholder="e.g. Local translator, PR agency"
                      value={v.name}
                      onChange={(e) => onUpdateCustomVendor(v.id, { name: e.target.value })}
                    />
                  </div>
                  <div className="w-32">
                    <Label className="mb-0.5">Cost ($/project)</Label>
                    <Input
                      type="number"
                      placeholder="TBD"
                      value={v.cost ?? ""}
                      onChange={(e) => onUpdateCustomVendor(v.id, { cost: e.target.value === "" ? null : Number(e.target.value) })}
                    />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onRemoveCustomVendor(v.id)}>
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
