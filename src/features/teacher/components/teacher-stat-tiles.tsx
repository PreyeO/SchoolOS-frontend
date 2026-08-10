"use client";

import type { LucideIcon } from "lucide-react";
import { BookOpen, ClipboardCheck, School, Users } from "lucide-react";

interface Tile {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
}

interface Props {
  classCount: number;
  subjectCount: number;
  studentCount: number;
  latestRate: number | null;
  hasAnyRecords: boolean;
}

// Headline numbers are stat tiles, not one-bar charts. Values use proportional
// figures (no tabular-nums) — equal-width digits read loose at this size.
export function TeacherStatTiles({
  classCount,
  subjectCount,
  studentCount,
  latestRate,
  hasAnyRecords,
}: Props) {
  const tiles: Tile[] = [
    {
      label: "Classes",
      value: String(classCount),
      hint: classCount === 1 ? "class arm you teach" : "class arms you teach",
      icon: School,
    },
    {
      label: "Subjects",
      value: String(subjectCount),
      hint: subjectCount === 1 ? "subject across your classes" : "subjects across your classes",
      icon: BookOpen,
    },
    {
      label: "Students",
      value: hasAnyRecords ? String(studentCount) : "—",
      // Said plainly rather than showing a confident zero: the student directory
      // is admin-only, so a teacher's roster size is only knowable from the last
      // register that was taken.
      hint: hasAnyRecords ? "on your most recent registers" : "known once a register is taken",
      icon: Users,
    },
    {
      label: "Attendance",
      value: latestRate === null ? "—" : `${latestRate}%`,
      hint: latestRate === null ? "no registers taken yet" : "on your last marked day",
      icon: ClipboardCheck,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <div key={tile.label} className="rounded-xl border border-n-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <Icon className="size-3.5 shrink-0 text-n-400" />
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-n-400">{tile.label}</p>
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-ink">{tile.value}</p>
            <p className="mt-0.5 text-xs text-n-400">{tile.hint}</p>
          </div>
        );
      })}
    </div>
  );
}
