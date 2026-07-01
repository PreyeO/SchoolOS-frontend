"use client";

import { useSchoolStore } from "@/stores/school-store";

export function useSetupStatus() {
  const setupStatus = useSchoolStore((s) => s.setupStatus);
  const currentSchool = useSchoolStore((s) => s.currentSchool);

  const isComplete = Object.values(setupStatus).every(Boolean);
  const completedCount = Object.values(setupStatus).filter(Boolean).length;

  return { setupStatus, isComplete, completedCount, totalSteps: 4, currentSchool };
}
