"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import {
  getClassArmResults,
  getReportCard,
  getReportCardOptions,
  getReportCardPreview,
  getReportCardSettings,
  lockClassArmResult,
  unlockClassArmResult,
  updateReportCardSettings,
} from "../api/report-card-api";
import type { ReportCardSettings } from "../types";

export const REPORT_CARD_QUERY_KEY = ["results", "report-card"];
export const CLASS_ARM_RESULTS_QUERY_KEY = ["results", "class-arm-results"];
export const REPORT_CARD_SETTINGS_QUERY_KEY = ["results", "report-card-settings"];

export function useReportCard(
  studentId: string | null | undefined,
  academicPeriodId: string | null | undefined,
) {
  return useQuery({
    queryKey: [...REPORT_CARD_QUERY_KEY, studentId, academicPeriodId],
    queryFn: () => getReportCard(studentId as string, academicPeriodId as string),
    enabled: !!studentId && !!academicPeriodId,
    // A parent or student gets a 403 until the broadsheet is locked, and that
    // won't change by asking again a second later.
    retry: false,
  });
}

export function useReportCardPreview(
  studentId: string | null | undefined,
  academicPeriodId: string | null | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: [...REPORT_CARD_QUERY_KEY, "preview", studentId, academicPeriodId],
    queryFn: () => getReportCardPreview(studentId as string, academicPeriodId as string),
    enabled: enabled && !!studentId && !!academicPeriodId,
    retry: false,
  });
}

export function useClassArmResults(academicPeriodId: string | null | undefined) {
  return useQuery({
    queryKey: [...CLASS_ARM_RESULTS_QUERY_KEY, academicPeriodId],
    queryFn: () => getClassArmResults(academicPeriodId as string),
    enabled: !!academicPeriodId,
  });
}

export function useLockClassArmResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ classArmId, periodId }: { classArmId: string; periodId: string }) =>
      lockClassArmResult(classArmId, periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      toast.success("Results published");
    },
    // The refusal is the useful part here: it names the subjects still awaiting
    // approval, which is exactly what the admin needs to chase.
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUnlockClassArmResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      classArmId,
      periodId,
      reason,
    }: {
      classArmId: string;
      periodId: string;
      reason: string;
    }) => unlockClassArmResult(classArmId, periodId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      toast.success("Results unpublished");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useReportCardSettings(level: string | null) {
  return useQuery({
    queryKey: [...REPORT_CARD_SETTINGS_QUERY_KEY, level],
    queryFn: () => getReportCardSettings(level as string),
    enabled: !!level,
  });
}

export function useUpdateReportCardSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      level,
      payload,
    }: {
      level: string;
      payload: Partial<Omit<ReportCardSettings, "id" | "level" | "updated_at">>;
    }) => updateReportCardSettings(level, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      toast.success("Report card updated");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// Fixed enum choices, identical for every school and every level. Never stale,
// so it's fetched once and kept.
export function useReportCardOptions() {
  return useQuery({
    queryKey: [...REPORT_CARD_SETTINGS_QUERY_KEY, "options"],
    queryFn: getReportCardOptions,
    staleTime: Infinity,
  });
}
