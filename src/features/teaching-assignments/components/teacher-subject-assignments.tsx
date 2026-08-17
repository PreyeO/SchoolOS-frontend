"use client";

import Link from "next/link";

import { useTeacherAssignments } from "../hooks/use-teacher-assignments";
import { armDisplayName } from "@/lib/school/arm-display-name";

// Read-only view of everything one teacher teaches, for the staff detail page.
// Grouped by class arm rather than listed flat: "JSS 1 A — Maths, Basic Science"
// is how a head of school thinks about a teacher's load.
export function TeacherSubjectAssignments({ teacherProfileId }: { teacherProfileId: string }) {
  const { data: assignments, isPending, isError } = useTeacherAssignments(teacherProfileId);

  const groups = new Map<string, { label: string; subjects: string[] }>();
  (assignments ?? []).forEach((a) => {
    const existing = groups.get(a.class_arm_id);
    const label = armDisplayName({ name: a.arm_name, is_default: a.is_default }, a.class_name);
    if (existing) existing.subjects.push(a.subject.name);
    else groups.set(a.class_arm_id, { label, subjects: [a.subject.name] });
  });

  return (
    <div className="rounded-xl border border-n-200 bg-white p-5">
      <h2 className="mb-1 text-sm font-semibold text-ink">Teaches</h2>
      <p className="mb-4 text-xs text-n-400">
        Set this in{" "}
        <Link href="/teaching-assignments" className="text-primary hover:underline">
          Teaching Assignments
        </Link>
        .
      </p>

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading assignments…</p>
      ) : isError ? (
        <p className="text-sm text-clay">Couldn&rsquo;t load teaching assignments.</p>
      ) : groups.size === 0 ? (
        <p className="text-sm text-n-400 italic">Not assigned to teach any subject yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {[...groups.values()].map((group) => (
            <li key={group.label} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-sm font-medium text-ink">{group.label}</span>
              <span className="text-sm text-n-500">{group.subjects.join(", ")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
