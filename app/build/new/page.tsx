"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CAMPAIGN_TYPES, SkuId } from "@/lib/data/campaign-types";
import { useCampaignStore } from "@/lib/store/campaign-store";
import { useClientStore } from "@/lib/store/client-store";

function NewCampaignRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sku = searchParams.get("sku") as SkuId | null;
  const createCampaign = useCampaignStore((s) => s.createCampaign);
  const clientProfile = useClientStore((s) => s.profile);

  useEffect(() => {
    if (!sku || !CAMPAIGN_TYPES[sku]) {
      router.replace("/");
      return;
    }
    const id = createCampaign(sku, clientProfile?.id);
    router.replace(`/build/${id}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-[13px]">
      Creating campaign…
    </div>
  );
}

export default function NewCampaignPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-muted-foreground text-[13px]">Creating campaign…</div>}>
      <NewCampaignRedirect />
    </Suspense>
  );
}
