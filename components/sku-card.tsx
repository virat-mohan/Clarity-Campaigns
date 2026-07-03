import Link from "next/link";
import { CampaignType } from "@/lib/data/campaign-types";
import { IND } from "@/lib/data/industry-benchmarks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STAGE_VARIANT = {
  Acquisition: "amber",
  Conversion: "sage",
  Retention: "coral",
} as const;

export function SkuCard({ ct }: { ct: CampaignType }) {
  return (
    <Card className="flex flex-col justify-between transition-colors hover:border-primary/50">
      <CardContent className="pt-5">
        <div className="mb-3 flex items-center justify-between">
          <Badge variant={STAGE_VARIANT[ct.flywheelStage]}>{ct.flywheelStage}</Badge>
          <span className="font-mono text-[10px] uppercase text-muted-foreground-2">
            {ct.mode === "sales" ? "Sales / Outbound" : "Marketing / Media"}
          </span>
        </div>
        <h3 className="font-heading text-[17px] font-semibold mb-1.5">{ct.label}</h3>
        <p className="text-[13px] text-muted-foreground leading-snug mb-3">{ct.desc}</p>

        <div className="mb-3 rounded-[3px] bg-muted px-2.5 py-2">
          <div className="font-mono-label text-[9px] text-muted-foreground-2 mb-1">Works well for</div>
          <div className="flex flex-wrap gap-1 mb-1.5">
            {ct.bestFitIndustries.map((id) => (
              <span key={id} className="font-mono text-[9.5px] px-1.5 py-0.5 rounded-[2px] bg-card border border-border text-foreground">
                {IND[id].name}
              </span>
            ))}
          </div>
          <p className="text-[11.5px] text-muted-foreground leading-snug">{ct.fitRationale}</p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {ct.channels.map((c) => (
            <span
              key={c}
              className="font-mono text-[9px] px-1.5 py-0.5 rounded-[2px] bg-muted text-muted-foreground-2"
            >
              {c}
            </span>
          ))}
        </div>
        <Link href={`/build/new?sku=${ct.id}`} className="block">
          <Button className="w-full">Build this campaign</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
