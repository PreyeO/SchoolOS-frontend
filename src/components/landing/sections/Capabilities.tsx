import { Container } from "@/components/layout/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { CapabilitiesClient } from "./CapabilitiesClient";

export function Capabilities() {
  return (
    <section className="bg-paper py-12 md:py-24">
      <Container>
        <div className="mb-8 md:mb-12 max-w-2xl">
          <SectionLabel className="mb-4 text-n-500">What SchoolOS does</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-ink leading-tight">
            Every module your school needs. One platform.
          </h2>
        </div>

        <CapabilitiesClient />
      </Container>
    </section>
  );
}
