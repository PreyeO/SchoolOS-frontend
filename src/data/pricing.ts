// Pricing tiers. Single source of truth for all pricing UI.
//
// Features not yet built carry an explicit "(soon)" rather than sitting in the
// list as though they ship today. That is most of the Growth tier, which is a
// commercial question rather than a copy one: see the note in PROJECT.md.

export const PRICING_TIERS = [
  {
    name: "Starter",
    price: 400,
    unit: "per student / term",
    limit: "Up to 200 students",
    description: "For schools getting started with digital management.",
    features: [
      "Results & branded report cards",
      "Fee collection & ledger",
      "Attendance tracking",
      "Parent & student portals",
      "Up to 200 active students",
    ],
    cta: { label: "Start free", href: "/book-demo" },
    demoLink: { label: "Book a demo instead", href: "/book-demo" },
    featured: false,
  },
  {
    name: "Growth",
    price: 350,
    unit: "per student / term",
    limit: "Unlimited students",
    description: "For schools ready to run every department in one place.",
    features: [
      "Everything in Starter",
      "Online fee payments (soon)",
      "Timetable & CBT mock exams (soon)",
      "HR & payroll basics (soon)",
      "Admissions management (soon)",
      "Unlimited active students",
      "Priority support",
    ],
    cta: { label: "Start free", href: "/book-demo" },
    demoLink: { label: "Book a demo instead", href: "/book-demo" },
    featured: true,
  },
  {
    name: "Enterprise",
    price: null,
    unit: "custom pricing",
    limit: "Multi-branch",
    description: "For school networks and multi-branch operators.",
    features: [
      "Everything in Growth",
      "Multi-branch management",
      "Custom integrations",
      "Dedicated onboarding manager",
      "SLA & phone support",
    ],
    cta: { label: "Talk to us", href: "#contact" },
    demoLink: null,
    featured: false,
  },
] as const;

export type PricingTier = (typeof PRICING_TIERS)[number];

export const PRICING_NOTE =
  "Prices in NGN. Billed per active student per term. Active = enrolled and attending this term. No setup fees. Cancel any time.";
