// Landing page copy and structured content — never hardcode this in JSX.

export const HERO = {
  eyebrow: "School management — built for Nigeria",
  headline: "Run your whole school from one place.",
  subheadline:
    "Compile a term's results in an afternoon. Collect fees online. Track attendance with one tap. Built for three terms, NERDC subjects, and the Nigerian school year — not adapted from abroad.",
  trustItems: [
    "Three-term calendar",
    "Paystack & Flutterwave",
    "Offline-first",
    "SMS & WhatsApp-native",
    "NDPA-compliant",
  ],
  ctaPrimary: { label: "Book a demo", href: "#demo" },
  ctaSecondary: { label: "Start free", href: "#start" },
} as const;

export const PAIN_RELIEF = {
  eyebrow: "// 01 — THE PROBLEM",
  pain: "Compiling one term's results shouldn't take three weeks and a pile of spreadsheets.",
  relief:
    "With SchoolOS, your teachers enter scores, the system computes positions and grades, and parents get branded PDF report cards — in hours, not weeks.",
  stat: "From data entry to report card: one afternoon.",
} as const;

export const BUILT_FOR_NIGERIA = {
  eyebrow: "Built for Nigeria",
  heading: "Not adapted. Not translated. Built here.",
  body: "Most school software in Nigeria is a foreign product with a Naira sign bolted on. SchoolOS started from a blank page — for three terms, NERDC subjects, and Nigerian parents who check WhatsApp, not email.",
  proofPoints: [
    { label: "Three-term academic calendar", description: "First, second, and third terms — the way Nigerian schools actually work." },
    { label: "NERDC subject catalogue", description: "All JSS and SSS subjects by name, including vocational and elective combinations." },
    { label: "WAEC & NECO grading scales", description: "A1–F9 grades, credit pass thresholds, and subject-level remarks, out of the box." },
    { label: "Naira payments everywhere", description: "Paystack, Flutterwave, bank transfer, and cash all reconcile to the same ledger." },
    { label: "Offline-first design", description: "All core workflows work without internet and sync when connectivity returns." },
    { label: "NDPA data compliance", description: "Student data stays in Africa, encrypted at rest, with full export rights for your school." },
  ],
} as const;

export const ONBOARDING = {
  eyebrow: "How it works",
  heading: "Live in one week. No IT team needed.",
  steps: [
    {
      number: "01",
      heading: "Upload your school data",
      body: "Send us your student list, class structure, and fee schedule as a spreadsheet. Our team imports everything — you don't touch a database.",
    },
    {
      number: "02",
      heading: "We configure your school",
      body: "We set up your term dates, grading scheme, NERDC subjects, and branding. Your logo on every report card from day one.",
    },
    {
      number: "03",
      heading: "Train your team in an afternoon",
      body: "Admin, teachers, and bursar each get a focused walkthrough — usually under two hours per role. Then you're on your own and we're a call away.",
    },
  ],
} as const;

export const FINAL_CTA = {
  eyebrow: "Get started",
  heading: "Your school. Running smoothly. Starting now.",
  body: "Book a 30-minute demo and we'll show you SchoolOS running on a live school's data — not a toy demo. We'll answer every question. No commitment required.",
  ctaPrimary: { label: "Book a demo", href: "#demo" },
  ctaSecondary: { label: "Start free today", href: "#start" },
  footnote: "From ₦400 per student per term. No setup fees. Cancel any time.",
} as const;
