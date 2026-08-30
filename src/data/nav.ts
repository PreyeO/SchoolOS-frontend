// Navigation structure — single source of truth for all nav components.

export const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
] as const;

// Both public CTAs point at the pilot funnel while onboarding is invite-led.
// Self-serve signup still exists at /signup and is reachable directly; only
// the marketing entry points moved, so reverting is a one-line change.
export const NAV_CTA_PRIMARY = { label: "Start free", href: "/book-demo" } as const;
export const NAV_CTA_SECONDARY = { label: "Log in", href: "/login" } as const;
