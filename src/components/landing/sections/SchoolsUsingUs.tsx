import Image, { type StaticImageData } from "next/image";

import { Container } from "@/components/layout/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SCHOOLS_USING_US } from "@/data/landing";

import kidsParadise from "../assets/schools/kids-paradise.jpg";
import letItShine from "../assets/schools/let-it-shine.jpg";
import stPetersIkwuano from "../assets/schools/st-peters-ikwuano.png";

// Keyed by the ids in SCHOOLS_USING_US, so the copy stays in data/landing.ts
// and an unmatched id fails the type-check rather than rendering a blank box.
const LOGOS: Record<(typeof SCHOOLS_USING_US.schools)[number]["id"], StaticImageData> = {
  "st-peters-ikwuano": stPetersIkwuano,
  "let-it-shine": letItShine,
  "kids-paradise": kidsParadise,
};

// Social proof directly under the hero: real schools' crests plus headcounts.
// Each crest sits on a white tile because the source files have white
// backgrounds, which would otherwise show as off-colour boxes on bg-paper.
export function SchoolsUsingUs() {
  return (
    <section aria-label="Schools using SchoolOS" className="bg-paper border-y border-n-200 py-10 md:py-14">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div>
            <SectionLabel className="mb-4 text-ink">{SCHOOLS_USING_US.label}</SectionLabel>
            <dl className="flex flex-wrap gap-x-8 gap-y-4">
              {SCHOOLS_USING_US.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse">
                  <dt className="text-sm text-n-500">{stat.label}</dt>
                  <dd className="font-display text-3xl md:text-4xl font-semibold text-ink leading-none mb-1">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <ul className="grid grid-cols-3 gap-3 sm:gap-4 lg:w-auto">
            {SCHOOLS_USING_US.schools.map((school) => (
              <li
                key={school.id}
                className="flex h-24 items-center justify-center rounded-xl border border-n-200 bg-white p-2 sm:h-28 sm:w-32 lg:h-32 lg:w-36"
              >
                <Image
                  src={LOGOS[school.id]}
                  alt={school.name}
                  title={school.name}
                  sizes="144px"
                  className="h-full w-auto max-w-full object-contain"
                />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
