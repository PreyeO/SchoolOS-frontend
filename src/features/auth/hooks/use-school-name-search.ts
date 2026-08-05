"use client";

import { useQuery } from "@tanstack/react-query";

import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";

import { searchSchools } from "../api/auth-api";

// Backend rejects q shorter than this (SchoolSearchSerializer min_length=2).
const MIN_QUERY_LENGTH = 2;

// Debounced a little longer than the directory filters' 300ms: this fires while
// someone types a school name, and each keystroke is a public LIKE query.
const DEBOUNCE_MS = 400;

export function useSchoolNameSearch(name: string) {
  const query = useDebouncedValue(name.trim(), DEBOUNCE_MS);

  return useQuery({
    queryKey: ["school-search", query],
    queryFn: () => searchSchools(query),
    enabled: query.length >= MIN_QUERY_LENGTH,
    // Names don't churn mid-signup; avoids refetching as the user tabs around.
    staleTime: 60_000,
  });
}
