"use client";

import { formatNaira } from "@/lib/text/format-naira";
import type { StudentListItem } from "@/features/students/types";
import { armDisplayName } from "@/lib/school/arm-display-name";

interface Props {
  student: StudentListItem;
  termLabel: string;
  totalBalance: number;
  isBilled: boolean;
}

// Who, which term, and the one number the conversation at the desk is about.
export function LedgerSummary({ student, termLabel, totalBalance, isBilled }: Props) {
  const klass = student.current_class;
  const settled = isBilled && totalBalance === 0;

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-n-200 bg-white p-4">
      <div className="min-w-0">
        <p className="font-display text-lg font-semibold text-ink">
          {student.user.first_name} {student.user.last_name}
        </p>
        <p className="mt-0.5 text-sm text-n-500">
          {student.admission_number}
          {klass && <> · {armDisplayName({ name: klass.arm_name, is_default: klass.is_default }, klass.class_name)}</>}
          {" · "}
          {termLabel}
        </p>
      </div>

      <div className="text-right">
        {!isBilled ? (
          <p className="text-sm text-n-500">Not billed this term</p>
        ) : (
          <>
            <p className="text-xs uppercase tracking-wide text-n-400">Outstanding</p>
            <p
              className={`font-mono text-2xl font-bold tabular-nums ${settled ? "text-grass" : "text-ink"}`}
            >
              {formatNaira(totalBalance)}
            </p>
            {settled && <p className="text-xs font-medium text-grass">Fully paid</p>}
          </>
        )}
      </div>
    </div>
  );
}
