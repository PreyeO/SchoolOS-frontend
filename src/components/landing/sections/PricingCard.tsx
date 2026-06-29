import { type PricingTier } from "@/data/pricing";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  tier: PricingTier;
}

export function PricingCard({ tier }: Props) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-8",
        tier.featured
          ? "border-brand bg-brand text-paper shadow-xl"
          : "border-n-200 bg-paper text-ink",
      )}
    >
      {tier.featured && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber px-4 py-1 text-xs font-semibold text-ink">
          Most popular
        </span>
      )}

      <div className="mb-6">
        <p
          className={cn(
            "font-display text-lg font-semibold mb-3",
            tier.featured ? "text-paper" : "text-ink",
          )}
        >
          {tier.name}
        </p>
        <div className="flex items-baseline gap-1">
          {tier.price !== null ? (
            <>
              <span
                className={cn(
                  "font-display text-4xl font-bold",
                  tier.featured ? "text-paper" : "text-ink",
                )}
              >
                ₦{tier.price.toLocaleString()}
              </span>
              <span
                className={cn(
                  "text-sm",
                  tier.featured ? "text-paper/70" : "text-n-500",
                )}
              >
                {tier.unit}
              </span>
            </>
          ) : (
            <span
              className={cn(
                "font-display text-3xl font-bold",
                tier.featured ? "text-paper" : "text-ink",
              )}
            >
              Custom
            </span>
          )}
        </div>
        <p
          className={cn(
            "text-xs mt-2",
            tier.featured ? "text-paper/60" : "text-n-400",
          )}
        >
          {tier.limit}
        </p>
      </div>

      <p
        className={cn(
          "text-sm leading-relaxed mb-6",
          tier.featured ? "text-paper/75" : "text-n-600",
        )}
      >
        {tier.description}
      </p>

      <ul className="flex-1 space-y-3 mb-8">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <CheckIcon
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                tier.featured ? "text-amber" : "text-grass",
              )}
              aria-hidden="true"
            />
            <span className={tier.featured ? "text-paper/85" : "text-ink"}>
              {f}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={tier.cta.href}
        className={cn(
          "block rounded-lg px-6 py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2",
          tier.featured
            ? "bg-amber text-ink focus-visible:outline-amber"
            : "border border-brand text-brand focus-visible:outline-brand",
        )}
      >
        {tier.cta.label}
      </a>
    </div>
  );
}
