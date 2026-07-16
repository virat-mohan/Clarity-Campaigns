import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[3px] border px-2 py-0.5 font-mono text-[10px] font-medium",
  {
    variants: {
      variant: {
        amber: "bg-primary/10 text-primary border-primary/30",
        sage: "bg-secondary/10 text-secondary border-secondary/30",
        coral: "bg-destructive/10 text-destructive border-destructive/30",
        neutral: "bg-muted text-muted-foreground border-border-strong",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, className }))} {...props} />;
}

export { Badge, badgeVariants };
