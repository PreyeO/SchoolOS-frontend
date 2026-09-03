import type { LegalDocument } from "./types";

// Written against what the system ACTUALLY stores, field by field, from
// accounts/models.py, audit/models.py and the storage app — not from a
// template. Every category named below corresponds to a real column.
//
// If the data model changes, this changes. In particular: the health fields in
// section 3 are the ones that make this a sensitive-data policy rather than an
// ordinary one, and they are on records about children.
export const PRIVACY_POLICY: LegalDocument = {
  title: "Privacy Policy",
  summary:
    "How SchoolOS handles personal information, for parents, students, teachers and school staff who use the platform.",
  effective: "3 September 2026",
  sections: [
    {
      id: "who-we-are",
      heading: "Who we are, and who holds your data",
      body: [
        "SchoolOS is school-management software used by Nigerian schools. This policy explains what personal information passes through the platform and what happens to it.",
        "Two different relationships matter, and which one applies changes who you should contact. For everything a school records about its own pupils, parents and staff, the school decides what is collected and why: the school is the data controller, and SchoolOS processes that information on its instructions. For the information we collect directly about you (a demo request, an account you create with us, an email you send us), SchoolOS is the controller.",
        "In practice: questions about your child's records, marks, attendance or fees go to the school. Questions about the platform itself go to us.",
      ],
    },
    {
      id: "school-records",
      heading: "Information schools record about pupils and families",
      body: [
        "A school using SchoolOS may record the following about a pupil. Not every school uses every field; most are optional, and a school chooses what it needs.",
      ],
      list: [
        "Identity: name, admission number, date of birth, gender, photograph",
        "Background: nationality, state of origin, religion, previous school, date of admission",
        "Health: blood group, genotype, allergies, chronic conditions, disabilities and emergency medications",
        "Personal detail used on nursery and primary report cards: favourite food, hobbies, ambitions",
        "School life: class and arm, attendance records with any note explaining an absence, scores, grades, report cards, conduct and behaviour ratings, teacher notes about the pupil",
        "Fees: what was billed, paid, waived or is outstanding, and payment records",
        "Guardians: the parents or guardians linked to the pupil and their relationship to them",
      ],
      callout:
        "Health information and religion are sensitive personal data, and here they concern children. Schools should record them only where there is a real reason to: an allergy the school must act on in an emergency is a good reason; completeness for its own sake is not. Teachers at the school can see these fields, because a teacher may need them mid-lesson.",
    },
    {
      id: "adults",
      heading: "Information about teachers, administrators and parents",
      body: [
        "For adults with a login, we hold a name, email address, phone number and optional photograph, plus role-specific details a school records: for teachers, an employee ID, qualification, specialisation and start date; for parents, an occupation and contact address.",
        "Every account also carries which school or schools you belong to and what you are permitted to do there.",
      ],
    },
    {
      id: "we-collect-directly",
      heading: "Information we collect directly",
      body: [
        "When you ask for a demo or apply to join the pilot, we collect your name, role, email address, phone number, your school's name, its state and approximate size, when you would like to be called, and anything you write in the message field. We use it to contact you about SchoolOS and nothing else.",
        "When you create an account we collect your name, email and phone number, and send a one-time code to verify the address.",
      ],
    },
    {
      id: "activity",
      heading: "Activity records",
      body: [
        "SchoolOS keeps an audit log of changes made inside a school: who did it, what was affected, when and, for many actions, the values before and after. This exists so a school can answer questions like who changed a mark or who removed a pupil from a class, and it is visible to administrators at that school.",
        "The log is a deliberate record rather than incidental data, and it is not editable by anyone, including us.",
      ],
    },
    {
      id: "why",
      heading: "Why we process it",
      body: [
        "We process personal information to provide the platform a school has signed up for: to run registers, record and publish results, issue report cards, track fees, give parents and pupils their own view of their records, and keep accounts secure.",
        "For school records, the lawful basis is the school's: most often the performance of its contract with families, its own legitimate interests in running the school, and its legal obligations. For the information we collect directly, our basis is your consent (a demo request) or the performance of our contract with you (an account).",
        "We do not sell personal information, we do not share it with advertisers, and we do not use it to train machine-learning models.",
      ],
    },
    {
      id: "who-sees",
      heading: "Who can see what",
      body: [
        "Access inside a school is limited by role, and the limits are enforced by the server rather than by hiding buttons.",
      ],
      list: [
        "Parents see only their own linked children: results once published, fees, attendance and profile.",
        "Pupils see only themselves.",
        "Teachers see pupils at their school, including medical alerts, and the classes and subjects they are assigned.",
        "Administrators see what their assigned role permits; a school can restrict an administrator to, say, fees alone.",
        "SchoolOS staff can see school and account records for support and billing. Pupil records are deliberately reduced on our internal tools: a pupil appears there by admission number and class, not by name, and teacher and parent email addresses are masked.",
      ],
    },
    {
      id: "third-parties",
      heading: "Who else processes it",
      body: [
        "We use a small number of service providers, each handling data only to deliver part of the platform:",
      ],
      list: [
        "Amazon Web Services: storage of uploaded files (school logos and pupil photographs).",
        "Our email provider: sending verification codes, invitations and notifications.",
        "Our hosting and database providers: running the application itself.",
      ],
      callout:
        "Some of these providers operate outside Nigeria, which means some personal information is transferred and stored abroad. We choose established providers and require them to protect the data, but a school that needs data to remain in Nigeria should raise it with us before signing up rather than assume it.",
    },
    {
      id: "retention",
      heading: "How long it is kept",
      body: [
        "School records are kept for as long as the school's account is active, because a school record is meant to last: a report card issued four years ago should still be there. Schools may delete individual records themselves, though records with academic or financial history attached are deactivated rather than erased so the history stays intact.",
        "When a school leaves SchoolOS, we delete or return its data on request. Audit-log entries are retained for the life of the account.",
        "Demo and pilot enquiries are kept while we are following them up and deleted once they are no longer live.",
      ],
    },
    {
      id: "your-rights",
      heading: "Your rights",
      body: [
        "Under the Nigeria Data Protection Act 2023 you may ask to see the personal information held about you, have it corrected if it is wrong, have it deleted where there is no continuing reason to keep it, object to or restrict certain processing, and receive a copy in a portable form. Where processing rests on consent, you may withdraw it.",
        "For anything a school holds (a pupil's records, a parent's contact details, staff records), the request goes to the school, and we help the school answer it. For information we hold about you directly, write to us at the address in the last section.",
        "Parents and guardians exercise these rights on behalf of a child.",
      ],
      callout:
        "There is currently no self-service export button. A request for a copy of a school's data is handled by our team manually. We are saying so plainly rather than implying a feature that does not exist yet: the right is real and we will honour it; the one-click version is not built.",
    },
    {
      id: "security",
      heading: "Keeping it secure",
      body: [
        "Traffic between your browser and SchoolOS is encrypted. Passwords are stored hashed, never in a readable form. Access is separated by school, so one school's data is not reachable from another's account, and every permission is checked on the server for each request.",
        "Uploaded photographs and logos are held in private storage and served through short-lived links that expire, rather than being published at a guessable address.",
        "No system is perfectly secure. If a breach occurs that puts anyone at risk, we will notify the affected schools and the Nigeria Data Protection Commission as required.",
      ],
    },
    {
      id: "children",
      heading: "Children",
      body: [
        "SchoolOS is not sold to children and is not marketed to them. Pupil accounts are created by a school, not by the pupil, and a pupil signing in can see only their own records.",
        "Where a child's information is recorded, the school is responsible for having a proper basis to record it and for involving parents or guardians as the law requires.",
      ],
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      body: [
        "If we change this policy we will update the effective date at the top, and for a change that materially affects how personal information is handled we will tell schools directly rather than relying on them to notice.",
      ],
    },
    {
      id: "contact",
      heading: "Contact us",
      body: [
        "Write to hello@myschoolos.io with anything about this policy, or to make a request about information we hold about you. Tell us which school you are connected to; it helps us route the request correctly.",
        "If you believe we have not handled your information properly, you may complain to the Nigeria Data Protection Commission.",
      ],
    },
  ],
};
