// What to call an arm on teacher- and student-facing screens.
//
// Two rules, both requested directly (2026-09-03) after they showed up wrong
// on screen — a teacher's "My Classes" card headlined bare "A" with "Primary 1"
// printed small underneath it, and the Teaching Assignments dropdown listed
// nothing but bare letters:
//
//   1. A REAL arm is named in full: "{class} {arm}" ("Primary 1 A"), not the
//      bare arm name alone. A letter or colour on its own tells nobody which
//      class it belongs to, and every screen that showed one was the sole
//      place on that screen naming the class at all.
//   2. The system PLACEHOLDER arm — created when a class is submitted with no
//      arms (academic/models.py ClassArm.is_default) — is never named "Default"
//      to a school. It collapses to the class name alone, since there's no
//      real arm to report.
//
// A class created without arms gets a system placeholder literally named
// "{class name} - Default" (AcademicService.create_classes) — NOT bare
// "Default", which this file wrongly assumed for a long time. That mismatch
// is exactly why the string-fallback below existed but never actually caught
// anything: comparing against a bare "Default" can never match
// "Primary 1 - Default", so every call site relying on the fallback (no
// is_default flag available) rendered that raw string verbatim instead of
// falling back — confirmed live against ClassArmSubjectResultSubmissionSerializer,
// the review-queue and submission-scores-dialog screens' data source, which is
// still the only embedded shape with no flag beside it.
//
// is_default arrives on every OTHER embedded arm shape: TeacherClassArmSerializer
// (teacher class_arms, staff directory), CurrentEnrollmentSerializer (a
// student's current_class), and both SubjectAssignment serializers. Those are
// decided on the flag; only the one holdout needs the string fallback, now
// built from the real className rather than a fixed literal.
interface ArmLike {
  name: string | null | undefined;
  // Absent on ClassArmSubjectResultSubmissionSerializer; see above.
  is_default?: boolean;
}

export function armDisplayName(arm: ArmLike, className: string): string {
  if (!arm.name) return className;
  // A real boolean is authoritative either way — an arm genuinely named
  // "{class} - Default" by a school (vanishingly unlikely, but not
  // impossible) stays as typed when the flag says it isn't the placeholder.
  const isPlaceholder =
    typeof arm.is_default === "boolean" ? arm.is_default : arm.name === `${className} - Default`;
  if (isPlaceholder) return className;
  return arm.name.startsWith(className) ? arm.name : `${className} ${arm.name}`;
}
