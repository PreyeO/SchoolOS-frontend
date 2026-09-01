import { GraduationCap } from "lucide-react";

import { PersonAvatar } from "@/components/shared/person-avatar";

import type { PeopleKind, PlatformPerson } from "../api/platform-people-api";

// Students are shown WITHOUT their name, email, photo or gender.
//
// Most are minors, and a SchoolOS employee has no reason to know a child's
// name to do their job. The support question this screen answers is "does this
// record exist, and where is it" — which an admission number and a class
// answer completely. The school's own admin, who quotes that number when they
// report a problem, already knows whose it is; nobody at the vendor needs to.
//
// The adult directories are unchanged: teachers, parents and school admins are
// the people a platform admin actually corresponds with, and identifying them
// is the point of looking them up.
//
// This narrows what is DISPLAYED. The list endpoint still sends the full
// record — name, email, gender, class — so the payload is in the browser
// either way. Reducing it at the source is a backend change; see
// docs/asks/platform-student-exposure.md.
export function PlatformPersonRow({ person, kind }: { person: PlatformPerson; kind: PeopleKind }) {
  if (kind === "students") {
    const student = person as PlatformPerson & {
      admission_number?: string;
      current_class?: { class_name: string; arm_name: string; is_default: boolean } | null;
      enrollment_status?: string;
    };
    const klass = student.current_class;
    const placement = klass
      ? klass.is_default
        ? klass.class_name
        : klass.arm_name
      : "Not enrolled";

    return (
      <li className="flex items-center gap-3 px-4 py-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-n-100">
          <GraduationCap className="size-4 text-n-400" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-sm text-ink">
            {student.admission_number ?? "—"}
          </span>
          <span className="block truncate text-xs text-n-500">{placement}</span>
        </span>
        {student.enrollment_status && student.enrollment_status !== "active" && (
          <span className="shrink-0 rounded-full bg-n-100 px-2 py-0.5 text-[11px] font-medium text-n-500">
            {student.enrollment_status}
          </span>
        )}
      </li>
    );
  }

  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      <PersonAvatar
        firstName={person.user.first_name}
        lastName={person.user.last_name}
        photo={person.user.photo}
        className="size-8 shrink-0"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-ink">
          {person.user.first_name} {person.user.last_name}
        </span>
        <span className="block truncate text-xs text-n-500">{person.user.email}</span>
      </span>
    </li>
  );
}
