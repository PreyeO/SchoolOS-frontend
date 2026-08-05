import type { AuditLogEntry } from "../api/audit-log-api";

type Sentence = (actor: string, target: string) => string;

// One entry per action string the backend actually logs (accounts/services.py
// + academic/services.py's AuditService.log/log_bulk calls). Falls back to a
// generic sentence for any action not listed here, so a new action the
// backend adds later still renders something readable instead of nothing.
const ACTION_SENTENCES: Record<string, Sentence> = {
  "user.registered": (actor) => `${actor} created an account`,
  "school.created": (actor) => `${actor} created the school`,
  "school.updated": (actor) => `${actor} updated the school profile`,
  "school_admin_role.created": (actor, t) => `${actor} created the "${t}" role`,
  "school_admin_role.updated": (actor, t) => `${actor} updated the "${t}" role`,
  "school_admin_role.deleted": (actor, t) => `${actor} deleted the "${t}" role`,
  "school_admin_profile.created": (actor, t) => `${actor} added an admin: ${t}`,
  "school_admin_profile.role_assigned": (actor, t) => `${actor} assigned a role to ${t}`,
  "school_admin_profile.role_unassigned": (actor, t) => `${actor} unassigned a role from ${t}`,
  "invite.admin_created": (actor, t) => `${actor} invited ${t} as an admin`,
  "invite.teacher_created": (actor, t) => `${actor} invited ${t} as a teacher`,
  "invite.parent_created": (actor, t) => `${actor} invited ${t} as a parent`,
  "invite.accepted": (_actor, t) => `${t} accepted their invite`,
  "invite.resent": (actor, t) => `${actor} resent an invite to ${t}`,
  "student_profile.created": (actor, t) => `${actor} added student ${t}`,
  "student_profile.password_reissued": (actor, t) => `${actor} reissued a password for ${t}`,
  "parent_student_link.created": (actor, t) => `${actor} linked ${t}`,
  "parent_student_link.deleted": (actor, t) => `${actor} unlinked ${t}`,
  "academic_session.created": (actor, t) => `${actor} added session ${t}`,
  "academic_session.updated": (actor, t) => `${actor} updated session ${t}`,
  "academic_session.deleted": (actor, t) => `${actor} deleted session ${t}`,
  "academic_period.created": (actor, t) => `${actor} added term ${t}`,
  "academic_period.updated": (actor, t) => `${actor} updated term ${t}`,
  "academic_period.deleted": (actor, t) => `${actor} deleted term ${t}`,
  "class.created": (actor, t) => `${actor} added class ${t}`,
  "class.updated": (actor, t) => `${actor} updated class ${t}`,
  "class.deleted": (actor, t) => `${actor} deleted class ${t}`,
  "class_arm.created": (actor, t) => `${actor} added arm ${t}`,
  "class_arm.updated": (actor, t) => `${actor} updated arm ${t}`,
  "class_arm.deleted": (actor, t) => `${actor} deleted arm ${t}`,
  "subject.created": (actor, t) => `${actor} added subject ${t}`,
  "subject.updated": (actor, t) => `${actor} updated subject ${t}`,
  "subject.deleted": (actor, t) => `${actor} deleted subject ${t}`,
  "grading_system.created": (actor, t) => `${actor} set up a grading system: ${t}`,
  "grading_system.updated": (actor, t) => `${actor} updated a grading system: ${t}`,
  "grading_system.deleted": (actor, t) => `${actor} deleted a grading system: ${t}`,
  "grade_component.created": (actor, t) => `${actor} added a grading component: ${t}`,
  "grade_component.deleted": (actor, t) => `${actor} removed a grading component: ${t}`,
  "grade_range.created": (actor, t) => `${actor} added a grade range: ${t}`,
  "grade_range.deleted": (actor, t) => `${actor} removed a grade range: ${t}`,
};

function fallbackSentence(actor: string, action: string, target: string): string {
  const verb = (action.split(".")[1] ?? action).replace(/_/g, " ");
  return `${actor} ${verb} ${target}`.trim();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Every model's __str__ this feed reads from (Class/Subject/AcademicSession/
// SchoolAdminRole/...) appends " @ SchoolName" or " @ (SchoolName)" — useful
// for a cross-school platform audit view, but pure noise here since this
// feed only ever shows one school's own activity. SchoolAdminRole's __str__
// also always ends in the literal word "role", which the sentence templates
// above already supply themselves.
function cleanTargetRepr(repr: string, schoolName: string | null): string {
  let cleaned = repr;
  if (schoolName) {
    const escaped = escapeRegExp(schoolName);
    cleaned = cleaned.replace(new RegExp(`\\s*@\\s*\\(?${escaped}\\)?\\s*$`), "");
  }
  return cleaned.replace(/\s+role$/, "").trim();
}

export function formatAuditEntry(entry: AuditLogEntry): string {
  const actor = entry.actor ? `${entry.actor.first_name} ${entry.actor.last_name}` : "System";
  const target = cleanTargetRepr(entry.target_repr, entry.school_name);
  const sentence = ACTION_SENTENCES[entry.action];
  return sentence ? sentence(actor, target) : fallbackSentence(actor, entry.action, target);
}
