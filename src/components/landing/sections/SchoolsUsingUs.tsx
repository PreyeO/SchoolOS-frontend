import Image, { type StaticImageData } from "next/image";

import { Container } from "@/components/layout/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { SCHOOLS_USING_US } from "@/data/landing";

import kidsParadise from "../assets/schools/kids-paradise.png";
import letItShine from "../assets/schools/let-it-shine.png";
import stPetersIkwuano from "../assets/schools/st-peters-ikwuano.png";

// Keyed by the ids in SCHOOLS_USING_US, so the copy stays in data/landing.ts
// and an unmatched id fails the type-check rather than rendering a blank.
const LOGOS: Record<(typeof SCHOOLS_USING_US.schools)[number]["id"], StaticImageData> = {
  "st-peters-ikwuano": stPetersIkwuano,
  "let-it-shine": letItShine,
  "kids-paradise": kidsParadise,
};

// Social proof directly under the hero.
//
// The crests are set like printed seals, not boxed. The schools sent them on
// white; the assets here were cut to transparent PNGs (near-white keyed out
// with a soft edge, then trimmed), so no rectangle shows on any background.
// Re-cut a new logo the same way rather than boxing it. Greyscale gives three unrelated crests one tone that
// doesn't fight the brand greens and amber; each takes its colour on hover.
export function SchoolsUsingUs() {
  return (
    <section
      aria-label="Schools using SchoolOS"
      className="bg-paper border-t border-n-200/70 py-14 md:py-20"
    >
      <Container>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-16">
          <div className="max-w-xl">
            <SectionLabel className="mb-4 text-brand opacity-100">{SCHOOLS_USING_US.label}</SectionLabel>
            <p className="font-display text-3xl md:text-4xl font-semibold leading-[1.15] tracking-tight text-n-400">
              {SCHOOLS_USING_US.headline.map((part) =>
                "strong" in part ? (
                  <span key={part.text} className="text-ink">
                    {part.text}
                  </span>
                ) : (
                  part.text
                ),
              )}
            </p>
          </div>

          <ul className="grid grid-cols-3 divide-x divide-n-200">
            {SCHOOLS_USING_US.schools.map((school) => (
              <li
                key={school.id}
                className="group flex flex-col items-center gap-3 px-3 sm:px-8 lg:px-10"
              >
                <div className="flex h-16 items-center sm:h-20 lg:h-24">
                  <Image
                    src={LOGOS[school.id]}
                    alt={school.name}
                    sizes="(min-width: 1024px) 112px, 80px"
                    className="h-full w-auto max-w-full object-contain grayscale opacity-75 transition duration-300 group-hover:grayscale-0 group-hover:opacity-100"
                  />
                </div>
                <p className="text-center text-xs leading-snug text-n-500" aria-hidden>
                  {school.shortName}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
