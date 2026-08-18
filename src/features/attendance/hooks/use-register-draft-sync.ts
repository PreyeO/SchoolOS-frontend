"use client";

import { useEffect, useState } from "react";

import type { StudentListItem } from "@/features/students/types";
import { useAuthStore } from "@/stores/auth-store";

import { clearDraft, draftKey, readDraft, writeDraft } from "../lib/draft-storage";
import type { AttendanceRecord, DraftEntry } from "../types";

// Keeps the register draft in step with the server and with device storage.
//
// Split from useRegisterDraft, which owns *editing* the draft; this owns where
// its contents come from. The three render-time state updates below must keep
// running in this exact order — reconcile, then seed, then mirror — because
// reconcile clears the seed key that the seed block then reacts to. Reordering
// them, or moving any into an effect, changes the behaviour.
export function useRegisterDraftSync(
  classArmId: string | null,
  date: string,
  saved: AttendanceRecord[] | undefined,
  students: StudentListItem[] | undefined,
  // The most recent sync that had marks rejected, plus the query's own data
  // version. The version is what makes this reliable: invalidateQueries only
  // *schedules* a refetch, so an isFetching check can read false in the window
  // before it starts — reconciling then would restore the very marks the server
  // rejected and mark itself done.
  reconcile?: { skippedReportId: number | null; savedUpdatedAt: number },
) {
  const membershipId = useAuthStore((s) => s.claims?.membership_id ?? null);
  const [draft, setDraft] = useState<Record<string, DraftEntry>>({});
  const [seededKey, setSeededKey] = useState<string | null>(null);
  const [handledReportId, setHandledReportId] = useState<number | null>(null);
  // The data version at the moment a rejection was learned of. Anything newer
  // than this is post-sync server truth.
  const [baseline, setBaseline] = useState<{ reportId: number; updatedAt: number } | null>(null);

  const key = classArmId ? draftKey(classArmId, date) : "";
  const ready = !!classArmId && !!saved && !!students;

  // Records can outlive a student's membership of the arm: AttendanceRecord
  // snapshots class_arm at marking time, so transferring a student out leaves
  // their mark behind on the old arm's register. Those rows are history, not
  // part of today's register — seeding them would count someone the roster no
  // longer lists, so the summary and the rows would disagree.
  const rosterIds = new Set((students ?? []).map((s) => s.id));
  const onRoster = (saved ?? []).filter((r) => rosterIds.has(r.student.id));
  const movedOut = (saved ?? []).length - onRoster.length;

  // A rejected mark must not keep showing as though it stuck. Two steps, both
  // during render like the seed below:
  //
  //   1. On learning of a rejection, note the data version we're looking at.
  //   2. Once a *newer* version has landed — the refetch invalidateQueries
  //      triggered — drop the stored draft and re-seed from it.
  //
  // The result: skipped students revert to whichever mark actually won, while
  // students whose marks *were* applied keep them, since those are now the
  // server's own values.
  const skippedReportId = reconcile?.skippedReportId ?? null;
  const savedUpdatedAt = reconcile?.savedUpdatedAt ?? 0;
  const awaitingReconcile = skippedReportId !== null && skippedReportId !== handledReportId;

  if (awaitingReconcile && baseline?.reportId !== skippedReportId) {
    setBaseline({ reportId: skippedReportId, updatedAt: savedUpdatedAt });
  } else if (
    awaitingReconcile &&
    ready &&
    baseline &&
    baseline.reportId === skippedReportId &&
    savedUpdatedAt > baseline.updatedAt
  ) {
    clearDraft(membershipId, key);
    setSeededKey(null);
    setHandledReportId(skippedReportId);
  }

  if (ready && seededKey !== key) {
    const seed: Record<string, DraftEntry> = {};
    onRoster.forEach((record) => {
      seed[record.student.id] = { status: record.status, note: record.note ?? "" };
    });

    // Stored edits go on top of the server's copy: they are the teacher's later
    // intent, made after this register was last loaded. Filtered by the current
    // roster for the same reason the server records are — a student who has
    // since transferred out must not reappear in the count.
    const stored = readDraft(membershipId, key);
    if (stored) {
      Object.entries(stored).forEach(([studentId, entry]) => {
        if (rosterIds.has(studentId)) seed[studentId] = entry;
      });
    }

    setDraft(seed);
    setSeededKey(key);
  }

  // Mirror after seeding only. Writing before the seed lands would persist an
  // empty draft over real stored edits during the render where the arm changes
  // but its data hasn't arrived — silently wiping the register being restored.
  useEffect(() => {
    if (!ready || seededKey !== key || !key) return;
    writeDraft(membershipId, key, draft);
  }, [draft, key, membershipId, ready, seededKey]);

  return {
    draft,
    setDraft,
    ready,
    key,
    membershipId,
    // Marks on this date belonging to students who have since transferred out.
    movedOut,
    // Discards local edits and re-seeds from the server on the next render.
    reset: () => {
      if (key) clearDraft(membershipId, key);
      setSeededKey(null);
    },
  };
}
