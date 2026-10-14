import { Container } from "@/components/layout/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { FAQAccordion } from "./FAQAccordion";

export function FAQ() {
  return (
    <section className="bg-paper py-12 md:py-24">
      <Container>
        <div className="grid grid-cols-1 gap-8 md:gap-16 lg:grid-cols-[1fr_2fr] lg:gap-24 items-start">
          <div>
            <SectionLabel className="mb-4 text-n-500">FAQ</SectionLabel>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight">
              Questions we get all the time.
            </h2>
            <p className="mt-4 text-n-600 leading-relaxed">
              Still have questions? Call us, we answer the phone.
            </p>
          </div>

          <FAQAccordion />
        </div>
      </Container>
    </section>
  );
}
