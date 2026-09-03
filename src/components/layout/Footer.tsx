import { Container } from "./Container";

// Every link here goes somewhere real. Root-relative section links
// (/#features etc.) so they work from /book-demo too — the footer renders on
// every marketing page, and a bare fragment there points at nothing.
//
// "What's new" and "Blog" are gone rather than pointed at href="#": neither
// page exists, and a link that scrolls the reader back to the top reads as
// broken. Nothing in the app is a natural stand-in for either, so dropping
// them was the honest option — add them back only once there's a real
// destination. "Contact" isn't a page either, so it goes straight to email
// rather than to a page that doesn't exist.
const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      // Was "About" — see the note on NAV_LINKS in data/nav.ts. Same section,
      // renamed to match what it's actually always described.
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Contact", href: "mailto:hello@myschoolos.io" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
      // Was "NDPA compliance", which asserted a legal status nobody had
      // verified. The page describes what we actually do instead.
      { label: "Data protection", href: "/data-protection" },
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
