import { Container } from "@/components/layout/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { PAIN_RELIEF } from "@/data/landing";

export function PainRelief() {
  return (
    <section data-surface="ink" className="bg-ink text-paper py-12 md:py-24">
      <Container>
        <SectionLabel className="mb-6 md:mb-10 text-paper">{PAIN_RELIEF.eyebrow}</SectionLabel>

        <div className="grid gap-8 md:gap-16 lg:grid-cols-2 lg:gap-24 items-start">
          <div>
            <p className="font-display text-3xl md:text-4xl xl:text-5xl font-semibold leading-tight text-paper/70">
              {PAIN_RELIEF.pain}
            </p>
          </div>

          <div className="space-y-8">
            <p className="text-lg md:text-xl text-paper/80 leading-relaxed">
              {PAIN_RELIEF.relief}
            </p>

            <div className="border-l-2 border-amber pl-6">
              <p className="font-display text-xl font-semibold text-amber">
                {PAIN_RELIEF.stat}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
