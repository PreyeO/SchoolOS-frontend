// Navigation structure — single source of truth for all nav components.

export const NAV_LINKS = [
  { label: "Product", href: "#product" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
] as const;

export const NAV_CTA_PRIMARY = { label: "Start free", href: "/signup" } as const;
export const NAV_CTA_SECONDARY = { label: "Log in", href: "/login" } as const;
