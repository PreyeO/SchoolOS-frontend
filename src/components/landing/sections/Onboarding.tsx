import { Container } from "@/components/layout/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ONBOARDING } from "@/data/landing";

export function Onboarding() {
  return (
    <section className="bg-paper py-12 md:py-24">
      <Container>
        <div className="mb-8 md:mb-14 max-w-2xl">
          <SectionLabel className="mb-4 text-n-500">{ONBOARDING.eyebrow}</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight">
            {ONBOARDING.heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {ONBOARDING.steps.map((step) => (
            <div key={step.number} className="flex gap-5">
              <div className="shrink-0">
                <span className="font-mono text-3xl font-bold text-amber leading-none">
                  {step.number}
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-ink mb-2">
                  {step.heading}
                </h3>
                <p className="text-n-600 text-sm leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
