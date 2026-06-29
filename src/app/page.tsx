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
