import { Container } from "@/components/layout/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ByRoleTabs } from "./ByRoleTabs";

export function ByRole() {
  return (
    <section className="bg-n-50 py-12 md:py-24">
      <Container>
        <div className="mb-6 md:mb-10 max-w-2xl">
          <SectionLabel className="mb-4 text-n-500">Built for every role</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight">
            Everyone at your school gets what they need.
          </h2>
        </div>

        <ByRoleTabs />
      </Container>
    </section>
  );
}
