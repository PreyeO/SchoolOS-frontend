"use client";

import { armDisplayName } from "@/lib/school/arm-display-name";
import { useMe } from "@/features/me/hooks/use-me";

export interface MyClass {
  classArmId: string;
  label: string;
  className: string;
  subjects: string[];
  // True when the teacher is this arm's class (form) teacher, as opposed to
  // just taking a subject in it. Drives ordering and the "Form class" badge.
  isFormClass: boolean;
}

// Every arm a teacher is responsible for, from both directions:
//
//   - class_arms          — arms they are the form teacher of
//   - subject_assignments — arms they take a subject in
//
// Both matter and neither implies the other. A form teacher may take no subjects
// in their own arm, which is exactly the case that used to show "no classes
// assigned" when this was derived from subject assignments alone.
export function useMyClasses() {
  const { data: me, isPending, isError, error } = useMe();
  const teacher = me?.teacher;

  const byArm = new Map<string, MyClass>();

  teacher?.class_arms.forEach((arm) => {
    byArm.set(arm.id, {
      classArmId: arm.id,
      // armDisplayName, not arm.name: a school that never named an arm carries a
      // placeholder literally called "Default", which must never be shown to a
      // teacher as though it were their class. /me now sends is_default, so this
      // is decided on the flag rather than the name.
      label: armDisplayName(arm, arm.class_name),
      className: arm.class_name,
      subjects: [],
      isFormClass: true,
    });
  });

  teacher?.subject_assignments.forEach((assignment) => {
    const existing = byArm.get(assignment.class_arm_id);
    if (existing) {
      if (!existing.subjects.includes(assignment.subject.name)) {
        existing.subjects.push(assignment.subject.name);
      }
      return;
    }
    byArm.set(assignment.class_arm_id, {
      classArmId: assignment.class_arm_id,
      label: armDisplayName(
        { name: assignment.arm_name, is_default: assignment.is_default },
        assignment.class_name,
      ),
      className: assignment.class_name,
      subjects: [assignment.subject.name],
      isFormClass: false,
    });
  });

  // Form classes first — that's the arm whose register they're responsible for.
  const classes = [...byArm.values()].sort((a, b) => {
    if (a.isFormClass !== b.isFormClass) return a.isFormClass ? -1 : 1;
    return a.label.localeCompare(b.label);
  });

  return { classes, isPending, isError, error, isTeacher: !!teacher };
}
