import { FAQ_CATEGORIES } from "@/lib/data/faq-content";
import { FaqAccordionItem } from "@/components/faq-accordion";
import { Card, CardContent } from "@/components/ui/card";
import { TalkToUsCta } from "@/components/talk-to-us-cta";

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="mb-8 border-b border-border pb-4">
        <div className="font-mono-label text-[10px] text-primary mb-1">Frequently asked questions</div>
        <h1 className="font-heading text-2xl font-semibold">Campaign FAQ</h1>
        <p className="text-[13px] text-muted-foreground mt-1">
          Everything about how the $499 campaigns work, pricing, results, and choosing the right one.
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {FAQ_CATEGORIES.map((category) => (
          <div key={category.title}>
            <div className="font-mono-label text-[9.5px] text-primary-hover mb-3">{category.title}</div>
            <Card>
              <CardContent className="pt-1 pb-1">
                {category.items.map((item) => (
                  <FaqAccordionItem key={item.question} item={item} />
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-[var(--radius-card)] border border-border-strong bg-card p-5 sm:flex-row sm:items-center">
        <div className="font-mono-label text-[10px] text-muted-foreground">Still have questions?</div>
        <TalkToUsCta variant="inline" />
      </div>
    </div>
  );
}
