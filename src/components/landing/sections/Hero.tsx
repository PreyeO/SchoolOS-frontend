import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HERO } from "@/data/landing";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";

import { HeroSurface } from "./HeroSurface";

export function Hero() {
  return (
    <section
      className="relative pt-20 pb-12 lg:pt-36 lg:pb-28 bg-paper overflow-hidden"
      aria-label="Hero"
    >
      {/* Subtle background texture */}
      <div
        className="absolute inset-0 bg-dot-grid opacity-40 pointer-events-none"
        aria-hidden
      />

      <Container className="relative">
        <div className="grid lg:grid-cols-[1fr_440px] gap-12 xl:gap-20 items-center">
          {/* Left: copy */}
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.1em] uppercase text-brand mb-5 md:mb-7">
              <span className="w-2 h-2 rounded-full bg-grass animate-pulse" aria-hidden />
              {HERO.eyebrow}
            </p>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-[4.25rem] xl:text-7xl font-bold text-ink leading-[0.93] tracking-tight mb-5 md:mb-6">
              {HERO.headline}
            </h1>

            <p className="text-lg leading-relaxed text-n-500 mb-7 md:mb-9 max-w-xl">
              {HERO.subheadline}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-7 md:mb-10">
              <Button
                asChild
                size="lg"
                className="bg-amber hover:bg-amber/90 text-ink font-semibold h-12 px-7 text-base"
              >
                <Link href={HERO.ctaPrimary.href}>{HERO.ctaPrimary.label}</Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="lg"
                className="text-ink hover:bg-n-100 h-12 px-5 text-base group"
              >
                <Link href={HERO.ctaSecondary.href} className="flex items-center gap-2">
                  {HERO.ctaSecondary.label}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </Button>
            </div>

            <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Trust signals">
              {HERO.trustItems.map((item) => (
                <li key={item} className="flex items-center gap-1.5 font-mono text-[11px] text-n-400 uppercase tracking-wide">
                  <span className="text-grass" aria-hidden>✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <p className="mt-5 text-sm text-n-500 font-medium">
              {HERO.trustLine}
            </p>
          </div>

          {/* Right: live product surface (desktop) */}
          <div className="hidden lg:flex justify-end items-start">
            <HeroSurface />
          </div>
        </div>

        {/* Mobile: surface below copy */}
        <div className="lg:hidden mt-8 flex justify-center">
          <HeroSurface />
        </div>
      </Container>
    </section>
  );
}
