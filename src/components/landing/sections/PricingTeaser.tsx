import { Container } from "@/components/layout/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PRICING_NOTE } from "@/data/pricing";
import { PRICING_TRUST } from "@/data/landing";
import { PilotCard } from "./PilotCard";
import { PricingCard } from "./PricingCard";

// Two panels, not a tier ladder — see the note at the top of data/pricing.ts.
// Price on the left, pilot on the right, in that order deliberately: a pricing
// section that leads with "free" and makes you hunt for the number reads as
// evasive. Left to right it says "₦1,000 per student per term — and your first
// term is free", which is the whole offer in one line.
export function PricingTeaser() {
  return (
    <section id="pricing" className="bg-n-50 py-12 md:py-24 scroll-mt-24">
      <Container>
        <div className="mb-8 md:mb-12 max-w-2xl">
          <SectionLabel className="mb-4 text-n-500">Pricing</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight mb-4">
            One plan. One price. Nothing held back.
          </h2>
          <p className="text-n-600 text-lg">
            ₦1,000 per student per term, and every school gets every feature. Your first term is
            free.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 items-start">
          <PricingCard />
          <PilotCard />
        </div>

        <p className="mt-6 text-center text-sm font-medium text-n-600">{PRICING_TRUST}</p>
        <p className="mt-3 text-center text-xs text-n-400">{PRICING_NOTE}</p>
      </Container>
    </section>
  );
}
