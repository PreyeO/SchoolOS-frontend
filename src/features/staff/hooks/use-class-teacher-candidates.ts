"use client";

import { useQuery } from "@tanstack/react-query";

import { getTeachers } from "../api/staff-api";
import { canBeClassTeacher, type TeacherListItem } from "../types";

export interface ClassTeacherCandidates {
  eligible: TeacherListItem[];
  // Fetched anyway, kept rather than discarded: lets the picker explain WHY a
  // subject-only teacher a searcher typed by name doesn't appear, instead of
  // that search silently reading as "no such teacher".
  all: TeacherListItem[];
}

// Teachers eligible to be a class teacher. The backend's teacher_type filter is a
// single-choice field, so it can't express "class OR both" in one request —
// hence page_size=100 (backend max) plus a client-side narrow. That cap is the
// one limitation here: a school with more than 100 active teachers would not see
// them all in the picker. Revisit with a dedicated endpoint if that ever lands.
export function useClassTeacherCandidates(enabled: boolean) {
  return useQuery({
    queryKey: ["staff", "teachers", "class-teacher-candidates"],
    queryFn: async (): Promise<ClassTeacherCandidates> => {
      const page = await getTeachers({ is_active: true, page_size: 100 });
      return { eligible: page.results.filter(canBeClassTeacher), all: page.results };
    },
    enabled,
  });
}
