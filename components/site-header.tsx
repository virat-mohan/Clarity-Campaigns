import Link from "next/link";
import { TalkToUsCta } from "@/components/talk-to-us-cta";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-[54px] max-w-[1180px] items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-[15px] font-bold">
          <span className="grid h-[22px] w-[22px] place-items-center rounded-full border-2 border-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          ClarityHQ
        </Link>
        <span className="font-mono text-[10.5px] px-2 py-1 rounded-[3px] bg-primary/10 border border-primary/30 text-primary">
          Campaign Marketplace
        </span>
        <div className="ml-auto flex items-center gap-2">
          <TalkToUsCta />
        </div>
      </div>
    </header>
  );
}
