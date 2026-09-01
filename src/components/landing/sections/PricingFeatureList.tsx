import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface Props {
  items: readonly string[];
  // The pilot panel sits on the brand fill and the plan panel on paper, so the
  // tick and the text both have to flip. Shared here so the two panels can't
  // drift into using different greens for the same list.
  featured?: boolean;
  className?: string;
}

export function PricingFeatureList({ items, featured = false, className }: Props) {
  return (
    <ul className={cn("space-y-3", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm">
          <CheckIcon
            className={cn("mt-0.5 h-4 w-4 shrink-0", featured ? "text-amber" : "text-grass")}
            aria-hidden="true"
          />
          <span className={featured ? "text-paper/85" : "text-ink"}>{item}</span>
        </li>
      ))}
    </ul>
  );
}
