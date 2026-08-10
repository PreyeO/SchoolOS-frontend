"use client";

import { useMemo, useState } from "react";

import type { StudentListItem } from "@/features/students/types";

import type { AttendanceRecord, AttendanceStatus } from "../types";

export interface DraftEntry {
  status: AttendanceStatus;
  note: string;
}

// The register's working state: saved marks as the baseline, plus whatever the
// teacher has changed since. Keyed by student id.
//
// Seeded during render rather than in an effect (React's "adjust state when data
// arrives" pattern) so the first paint after a fetch already shows the saved
// marks. The seed key is arm+date: switching either resets the draft, because a
// different register is a different set of answers — carrying edits across would
// silently write one class's marks onto another's.
export function useRegisterDraft(
  classArmId: string | null,
  date: string,
  saved: AttendanceRecord[] | undefined,
  students: StudentListItem[] | undefined,
) {
  const [draft, setDraft] = useState<Record<string, DraftEntry>>({});
  const [seededKey, setSeededKey] = useState<string | null>(null);

  const key = `${classArmId ?? ""}|${date}`;
  const ready = !!classArmId && !!saved && !!students;

  if (ready && seededKey !== key) {
    const seed: Record<string, DraftEntry> = {};
    saved.forEach((record) => {
      seed[record.student.id] = { status: record.status, note: record.note ?? "" };
    });
    setDraft(seed);
    setSeededKey(key);
  }

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
    // Discards local edits and re-seeds from the server on the next render.
    reset: () => setSeededKey(null),
  };
}
