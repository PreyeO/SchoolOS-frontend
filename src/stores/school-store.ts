"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { SchoolLevelValue } from "@/data/school-levels";
import type { SchoolType } from "@/lib/school/derive-school-type";
import type { ClassRecord } from "@/lib/school/class-record";
import { DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR } from "@/data/color-presets";

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
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string | null;
  motto?: string | null;
}

export interface SetupStatus {
  branding: boolean;
  academic_year: boolean;
  classes: boolean;
  subjects: boolean;
}

interface SchoolState {
  currentSchool: CurrentSchool | null;
  setupStatus: SetupStatus;
  setCurrentSchool: (
    school: Omit<
      CurrentSchool,
      "primaryColor" | "accentColor" | "logoUrl" | "motto" | "sessionName" | "currentTermName" | "classes" | "subjectCount"
    >,
  ) => void;
  updateBranding: (branding: BrandingUpdate) => void;
  updateSession: (sessionName: string, currentTermName: string | null) => void;
  setClasses: (classes: ClassRecord[]) => void;
  updateSubjectCount: (count: number) => void;
  markSetupStep: (step: keyof SetupStatus) => void;
  clearSchool: () => void;
}

const ssrSafeSessionStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string) => {
    if (typeof window !== "undefined") sessionStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (typeof window !== "undefined") sessionStorage.removeItem(name);
  },
} as Storage;

const INITIAL_SETUP: SetupStatus = { branding: false, academic_year: false, classes: false, subjects: false };

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set) => ({
      currentSchool: null,
      setupStatus: INITIAL_SETUP,
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
          setupStatus: INITIAL_SETUP,
        }),
      updateBranding: (branding) =>
        set((s) => ({
          currentSchool: s.currentSchool ? { ...s.currentSchool, ...branding } : null,
        })),
      updateSession: (sessionName, currentTermName) =>
        set((s) => ({
          currentSchool: s.currentSchool ? { ...s.currentSchool, sessionName, currentTermName } : null,
        })),
      setClasses: (classes) =>
        set((s) => ({
          currentSchool: s.currentSchool ? { ...s.currentSchool, classes } : null,
        })),
      updateSubjectCount: (subjectCount) =>
        set((s) => ({
          currentSchool: s.currentSchool ? { ...s.currentSchool, subjectCount } : null,
        })),
      markSetupStep: (step) =>
        set((s) => ({ setupStatus: { ...s.setupStatus, [step]: true } })),
      clearSchool: () => set({ currentSchool: null, setupStatus: INITIAL_SETUP }),
    }),
    {
      name: "schoolos-school",
      storage: createJSONStorage(() => ssrSafeSessionStorage),
    }
  )
);
