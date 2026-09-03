import type { LegalDocument } from "./types";

// Terms for the school that subscribes, not for a consumer signing up alone —
// SchoolOS is sold to a school and used by its staff and families.
//
// The commercial clauses match what the billing code actually does: a 90-day
// trial set at school creation, per-student pricing against the declared
// capacity, proration on a capacity increase over a 90-day term, and access
// that lapses to read-only rather than being deleted. Check accounts/services.py
// before changing any figure here.
export const TERMS_OF_SERVICE: LegalDocument = {
  title: "Terms of Service",
  summary:
    "The agreement between SchoolOS and the school that subscribes to it, and the rules for everyone who uses the platform.",
  effective: "3 September 2026",
  sections: [
    {
      id: "agreement",
      heading: "This agreement",
      body: [
        "These terms apply to the school that signs up for SchoolOS and to everyone who uses it under that school's account: administrators, teachers, parents and pupils.",
        "The person who creates a school's account confirms they are authorised to accept these terms for that school. If you are using SchoolOS through a school, the school's own rules apply to you as well.",
      ],
    },
    {
      id: "accounts",
      heading: "Accounts and access",
      body: [
        "A school's owner creates the school and invites everyone else. Administrators, teachers and parents are invited by email and set their own password. Pupil accounts are created directly by the school with a password issued to them, because a pupil may have no email address of their own.",
        "You are responsible for keeping your password to yourself and for what happens under your login. Tell the school, or us, promptly if you think someone else has access to your account.",
        "A school controls who may do what through the roles it defines, and is responsible for granting the right level of access to its own staff.",
      ],
    },
    {
      id: "trial",
      heading: "Free trial",
      body: [
        "New schools get 90 days of full access at no cost and with no card required. Every feature is available during the trial; nothing is held back.",
        "At the end of the trial, a school that has not subscribed loses the ability to make changes: registers cannot be marked, scores cannot be entered, payments cannot be recorded. The school's existing data is not deleted, and access is restored as soon as a subscription starts.",
      ],
    },
    {
      id: "fees",
      heading: "Fees and billing",
      body: [
        "SchoolOS costs ₦1,000 per student per term, where a term is 90 days. There is no setup fee and no annual contract.",
        "Billing is based on the student capacity a school sets for itself, not on a headcount taken by us. A school can change its capacity at any time from Settings. Increasing capacity mid-term is charged pro rata for the days remaining in the term, and the figure is shown before the change is confirmed. Reducing capacity does not generate a charge, and capacity cannot be set below the number of pupils currently enrolled.",
        "Prices are in Naira. If we change our pricing we will give schools notice before it applies to them.",
      ],
      callout:
        "There is no online payment for subscriptions yet. Subscriptions are arranged and invoiced directly with our team, and access is activated by us once payment is settled.",
    },
    {
      id: "your-data",
      heading: "Your school's data belongs to your school",
      body: [
        "Everything a school records in SchoolOS (pupil records, results, attendance, fee history) remains the school's. We do not claim ownership of it, we do not sell it, and we do not use it for anything except running the platform for that school and keeping it secure.",
        "We process it under the Privacy Policy and the Data Protection Policy, which form part of these terms.",
        "If a school leaves, we will return or delete its data on request. Ask before closing the account rather than after.",
      ],
    },
    {
      id: "acceptable-use",
      heading: "Acceptable use",
      body: ["When using SchoolOS you agree not to:"],
      list: [
        "Record information about a pupil, parent or member of staff that the school has no proper reason to hold.",
        "Share your login, or use someone else's.",
        "Attempt to reach data belonging to another school, or to a person whose records your role does not cover.",
        "Upload anything unlawful, or any file intended to damage the platform or its users.",
        "Probe, scan or attempt to break the security of the service. If you find a vulnerability, report it to us; we would rather hear from you than not.",
        "Resell or rent access to SchoolOS to anyone else.",
      ],
    },
    {
      id: "availability",
      heading: "Availability",
      body: [
        "We aim to keep SchoolOS running during school hours and to schedule maintenance outside them, but we do not promise uninterrupted service and we are not offering a specific uptime figure we cannot yet stand behind.",
        "Attendance registers and score entry are built to keep working while a device is offline and to sync when the connection returns. That is a deliberate design choice for Nigerian network conditions, not a guarantee that no work is ever lost.",
      ],
    },
    {
      id: "changes-to-service",
      heading: "Changes to the service",
      body: [
        "We improve SchoolOS continuously, and features may be added, changed or removed. If we remove something a school depends on, we will give notice and, where we can, a way to get the data out first.",
        "Anything we describe as coming soon is a plan, not a commitment, and should not be the reason a school signs up.",
      ],
    },
    {
      id: "ending",
      heading: "Ending the agreement",
      body: [
        "A school may stop using SchoolOS at any time; there is no minimum term. Access continues to the end of the period already paid for.",
        "We may suspend or end an account that breaches these terms, particularly where a person's data or another school's data is at risk. Except where the breach is serious, we will raise it with the school first and give a chance to put it right.",
      ],
    },
    {
      id: "liability",
      heading: "Liability",
      body: [
        "SchoolOS is provided as it is. We do not promise it is free of faults, and we are not liable for indirect or consequential loss, or for loss of profit, goodwill or data, beyond what the law does not allow us to exclude.",
        "Where we are liable, our total liability is limited to the fees the school paid us in the twelve months before the claim.",
        "Nothing here limits liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be limited.",
      ],
    },
    {
      id: "law",
      heading: "Governing law",
      body: [
        "These terms are governed by the laws of the Federal Republic of Nigeria, and the Nigerian courts have jurisdiction over any dispute.",
        "We would much rather resolve a disagreement by talking to you. Write to us first.",
      ],
    },
    {
      id: "contact-terms",
      heading: "Contact",
      body: ["Questions about these terms: hello@myschoolos.io."],
    },
  ],
};
