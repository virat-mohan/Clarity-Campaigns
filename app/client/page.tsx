"use client";

import Link from "next/link";
import { MARKET_OPTIONS } from "@/lib/data/campaign-brief-fields";
import { INDUSTRY_LIST } from "@/lib/data/industry-benchmarks";
import { SKU_TO_SLUG } from "@/lib/data/campaign-flow-copy";
import { useStartFlowStore } from "@/lib/store/start-flow-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ClientPortalPage() {
  const brandBasics = useStartFlowStore((s) => s.brandBasics);
  const targetCustomer = useStartFlowStore((s) => s.targetCustomer);
  const selectedSku = useStartFlowStore((s) => s.selectedSku);

  const rows: [string, string][] = [
    ["Brand name", brandBasics.brandName],
    ["Website", brandBasics.website],
    ["Market", MARKET_OPTIONS.find((m) => m.value === brandBasics.country)?.label ?? ""],
    ["Industry", INDUSTRY_LIST.find((i) => i.id === brandBasics.industry)?.name ?? ""],
    ["What the brand does", brandBasics.whatBrandDoes],
    ["ICP", targetCustomer.icpDescription],
    ["Competitors", targetCustomer.competitors],
  ];
  const filled = rows.filter(([, v]) => v);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-9">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label mb-1 text-[10px] text-primary">Client portal</div>
        <h1 className="font-heading text-2xl font-semibold">Your brand profile</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          The Brand Intelligence details on file — reused across every campaign you run.
        </p>
      </div>

      <Card>
        <CardContent className="pt-5">
          {filled.length > 0 ? (
            filled.map(([k, v]) => (
              <div key={k} className="mb-1.5 flex items-start justify-between gap-4 text-[12.5px]">
                <span className="w-[150px] flex-none text-muted-foreground">{k}</span>
                <span className="flex-1 text-right">{v}</span>
              </div>
            ))
          ) : (
            <p className="text-[12.5px] text-muted-foreground">
              No brand profile yet. Fill in a campaign brief and your details appear here.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-[18px] flex items-center justify-between border-t border-border pt-[18px]">
        <Link href="/start">
          <Button variant="outline">← Back to campaigns</Button>
        </Link>
        {selectedSku && (
          <Link href={`/start/brief?type=${SKU_TO_SLUG[selectedSku]}`}>
            <Button variant="outline" size="sm">
              Edit details
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
