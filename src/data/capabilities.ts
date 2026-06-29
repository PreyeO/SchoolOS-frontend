// Capability wedge copy and compact grid items.

export const CAPABILITY_WEDGES = [
  {
    id: "results",
    eyebrow: "RESULTS & REPORT CARDS",
    heading: "Compile a term's results in an afternoon.",
    body: "Teachers enter CA scores and exam marks. SchoolOS computes positions, averages, and grade remarks — with your school's own CA/exam weighting. Approve, then release to parents.",
    bullets: [
      "CA + exam weighting you control",
      "Class positions auto-calculated",
      "Branded PDF report cards",
      "Approve-and-release workflow",
      "Withhold cards for fee defaulters",
    ],
    cta: { label: "See a sample report card", href: "#demo" },
  },
  {
    id: "fees",
    eyebrow: "FEES & PAYMENTS",
    heading: "Stop chasing parents for fees.",
    body: "Accept payments online, by transfer, USSD, or cash. Every naira auto-reconciles to your ledger. Parents get instant SMS receipts. Defaulters get reminders before you even ask.",
    bullets: [
      "Paystack & Flutterwave built in",
      "Installment payment plans",
      "Auto-reconciliation to ledger",
      "Defaulter SMS reminders",
      "Real-time fee balance per student",
    ],
    cta: { label: "See how it works", href: "#demo" },
  },
  {
    id: "attendance",
    eyebrow: "ATTENDANCE & COMMUNICATION",
    heading: "Mark attendance with one tap. Parents know instantly.",
    body: "Teachers mark attendance offline on any device. When a student is absent, parents get an automatic SMS or WhatsApp message before the end of first period — without you lifting a finger.",
    bullets: [
      "Offline-first — no internet needed",
      "Auto SMS/WhatsApp to parents",
      "Attendance reports per class & term",
      "Late arrival tracking",
      "Works on cheap Android phones",
    ],
    cta: { label: "Book a demo", href: "#demo" },
  },
] as const;

export type CapabilityWedge = (typeof CAPABILITY_WEDGES)[number];

export const CAPABILITY_GRID = [
  { label: "Admissions", description: "Online applications and enrollment pipeline" },
  { label: "Timetable", description: "Auto-generated weekly class schedules" },
  { label: "CBT & Exam Prep", description: "Mock exams with WAEC past question banks" },
  { label: "Transport", description: "Bus routes and student tracking" },
  { label: "HR & Payroll", description: "Staff records, leave, and salary processing" },
  { label: "Analytics", description: "Term-over-term performance dashboards" },
] as const;
