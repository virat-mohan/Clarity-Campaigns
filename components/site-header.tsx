"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { TalkToUsCta, HUBSPOT_MEETING_LINK } from "@/components/talk-to-us-cta";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/campaigns", label: "My Campaigns" },
  { href: "/client", label: "Client Portal" },
  { href: "/admin", label: "Admin" },
];

function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/92">
      <div className="mx-auto flex h-[60px] max-w-[1080px] items-center gap-3 px-5">
        <Link href="/" className="flex items-center gap-2 font-heading text-[16px] font-bold text-foreground">
          <span className="h-[9px] w-[9px] rounded-full bg-primary" />
          ClarityHQ
        </Link>
        <a href={HUBSPOT_MEETING_LINK} target="_blank" rel="noopener noreferrer" className="ml-auto">
          <Button variant="accent" className="h-9 px-4 text-[12.5px]">
            Schedule a call
          </Button>
        </a>
      </div>
    </header>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return <MarketingHeader />;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-[56px] max-w-[1180px] items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-[15px] font-bold text-foreground transition-colors">
          <span className="grid h-[24px] w-[24px] place-items-center rounded-full border bg-primary/15 border-primary/40">
            <span className="h-2 w-2 rounded-full bg-primary" />
          </span>
          ClarityHQ
        </Link>

        <span className="rounded-full border bg-primary/10 border-primary/25 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary transition-colors">
          Campaign Marketplace
        </span>

        <div className="ml-auto flex items-center gap-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[12.5px] font-medium transition-colors",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          <TalkToUsCta />
        </div>
      </div>
    </header>
  );
}
