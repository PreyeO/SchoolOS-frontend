"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getSchoolId } from "./get-school-id";
import { getSchoolDetail } from "./get-school-detail";
import { useSchoolStore } from "@/stores/school-store";
import type { SchoolLevelValue } from "@/data/school-levels";

interface Result {
  levels: SchoolLevelValue[];
  isLoading: boolean;
}

// The reliable source of the school's levels for filtering Classes/Subjects
// prefills (onboarding and dashboard Settings both use this). Prefers the
// school-store (populated at create-school or login); only when that's empty
// does it fetch GET /api/schools/:id/ — the school-DETAIL endpoint, which
// includes levels — and hydrate the store. Never reads the school-list
// endpoint, whose summary omits levels.
export function useSchoolLevels(): Result {
  const storeLevels = useSchoolStore((s) => s.currentSchool?.levels);
  const setLevels = useSchoolStore((s) => s.setLevels);
  const hasLevels = !!storeLevels && storeLevels.length > 0;
  const schoolId = getSchoolId();

  const { data, isPending } = useQuery({
    queryKey: ["school-levels", schoolId],
    queryFn: () => getSchoolDetail(schoolId as string),
    enabled: !hasLevels && !!schoolId,
  });

  useEffect(() => {
    if (data && !hasLevels) setLevels(data.levels);
  }, [data, hasLevels, setLevels]);

  if (hasLevels) return { levels: storeLevels as SchoolLevelValue[], isLoading: false };
  return { levels: data?.levels ?? [], isLoading: !!schoolId && isPending };
}
