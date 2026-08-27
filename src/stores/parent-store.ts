"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { ssrSafeLocalStorage } from "@/lib/storage/ssr-safe-local-storage";

interface ParentState {
  // The child every parent screen is scoped to. Persisted for the same reason
  // currentSchool is: it's a context the user chose, and losing it on reload
  // would drop them back onto a different child mid-task.
  //
  // Only the id lives here — never the child record itself. Names, classes and
  // links come from /me on every load, so a child who was renamed, moved class
  // or unlinked can't be served from a stale copy in localStorage.
  selectedChildId: string | null;
  selectChild: (studentId: string) => void;
}

export const useParentStore = create<ParentState>()(
  persist(
    (set) => ({
      selectedChildId: null,
      selectChild: (studentId) => set({ selectedChildId: studentId }),
    }),
    {
      name: "schoolos-parent",
      storage: createJSONStorage(() => ssrSafeLocalStorage),
    },
  ),
);
