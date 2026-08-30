// FAQ items. All question/answer copy lives here, never in JSX.

export const FAQ_ITEMS = [
  {
    q: "Is our school's data safe and private?",
    a: "Yes. Your data is encrypted in transit and at rest, and handled under Nigeria's Data Protection Act (NDPA). You own your data and can export everything at any time. We never sell or share your school's information with third parties.",
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
    a: "From ₦400 per active student per term. A school with 300 students pays ₦120,000 per term, often less than the cost of printing and distributing report cards manually. There are no hidden setup fees and no annual contracts.",
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
