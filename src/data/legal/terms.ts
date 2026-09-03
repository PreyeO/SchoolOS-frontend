import type { LegalDocument } from "./types";

// Updated 2026-09-03 with the user's own revised copy — replaces the earlier
// commercial terms (a 90-day trial, ₦1,000/student/term) with the current
// arrangement: a free pilot for a period agreed per school, no pricing
// committed yet. If paid plans are introduced, this document is the one that
// has to change first, and the pricing page and FAQ would need re-checking
// against whatever this ends up saying, the same way they were checked
// against the trial figures before.
//
// Also adds the registered company (AKỤ TECHNOLOGY LTD) and its two
// addresses, and an explicit data-export commitment on leaving (section 9)
// that goes further than the Privacy Policy's "we return or delete on
// request" — this one names a format and a timeframe. Keep the two documents
// consistent if either changes.
//
// Section 5 now names BOTH the Privacy Policy and the Data Protection Policy
// as incorporated. Contact (section 12) is email-only — a WhatsApp/phone
// contact block was in an earlier draft and was removed; don't reintroduce it
// without checking this is still current.
//
// **bold** spans render via LegalRichText (components/legal/legal-rich-text.tsx).
export const TERMS_OF_SERVICE: LegalDocument = {
  title: "Terms of Service",
  summary:
    "The agreement between AKỤ TECHNOLOGY LTD (which operates SchoolOS) and the school that uses it, and the rules for everyone who uses the platform.",
  effective: "3 September 2026",
  sections: [
    {
      id: "agreement",
      heading: "This agreement",
      body: [
        "These terms are between **AKỤ TECHNOLOGY LTD** (\"AKỤ\", \"we\", \"us\"), the company that owns and operates the SchoolOS platform (\"SchoolOS\"), and the school that signs up to use SchoolOS (\"you\", \"the school\"). They also apply to everyone who uses SchoolOS under that school's account: administrators, teachers, parents and pupils.",
        "The person who creates a school's account confirms they are authorised to accept these terms for that school. If you are using SchoolOS through a school, the school's own rules apply to you as well.",
      ],
      list: [
        "**AKỤ TECHNOLOGY LTD**",
        "Registered address: No. 2 Dobys Haven Estate, Lekki, Lagos State, Nigeria.",
        "Business / correspondence address: No. 3 Azikiwe Road, Umuahia, Abia State, Nigeria.",
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
      id: "accuracy",
      heading: "Accuracy of information",
      body: [
        "You are responsible for the accuracy of the information you enter: pupil records, grades, attendance, fees and so on. We store and process what you give us; we do not independently verify it.",
      ],
    },
    {
      id: "pilot-and-cost",
      heading: "Free pilot and cost",
      body: [
        "New schools join SchoolOS through a free pilot for the period agreed with your school, at no cost and with no card required. Every feature is available during the pilot; nothing is held back.",
        "We do not charge you during the pilot, and there is no hidden cost. If and when we introduce paid plans, we will tell you well in advance, agree the price and terms with you, and give you a clear choice to continue or not before anything changes for you. There is no online payment for subscriptions yet; any future subscription would be arranged and invoiced directly with our team.",
        "Anything about future pricing is a plan, not a commitment, and should not be the reason a school signs up.",
      ],
    },
    {
      id: "your-data",
      heading: "Your school's data belongs to your school",
      body: [
        "Everything a school records in SchoolOS (pupil records, results, attendance, fee history) remains the school's. We do not claim ownership of it, we do not sell it, and we do not use it for anything except running the platform for that school and keeping it secure.",
        "We process it under our **Privacy Policy** and **Data Protection Policy**, which form part of these terms. Because much of this data belongs to children, we handle it with extra care and in line with the Nigeria Data Protection Act, 2023.",
        "If a school leaves, we will return or delete its data on request. Please ask before closing the account rather than after.",
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
        "We aim to keep SchoolOS running during school hours and to schedule maintenance outside them, but we do not promise uninterrupted service, and we are not offering a specific uptime figure we cannot yet stand behind. We are still early and building this out; we will fix issues as fast as we reasonably can and keep you informed if something is wrong.",
        "Attendance registers and score entry are built to keep working while a device is offline and to sync when the connection returns. That is a deliberate design choice for Nigerian network conditions, not a guarantee that no work is ever lost.",
      ],
    },
    {
      id: "changes-to-service",
      heading: "Changes to the service",
      body: [
        "We improve SchoolOS continuously, and features may be added, changed or removed. If we remove something a school depends on, we will give notice and, where we can, a way to get the data out first.",
        "Anything we describe as coming soon is a plan, not a commitment.",
      ],
    },
    {
      id: "ending",
      heading: "Ending the agreement",
      body: [
        "A school may stop using SchoolOS at any time; there is no minimum term. Either side can end this agreement by telling the other in writing (email is fine).",
        "If a school leaves, we will return or delete its data on request, and can provide an export in a usable format (such as spreadsheets/CSV) within a reasonable time. After that, we delete the school's data from our systems, except where we are required to keep something for legal reasons, and we will tell you if that applies.",
        "We may suspend or end an account that breaches these terms, particularly where a person's data or another school's data is at risk. Except where the breach is serious, we will raise it with the school first and give a chance to put it right.",
        "If we ever need to stop offering SchoolOS entirely, we will give reasonable notice and help you get your data out.",
      ],
    },
    {
      id: "liability",
      heading: "Liability",
      body: [
        "SchoolOS is provided as it is. We do not promise it is free of faults, and we are not liable for indirect or consequential loss, or for loss of profit, goodwill or data, beyond what the law does not allow us to exclude.",
        "Where we are liable, our total liability is limited to the fees the school paid us in the twelve months before the claim.",
        "Nothing here limits liability for death or personal injury caused by negligence, for fraud, for our responsibility to handle data protection properly, or for anything else that cannot lawfully be limited. Nothing in these terms affects your rights under Nigerian law.",
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
      body: ["Questions about these terms? Reach us at:"],
      list: ["Email: **hello@myschoolos.io**"],
    },
  ],
  footer: "AKỤ TECHNOLOGY LTD, operator of SchoolOS.",
};
