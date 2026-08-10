"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/shared/error-state";
import { useCanMarkAttendance } from "@/lib/auth/use-personas";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useSchoolStore } from "@/stores/school-store";
import { ArmPicker } from "@/features/teaching-assignments/components/arm-picker";
import { armlessClasses, buildArmOptions } from "@/features/teaching-assignments/lib/arm-options";

import { useBulkMark } from "../hooks/use-bulk-mark";
import { useAttendance, useRoster } from "../hooks/use-register";
import { useRegisterDraft } from "../hooks/use-register-draft";
import { STATUS_META } from "../lib/status-meta";
import { ATTENDANCE_STATUSES } from "../types";
import { RegisterRow } from "./register-row";

// Local calendar date as YYYY-MM-DD. Not toISOString(), which converts to UTC
// and hands back yesterday for anyone marking a register before ~1am WAT.
function todayLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function AttendancePage() {
  const canMark = useCanMarkAttendance();
  const sessionName = useSchoolStore((s) => s.currentSchool?.sessionName);
  const { data: classes, isPending: classesLoading, isError, error } = useClasses();

  const [armId, setArmId] = useState<string | null>(null);
  const [date, setDate] = useState(todayLocal());

  const groups = useMemo(() => buildArmOptions(classes ?? []), [classes]);
  const allOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const skipped = useMemo(() => armlessClasses(classes ?? []), [classes]);

  const selectedId = armId ?? allOptions[0]?.armId ?? null;
  const selected = allOptions.find((o) => o.armId === selectedId) ?? null;

  const { data: roster, isPending: rosterLoading } = useRoster(selectedId);
  const { data: saved, isPending: savedLoading } = useAttendance(selectedId, date);
  const bulkMark = useBulkMark();

  const students = roster?.students;
  const { draft, savedById, setStatus, setNote, markAllUnset, changed, unmarkedCount } =
    useRegisterDraft(selectedId, date, saved, students);

  const counts = useMemo(() => {
    const tally: Record<string, number> = {};
    Object.values(draft).forEach((entry) => {
      tally[entry.status] = (tally[entry.status] ?? 0) + 1;
    });
    return tally;
  }, [draft]);

  function submit() {
    if (!selectedId || changed.length === 0) return;
    const markedAt = new Date().toISOString();
    bulkMark.mutate({
      class_arm_id: selectedId,
      date,
      records: changed.map(([student_id, entry]) => ({
        student_id,
        status: entry.status,
        ...(entry.note.trim() ? { note: entry.note.trim() } : {}),
        marked_at: markedAt,
      })),
    });
  }

  if (classesLoading) {
    return <p className="text-sm text-n-400" role="status">Loading classes…</p>;
  }

  if (isError || !classes) {
    return <ErrorState error={error} resourceLabel="your classes" />;
  }

  const loadingRegister = rosterLoading || savedLoading;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Attendance</h1>
        <p className="mt-1 text-sm text-n-500">
          {canMark
            ? "Mark the daily register for a class arm. Re-marking a day updates it."
            : "Review the daily register. Only a class's teacher can record or change marks."}
        </p>
      </div>

      {/* Only teachers can write. Say so up front rather than showing controls
          that 403 — the backend has no admin override by design. */}
      {!canMark && (
        <p className="flex items-start gap-2 rounded-lg border border-n-200 bg-n-50 px-3.5 py-2.5 text-xs text-n-600">
          <Info className="mt-0.5 size-4 shrink-0 text-n-400" />
          <span>
            You&rsquo;re viewing this as an admin, so the register is read-only. Attendance
            can only be recorded by a teacher — assign one to each arm in{" "}
            <Link href="/classes" className="text-primary hover:underline">
              Classes &amp; Arms
            </Link>
            .
          </span>
        </p>
      )}

      {!sessionName && (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
          No academic term is marked current, so students have no enrollments to build a
          register from. Set one in{" "}
          <Link href="/settings/sessions" className="text-primary hover:underline">
            Sessions &amp; Terms
          </Link>
          .
        </p>
      )}

      {skipped.length > 0 && (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
          {skipped.length} {skipped.length === 1 ? "class has" : "classes have"} no arm and
          can&rsquo;t take a register: {skipped.map((k) => k.name).join(", ")}. Add an arm in{" "}
          <Link href="/classes" className="text-primary hover:underline">
            Classes &amp; Arms
          </Link>
          .
        </p>
      )}

      {allOptions.length === 0 ? (
        <p className="text-sm text-n-400 italic">No classes yet — add one in Classes &amp; Arms first.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <ArmPicker groups={groups} value={selectedId} onChange={setArmId} />
            <label className="flex items-center gap-2 text-sm">
              <span className="text-n-500">Date</span>
              <Input
                type="date"
                value={date}
                max={todayLocal()}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Register date"
                className="h-9 w-auto"
              />
            </label>
          </div>

          <div className="rounded-xl border border-n-200 bg-white">
            {loadingRegister ? (
              <p className="p-5 text-sm text-n-400" role="status">Loading register…</p>
            ) : !students || students.length === 0 ? (
              <p className="p-5 text-sm text-n-400 italic">
                No students enrolled in {selected?.label ?? "this arm"} for the current term.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-n-100 px-5 py-3">
                  <span className="text-xs text-n-500">
                    {students.length} student{students.length === 1 ? "" : "s"}
                    {unmarkedCount > 0 && ` · ${unmarkedCount} unmarked`}
                  </span>
                  <span className="flex flex-wrap items-center gap-3">
                    {ATTENDANCE_STATUSES.filter((s) => counts[s]).map((status) => (
                      <span key={status} className="flex items-center gap-1.5 text-xs text-n-600">
                        <span className={`size-2 rounded-full ${STATUS_META[status].dot}`} />
                        {counts[status]} {STATUS_META[status].label.toLowerCase()}
                      </span>
                    ))}
                  </span>
                  {canMark && unmarkedCount > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => markAllUnset("present")}
                      className="ml-auto h-7 text-xs text-primary"
                    >
                      Mark {unmarkedCount} remaining present
                    </Button>
                  )}
                </div>

                <ul className="divide-y divide-n-100 px-5">
                  {students.map((student) => (
                    <RegisterRow
                      key={student.id}
                      student={student}
                      entry={draft[student.id]}
                      savedRecord={savedById[student.id]}
                      canMark={canMark}
                      onStatus={(status) => setStatus(student.id, status)}
                      onNote={(note) => setNote(student.id, note)}
                    />
                  ))}
                </ul>

                {roster && roster.total > students.length && (
                  <p className="border-t border-n-100 px-5 py-3 text-xs text-clay">
                    Showing {students.length} of {roster.total} students — this arm exceeds the
                    100-per-request limit, so the register is incomplete. Split the arm or
                    contact support before marking.
                  </p>
                )}

                {canMark && (
                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-n-100 px-5 py-3">
                    <span className="mr-auto text-xs text-n-400">
                      {changed.length === 0
                        ? "No unsaved changes."
                        : `${changed.length} unsaved change${changed.length === 1 ? "" : "s"}.`}
                    </span>
                    <Button
                      type="button"
                      onClick={submit}
                      disabled={changed.length === 0 || bulkMark.isPending}
                    >
                      {bulkMark.isPending ? "Saving…" : "Save register"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
