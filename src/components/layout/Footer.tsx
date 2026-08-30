import { Container } from "./Container";

// The three that have somewhere to go now point at the real sections. The rest
// keep href="#" because no such page or section exists yet — worth replacing
// with real destinations (or dropping) before launch, since a link that scrolls
// the reader back to the top reads as broken.
const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "What's new", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy policy", href: "#" },
      { label: "Terms of service", href: "#" },
      { label: "NDPA compliance", href: "#" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-ink text-paper/60 border-t border-paper/10">
      <Container>
        <div className="py-10 md:py-14 grid gap-8 md:gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-xl font-semibold text-paper mb-3">
              School<span className="text-brand">OS</span>
            </p>
            <p className="text-sm leading-relaxed max-w-xs">
              School management built for Nigerian schools. Three terms, NERDC subjects, and offline-first.
            </p>
            <p className="mt-4 text-xs">
              Lagos, Nigeria &middot; hello@myschoolos.io
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.heading}>
              <p className="font-mono text-xs tracking-[0.12em] uppercase text-paper/40 mb-4">
                {group.heading}
              </p>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-paper transition-colors focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-paper rounded-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-paper/10 py-6 text-xs text-paper/40">
          <p>&copy; {new Date().getFullYear()} SchoolOS. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
