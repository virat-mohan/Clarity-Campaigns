import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[70px] w-full rounded-[3px] border border-paper-border bg-[#fdfbf7] px-2.5 py-1.5 text-[13px] text-paper-foreground placeholder:text-[#9a9585] focus-visible:outline-none focus-visible:border-primary-hover disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
