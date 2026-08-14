"use client";

import { useEffect, useMemo, useState } from "react";

import type { StudentListItem } from "@/features/students/types";
import { useAuthStore } from "@/stores/auth-store";

import { clearDraft, draftKey, readDraft, writeDraft } from "../lib/draft-storage";
import type { AttendanceRecord, AttendanceStatus, DraftEntry } from "../types";

export type { DraftEntry };

// The register's working state: saved marks as the baseline, plus whatever the
// teacher has changed since. Keyed by student id.
//
// Seeded during render rather than in an effect (React's "adjust state when data
// arrives" pattern) so the first paint after a fetch already shows the saved
// marks. The seed key is arm+date: switching either re-seeds from scratch,
// because a different register is a different set of answers — carrying edits
// across would silently write one class's marks onto another's.
//
// Unsaved edits are mirrored to the device under that same arm+date key, so a
// half-marked register survives a reload, a backgrounded tab being discarded, or
// a walk to the next classroom. The key is what makes that safe: a stored draft
// can only ever be restored onto the exact register it was made for.
export function useRegisterDraft(
  classArmId: string | null,
  date: string,
  saved: AttendanceRecord[] | undefined,
  students: StudentListItem[] | undefined,
) {
  const membershipId = useAuthStore((s) => s.claims?.membership_id ?? null);
  const [draft, setDraft] = useState<Record<string, DraftEntry>>({});
  const [seededKey, setSeededKey] = useState<string | null>(null);

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

  const savedById = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {};
    (saved ?? []).forEach((r) => {
      map[r.student.id] = r;
    });
    return map;
  }, [saved]);

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
        const record = savedById[studentId];
        if (!record) return true;
        return record.status !== entry.status || (record.note ?? "") !== entry.note;
      }),
    [draft, savedById],
  );

  // Once nothing differs from the server there is no unsaved work to protect,
  // so the stored copy is dropped. Self-correcting: while a save is still queued
  // offline the server copy hasn't moved, `changed` stays non-empty, and the
  // draft is deliberately kept.
  const isSynced = ready && changed.length === 0;
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
    // Discards local edits and re-seeds from the server on the next render.
    reset: () => {
      if (key) clearDraft(membershipId, key);
      setSeededKey(null);
    },
  };
}
