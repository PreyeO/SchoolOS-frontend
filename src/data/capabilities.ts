// Capability wedge copy and the roadmap grid.
//
// Every bullet in CAPABILITY_WEDGES describes something that works today,
// checked against the API rather than assumed. Anything still being built
// belongs in CAPABILITY_GRID, which is labelled as upcoming.
//
// What was removed and why, so it isn't re-added by accident:
//   - Paystack/Flutterwave: PaymentSource lists them as "reserved slots",
//     unused "until gateway integration lands". Cash, transfer, POS and cheque
//     are the methods that actually record today.
//   - SMS and WhatsApp, in every form: there is no messaging backend at all,
//     and send_sms grants nothing. Parents read attendance and results in
//     their own portal instead, which is built.
//   - Installment plans: no such concept exists anywhere in the API.
//   - "Withhold cards for fee defaulters": the defaulter list is real, but
//     nothing gates a report card on fees.

export const CAPABILITY_WEDGES = [
  {
    id: "results",
    eyebrow: "RESULTS & REPORT CARDS",
    heading: "Compile a term's results in an afternoon.",
    body: "Teachers enter CA scores and exam marks. SchoolOS computes positions, averages, and grade remarks, using your school's own CA/exam weighting. Approve, then release to parents.",
    bullets: [
      "CA + exam weighting you control",
      "Class positions auto-calculated",
      "Branded PDF report cards",
      "Approve-and-release workflow",
      "Class teacher & principal remarks",
    ],
    // Opens in a new tab rather than scrolling in-page like the other two
    // CTAs below — it's a real file, not an anchor, and a visitor shouldn't
    // lose their place on the landing page to view it.
    cta: { label: "See a sample report card", href: "/sample-report-card.pdf", newTab: true },
  },
  {
    id: "fees",
    eyebrow: "FEES & PAYMENTS",
    heading: "Know exactly who has paid, and who hasn't.",
    body: "Record payments by cash, bank transfer, POS, or cheque, and every one lands against the student's balance. See the defaulter list for any class and term at a glance, with receipts you can download.",
    bullets: [
      "Cash, transfer, POS & cheque",
      "Fee waivers and discounts",
      "Real-time balance per student",
      "Defaulter list per class & term",
      "Downloadable payment receipts",
    ],
    cta: { label: "See how it works", href: "#demo", newTab: false },
  },
  {
    id: "attendance",
    eyebrow: "ATTENDANCE & PARENT ACCESS",
    heading: "Mark attendance with one tap, even with no network.",
    body: "Teachers mark the register offline on any device, and it syncs the moment they're back online. Parents follow their child's attendance, results, and fees in their own portal, without anyone having to send an update.",
    bullets: [
      "Offline-first, no internet needed",
      "Present, absent, late & excused",
      "Attendance reports per class & term",
      "Parents track it in their portal",
      "Works on cheap Android phones",
    ],
    cta: { label: "Book a demo", href: "/book-demo", newTab: false },
  },
] as const;

export type CapabilityWedge = (typeof CAPABILITY_WEDGES)[number];

// Not built yet. Presented as what's coming rather than what's included, since
// listing them beside working features is a promise the product can't keep.
export const CAPABILITY_GRID = [
  { label: "Online payments", description: "Paystack and Flutterwave collection" },
  { label: "SMS & WhatsApp", description: "Automatic alerts to parents" },
  { label: "Admissions", description: "Online applications and enrollment pipeline" },
  { label: "Timetable", description: "Auto-generated weekly class schedules" },
  { label: "HR & Payroll", description: "Staff records, leave, and salary processing" },
  { label: "Transport", description: "Bus routes and student tracking" },
] as const;
