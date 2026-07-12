"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useStartFlowStore } from "@/lib/store/start-flow-store";

/**
 * Reads ?brand=&score=&name= off the /start URL (brief Section 7.2 — the
 * HubSpot email sequence's {{brand_name}}/{{brand_xray_score}}/{{firstname}}
 * tokens) and records them so the brand name field on Screen 2 arrives
 * pre-filled. Renders nothing; runs once per landing.
 *
 * TODO: confirm URL param names once HubSpot workflow is live — the brief's
 * only worked example is "?brand=STOGA&score=74&name=Rahul", not a formal
 * contract from the HubSpot/S360 side.
 */
export function UrlPrefill() {
  const searchParams = useSearchParams();
  const applyLeadContext = useStartFlowStore((s) => s.applyLeadContext);
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    const brand = searchParams.get("brand");
    const score = searchParams.get("score");
    const name = searchParams.get("name");
    if (!brand && !score && !name) return;
    applied.current = true;
    applyLeadContext({
      ...(brand ? { brand } : {}),
      ...(score ? { score } : {}),
      ...(name ? { name } : {}),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return null;
}
