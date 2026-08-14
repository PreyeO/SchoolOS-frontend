export type AuditTone = "normal" | "sensitive" | "destructive";

// Events that change who can access what, hand out a credential, or reopen a
// record that had been sealed — the ones a proprietor actually scans an audit
// log for. Deliberately a short list: tinting everything defeats the purpose of
// tinting anything.
//
// The two unlocks earn their place for the same reason a password reissue does.
// Locking results is the point at which they become the school's official
// record, so undoing that is rare, deliberate, and worth catching the eye. Score
// edits are *not* here despite being the obvious tampering surface — they happen
// constantly during normal marking, and a permanently amber log says nothing.
const SENSITIVE_ACTIONS = new Set([
  "school_admin_role.created",
  "school_admin_role.updated",
  "school_admin_role.deleted",
  "school_admin_profile.created",
  "school_admin_profile.role_assigned",
  "school_admin_profile.role_unassigned",
  "student_profile.password_reissued",
  "invite.accepted",
  "class_arm_result.unlocked",
  "class_arm_subject_result_submission.unlocked",
]);

export function auditTone(action: string): AuditTone {
  if (SENSITIVE_ACTIONS.has(action)) return "sensitive";
  // Deactivation is the soft-delete half of the same intent — the results app
  // deactivates a trait or grading component that's already in use rather than
  // destroying rows that reference it — so it reads with the same weight.
  if (action.endsWith(".deleted") || action.endsWith(".deactivated")) return "destructive";
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
