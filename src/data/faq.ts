// FAQ items. All question/answer copy lives here, never in JSX.

export const FAQ_ITEMS = [
  {
    q: "Is our school's data safe and private?",
    a: "Your data is encrypted in transit, access is separated by school and by role so one school can never reach another's records, and every change is recorded in an audit log. Your data stays yours — we never sell it or share it with advertisers, and if you leave we return or delete it on request. We handle it under Nigeria's Data Protection Act 2023; our Data Protection Policy sets out exactly what we do, including where the gaps still are.",
  },
  {
    q: "Does it work offline or on a poor network?",
    a: "Yes. Teachers can mark attendance and enter scores completely offline on any phone or laptop. Data syncs automatically when connectivity returns. SchoolOS is built for the Nigerian network reality, so daily operations do not require fast or stable internet.",
  },
  {
    q: "How hard is it to move our existing records over?",
    a: "Not hard, because we do it with you. Our onboarding team imports your student list, historical results, and fee records from your spreadsheets or previous system. Most schools are fully live within one week. You don't need any technical knowledge.",
  },
  {
    q: "What does it actually cost?",
    a: "₦1,000 per student per term, and your first term is free. There is one plan, so a school of forty and a school of four thousand get exactly the same features. A school with 300 students pays ₦300,000 a term once the free term ends. No setup fee, no annual contract.",
  },
  {
    q: "What support do we get after going live?",
    a: "Phone and WhatsApp support during Nigerian business hours, from a Nigeria-based team. During your first term, you get dedicated onboarding help. After that, we're available for questions, training refreshers, and technical issues whenever you need.",
  },
  {
    q: "Does it support WAEC, NECO, BECE, and NERDC subjects?",
    a: "Yes. NERDC subject names, WAEC and NECO grade scales, CA/exam weightings, and the three-term calendar are all built in. You can also customise grading schemes, subject combinations, and report formats to match your school's own structure.",
  },
] as const;

export type FaqItem = (typeof FAQ_ITEMS)[number];
