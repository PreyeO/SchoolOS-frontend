"use client";

import { forwardRef } from "react";
import { Select } from "@/components/ui/select";

import { cn } from "@/lib/utils";
import { NIGERIAN_STATES } from "@/data/nigerian-states";

interface StateSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export const StateSelect = forwardRef<HTMLSelectElement, StateSelectProps>(
  function StateSelect({ className, hasError, ...props }, ref) {
    return (
      <Select
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        {...props}>
        <option value="">Select a state</option>
        {NIGERIAN_STATES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
    );
  }
);
