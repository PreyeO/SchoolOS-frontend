// Role-based feature lists for the ByRole switcher section.
//
// Each line describes something a person in that role can actually do today,
// checked against the API. Removed rather than softened: online/USSD fee
// payment and bank-statement reconciliation (no gateway integration exists),
// every SMS and WhatsApp claim (no messaging backend), Excel export of fees
// (no export endpoint or client-side export), assignment resource sharing and
// parent-to-school messaging (neither feature exists at all).

export const ROLES_DATA = [
  {
    id: "admin",
    label: "Admin",
    heading: "Run the whole school from your dashboard.",
    body: "One place to see every student, every result, and every naira, and to act on them.",
    features: [
      "Term planner and academic calendar",
      "All students, staff, and results in one view",
      "Bulk imports from spreadsheets",
      "Report card approval and release",
      "School-wide announcements",
      "Audit trail for every action",
    ],
  },
  {
    id: "bursar",
    label: "Bursar",
    heading: "Fee collection without the spreadsheet chaos.",
    body: "Every payment, by transfer, POS, cheque, or cash, lands against the same student balance.",
    features: [
      "Real-time fee ledger per student",
      "Cash, transfer, POS, and cheque logging",
      "Downloadable receipt for every payment",
      "Defaulter list per class and term",
      "Term fee summary and collection reports",
      "Fee waivers and discounts per student",
    ],
  },
  {
    id: "teacher",
    label: "Teacher",
    heading: "Scores in. Report cards out. Done.",
    body: "No more spreadsheets emailed back and forth. Enter scores once, online or offline.",
    features: [
      "Score entry from any phone or laptop",
      "Offline attendance marking",
      "Class broadsheet with positions",
      "Subject-level remarks and comments",
      "Notes on a student that follow them up",
      "Announcements to your own classes",
    ],
  },
  {
    id: "parent",
    label: "Parent",
    heading: "Know what's happening with your child.",
    body: "On your phone, whenever you want it. No more waiting for speech day to find out how they did.",
    features: [
      "Download report cards as they're released",
      "Full fee breakdown, balance, and receipts",
      "Follow attendance day by day",
      "Track results across terms",
      "Receive school announcements and notices",
      "Switch between all your children in one place",
    ],
  },
] as const;

export type RoleData = (typeof ROLES_DATA)[number];
