"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { getClassArmReportCards, getReportCardPdf } from "../api/report-card-export-api";
import { saveBlob } from "../lib/save-blob";

// Downloads rather than renders — see saveBlob for why these can't be links.

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
// The skipped list is the important half. Candidates are everyone currently
// enrolled in the arm for that session, and the backend soft-skips anyone with
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
      // Mirrors the server's {Class}_{Arm}_report_cards.{ext} rather than
      // reading Content-Disposition, which isn't exposed cross-origin either.
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
