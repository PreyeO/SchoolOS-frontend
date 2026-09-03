import type { LegalDocument } from "./types";

// Replaces the old "NDPA compliance" footer link.
//
// The rename was the point: "NDPA compliance" is a claim about our legal status
// that nobody had verified, and a page under that name has to either prove it or
// mislead. "Data Protection Policy" describes a document we can actually stand
// behind: what we do, what we don't, and where the gaps are.
//
// Audience is the school, not the individual: this is the page a proprietor
// reads before signing. Individual-facing detail lives in the Privacy Policy.
//
// Updated 2026-09-03 to name AKỤ TECHNOLOGY LTD explicitly as the processor
// (was "SchoolOS" standing in for the company throughout section 1 and 10 —
// SchoolOS is the platform, AKỤ is the legal entity, and Terms/Privacy already
// draw that line). Contact restructured to the same email-as-list-item shape
// Terms uses. **bold** spans render via LegalRichText
// (components/legal/legal-rich-text.tsx).
export const DATA_PROTECTION_POLICY: LegalDocument = {
  title: "Data Protection Policy",
  summary:
    "How SchoolOS protects the information a school entrusts to it, for proprietors and administrators deciding whether to sign up.",
  effective: "3 September 2026",
  sections: [
    {
      id: "roles",
      heading: "Controller and processor",
      body: [
        "Under the Nigeria Data Protection Act 2023, a school using SchoolOS is the **data controller** for its pupils', families' and staff records: the school decides what to collect and why. **AKỤ TECHNOLOGY LTD** (\"AKỤ\", \"we\", \"us\"), which operates the SchoolOS platform, is the **data processor**, acting on the school's instructions.",
        "This is not a technicality. It means the school answers to families for what it records, and AKỤ answers to the school for what it does with it. It also means we will not use a school's records for our own purposes: we have no product that would benefit from doing so, and these terms would not permit it.",
        "AKỤ is a controller in its own right only for our own business information: the accounts of people who sign up, demo enquiries, and billing records.",
      ],
    },
    {
      id: "our-commitments",
      heading: "What we commit to",
      body: ["As processor for a school's data, we commit to:"],
      list: [
        "Process it only to provide the platform and to keep it secure, never for our own purposes.",
        "Keep each school's data separated, so one school cannot reach another's.",
        "Restrict access among our own staff to those who need it for support or billing, and reduce what they can see where identification is not necessary.",
        "Hold our service providers to equivalent obligations.",
        "Help a school respond when a family or a member of staff exercises their rights.",
        "Tell a school without undue delay if its data is involved in a breach, and notify the Nigeria Data Protection Commission where required.",
        "Return or delete a school's data when it leaves, on request.",
      ],
    },
    {
      id: "children",
      heading: "Children's data, and why it deserves more care",
      body: [
        "Almost everyone whose data sits in SchoolOS is a child, and some of what schools record about them is sensitive: blood group, genotype, allergies, chronic conditions, disabilities, emergency medications, and religion.",
        "These fields exist because a school genuinely needs some of them: a teacher who has to act on a peanut allergy should not have to go looking. But sensitive data about a minor is the highest-risk category a school system can hold, and the platform is built accordingly: medical information surfaces as an alert to teachers at the school and is not shown on our internal support tools at all.",
      ],
      callout:
        "Our advice to schools: record a health field only where there is something the school would actually do with it. A blank field carries no risk. A completed one that nobody uses carries all of the risk and none of the benefit.",
    },
    {
      id: "access-control",
      heading: "How access is controlled",
      body: [
        "Every request is authorised on the server against the caller's school and role. The interface hides what you cannot reach, but hiding is not the control; the server refusing is.",
        "Roles are defined by each school. A school can create an administrator who can see fees and nothing else, or staff records and nothing else. Parents reach only their own linked children; pupils reach only themselves.",
        "Changes are recorded in an audit log that names who made them and, for most actions, the values before and after. Administrators can read it; nobody can edit it.",
      ],
    },
    {
      id: "security-measures",
      heading: "Security measures",
      body: ["The measures currently in place:"],
      list: [
        "Encryption of traffic in transit between browsers and the platform.",
        "Passwords stored as salted hashes, never recoverable in readable form.",
        "Sessions issued as signed, expiring tokens, with refresh tokens rotated and the previous one invalidated on use.",
        "Uploaded files held in private storage, served only through short-lived signed links rather than public addresses.",
        "Per-request authorisation checks scoped to the caller's school and role.",
        "Rate limiting on verification codes and other sensitive endpoints.",
      ],
    },
    {
      id: "sub-processors",
      heading: "Service providers",
      body: [
        "We use Amazon Web Services for file storage, an email provider for verification codes and notifications, and hosting and database providers to run the application. Some operate outside Nigeria, so some data is stored abroad.",
        "We will tell schools before adding a service provider that handles personal data in a materially different way. A current list is available on request.",
      ],
    },
    {
      id: "rights-support",
      heading: "Supporting data subject rights",
      body: [
        "When a parent, pupil or member of staff asks a school to see, correct, delete or export their information, the school owns the response and we support it. Much of it a school can do itself: records are editable in the interface, and report cards and receipts download as PDFs.",
      ],
      callout:
        "Being straight about a gap: there is no self-service button that exports everything a school holds, and no automated erasure workflow. Both are handled manually by our team on request. If a school's own compliance posture depends on doing this without involving us, ask us where that work stands before signing up.",
    },
    {
      id: "retention",
      heading: "Retention",
      body: [
        "School records persist for the life of the account, because that is what a school record is for. Where a class, subject or fee item has academic or financial history attached, deleting it deactivates the record and keeps the history rather than erasing both.",
        "On leaving, a school can ask for its data to be returned or deleted. Audit-log entries are kept for the life of the account and are not selectively editable.",
      ],
    },
    {
      id: "breach",
      heading: "If something goes wrong",
      body: [
        "If we become aware of a breach affecting personal data, we will investigate immediately, contain it, tell the affected schools what happened and what it means for them, and notify the Nigeria Data Protection Commission where the law requires it.",
        "We would rather tell a school about a problem it had not noticed than have it find out later. If you believe you have found a security issue, write to hello@myschoolos.io; a report made in good faith is welcome and we will not pursue anyone for making one.",
      ],
    },
    {
      id: "registration",
      heading: "Our regulatory position",
      body: [
        "AKỤ TECHNOLOGY LTD is a Nigerian company processing the data of Nigerian data subjects through SchoolOS, and we operate on the basis that the Nigeria Data Protection Act 2023 applies to us in full.",
      ],
      callout:
        "We describe what we do rather than advertise a certification. Where a school's own obligations require formal confirmation of our registration status with the Nigeria Data Protection Commission or a signed data processing agreement, ask us directly and we will give you a straight answer in writing.",
    },
    {
      id: "contact-dp",
      heading: "Contact",
      body: ["Data protection questions, requests for a processing agreement, or anything in this policy:"],
      list: ["Email: **hello@myschoolos.io**"],
    },
  ],
  footer: "AKỤ TECHNOLOGY LTD, operator of SchoolOS.",
};
