"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { useCanMarkAttendance } from "@/lib/auth/use-personas";
import { ArmPicker } from "@/components/shared/arm-picker";
import { getErrorMessage, isPermissionDeniedError } from "@/lib/api/get-error-message";
import { armlessClasses, buildArmOptions, type ArmOptionGroup } from "@/lib/school/arm-options";
import { teachingUnitWords } from "@/lib/school/teaching-unit";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useCanAccess } from "@/lib/auth/use-can-access";
import { useMyClasses, type MyClass } from "@/features/teacher/hooks/use-my-classes";
import { useSchoolStore } from "@/stores/school-store";

import { useBulkMark } from "../hooks/use-bulk-mark";
import { clearRegisterStudentIds, useClearRegister } from "../hooks/use-clear-register";
import { useAttendance, useRoster } from "../hooks/use-register";
import { useRegisterDraft } from "../hooks/use-register-draft";
import { useLastSkippedReport, useOnlineStatus, usePendingMarks } from "../hooks/use-sync-status";
import { STATUS_META } from "../lib/status-meta";
import { ATTENDANCE_STATUSES, type AttendanceRecord } from "../types";
import { RegisterRow } from "./register-row";
import { SkippedMarksPanel } from "./skipped-marks-panel";
import { ClearRegisterButton } from "./clear-register-button";
import { SyncStatusStrip } from "./sync-status-strip";
import { WeekendNotice } from "./weekend-notice";

// The teacher's own arms, shaped like the picker's normal input. One group, not
// grouped by level — /me doesn't carry a level per arm, and a teacher has a
// handful of classes rather than a school-sized list, so there's nothing to
// group. armId is what every payload needs and it's the same id either way.
function armOptionsFromMyClasses(myClasses: MyClass[]): ArmOptionGroup[] {
  if (myClasses.length === 0) return [];
  return [
    {
      level: "primary",
      levelLabel: "Your classes",
      options: myClasses.map((klass) => ({
        armId: klass.classArmId,
        label: klass.label,
        className: klass.className,
        level: "primary" as const,
      })),
    },
  ];
}

// Module scope so the identity is stable across renders — an inline [] would
// invalidate the draft's memos on every pass.
const NO_RECORDS: AttendanceRecord[] = [];

// A ?date= from the URL, only if it's a real past-or-present calendar date.
// Anything else — malformed, or ahead of today, which the picker itself forbids —
// falls back to today rather than opening a register that can't exist.
function safeDate(value: string | undefined, today: string): string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return today;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return today;
  return value > today ? today : value;
}

// Local calendar date as YYYY-MM-DD. Not toISOString(), which converts to UTC
// and hands back yesterday for anyone marking a register before ~1am WAT.
function todayLocal(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function AttendancePage({
  initialArmId,
  initialDate,
}: {
  initialArmId?: string;
  initialDate?: string;
}) {
  const canManageClasses = useCanAccess("/classes");
  const canManageSessions = useCanAccess("/settings/sessions");
  const router = useRouter();
  const pathname = usePathname();
  const canMark = useCanMarkAttendance();
  const sessionName = useSchoolStore((s) => s.currentSchool?.sessionName);
  const {
    data: classes,
    isPending: classesLoading,
    // Offline with nothing cached, TanStack pauses rather than fails. Told apart
    // from a real load so the page can say so instead of spinning forever.
    isPaused: classesPaused,
    isError,
    error,
  } = useClasses();
  const { classes: myClasses } = useMyClasses();

  const [armId, setArmId] = useState<string | null>(initialArmId ?? null);
  const [date, setDate] = useState(() => safeDate(initialDate, todayLocal()));
  const lastSkipped = useLastSkippedReport();
  const [dismissedReportId, setDismissedReportId] = useState<number | null>(null);

  // The school-wide class list is the richer source — it groups by level and
  // knows about arms with no teacher. But it's an admin-shaped request a teacher
  // doesn't need, and on a device that has never loaded it there's nothing
  // cached. /me is always persisted and already carries the arms this teacher is
  // responsible for, so it stands in when the full list isn't there.
  const groups = useMemo(
    () => (classes ? buildArmOptions(classes) : armOptionsFromMyClasses(myClasses)),
    [classes, myClasses],
  );
  const allOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const skipped = useMemo(() => armlessClasses(classes ?? []), [classes]);
  // This school's own word for the thing holding a register.
  const unit = useMemo(() => teachingUnitWords(classes), [classes]);

  // Which register to open on, in order of how likely it is to be the one
  // wanted: an explicit ?arm=, then the teacher's own class (form class first —
  // useMyClasses sorts those to the front), then whatever sorts first. A teacher
  // shouldn't have to hunt through a school-wide list for their own register.
  const selectedId =
    armId ?? initialArmId ?? myClasses[0]?.classArmId ?? allOptions[0]?.armId ?? null;
  const selected = allOptions.find((o) => o.armId === selectedId) ?? null;

  const {
    data: roster,
    isPending: rosterLoading,
    isPaused: rosterPaused,
    error: rosterError,
  } = useRoster(selectedId);
  const {
    data: saved,
    isPending: savedLoading,
    isPaused: savedPaused,
    // Bumped on every successful fetch, whether or not the rows changed — which
    // is exactly what "the refetch has landed" needs.
    dataUpdatedAt: savedUpdatedAt,
  } = useAttendance(selectedId, date);

  // Today with nothing cached is an *unmarked* register, not a missing one, and
  // it has to stay markable — a teacher opening the app offline first thing in
  // the morning has never fetched today's records, and that is precisely the
  // case this whole feature exists for. Treating it as "no saved copy" would
  // block the one thing offline attendance promises.
  //
  // Past dates deliberately don't get this. Assuming "empty" for a day that was
  // in fact marked would show a blank register, invite re-marking, and
  // last-write-wins would then commit those over the real records.
  const todayUnmarkedOffline = savedPaused && !saved && date === todayLocal();
  const savedRecords = saved ?? (todayUnmarkedOffline ? NO_RECORDS : undefined);

  // Records are cached per date — the key is ["attendance","records",arm,date] —
  // so offline a date resolves only if it was opened while online. Any other
  // date pauses forever, which without this check rendered "Loading register…"
  // indefinitely: the same trap the class list had, reachable just by nudging
  // the date field back a day. Computed here, ahead of the URL-sync effect
  // below, so that effect can tell a genuinely unreachable selection apart from
  // one that just hasn't resolved yet.
  const unavailableOffline = (savedPaused && !savedRecords) || (rosterPaused && !roster);

  // Keep the URL saying which register is open, so a refresh returns to it
  // rather than silently snapping back to today's date and the default arm.
  //
  // replace, not push: the date input fires on every change, and pushing would
  // bury the previous page under a dozen history entries. Mirrors the *derived*
  // selection, so the arm chosen by default on first load is written down too.
  //
  // Skipped while unavailableOffline: this route is an async Server Component
  // that bakes ?arm=/?date= into props via searchParams, so replace() here
  // means a real RSC fetch for that exact URL. Offline, with nothing cached for
  // this arm/date, the service worker can't find an exact match and falls back
  // to whatever /attendance document IS cached (`ignoreSearch: true`) — serving
  // a *different* date's baked-in props and silently snapping the picker back
  // to it. Leaving the URL alone here means the address bar briefly lags the
  // picker, but the picker's own "No saved copy of this date" message (below)
  // gets to render instead of being clobbered by that stale navigation. Once
  // unavailableOffline clears — back online, or the data was cached after all —
  // this re-runs and the URL catches up.
  useEffect(() => {
    if (!selectedId || unavailableOffline) return;
    const params = new URLSearchParams({ arm: selectedId, date });
    const next = `${pathname}?${params.toString()}`;
    if (`${window.location.pathname}${window.location.search}` === next) return;
    router.replace(next, { scroll: false });
  }, [selectedId, date, pathname, router, unavailableOffline]);

  const bulkMark = useBulkMark();

  // isPaused means "queued because there's no network", which is a finished
  // action from the teacher's point of view — only a live request should lock
  // the button. Conflating the two left Save stuck on "Saving…" offline, so a
  // half-marked register could never be added to.
  const isSubmitting = bulkMark.isPending && !bulkMark.isPaused;
  const queuedCount = Object.keys(usePendingMarks(selectedId, date)).length;

  const students = roster?.students;
  const { draft, savedById, setStatus, setNote, markAllUnset, changed, unmarkedCount, movedOut, reset } =
    useRegisterDraft(selectedId, date, savedRecords, students, {
      skippedReportId: lastSkipped?.id ?? null,
      savedUpdatedAt,
    });
  // reset drops the device draft, so the cleared marks can't seed back in.
  const clearRegister = useClearRegister(selectedId, date, reset);
  const online = useOnlineStatus();
  // Online only, and never while this register's own marks are still queued:
  // those would land after the clear and be skipped, silently losing them.
  const clearBlocked = !online
    ? "Connect to the internet to clear a register."
    : queuedCount > 0
      ? "Wait for this register's saved marks to sync first."
      : isSubmitting
        ? "Wait for the register to finish saving."
        : null;

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

  // Order matters. A teacher whose own arms are known can open their register
  // even with no class list at all, so that's checked before any loading or
  // error state — otherwise the page would block on a request it doesn't need.
  const canWorkFromMyClasses = allOptions.length > 0;

  if (!canWorkFromMyClasses) {
    // Paused, not loading: offline with nothing cached. Saying "Loading…" here
    // was the forever-spinner — the request cannot resolve until the network
    // returns, so the honest answer is that there's no saved copy.
    if (classesPaused) {
      return <OfflineNotice resourceLabel="Your class list" />;
    }
    if (classesLoading) {
      return <p className="text-sm text-n-400" role="status">Loading classes…</p>;
    }
    if (isError || !classes) {
      return <ErrorState error={error} resourceLabel="your classes" />;
    }
  }

  // unavailableOffline is computed earlier, alongside the URL-sync effect that
  // needs it before this point in the render.
  const loadingRegister =
    !unavailableOffline && (rosterLoading || (savedLoading && !savedRecords));

  // A failed *background* refetch must not hide a roster we already hold.
  // query-core's error reducer spreads the previous state, so `data` survives
  // while `status` flips to "error" — meaning a cached, perfectly usable
  // register would otherwise disappear behind "Couldn't load the class list.
  // Check your network", which is exactly what a cold start offline produces.
  const rosterUnavailable = !!rosterError && !roster;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Attendance</h1>
        <p className="mt-1 text-sm text-n-500">
          {canMark
            ? `Mark the daily register for a ${unit.one}. Re-marking a day updates it.`
            : "Review the daily register. Only a teacher can record or change marks."}
        </p>
      </div>

      {/* Only teachers can write. Say so up front rather than showing controls
          that 403 — the backend has no admin override by design.
          Deliberately doesn't point at assigning a form teacher: any teacher
          at the school can mark any arm's register regardless of who (if
          anyone) is its class teacher — see
          AttendanceRecordViewSet's docstring, attendance/views.py. Naming that
          as "the fix" would misdiagnose why an admin can't mark it — the
          reason is simply that admins never can, not that this arm is missing
          something. */}
      {!canMark && (
        <p className="flex items-start gap-2 rounded-lg border border-n-200 bg-n-50 px-3.5 py-2.5 text-xs text-n-600">
          <Info className="mt-0.5 size-4 shrink-0 text-n-400" />
          <span>
            You&rsquo;re viewing this as an admin, so the register is read-only. Attendance
            can only be recorded by a teacher — there&rsquo;s no admin override.
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
          register from.{" "}
          {/* Sessions & Terms is admin-only, and this screen is staff-wide. */}
          {canManageSessions ? (
            <>
              Set one in{" "}
              <Link href="/settings/sessions" className="text-primary hover:underline">
                Sessions &amp; Terms
              </Link>
              .
            </>
          ) : (
            "Ask an administrator to mark the current term."
          )}
        </p>
      )}

      {skipped.length > 0 && (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
          {skipped.length} {skipped.length === 1 ? "class has" : "classes have"} no arm and
          can&rsquo;t take a register: {skipped.map((k) => k.name).join(", ")}.{" "}
          {/* Classes & Arms is admin-only — a teacher is told what's wrong
              without being pointed at a screen that would refuse them. */}
          {canManageClasses ? (
            <>
              Add an arm in{" "}
              <Link href="/classes" className="text-primary hover:underline">
                Classes &amp; Arms
              </Link>
              .
            </>
          ) : (
            "An administrator needs to add an arm before they can be marked."
          )}
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

          {canMark && <WeekendNotice date={date} />}

          <div className="rounded-xl border border-n-200 bg-white">
            {unavailableOffline ? (
              // Deliberately not seeded from the dashboard's arm-history cache,
              // which does hold several recent days: that query is capped at 100
              // records, so a day near the cap arrives half-complete. Showing a
              // partial register as if it were whole would invite a teacher to
              // "fix" marks that were already correct, and last-write-wins would
              // then overwrite the real ones.
              <div className="p-5">
                <p className="text-sm font-medium text-ink">No saved copy of this date</p>
                <p className="mt-1 text-sm text-n-500">
                  You&rsquo;re offline, and this register hasn&rsquo;t been opened on this
                  device. Today&rsquo;s register and any date you&rsquo;ve already viewed
                  still work — this one will load once you&rsquo;re back on the network.
                </p>
              </div>
            ) : loadingRegister ? (
              <p className="p-5 text-sm text-n-400" role="status">Loading register…</p>
            ) : rosterUnavailable ? (
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
                    {selectedId && (savedRecords?.length ?? 0) > 0 && (
                      <ClearRegisterButton
                        classArmId={selectedId}
                        date={date}
                        armLabel={selected?.label ?? `this ${unit.one}`}
                        studentIds={clearRegisterStudentIds(students.map((s) => s.id), savedRecords)}
                        markedCount={savedRecords?.length ?? 0}
                        blockedReason={clearBlocked}
                        isPending={clearRegister.isPending}
                        onConfirm={(payload) => clearRegister.mutate(payload)}
                      />
                    )}
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
