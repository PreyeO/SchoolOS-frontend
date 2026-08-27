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
        <p className="mt-1 truncate text-xs text-n-500">
          {klassLabel && <>{klassLabel} · </>}
          <span className="font-mono">{child.admission_number}</span>
          <span className="capitalize"> · Your {child.relationship}</span>
        </p>
      </div>
      {trailing}
    </div>
  );
}
