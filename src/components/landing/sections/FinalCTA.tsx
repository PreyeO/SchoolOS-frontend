import { Container } from "@/components/layout/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FINAL_CTA } from "@/data/landing";

export function FinalCTA() {
  return (
    // id="demo": every "Book a demo" CTA on the page points at #demo.
    <section id="demo" data-surface="ink" className="bg-ink py-12 md:py-24 scroll-mt-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <SectionLabel className="mb-4 text-paper/50">{FINAL_CTA.eyebrow}</SectionLabel>

          <h2 className="font-display text-3xl md:text-5xl font-semibold text-paper leading-tight mb-5">
            {FINAL_CTA.heading}
          </h2>

          <p className="text-paper/70 text-lg leading-relaxed mb-8">
            {FINAL_CTA.body}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={FINAL_CTA.ctaPrimary.href}
              className="rounded-lg bg-amber px-8 py-4 text-sm font-semibold text-ink transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber"
            >
              {FINAL_CTA.ctaPrimary.label}
            </a>
            <a
              href={FINAL_CTA.ctaSecondary.href}
              className="rounded-lg border border-paper/30 px-8 py-4 text-sm font-semibold text-paper transition-colors hover:border-paper/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            >
              {FINAL_CTA.ctaSecondary.label}
            </a>
          </div>

          <p className="mt-8 text-xs text-paper/40">{FINAL_CTA.footnote}</p>
        </div>
      </Container>
    </section>
  );
}
