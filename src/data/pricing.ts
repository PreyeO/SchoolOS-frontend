// Pricing. Single source of truth for all pricing UI.
//
// ONE plan, not a tier ladder — and the free period is the PILOT, not a tier
// of its own. The backend has exactly one product with two access states,
// `trialing` and `subscribed` (`School.access_status`, accounts/models.py), and
// no feature differs between them: a trialing school has everything, an expired
// one loses writes. A "Starter" card beside the paid one would therefore have
// listed identical features, inviting "what am I giving up?" — whose honest
// answer is "nothing, only time". That's an onboarding step, not a plan.
//
// So the free 90 days is presented as the pilot the whole marketing funnel
// already points at (/book-demo, data/pilot.ts), beside the one price that
// follows it.
//
// ₦1,000 per student per 90 days is exactly what the backend already models:
// DEFAULT_PRICE_PER_STUDENT_NAIRA = 1000 (accounts/constants.py), and the
// capacity-increase proration divides by 90 (UserService.update_student_capacity:
// students_added * price_per_student * days_remaining / 90). If the price here
// changes, that constant has to change with it — this page is the only place
// the figure is stated publicly.
//
// Roadmap features are deliberately NOT listed here. They live in
// CapabilityGrid under "On the roadmap" with a Soon badge; repeating "(soon)"
// items inside a price card is what made the old Growth tier look thin.

export const PRICING_PLAN = {
  price: 1000,
  unit: "per student / term",
  // A Nigerian school year is three terms, and 90 days is the exact window the
  // backend prorates against — so the two readings of "term" agree.
  periodNote: "One term = 90 days",
  description:
    "One plan. Every school gets every feature, whether you run forty pupils or four thousand.",
  features: [
    "Results, grading and branded report cards",
    "Fees, invoices, receipts and arrears tracking",
    "Attendance that keeps working offline",
    "Parent and student portals",
    "Announcements to any group in the school",
    "Staff roles and per-permission access",
    "End-of-year promotion",
    "Bulk student import",
    "Full audit log of every change",
  ],
  cta: { label: "Book a demo", href: "/book-demo" },
} as const;

export const PILOT_OFFER = {
  badge: "Free for 90 days",
  name: "Join the pilot",
  description:
    "We're onboarding a small number of Nigerian schools this term. Full access to everything above, and we set it up with you.",
  features: [
    "Everything in the plan, nothing held back",
    "No card, no setup fee",
    "We import your students and set up your terms with you",
    "Walk away at the end and your data leaves with you",
  ],
  cta: { label: "Join the pilot", href: "/book-demo" },
} as const;

export const PRICING_NOTE =
  "Prices in NGN. Billed on the student capacity you set for your school, which you can change at any time from Settings › Subscription. No setup fee and no annual contract.";
