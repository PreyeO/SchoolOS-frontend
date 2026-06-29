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
