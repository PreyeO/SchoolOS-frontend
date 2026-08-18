"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import {
  getClassArmReportCards,
  getClassArmResults,
  getReportCard,
  getReportCardOptions,
  getReportCardPdf,
  getReportCardPreview,
  getReportCardSettings,
  lockClassArmResult,
  unlockClassArmResult,
  updateReportCardSettings,
} from "../api/report-card-api";
import { saveBlob } from "../lib/save-blob";
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

// Downloads rather than renders — see saveBlob for why it can't be a link.
export function useDownloadReportCard() {
  return useMutation({
    mutationFn: async ({
      studentId,
      periodId,
      admissionNumber,
    }: {
      studentId: string;
      periodId: string;
      admissionNumber: string;
    }) => {
      const blob = await getReportCardPdf(studentId, periodId);
      saveBlob(blob, `${admissionNumber}_report_card.pdf`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// The whole arm in one go: a merged PDF, or a zip of one file per student.
//
// The skipped list is the important half. Candidates are everyone *currently
// enrolled* in the arm for that session, and the backend soft-skips anyone with
// no results rather than failing — so a silent success can be missing children,
// and staff would have no way to know. Naming them is the difference between
// "printed the class" and "printed most of the class".
export function useDownloadClassReportCards() {
  return useMutation({
    mutationFn: async ({
      classArmId,
      periodId,
      exportFormat,
      armLabel,
    }: {
      classArmId: string;
      periodId: string;
      exportFormat: "pdf" | "zip";
      armLabel: string;
    }) => {
      const { blob, skipped } = await getClassArmReportCards(classArmId, periodId, exportFormat);
      // Mirrors the server's own {Class}_{Arm}_report_cards.{ext} rather than
      // reading Content-Disposition, which is not exposed cross-origin either.
      const safeLabel = armLabel.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_");
      saveBlob(blob, `${safeLabel || "class"}_report_cards.${exportFormat}`);
      return skipped;
    },
    onSuccess: (skipped) => {
      if (skipped.length === 0) {
        toast.success("Report cards downloaded");
        return;
      }
      toast.warning(
        `Downloaded, without ${skipped.length} student${skipped.length === 1 ? "" : "s"}: ${skipped.join(", ")}. They have no results for this term.`,
        { duration: 10000 },
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
