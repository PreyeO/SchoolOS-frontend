import { Container } from "@/components/layout/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { BUILT_FOR_NIGERIA } from "@/data/landing";

// id was "about" — renamed to match the navbar/footer's "How It Works" label,
// which this section's content (calendar, subjects, grading, payments,
// offline) always was, not company-about copy.
export function BuiltForNigeria() {
  return (
    <section id="how-it-works" data-surface="brand" className="bg-brand py-12 md:py-24 scroll-mt-24">
      <Container>
        <div className="mb-8 md:mb-14 max-w-3xl">
          <SectionLabel className="mb-4 text-paper/60">{BUILT_FOR_NIGERIA.eyebrow}</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-paper leading-tight mb-5">
            {BUILT_FOR_NIGERIA.heading}
          </h2>
          <p className="text-paper/75 text-lg leading-relaxed">
            {BUILT_FOR_NIGERIA.body}
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BUILT_FOR_NIGERIA.proofPoints.map((point) => (
            <li
              key={point.label}
              className="rounded-xl border border-paper/20 bg-paper/10 p-6"
            >
              <p className="font-semibold text-paper mb-2">{point.label}</p>
              <p className="text-sm text-paper/70 leading-relaxed">{point.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
