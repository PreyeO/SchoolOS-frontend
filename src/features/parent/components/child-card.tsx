import Link from "next/link";
import { ChevronRight, UserRound } from "lucide-react";

import type { MeChildLink } from "@/features/me/types";

// One linked child, on both the parent's home and the My Children list. Shared
// so the two can't drift — they show the same child, one screen apart.
export function ChildCard({ child }: { child: MeChildLink }) {
  return (
    <li>
      <Link
        href={`/my-children/${child.student_id}`}
        className="flex items-center gap-3 rounded-xl border border-n-200 bg-white p-4 transition-colors hover:border-n-300"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <UserRound className="size-5 text-primary" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">
            {child.student_name}
          </span>
          <span className="block truncate font-mono text-[11px] text-n-400">
            {child.admission_number}
          </span>
          <span className="block truncate text-xs text-n-500 capitalize">
            {child.relationship}
            {child.is_primary_contact && " · Primary contact"}
          </span>
        </span>
        <ChevronRight className="size-4 shrink-0 text-n-400" />
      </Link>
    </li>
  );
}
