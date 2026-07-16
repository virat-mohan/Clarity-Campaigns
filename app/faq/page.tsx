import Link from "next/link";
import { FAQ_CATEGORIES } from "@/lib/data/faq-content";
import { FaqAccordionItem } from "@/components/faq-accordion";
import { TalkToUsCta } from "@/components/talk-to-us-cta";
import { Button } from "@/components/ui/button";

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-12 pt-9">
      <div className="mb-6 border-b border-border pb-4">
        <div className="font-mono-label mb-1 text-[10px] text-primary">Frequently asked questions</div>
        <h1 className="font-heading text-2xl font-semibold">Everything about the $499 campaign</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Refunds, payment, process, and results — the straight answers.
        </p>
      </div>

      <div className="flex flex-col">
        {FAQ_CATEGORIES.map((category) => (
          <div key={category.title}>
            <div className="font-mono-label mb-2 mt-[22px] text-[10px] tracking-[0.12em] text-primary">
              {category.title}
            </div>
            {category.items.map((item) => (
              <FaqAccordionItem key={item.question} item={item} />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-[18px]">
        <Link href="/start">
          <Button variant="outline">← Back to campaigns</Button>
        </Link>
        <TalkToUsCta variant="inline" label="Still have questions? Talk to us" />
      </div>
    </div>
  );
}
