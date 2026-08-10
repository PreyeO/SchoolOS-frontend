"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { SchoolLevelValue } from "@/data/school-levels";
import type { SchoolType } from "@/lib/school/derive-school-type";
import type { ClassRecord } from "@/lib/school/class-record";
import { DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR } from "@/data/color-presets";
import { ssrSafeLocalStorage } from "@/lib/storage/ssr-safe-local-storage";

export interface CurrentSchool {
  id: string;
  name: string;
  slug: string;
  school_type: SchoolType;
  levels: SchoolLevelValue[];
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  motto: string | null;
  sessionName: string | null;
  currentTermName: string | null;
  // Real created-class records (ids, order, arm ids) from POST /api/classes/bulk/,
  // kept as-is rather than collapsed to a count so later steps/screens can
  // reference the actual records instead of re-deriving them.
  classes: ClassRecord[];
  subjectCount: number;
}

export interface BrandingUpdate {
  name?: string;
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string | null;
  motto?: string | null;
}

// Identity + branding for hydrating an EXISTING school (login, verify-otp
// into an already-set-up school) — deliberately excludes session/classes/
// subjectCount, which setCurrentSchool resets for a genuinely new school.
// hydrateSchool must never wipe those for a returning user.
export type SchoolIdentity = Pick<
  CurrentSchool,
  "id" | "name" | "slug" | "school_type" | "levels" | "primaryColor" | "accentColor" | "logoUrl" | "motto"
>;

interface SchoolState {
  currentSchool: CurrentSchool | null;
  setCurrentSchool: (
    school: Omit<
      CurrentSchool,
      "primaryColor" | "accentColor" | "logoUrl" | "motto" | "sessionName" | "currentTermName" | "classes" | "subjectCount"
    >,
  ) => void;
  hydrateSchool: (school: SchoolIdentity) => void;
  updateBranding: (branding: BrandingUpdate) => void;
  // Both null when the school has no period marked current — see
  // useSyncSchoolData, which must clear rather than leave a stale term showing.
  updateSession: (sessionName: string | null, currentTermName: string | null) => void;
  setLevels: (levels: SchoolLevelValue[]) => void;
  setClasses: (classes: ClassRecord[]) => void;
  updateSubjectCount: (count: number) => void;
  clearSchool: () => void;
}

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set) => ({
      currentSchool: null,
      setCurrentSchool: (school) =>
        set({
          currentSchool: {
            ...school,
            primaryColor: DEFAULT_PRIMARY_COLOR,
            accentColor: DEFAULT_ACCENT_COLOR,
            logoUrl: null,
            motto: null,
            sessionName: null,
            currentTermName: null,
            classes: [],
            subjectCount: 0,
          },
        }),
      hydrateSchool: (school) =>
        set((s) => ({
          currentSchool: {
            sessionName: null,
            currentTermName: null,
            classes: [],
            subjectCount: 0,
            ...s.currentSchool,
            ...school,
          },
        })),
      updateBranding: (branding) =>
        set((s) => ({
          currentSchool: s.currentSchool ? { ...s.currentSchool, ...branding } : null,
        })),
      updateSession: (sessionName, currentTermName) =>
        set((s) => ({
          currentSchool: s.currentSchool ? { ...s.currentSchool, sessionName, currentTermName } : null,
        })),
      setLevels: (levels) =>
        set((s) => ({
          currentSchool: s.currentSchool ? { ...s.currentSchool, levels } : null,
        })),
      setClasses: (classes) =>
        set((s) => ({
          currentSchool: s.currentSchool ? { ...s.currentSchool, classes } : null,
        })),
      updateSubjectCount: (subjectCount) =>
        set((s) => ({
          currentSchool: s.currentSchool ? { ...s.currentSchool, subjectCount } : null,
        })),
      clearSchool: () => set({ currentSchool: null }),
    }),
    {
      name: "schoolos-school",
      storage: createJSONStorage(() => ssrSafeLocalStorage),
    }
  )
);
