// Landing page — the homepage at "/".
// Navbar is imported directly here because this file sits outside the
// (marketing) route group, so (marketing)/layout.tsx does not apply.
// Sub-pages like /pricing and /about live inside (marketing)/ and
// receive Navbar + Footer automatically from (marketing)/layout.tsx.
import { Hero } from "@/components/landing/sections/Hero";
import { Navbar } from "@/components/layout/Navbar";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        {/* TODO (Phase 2 full): PainRelief, Capabilities, BuiltForNigeria,
            ByRole, PricingTeaser, Onboarding, FAQ, FinalCTA, Footer */}
      </main>
    </>
  );
}
