"use client";

import { CalendarCheck } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { STATUS_META } from "@/features/attendance/lib/status-meta";
import { formatDate } from "@/lib/text/format-date";

import { useStudentAttendance } from "../hooks/use-student-attendance";

interface Props {
  studentId: string | undefined;
  // Term bounds. Attendance is per-day and a session runs to ~195 school days,
  // past the 100-record page — so this is scoped to a term rather than paged.
  range?: { after?: string; before?: string };
  // "your" for a student reading their own, the child's first name for a parent.
  subject: string;
}

// One student's attendance for a term: the rate, the counts, and every day.
//
// Shared by both portals because the question is identical — only the pronoun
// differs. The backend scopes the rows itself (self for a student, linked
// children for a parent), so nothing here filters by identity.
export function AttendanceRecordView({ studentId, range, subject }: Props) {
  const { records, summary, isPending, isPaused, isError, error } = useStudentAttendance(
    studentId,
    range,
  );

  if (isPaused && records.length === 0) {
    return <OfflineNotice resourceLabel="Attendance" />;
  }
  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading attendance…</p>;
  }
  if (isError) {
    return <ErrorState error={error} resourceLabel="attendance" />;
  }

  if (summary.total === 0) {
    return (
      <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-n-100">
          <CalendarCheck className="size-5 text-n-400" />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold text-ink">
          No attendance recorded
        </h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
          Nothing has been marked for {subject} this term yet. Registers are taken by
          the class teacher.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Tile
          label="Attendance"
          value={summary.rate === null ? "—" : `${summary.rate}%`}
          strong
        />
        <Tile label="Present" value={String(summary.present)} />
        <Tile label="Absent" value={String(summary.absent)} />
        <Tile label="Late" value={String(summary.late)} />
        <Tile label="Excused" value={String(summary.excused)} />
      </div>

      <ul className="divide-y divide-n-100 rounded-xl border border-n-200 bg-white">
        {records.map((record) => {
          const meta = STATUS_META[record.status];
          return (
            <li key={record.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className={`size-2 shrink-0 rounded-full ${meta.dot}`} />
              <span className="min-w-0 flex-1 truncate text-sm text-ink">
                {formatDate(record.date)}
              </span>
              {/* The note is where a reason lives ("Student is sick"), which is
                  the whole point of an excused day for a parent. */}
              {record.note && (
                <span className="hidden min-w-0 flex-1 truncate text-xs text-n-500 sm:block">
                  {record.note}
                </span>
              )}
              <span className="shrink-0 text-xs font-medium text-n-600">{meta.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Tile({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-n-200 bg-white p-3.5">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">{label}</p>
      <p
        className={`mt-1 font-display font-bold tabular-nums text-ink ${strong ? "text-xl" : "text-lg"}`}
      >
        {value}
      </p>
    </div>
  );
}
