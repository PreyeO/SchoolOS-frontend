"use client";

import type { MeChildLink } from "@/features/me/types";
import type { StudentListItem } from "@/features/students/types";
import { armDisplayName } from "@/lib/school/arm-display-name";

import { ChildSwitcher } from "./child-switcher";

interface Props {
  child: MeChildLink;
  // See ChildSwitcher: deliberately not `children`, which React reserves.
  childrenLinks: MeChildLink[];
  onSelect: (studentId: string) => void;
  student: StudentListItem | undefined;
  // Rendered at the end of the row — the term badge on most screens.
  trailing?: React.ReactNode;
}

// Who this screen is about, on every parent screen.
//
// Rendered by each screen rather than by a child/layout.tsx, because the
// dashboard needs it too and doesn't live under /child — one shared component
// beats a layout plus a duplicate of it.
export function ChildContextBar({ child, childrenLinks, onSelect, student, trailing }: Props) {
  const klass = student?.current_class;
  const klassLabel = klass
    ? armDisplayName({ name: klass.arm_name, is_default: klass.is_default }, klass.class_name)
    : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <ChildSwitcher child={child} childrenLinks={childrenLinks} onSelect={onSelect} />
        <p className="mt-1 flex flex-wrap items-center gap-x-1.5 truncate text-xs text-n-500">
          {klassLabel && <span>{klassLabel} ·</span>}
          <span className="font-mono">{child.admission_number}</span>
          {/* Was "· Your {relationship}" — e.g. "· Your mother", right next to
              the CHILD's own admission number. Read on the child's own results
              screen, that phrasing names a third person ("your mother" as in
              the reader's own mother) rather than saying who the reader is TO
              this child, which is what the field actually records
              (ParentStudentLink.relationship — "I am this child's mother").
              A plain role badge, matching how the admin-facing linked-parents
              list already renders the same field (student-parent-links.tsx),
              says the same fact without the ambiguity. */}
          <span className="rounded-full bg-n-100 px-2 py-0.5 text-[11px] capitalize text-n-500">
            {child.relationship}
          </span>
        </p>
      </div>
      {trailing}
    </div>
  );
}
