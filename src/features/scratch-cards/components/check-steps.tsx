import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const STEPS = ["Your card", "Child & term"];

// The two real steps of the form, in order: the card is found first, then the
// child's details are asked for. Numbered because the order is the point.
export function CheckSteps({ current }: { current: 1 | 2 }) {
  return (
    <ol className="flex items-center gap-3" aria-label="Steps">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                done || active ? "bg-primary text-primary-foreground" : "bg-n-100 text-n-500",
              )}
            >
              {done ? <Check className="size-3.5" /> : step}
            </span>
            <span className={cn("text-sm", active ? "font-medium text-ink" : "text-n-500")}>{label}</span>
            {step < STEPS.length && <span className="h-px flex-1 bg-n-200" />}
          </li>
        );
      })}
    </ol>
  );
}
