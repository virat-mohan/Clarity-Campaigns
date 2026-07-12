"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { TalkToUsCta } from "@/components/talk-to-us-cta";

const NAV = [
  { href: "/campaigns", label: "My Campaigns" },
  { href: "/client", label: "Client Portal" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  const pathname = usePathname();
  // The old homepage's floating cream-hero treatment now lives at /classic
  // (root "/" is a server redirect to /start, so it never actually renders).
  const isHome = pathname === "/classic";
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // "floating" = editorial treatment over the cream hero. Anywhere else -> solid dark bar.
  const floating = isHome && !scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        floating
          ? // paints the exact hero cream (--paper) so the bar reads as part of the hero.
          // NOTE: must not be bg-transparent — the header is sticky and sits *above*
          // the cream section in flow, so transparent reveals the dark body background.
          "bg-[#f4f1e8] border-b border-transparent"
          : "border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      )}
    >
      <div className="mx-auto flex h-[56px] max-w-[1180px] items-center gap-3 px-4">
        {/* Logo — plain dark text over the hero (clarityhq shows no pill at scroll-top) */}
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 font-heading text-[15px] font-bold transition-colors",
            floating ? "text-[#1c1712]" : "text-foreground"
          )}
        >
          <span
            className={cn(
              "grid h-[24px] w-[24px] place-items-center rounded-full border",
              floating ? "bg-primary/20 border-primary/50" : "bg-primary/15 border-primary/40"
            )}
          >
            <span className="h-2 w-2 rounded-full bg-primary" />
          </span>
          ClarityHQ
        </Link>

        <span
          className={cn(
            "text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full border transition-colors",
            floating
              ? "bg-[#1c1712]/5 border-[#1c1712]/20 text-[#8a6d1f]"
              : "bg-primary/10 border-primary/25 text-primary"
          )}
        >
          Campaign Marketplace
        </span>

        {/* Right cluster — a white floating pill group over the cream hero */}
        <div
          className={cn(
            "ml-auto flex items-center gap-4 transition-colors",
            floating &&
            "rounded-full bg-white/85 backdrop-blur border border-black/5 shadow-sm pl-5 pr-1.5 py-1.5"
          )}
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[12.5px] font-medium transition-colors",
                floating
                  ? "text-[#6b6353] hover:text-[#1c1712]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
          <TalkToUsCta
            className={cn(
              floating && "bg-[#1c1712] text-[#f4f1e8] border-transparent hover:opacity-90 hover:text-[#f4f1e8]"
            )}
          />
        </div>
      </div>
    </header>
  );
}