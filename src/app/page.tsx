import type { Metadata } from "next";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/sections/Hero";
import { PainRelief } from "@/components/landing/sections/PainRelief";
import { Capabilities } from "@/components/landing/sections/Capabilities";
import { BuiltForNigeria } from "@/components/landing/sections/BuiltForNigeria";
import { ByRole } from "@/components/landing/sections/ByRole";
import { PricingTeaser } from "@/components/landing/sections/PricingTeaser";
import { Onboarding } from "@/components/landing/sections/Onboarding";
import { FAQ } from "@/components/landing/sections/FAQ";
import { FinalCTA } from "@/components/landing/sections/FinalCTA";

// Canonical lives here, not in the root layout: a layout-level canonical is
// inherited by every page without its own, which would tell Google that
// /login, /terms etc. are all duplicates of the home page.
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PainRelief />
        <Capabilities />
        <BuiltForNigeria />
        <ByRole />
        <PricingTeaser />
        <Onboarding />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
