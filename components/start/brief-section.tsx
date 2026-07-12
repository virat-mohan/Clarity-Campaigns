import { Card, CardContent } from "@/components/ui/card";

export function BriefSection({ title, helper, children }: { title: string; helper?: string; children: React.ReactNode }) {
  return (
    <Card className="bg-paper border-paper-border text-paper-foreground">
      <CardContent className="pt-5">
        <div className="font-mono-label text-[9.5px] text-primary-hover mb-1">{title}</div>
        {helper && <p className="text-[11.5px] text-muted-foreground-2 mb-3">{helper}</p>}
        <div className="mt-3">{children}</div>
      </CardContent>
    </Card>
  );
}
