"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import { saveBlob } from "@/lib/api/save-blob";

import { checkResult, checkResultPdf, getCheckPeriods } from "../api/result-check-api";
import type { CheckResultPayload } from "../types";

// The public checker's three calls. Errors are shown inline on the page, not
// toasted: this is a parent at a café, and "Invalid scratch card, PIN, or
// student identifier." belongs next to the form they're filling in.
//
// None retry. Every wrong attempt counts toward the card's five-strike lock and
// the 15-a-minute IP limit, so a silent retry would spend the parent's tries.

export function useCheckPeriods(serial: string | null) {
  return useQuery({
    queryKey: ["result-check", "periods", serial],
    queryFn: () => getCheckPeriods(serial as string),
    enabled: !!serial,
    retry: false,
    staleTime: Infinity,
  });
}

export function useCheckResult() {
  return useMutation({ mutationFn: checkResult, networkMode: "always", gcTime: 0 });
}

export function useDownloadResultPdf() {
  return useMutation({
    mutationFn: async (payload: CheckResultPayload) => {
      const blob = await checkResultPdf(payload);
      saveBlob(blob, `result-${payload.admission_number.replace(/[^\w-]+/g, "-")}.pdf`);
    },
    networkMode: "always",
  });
}
