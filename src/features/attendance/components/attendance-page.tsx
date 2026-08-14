"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/shared/error-state";
import { useCanMarkAttendance } from "@/lib/auth/use-personas";
import { ArmPicker } from "@/components/shared/arm-picker";
import { getErrorMessage, isPermissionDeniedError } from "@/lib/api/get-error-message";
import { armlessClasses, buildArmOptions } from "@/lib/school/arm-options";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useMyClasses } from "@/features/teacher/hooks/use-my-classes";
import { useSchoolStore } from "@/stores/school-store";

import { useBulkMark } from "../hooks/use-bulk-mark";
import { useAttendance, useRoster } from "../hooks/use-register";
import { useRegisterDraft } from "../hooks/use-register-draft";
import { useLastSkippedReport, usePendingMarks } from "../hooks/use-sync-status";
import { STATUS_META } from "../lib/status-meta";
import { ATTENDANCE_STATUSES } from "../types";
import { RegisterRow } from "./register-row";
import { SkippedMarksPanel } from "./skipped-marks-panel";
import { SyncStatusStrip } from "./sync-status-strip";

// Local calendar date as YYYY-MM-DD. Not toISOString(), which converts to UTC
// and hands back yesterday for anyone marking a register before ~1am WAT.
function todayLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function AttendancePage({ initialArmId }: { initialArmId?: string }) {
  const canMark = useCanMarkAttendance();
  const sessionName = useSchoolStore((s) => s.currentSchool?.sessionName);
  const { data: classes, isPending: classesLoading, isError, error } = useClasses();
  const { classes: myClasses } = useMyClasses();

  const [armId, setArmId] = useState<string | null>(null);
  const [date, setDate] = useState(todayLocal());
  const lastSkipped = useLastSkippedReport();
  const [dismissedReportId, setDismissedReportId] = useState<number | null>(null);

  const groups = useMemo(() => buildArmOptions(classes ?? []), [classes]);
  const allOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const skipped = useMemo(() => armlessClasses(classes ?? []), [classes]);

  // Which register to open on, in order of how likely it is to be the one
  // wanted: an explicit ?arm=, then the teacher's own class (form class first —
  // useMyClasses sorts those to the front), then whatever sorts first. A teacher
  // shouldn't have to hunt through a school-wide list for their own register.
  const selectedId =
    armId ?? initialArmId ?? myClasses[0]?.classArmId ?? allOptions[0]?.armId ?? null;
  const selected = allOptions.find((o) => o.armId === selectedId) ?? null;

  const { data: roster, isPending: rosterLoading, error: rosterError } = useRoster(selectedId);
  const {
    data: saved,
    isPending: savedLoading,
    // Bumped on every successful fetch, whether or not the rows changed — which
    // is exactly what "the refetch has landed" needs.
    dataUpdatedAt: savedUpdatedAt,
  } = useAttendance(selectedId, date);
  const bulkMark = useBulkMark();

  // isPaused means "queued because there's no network", which is a finished
  // action from the teacher's point of view — only a live request should lock
  // the button. Conflating the two left Save stuck on "Saving…" offline, so a
  // half-marked register could never be added to.
  const isSubmitting = bulkMark.isPending && !bulkMark.isPaused;
  const queuedCount = Object.keys(usePendingMarks(selectedId, date)).length;

  const students = roster?.students;
  const { draft, savedById, setStatus, setNote, markAllUnset, changed, unmarkedCount, movedOut } =
    useRegisterDraft(selectedId, date, saved, students, {
      skippedReportId: lastSkipped?.id ?? null,
      savedUpdatedAt,
    });

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

      <SyncStatusStrip />

      {lastSkipped && lastSkipped.id !== dismissedReportId && (
        <SkippedMarksPanel
          skipped={lastSkipped.skipped}
          students={students}
          onDismiss={() => setDismissedReportId(lastSkipped.id)}
        />
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
            ) : rosterError ? (
              // A failed roster fetch is not an empty class, and saying "no
              // students" for a 403 would send someone hunting for enrolments
              // that are actually there.
              <div className="p-5">
                <p className="text-sm font-medium text-ink">Couldn&rsquo;t load the class list.</p>
                <p className="mt-1 text-sm text-n-500">
                  {isPermissionDeniedError(rosterError)
                    ? "Your account isn't permitted to read the student list, so the register can't be built. This is a known gap for teacher accounts — an administrator can view the register in the meantime."
                    : getErrorMessage(rosterError)}
                </p>
              </div>
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

                {movedOut > 0 && (
                  <p className="border-t border-n-100 px-5 py-2.5 text-xs text-n-400">
                    {movedOut} mark{movedOut === 1 ? "" : "s"} from this date{" "}
                    {movedOut === 1 ? "belongs" : "belong"} to a student who has since moved
                    to another class, so {movedOut === 1 ? "it isn't" : "they aren't"} counted
                    above. The record stays on this date&rsquo;s history.
                  </p>
                )}

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
                      {changed.length > 0
                        ? `${changed.length} unsaved change${changed.length === 1 ? "" : "s"}.`
                        : queuedCount > 0
                          ? "Saved on this device — will sync when you're back online."
                          : "No unsaved changes."}
                    </span>
                    <Button
                      type="button"
                      onClick={submit}
                      // Only a request actually in flight blocks further saving.
                      // A queued one is done as far as the teacher is concerned,
                      // so they can keep marking and save again — the backend
                      // upserts, and the later marked_at wins.
                      disabled={changed.length === 0 || isSubmitting}
                    >
                      {isSubmitting ? "Saving…" : "Save register"}
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
