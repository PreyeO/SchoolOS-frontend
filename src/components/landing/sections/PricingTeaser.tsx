import { Container } from "@/components/layout/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PRICING_TIERS, PRICING_NOTE } from "@/data/pricing";
import { PricingCard } from "./PricingCard";

export function PricingTeaser() {
  return (
    <section className="bg-n-50 py-12 md:py-24">
      <Container>
        <div className="mb-8 md:mb-12 max-w-2xl">
          <SectionLabel className="mb-4 text-n-500">Pricing</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight mb-4">
            Straightforward pricing. No surprises.
          </h2>
          <p className="text-n-600 text-lg">
            Pay per active student per term. The more students you have, the less you pay per head.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 items-start">
          {PRICING_TIERS.map((tier) => (
            <PricingCard key={tier.name} tier={tier} />
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-n-400">{PRICING_NOTE}</p>
      </Container>
    </section>
  );
}
