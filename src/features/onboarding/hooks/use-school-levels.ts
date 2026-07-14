"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getSchoolId } from "@/lib/school/get-school-id";
import { useSchoolStore } from "@/stores/school-store";
import type { SchoolLevelValue } from "@/data/school-levels";

import { getSchoolDetail } from "../api/onboarding-api";

interface Result {
  levels: SchoolLevelValue[];
  isLoading: boolean;
}

// The reliable source of the school's levels for filtering Classes/Subjects
// prefills. Prefers the school-store (populated at create-school or login);
// only when that's empty (e.g. a fresh login that hydrated from a summary
// endpoint without levels) does it fetch GET /api/schools/:id/ — the
// school-DETAIL endpoint, which includes levels — and hydrate the store.
// Never reads the school-list endpoint, whose summary omits levels.
export function useSchoolLevels(): Result {
  const storeLevels = useSchoolStore((s) => s.currentSchool?.levels);
  const setLevels = useSchoolStore((s) => s.setLevels);
  const hasLevels = !!storeLevels && storeLevels.length > 0;
  const schoolId = getSchoolId();

  const { data, isPending } = useQuery({
    queryKey: ["onboarding", "school-levels", schoolId],
    queryFn: () => getSchoolDetail(schoolId as string),
    enabled: !hasLevels && !!schoolId,
  });

  useEffect(() => {
    if (data && !hasLevels) setLevels(data.levels);
  }, [data, hasLevels, setLevels]);

  if (hasLevels) return { levels: storeLevels as SchoolLevelValue[], isLoading: false };
  return { levels: data?.levels ?? [], isLoading: !!schoolId && isPending };
}
