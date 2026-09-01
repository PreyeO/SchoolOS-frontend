import { PRICING_PLAN } from "@/data/pricing";

import { PricingFeatureList } from "./PricingFeatureList";

// The one plan. No tier name above the price: with a single plan, a label like
// "Standard" only invites the reader to look for the tier it's being compared
// against, and there isn't one.
export function PricingCard() {
  return (
    <div className="flex flex-col rounded-2xl border border-n-200 bg-paper p-8 text-ink">
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold text-ink">
            ₦{PRICING_PLAN.price.toLocaleString()}
          </span>
          <span className="text-sm text-n-500">{PRICING_PLAN.unit}</span>
        </div>
        <p className="mt-2 text-xs text-n-400">{PRICING_PLAN.periodNote}</p>
      </div>

      <p className="mb-6 text-sm leading-relaxed text-n-600">{PRICING_PLAN.description}</p>

      <PricingFeatureList items={PRICING_PLAN.features} className="mb-8 flex-1" />

      <a
        href={PRICING_PLAN.cta.href}
        className="block rounded-lg border border-brand px-6 py-3 text-center text-sm font-semibold text-brand transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {PRICING_PLAN.cta.label}
      </a>
    </div>
  );
}
