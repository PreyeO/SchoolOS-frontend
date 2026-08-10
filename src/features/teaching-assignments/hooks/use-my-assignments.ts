"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyAssignments } from "../api/teaching-assignments-api";
import type { SubjectAssignment } from "../types";

export interface MyClass {
  classArmId: string;
  label: string;
  className: string;
  subjects: string[];
}

// The signed-in teacher's own assignments. This is the one teaching endpoint a
// teacher can call without an admin permission, which makes it the backbone of
// the teacher experience — it's how they discover which arms they touch at all.
export function useMyAssignments() {
  return useQuery({
    queryKey: ["my-assignments"],
    queryFn: getMyAssignments,
  });
}

// Collapses the flat assignment list into one entry per class arm, which is how
// a teacher thinks about their load ("JSS 1 A — Maths, Basic Science") rather
// than as a list of subject-arm pairs.
export function groupByClassArm(assignments: SubjectAssignment[] | undefined): MyClass[] {
  const groups = new Map<string, MyClass>();

  (assignments ?? []).forEach((a) => {
    const existing = groups.get(a.class_arm_id);
    if (existing) {
      if (!existing.subjects.includes(a.subject.name)) existing.subjects.push(a.subject.name);
      return;
    }
    groups.set(a.class_arm_id, {
      classArmId: a.class_arm_id,
      // arm_name is the full label ("JSS 1 A"); class_name covers the case of a
      // class whose only arm is the system placeholder.
      label: a.arm_name || a.class_name,
      className: a.class_name,
      subjects: [a.subject.name],
    });
  });

  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label));
}
