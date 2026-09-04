"use client";

import { useEffect, useMemo } from "react";

import type { StudentListItem } from "@/features/students/types";

import { clearDraft } from "../lib/draft-storage";
import { useRegisterDraftSync } from "./use-register-draft-sync";
import { usePendingMarks } from "./use-sync-status";
import type { AttendanceRecord, AttendanceStatus, DraftEntry } from "../types";

export type { DraftEntry };

// The register's working state: saved marks as the baseline, plus whatever the
// teacher has changed since. Keyed by student id.
//
// Seeding, reconciliation after a rejected sync, and mirroring to device
// storage all live in useRegisterDraftSync — see there for why those run during
// render rather than in effects. This hook owns editing and the derived counts.
export function useRegisterDraft(
  classArmId: string | null,
  date: string,
  saved: AttendanceRecord[] | undefined,
  students: StudentListItem[] | undefined,
  reconcile?: { skippedReportId: number | null; savedUpdatedAt: number },
) {
  const { draft, setDraft, ready, key, membershipId, movedOut, reset } = useRegisterDraftSync(
    classArmId,
    date,
    saved,
    students,
    reconcile,
  );

  const savedById = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {};
    (saved ?? []).forEach((r) => {
      map[r.student.id] = r;
    });
    return map;
  }, [saved]);

  // Marks already handed to the queue but not yet accepted by the server.
  //
  // Without this, offline saves never "take": the server copy can't change while
  // there's no network, so every queued mark stays in `changed` and the register
  // insists it has unsaved work no matter how many times it's saved. Treating a
  // queued mark as committed is what lets a teacher save, keep marking, and save
  // again. If a queued batch later errors it leaves this set, and those marks
  // correctly reappear as unsaved.
  const queuedByStudent = usePendingMarks(classArmId, date);

  function setStatus(studentId: string, status: AttendanceStatus) {
    setDraft((prev) => ({ ...prev, [studentId]: { status, note: prev[studentId]?.note ?? "" } }));
  }

  function setNote(studentId: string, note: string) {
    setDraft((prev) => {
      const existing = prev[studentId];
      // A note without a status would be dropped on submit, so ignore it until
      // the student has been marked.
      if (!existing) return prev;
      return { ...prev, [studentId]: { ...existing, note } };
    });
  }

  function markAllUnset(status: AttendanceStatus) {
    setDraft((prev) => {
      const next = { ...prev };
      (students ?? []).forEach((s) => {
        if (!next[s.id]) next[s.id] = { status, note: "" };
      });
      return next;
    });
  }

  // Only what actually differs from what's stored — resubmitting an unchanged
  // row is harmless (the backend upserts and logs nothing) but it inflates the
  // payload and the "saved N" count, which should reflect real edits.
  const changed = useMemo(
    () =>
      Object.entries(draft).filter(([studentId, entry]) => {
        // A queued mark counts as committed — it's on its way, and resubmitting
        // it would only duplicate the work.
        const queued = queuedByStudent[studentId];
        if (queued) {
          return queued.status !== entry.status || queued.note !== entry.note;
        }
        const record = savedById[studentId];
        if (!record) return true;
        return record.status !== entry.status || (record.note ?? "") !== entry.note;
      }),
    [draft, savedById, queuedByStudent],
  );

  // Whether the SERVER — not merely the offline queue — actually reflects
  // every entry in the draft. Deliberately NOT `changed` above: its queued-mark
  // shortcut treats a draft entry as "no longer unsaved" the moment it matches
  // what was just handed to the queue, which is right for the "unsaved" count
  // (a teacher shouldn't be nagged about a mark already queued) but wrong as
  // the signal for whether the local draft is safe to delete. A queued mark
  // can sit paused for hours; clearing the only surviving copy of it the
  // moment it merely matched the QUEUE — rather than once the server had
  // actually accepted it — left nothing to reconstruct from on a refresh
  // while still offline: the local draft was already gone, and the server's
  // own copy genuinely hadn't moved. Marks would then vanish until back
  // online, at which point the queued mutation finally completes and
  // invalidates ["attendance"] (see use-bulk-mark.ts's onSuccess), and the
  // marks reappear from the server. Comparing against savedById instead means
  // this only goes true once that has genuinely happened. See the identical
  // fix and longer note in features/results/hooks/use-score-draft.ts, the
  // sibling this hook is explicitly modelled on.
  const unconfirmedByServer = useMemo(
    () =>
      Object.entries(draft).filter(([studentId, entry]) => {
        const record = savedById[studentId];
        if (!record) return true;
        return record.status !== entry.status || (record.note ?? "") !== entry.note;
      }),
    [draft, savedById],
  );

  // Once nothing differs from the server there is no unsaved work to protect,
  // so the stored copy is dropped.
  const isSynced = ready && unconfirmedByServer.length === 0;
  useEffect(() => {
    if (isSynced && key) clearDraft(membershipId, key);
  }, [isSynced, key, membershipId]);

  const markedCount = Object.keys(draft).length;
  const unmarkedCount = Math.max((students?.length ?? 0) - markedCount, 0);

  return {
    draft,
    savedById,
    setStatus,
    setNote,
    markAllUnset,
    changed,
    markedCount,
    unmarkedCount,
    // Marks on this date belonging to students who have since transferred out.
    // Reported rather than silently dropped, so a count that no longer adds up
    // against an earlier screenshot has a visible explanation.
    movedOut,
    reset,
  };
}
