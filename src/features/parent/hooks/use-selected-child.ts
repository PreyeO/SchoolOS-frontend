"use client";

import { useMe } from "@/features/me/hooks/use-me";
import type { MeChildLink } from "@/features/me/types";
import { useParentStore } from "@/stores/parent-store";

export interface SelectedChild {
  child: MeChildLink | undefined;
  children: MeChildLink[];
  selectChild: (studentId: string) => void;
  isPending: boolean;
  unavailableOffline: boolean;
  isError: boolean;
  error: unknown;
}

// Which child every parent screen is about.
//
// The stored id is resolved against /me rather than trusted, and falls back to
// the first linked child when it doesn't match one. That matters more than it
// looks: ParentStudentLink has no soft-delete, so unlinking hard-deletes the
// row, and both the fees and report-card services re-check the link live on
// every request. A stale id in localStorage would otherwise 403 every query on
// every screen, with nothing on screen explaining why.
export function useSelectedChild(): SelectedChild {
  const { data: me, isPending, isPaused, isError, error } = useMe();
  const selectedChildId = useParentStore((s) => s.selectedChildId);
  const selectChild = useParentStore((s) => s.selectChild);

  const children = me?.parent?.student_links ?? [];
  const stored = children.find((link) => link.student_id === selectedChildId);

  return {
    child: stored ?? children[0],
    children,
    selectChild,
    isPending,
    unavailableOffline: isPaused && !me,
    isError,
    error,
  };
}
