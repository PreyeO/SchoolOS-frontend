// Pricing tiers — single source of truth for all pricing UI.

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
      "Parent SMS notifications",
      "Up to 200 active students",
    ],
    cta: { label: "Start free", href: "#start" },
    demoLink: { label: "Book a demo instead", href: "#demo" },
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
      "Timetable & CBT mock exams",
      "HR & payroll basics",
      "Admissions management",
      "Transport management",
      "Unlimited active students",
      "Priority support",
    ],
    cta: { label: "Start free", href: "#start" },
    demoLink: { label: "Book a demo instead", href: "#demo" },
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
