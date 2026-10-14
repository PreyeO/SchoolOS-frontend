import { NIGERIAN_STATES } from "@/data/nigerian-states";
import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";
import type { SchoolAccessStatus } from "@/lib/school/get-school-detail";

import type { SchoolFinancialRow } from "../types";

export interface StateReach {
  state: string;
  label: string;
  schools: number;
  students: number;
  cities: string[];
}

export interface PlatformReach {
  students: number;
  capacity: number;
  states: StateReach[];
  cityCount: number;
  access: Record<SchoolAccessStatus, number>;
  levels: { value: SchoolLevelValue; label: string; schools: number }[];
}

const STATE_LABEL = new Map<string, string>(NIGERIAN_STATES.map((s) => [s.value, s.label]));

// Everything on the overview that isn't a headcount, derived from the one
// financials payload the page already loads — no extra requests.
//
// students is the sum of each school's student_count, which is the backend's
// billable headcount (enrolled + suspended). Students who have left aren't in
// it, so it is "students on SchoolOS today", not "ever".
export function buildPlatformReach(rows: SchoolFinancialRow[]): PlatformReach {
  const byState = new Map<string, StateReach>();
  const cities = new Set<string>();
  const access: Record<SchoolAccessStatus, number> = { subscribed: 0, trialing: 0, expired: 0 };
  const levelCounts = new Map<SchoolLevelValue, number>();
  let students = 0;
  let capacity = 0;

  for (const row of rows) {
    const { state, city, levels } = row.school;
    students += row.student_count;
    capacity += row.student_capacity;
    access[row.access_status] += 1;
    for (const level of levels) levelCounts.set(level, (levelCounts.get(level) ?? 0) + 1);

    // Cities are keyed with their state: "Ikeja" in two states is two places,
    // and typed city names vary in case and spacing.
    const cityKey = `${state}|${city.trim().toLowerCase()}`;
    cities.add(cityKey);

    const entry = byState.get(state) ?? {
      state,
      label: STATE_LABEL.get(state) ?? state,
      schools: 0,
      students: 0,
      cities: [],
    };
    entry.schools += 1;
    entry.students += row.student_count;
    if (!entry.cities.some((c) => c.toLowerCase() === city.trim().toLowerCase())) entry.cities.push(city.trim());
    byState.set(state, entry);
  }

  return {
    students,
    capacity,
    // Most schools first; students break ties, since that's the bigger footprint.
    states: [...byState.values()].sort((a, b) => b.schools - a.schools || b.students - a.students),
    cityCount: cities.size,
    access,
    levels: SCHOOL_LEVELS.map((l) => ({ value: l.value, label: l.label, schools: levelCounts.get(l.value) ?? 0 })),
  };
}
