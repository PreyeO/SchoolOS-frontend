"use client";

import { useState } from "react";

import type { EnrollmentStatus, StudentListItem } from "../types";
import type { StudentSelection } from "../components/students-table";

// The directory's checkbox state for a bulk status change. Keeps each
// selected student's status alongside the id, because the dialog's legal
// targets depend on every selected row — including rows on other pages that
// are no longer in the list being rendered.
export function useStudentSelection() {
  const [rows, setRows] = useState<Map<string, EnrollmentStatus>>(new Map());

  function toggle(student: StudentListItem) {
    setRows((prev) => {
      const next = new Map(prev);
      if (next.has(student.id)) next.delete(student.id);
      else next.set(student.id, student.enrollment_status);
      return next;
    });
  }

  function toggleAll(students: StudentListItem[], select: boolean) {
    setRows((prev) => {
      const next = new Map(prev);
      for (const s of students) {
        if (select) next.set(s.id, s.enrollment_status);
        else next.delete(s.id);
      }
      return next;
    });
  }

  const selection: StudentSelection = {
    selected: new Set(rows.keys()),
    onToggle: toggle,
    onToggleAll: toggleAll,
  };

  return {
    selection,
    count: rows.size,
    students: [...rows].map(([id, status]) => ({ id, status })),
    clear: () => setRows(new Map()),
  };
}
