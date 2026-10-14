"use client";

import { useInPageAnchorClick } from "@/lib/scroll-to-in-page-hash";

import { Container } from "./Container";

// Every link here goes somewhere real. Root-relative section links
// (/#features etc.) so they work from /book-demo too — the footer renders on
// every marketing page, and a bare fragment there points at nothing.
//
// Two groups, not three. "Company" used to hold "About" (renamed to "How It
// Works" — see the note in data/nav.ts) plus "Contact" — but there is no
// company-info page behind either, and "How It Works" is product narrative,
// not company narrative: it lives with Features and Pricing now, matching
// where the navbar already puts it (right after Pricing). "Contact" duplicated
// the brand column's own "hello@myschoolos.io", just as a link instead of
// plain text — dropped as a separate list item; the brand column's address is
// now the clickable one, so there's exactly one contact line, not two.
//
// "What's new" and "Blog" are gone rather than pointed at href="#": neither
// page exists, and a link that scrolls the reader back to the top reads as
// broken. Nothing in the app is a natural stand-in for either — add them back
// only once there's a real destination.
const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "How It Works", href: "/#how-it-works" },
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
  const onAnchorClick = useInPageAnchorClick();

  return (
    <footer className="bg-ink text-paper/60 border-t border-paper/10">
      <Container>
        <div className="py-10 md:py-14 grid grid-cols-1 gap-8 md:gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="font-display text-xl font-semibold text-paper mb-3">
              School<span className="text-brand">OS</span>
            </p>
            <p className="text-sm leading-relaxed max-w-xs">
              School management built for Nigerian schools. Three terms, NERDC subjects, and offline-first.
            </p>
            <p className="mt-4 text-xs">
              Lagos, Nigeria &middot;{" "}
              <a
                href="mailto:hello@myschoolos.io"
                className="hover:text-paper transition-colors focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-paper rounded-sm"
              >
                hello@myschoolos.io
              </a>
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
                      onClick={(e) => onAnchorClick(e, link.href)}
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
