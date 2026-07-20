"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HUBSPOT_MEETING_LINK } from "@/components/talk-to-us-cta";

const NAV = [
  { href: "/campaigns", label: "My Campaigns" },
  { href: "/client", label: "Client Portal" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const pillBase = "inline-flex items-center gap-[12px] text-[13px] font-bold tracking-[0.07em] uppercase no-underline cursor-pointer px-[20px] sm:px-[26px] py-[13px] sm:py-[15px] rounded-full transition-all duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap font-sans hover:-translate-y-[2px]";
  
  const pillLight = cn(pillBase, "bg-white/90 backdrop-blur-[12px] text-[#1C1C1C] shadow-[0_6px_22px_-10px_rgba(28,28,28,0.28)] hover:bg-white");
  const pillLightIcon = "w-[28px] h-[28px] rounded-full bg-[#1C1C1C] text-[#F5F5F0] inline-flex items-center justify-center text-[12px] -my-[5px] -mr-[11px] ml-[4px] shrink-0";
  
  const pillDark = cn(pillBase, "bg-[#1C1C1C] text-[#F5F5F0] shadow-[0_6px_22px_-10px_rgba(28,28,28,0.5)] hover:bg-black");
  const pillDarkIcon = "w-[28px] h-[28px] rounded-full bg-[#F5F5F0] text-[#1C1C1C] inline-flex items-center justify-center text-[12px] -my-[5px] -mr-[11px] ml-[4px] shrink-0";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[700] px-[clamp(18px,3.2vw,48px)] py-[18px] flex items-center justify-between pointer-events-none [&>*]:pointer-events-auto">
        <Link 
          href="/" 
          className="font-sans font-extrabold text-[clamp(19px,1.9vw,24px)] tracking-[-0.03em] leading-none bg-[#F5F5F0]/70 backdrop-blur-[12px] px-[20px] py-[13px] rounded-full text-[#1C1C1C] no-underline"
        >
          clarity hq<span className="text-[#D4AF37] text-[0.8em]">✦</span>
        </Link>
        
        <div className="flex gap-[10px] items-center">
          <a 
            href={HUBSPOT_MEETING_LINK}
            target="_blank" 
            rel="noopener noreferrer"
            className={cn(pillLight, "hidden sm:inline-flex")}
          >
            Schedule a call <span className={pillLightIcon}>→</span>
          </a>
          
          <button 
            className={pillDark}
            onClick={() => setMenuOpen(true)}
          >
            Menu <span className={pillDarkIcon}>··</span>
          </button>
        </div>
      </header>

      <div 
        className={cn(
          "fixed inset-0 z-[1000] bg-[#1C1C1C] text-[#F5F5F0] flex flex-col justify-center px-[clamp(18px,3.2vw,48px)] transition-[clip-path] duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
          !menuOpen && "pointer-events-none"
        )}
        style={{
          clipPath: menuOpen ? "inset(0 0 0 0)" : "inset(0 0 100% 0)"
        }}
      >
        <button 
          className={cn(pillLight, "absolute top-[20px] right-[clamp(18px,3.2vw,48px)] pointer-events-auto")}
          onClick={() => setMenuOpen(false)}
        >
          Close <span className={pillLightIcon}>✕</span>
        </button>
        
        <div className="flex flex-col gap-4 pointer-events-auto">
          <Link 
            href="/"
            className="group font-sans font-extrabold text-[clamp(34px,6.8vw,84px)] tracking-[-0.04em] leading-[1.08] no-underline text-[#F5F5F0]/55 hover:text-[#F5F5F0] transition-all duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-[18px] flex items-baseline gap-[22px]"
            onClick={() => setMenuOpen(false)}
          >
            <small className="font-mono text-[12px] text-[#D4AF37] tracking-[0.1em]">00</small>
            Home
          </Link>
          {NAV.map((item, i) => (
            <Link 
              key={item.href}
              href={item.href}
              className="group font-sans font-extrabold text-[clamp(34px,6.8vw,84px)] tracking-[-0.04em] leading-[1.08] no-underline text-[#F5F5F0]/55 hover:text-[#F5F5F0] transition-all duration-[300ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:pl-[18px] flex items-baseline gap-[22px]"
              onClick={() => setMenuOpen(false)}
            >
              <small className="font-mono text-[12px] text-[#D4AF37] tracking-[0.1em]">
                {String(i + 1).padStart(2, "0")}
              </small>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="absolute bottom-[30px] left-[clamp(18px,3.2vw,48px)] right-[clamp(18px,3.2vw,48px)] flex justify-between text-[13px] text-[#F5F5F0]/55 flex-wrap gap-[10px] pointer-events-auto">
          <span>hello@clarityhq.ai</span>
          <span className="hidden sm:inline">Human-led. AI-powered.</span>
        </div>
      </div>
    </>
  );
}
