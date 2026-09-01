import { PILOT_OFFER } from "@/data/pricing";

import { PricingFeatureList } from "./PricingFeatureList";

// The free period, as an offer rather than a tier. It carries the primary CTA,
// so it takes the brand fill — but it deliberately shows no price, not even
// "₦0": a zero beside the ₦1,000 next to it would read as a cheaper product
// when it's the same product, free for a while.
export function PilotCard() {
  return (
    <div className="relative flex flex-col rounded-2xl border border-brand bg-brand p-8 text-paper shadow-xl">
      <span className="absolute -top-3 left-8 rounded-full bg-amber px-4 py-1 text-xs font-semibold text-ink">
        {PILOT_OFFER.badge}
      </span>

      <p className="mb-3 font-display text-2xl font-semibold text-paper">{PILOT_OFFER.name}</p>

      <p className="mb-6 text-sm leading-relaxed text-paper/75">{PILOT_OFFER.description}</p>

      <PricingFeatureList items={PILOT_OFFER.features} featured className="mb-8 flex-1" />

      <a
        href={PILOT_OFFER.cta.href}
        className="block rounded-lg bg-amber px-6 py-3 text-center text-sm font-semibold text-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
      >
        {PILOT_OFFER.cta.label}
      </a>
    </div>
  );
}
