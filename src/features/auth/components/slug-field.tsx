"use client";

import { forwardRef } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface SlugFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  slug: string;
  hasError?: boolean;
}

export const SlugField = forwardRef<HTMLInputElement, SlugFieldProps>(
  function SlugField({ slug, hasError, className, ...props }, ref) {
    const domain = process.env.NEXT_PUBLIC_SCHOOL_DOMAIN ?? "schoolos.com";
    const preview = slug.trim().length > 0 ? `${slug}.${domain}` : null;

    return (
      <div className="space-y-1">
        <Input
          ref={ref}
          className={cn(
            hasError && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          aria-invalid={hasError}
          {...props}
        />
        {preview && (
          <p className="font-mono text-[11px] text-n-400 tracking-wide">
            {preview}
          </p>
        )}
      </div>
    );
  }
);
