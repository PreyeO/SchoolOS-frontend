"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";

interface SlugFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const SlugField = forwardRef<HTMLInputElement, SlugFieldProps>(
  function SlugField({ hasError, className, ...props }, ref) {
    const domain = process.env.NEXT_PUBLIC_SCHOOL_DOMAIN ?? "schoolos.com";

    return (
      <div
        className={cn(
          "flex h-8 items-center rounded-lg border border-input transition-colors",
          "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
          hasError &&
            "border-destructive focus-within:ring-destructive/20",
        )}
      >
        <input
          ref={ref}
          className={cn(
            "h-full min-w-0 flex-1 bg-transparent px-2.5 text-base outline-none",
            "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
            "md:text-sm",
            className,
          )}
          aria-invalid={hasError}
          {...props}
        />
        <span className="flex h-full shrink-0 select-none items-center whitespace-nowrap border-l border-input bg-muted/40 px-2.5 text-xs text-n-400">
          .{domain}
        </span>
      </div>
    );
  }
);
