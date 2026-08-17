// What to call an arm on teacher- and student-facing screens.
//
// A class created without arms gets a system placeholder literally named
// "Default". The admin-side endpoints have always exposed is_default so
// realArms() can filter it properly; the embedded shapes did not, so this used
// to match on the name — which worked, but broke the moment that literal changed.
//
// is_default now arrives on every embedded arm shape but one:
// TeacherClassArmSerializer (teacher class_arms, staff directory),
// CurrentEnrollmentSerializer (a student's current_class), and both
// SubjectAssignment serializers all carry it, so those are decided on the flag.
//
// The holdout is ClassArmSubjectResultSubmissionSerializer, which flattens
// arm_name for the result review screens with no flag beside it — a class with
// no named arms shows up there as {"arm_name": "Default"}. That one call site is
// the only remaining reason this fallback exists; delete it once the flag lands.
const PLACEHOLDER_ARM_NAME = "Default";

interface ArmLike {
  name: string | null | undefined;
  // Absent on the two subject-assignment serializers; see above.
  is_default?: boolean;
}

export function armDisplayName(arm: ArmLike, className: string): string {
  if (!arm.name) return className;
  // A real boolean is authoritative either way — an arm genuinely named
  // "Default" by a school stays "Default" when the flag says it isn't the
  // placeholder.
  if (typeof arm.is_default === "boolean") {
    return arm.is_default ? className : arm.name;
  }
  return arm.name === PLACEHOLDER_ARM_NAME ? className : arm.name;
}
