import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-[3px] border border-paper-border bg-[#fdfbf7] px-2.5 py-1.5 text-[13px] text-paper-foreground placeholder:text-[#9a9585] focus-visible:outline-none focus-visible:border-primary-hover disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
