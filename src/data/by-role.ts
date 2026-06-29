// Role-based feature lists for the ByRole switcher section.

export const ROLES_DATA = [
  {
    id: "admin",
    label: "Admin",
    heading: "Run the whole school from your dashboard.",
    body: "One place to see every student, every result, every naira — and to make things happen.",
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
    body: "Every payment — online, transfer, or cash — lands in the same ledger automatically.",
    features: [
      "Real-time fee ledger per student",
      "Online, USSD, and cash payment logging",
      "Auto-reconciliation to bank statement",
      "Defaulter lists and SMS reminders",
      "Term fee summary and collection reports",
      "Export to Excel for external audits",
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
      "View class positions as you enter marks",
      "Subject-level remarks and comments",
      "Share assignment resources with students",
      "Class broadcast via WhatsApp",
    ],
  },
  {
    id: "parent",
    label: "Parent",
    heading: "Know what's happening with your child.",
    body: "On your phone. In real time. No more waiting for speech day to find out how they did.",
    features: [
      "Receive report cards directly on your phone",
      "Pay fees online from anywhere",
      "Get instant alerts when your child is absent",
      "See outstanding fee balance at any time",
      "Receive school announcements and notices",
      "Send messages directly to the school",
    ],
  },
] as const;

export type RoleData = (typeof ROLES_DATA)[number];
