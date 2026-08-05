export type AuditTone = "normal" | "sensitive" | "destructive";

// Events that change who can access what, or hand out a credential — the ones
// a proprietor actually scans an audit log for. Deliberately a short list:
// tinting everything defeats the purpose of tinting anything.
const SENSITIVE_ACTIONS = new Set([
  "school_admin_role.created",
  "school_admin_role.updated",
  "school_admin_role.deleted",
  "school_admin_profile.created",
  "school_admin_profile.role_assigned",
  "school_admin_profile.role_unassigned",
  "student_profile.password_reissued",
  "invite.accepted",
]);

export function auditTone(action: string): AuditTone {
  if (SENSITIVE_ACTIONS.has(action)) return "sensitive";
  if (action.endsWith(".deleted")) return "destructive";
  return "normal";
}

// Status colours, not brand colours — same rule as the invite status badges and
// the grade-scale strip: these are semantic states, unrelated to the school's
// own primary/accent.
export const TONE_STYLES: Record<AuditTone, string> = {
  normal: "bg-n-100 text-n-500",
  sensitive: "bg-amber/15 text-amber",
  destructive: "bg-clay/10 text-clay",
};
