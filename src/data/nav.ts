// Navigation structure — single source of truth for all nav components.

// Root-relative ("/#features"), not bare ("#features"). These sections live on
// the landing page, but the navbar now renders on every marketing page — and a
// bare fragment on /book-demo looks for an element that isn't there, so the
// links did nothing at all. With the leading slash they navigate home and then
// scroll; on the landing page itself the behaviour is unchanged.
export const NAV_LINKS = [
  { label: "Product", href: "/#product" },
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/#pricing" },
  // Was "About", pointing at the same section — but the section itself
  // (BuiltForNigeria) has never been company-about copy; it's three-term
  // calendar, NERDC subjects, grading, payments, offline-first — how the
  // product fits a school's own workflow. The id was renamed to match
  // (`how-it-works`), since a label reading "How It Works" linking to a
  // fragment literally called `#about` would be the kind of thing someone
  // notices in the address bar.
  { label: "How It Works", href: "/#how-it-works" },
] as const;

// Both public CTAs point at the pilot funnel while onboarding is invite-led.
// Self-serve signup still exists at /signup and is reachable directly; only
// the marketing entry points moved, so reverting is a one-line change.
export const NAV_CTA_PRIMARY = { label: "Start free", href: "/book-demo" } as const;
export const NAV_CTA_SECONDARY = { label: "Log in", href: "/login" } as const;
