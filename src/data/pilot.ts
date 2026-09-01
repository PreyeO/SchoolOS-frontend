// Copy and option lists for the pilot signup page (/book-demo).
//
// Values are the strings sent to the backend and are deliberately stable and
// snake_cased, so relabelling an option here never changes stored data.

export const PILOT_ROLES = [
  { value: "proprietor", label: "Proprietor / Owner" },
  { value: "principal", label: "Principal / Head Teacher" },
  { value: "administrator", label: "Administrator" },
  { value: "teacher", label: "Teacher" },
  { value: "other", label: "Other" },
] as const;

export const STUDENT_RANGES = [
  { value: "under_100", label: "Under 100" },
  { value: "100_300", label: "100–300" },
  { value: "300_600", label: "300–600" },
  { value: "600_plus", label: "600+" },
] as const;

// Optional, and kept to three coarse buckets on purpose. The follow-up is a
// message from a person, not a calendar slot, so anything finer would promise a
// precision nobody is holding to.
export const CONTACT_TIMES = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
] as const;

export const PILOT_COPY = {
  eyebrow: "Free pilot · 90 days",
  heading: "Join the SchoolOS pilot.",
  body: "We're onboarding a small number of Nigerian schools for a free 90-day pilot. Full access to everything, and we help you set it up. No cost.",
  reassurances: [
    "Free for 90 days, and no card",
    "We import your students and set up your terms with you",
    "Live in about a week",
  ],
  // Split across three short steps rather than one long column: the fields are
  // the same, but a page that shows five of them at a time is answerable.
  steps: [
    { id: "you", title: "About you", blurb: "Two questions, then your school." },
    { id: "school", title: "Your school", blurb: "So we can set it up the way you run it." },
    { id: "contact", title: "How to reach you", blurb: "So we can get in touch to set up your demo." },
  ],
  successHeading: (firstName: string) => `Thanks, ${firstName}.`,
  successBody:
    "We'll be in touch within a day to set up your demo. Nothing to do in the meantime.",
} as const;
