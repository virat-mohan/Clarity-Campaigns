import { Button } from "@/components/ui/button";

const HUBSPOT_MEETING_LINK = "https://meetings-na2.hubspot.com/virat-mohan";

export function TalkToUsCta({
  variant = "header",
  className,
}: {
  variant?: "header" | "inline";
  /** Extra classes for the button — the header uses this to render a solid black pill over the cream hero. */
  className?: string;
}) {
  if (variant === "inline") {
    return (
      <a href={HUBSPOT_MEETING_LINK} target="_blank" rel="noopener noreferrer">
        <Button variant="outline" size="sm">
          Talk to us instead
        </Button>
      </a>
    );
  }
  return (
    <a href={HUBSPOT_MEETING_LINK} target="_blank" rel="noopener noreferrer">
      <Button variant="outline" size="sm" className={className}>
        Talk to us
      </Button>
    </a>
  );
}