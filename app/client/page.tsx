"use client";

import Link from "next/link";
import { useClientStore } from "@/lib/store/client-store";
import { useCampaignStore } from "@/lib/store/campaign-store";
import { useAdminStore } from "@/lib/store/admin-store";
import { CAMPAIGN_TYPES, CAMPAIGN_TYPE_LIST } from "@/lib/data/campaign-types";
import { CampaignStatusBadge } from "@/components/campaign-status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Pencil, ArrowRight } from "lucide-react";

export default function ClientPortalPage() {
  const profile = useClientStore((s) => s.profile);
  const campaigns = useCampaignStore((s) => s.campaigns);
  const adminClients = useAdminStore((s) => s.clients);

  // Match campaigns by:
  // 1. top-level clientId (set when campaign was created via client portal flow)
  // 2. config.clientId matching an admin client whose name matches the profile company
  // 3. config.client name directly matching the profile company name
  const clientCampaigns = profile
    ? campaigns.filter((c) => {
        if (c.clientId === profile.id) return true;
        const name = profile.companyName.toLowerCase().trim();
        if (!name) return false;
        if ((c.config.client ?? "").toLowerCase().trim() === name) return true;
        const adminClient = adminClients.find((ac) => ac.id === c.config.clientId);
        if (adminClient && adminClient.name.toLowerCase().trim() === name) return true;
        return false;
      })
    : [];

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted border border-border">
          <User className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="font-heading text-xl font-semibold mb-2">Welcome to the Client Portal</h1>
        <p className="text-[13px] text-muted-foreground mb-6 max-w-sm mx-auto">
          Set up your company profile to start creating campaigns and tracking your work with ClarityHQ.
        </p>
        <Link href="/client/profile">
          <Button>Set up profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label text-[10px] text-primary mb-1">Client Portal</div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-semibold">{profile.companyName}</h1>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {profile.contactName}
              {profile.email ? ` · ${profile.email}` : ""}
              {profile.website ? ` · ${profile.website}` : ""}
            </p>
          </div>
          <Link href="/client/profile">
            <Button variant="outline" size="sm" className="gap-1.5 font-mono text-[10px]">
              <Pencil className="h-3 w-3" />
              Edit profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Brand intelligence summary */}
      {(profile.brandBookFileName || profile.icpText) && (
        <Card className="mb-6 bg-muted/40">
          <CardContent className="pt-4 pb-4">
            <div className="font-mono-label text-[9.5px] text-primary mb-3">Brand Intelligence</div>
            <div className="grid sm:grid-cols-2 gap-3 text-[12.5px]">
              {profile.brandBookFileName && (
                <div>
                  <div className="text-[10px] text-muted-foreground-2 font-mono uppercase tracking-wide mb-0.5">Brand book</div>
                  <div className="font-mono text-[11px] text-foreground">{profile.brandBookFileName}</div>
                </div>
              )}
              {profile.icpText && (
                <div>
                  <div className="text-[10px] text-muted-foreground-2 font-mono uppercase tracking-wide mb-0.5">ICP</div>
                  <div className="text-[12px] text-muted-foreground line-clamp-3">{profile.icpText}</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campaigns */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-[16px] font-semibold">
          Your Campaigns{" "}
          <span className="font-normal text-[13px] text-muted-foreground">({clientCampaigns.length})</span>
        </h2>
      </div>

      {clientCampaigns.length === 0 ? (
        <div className="mb-8 rounded-[6px] border border-dashed border-border px-6 py-10 text-center">
          <p className="text-[13px] text-muted-foreground mb-4">
            No campaigns yet. Choose a campaign type below to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 mb-8">
          {[...clientCampaigns].sort((a, b) => b.updatedAt - a.updatedAt).map((c) => {
            const ct = CAMPAIGN_TYPES[c.sku];
            return (
              <Card key={c.id} className="hover:border-primary/40 transition-colors">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <CampaignStatusBadge status={c.status} />
                        <span className="font-mono text-[9.5px] text-muted-foreground-2">{ct.label}</span>
                      </div>
                      <div className="font-heading text-[14px] font-semibold">
                        {c.config.name || <span className="text-muted-foreground font-normal">Untitled campaign</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/proposal/${c.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="font-mono text-[10px] h-7">
                          View proposal
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Start new campaign */}
      <div className="mb-3">
        <div className="font-mono-label text-[9.5px] text-primary mb-3">Start a new campaign</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CAMPAIGN_TYPE_LIST.map((ct) => (
            <Link key={ct.id} href={`/build/new?sku=${ct.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardContent className="pt-3 pb-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[13px] font-semibold font-heading">{ct.label}</div>
                    <div className="text-[11.5px] text-muted-foreground line-clamp-1">{ct.desc}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
