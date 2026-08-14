// The literal name the backend gives a placeholder arm, from
// AcademicService.bulk_create_classes:
//
//   ClassArm.objects.create(klass=class_obj, name="Default", is_default=True)
//
// Matching on it is not something to be pleased about, but it's the only signal
// available on these surfaces: /me and the staff directory embed arms through
// TeacherClassArmSerializer, which exposes only {id, name, class_id, class_name}
// — no is_default. The admin-side endpoints do return the flag, which is why
// realArms() can do this properly and this can't.
//
// Without the guard, a school that never named an arm shows its teachers a class
// called "Default" — on their dashboard, in My Classes, and on the staff record.
// The class name is the right answer there, and it's what the admin-side pickers
// already display for the very same row (see buildArmOptions).
const PLACEHOLDER_ARM_NAME = "Default";

export function armDisplayName(armName: string | null | undefined, className: string): string {
  if (!armName || armName === PLACEHOLDER_ARM_NAME) return className;
  return armName;
}
