// Landing page copy and structured content. Never hardcode this in JSX.
//
// No em dashes in any of this prose. Claims are also kept to what actually
// ships today; anything still being built is labelled as such rather than
// listed alongside working features.

export const HERO = {
  eyebrow: "School management built for Nigeria",
  headline: "Run your whole school from one place.",
  subheadline:
    "Results, fees, attendance, and parent updates, all in one place. Compile a whole term's results in an afternoon, track every naira of fees, and give parents their own login. Online or off.",
  trustItems: [
    "Three-term calendar",
    "WAEC & NECO grading",
    "Offline-first",
    "Parent & student portals",
    "NDPA-compliant",
  ],
  trustLine: "Built with Nigerian school owners, and we answer the phone.",
  ctaPrimary: { label: "Start free", href: "/book-demo" },
  ctaSecondary: { label: "Book a demo", href: "/book-demo" },
} as const;

export const PAIN_RELIEF = {
  eyebrow: "// 01 · THE PROBLEM",
  pain: "Compiling one term's results shouldn't take three weeks and a pile of spreadsheets.",
  relief:
    "With SchoolOS, your teachers enter scores, the system computes positions and grades, and parents get branded PDF report cards in hours, not weeks.",
  stat: "From data entry to report card: one afternoon.",
} as const;

export const BUILT_FOR_NIGERIA = {
  eyebrow: "FITS HOW YOUR SCHOOL RUNS",
  heading: "Set up the way your school already works.",
  body: "No workarounds, no bending your school to fit the software. Three terms, NERDC subjects, CA-plus-exam grading, WAEC and NECO scales, ready on day one. You set your weighting and add your logo; the rest is already in place.",
  proofPoints: [
    { label: "Three-term calendar", description: "Sessions, holidays, and resumption dates the way your school runs them." },
    { label: "NERDC subjects", description: "Every JSS and SSS subject ready to assign, including vocational and elective combinations." },
    { label: "WAEC & NECO scales", description: "A1–F9 grades, credit thresholds, and subject remarks, calculated for you." },
    { label: "Naira payments", description: "Cash, bank transfer, POS, and cheque, all recorded against one ledger and balance." },
    { label: "Offline-first", description: "Mark attendance and enter scores with no network; it all syncs when you're back online." },
    { label: "NDPA compliance", description: "Your students' data encrypted and handled to Nigeria's data-protection standard. You own it and can export it anytime." },
  ],
} as const;

export const ONBOARDING = {
  eyebrow: "How it works",
  heading: "Live in one week. No IT team needed.",
  steps: [
    {
      number: "01",
      heading: "Upload your school data",
      body: "Send us your student list, class structure, and fee schedule as a spreadsheet. Our team imports everything, so you don't touch a database.",
    },
    {
      number: "02",
      heading: "We configure your school",
      body: "We set up your term dates, grading scheme, NERDC subjects, and branding. Your logo on every report card from day one.",
    },
    {
      number: "03",
      heading: "Train your team in an afternoon",
      body: "Admin, teachers, and bursar each get a focused walkthrough, usually under two hours per role. From there it runs itself, and we're a call away whenever you need us.",
    },
  ],
} as const;

export const FINAL_CTA = {
  eyebrow: "Get started",
  heading: "Your school. Running smoothly. Starting now.",
  body: "Book a 30-minute demo and we'll show you SchoolOS running on a live school's data, not a toy demo. We'll answer every question. No commitment required.",
  ctaPrimary: { label: "Start free", href: "/book-demo" },
  ctaSecondary: { label: "Book a demo", href: "/book-demo" },
  footnote: "Start free this term. No card, no setup fee, cancel anytime.",
} as const;

export const PRICING_TRUST =
  "Try it free this term. If it doesn't save you time, walk away, and your data leaves with you.";
