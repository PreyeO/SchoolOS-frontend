"use client";

import { useState } from "react";

import { useCommitBulkImport, usePreviewBulkImport } from "../hooks/use-bulk-import";
import type { BulkImportResult } from "../types";
import { BulkImportPreviewStep } from "./bulk-import-preview-step";
import { BulkImportResultStep } from "./bulk-import-result-step";
import { BulkImportUploadStep } from "./bulk-import-upload-step";

type Step = "upload" | "preview" | "done";

// Preview and commit are two separate POSTs against the same file — the
// backend keeps nothing between them, so "confirm" re-uploads rather than
// sending back an edited diff. There is no per-row edit UI: the CSV format
// is validated whole-file, so fixing a bad row means fixing the CSV and
// choosing it again, same as the preview step itself.
export function BulkImportPanel() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkImportResult | null>(null);

  const preview = usePreviewBulkImport();
  const commit = useCommitBulkImport();

  function handleFileSelected(selected: File) {
    setFile(selected);
    preview.mutate(selected, {
      onSuccess: (data) => {
        setResult(data);
        setStep("preview");
      },
    });
  }

  function handleConfirm() {
    if (!file) return;
    commit.mutate(file, {
      onSuccess: (data) => {
        setResult(data);
        setStep("done");
      },
    });
  }

  function reset() {
    setStep("upload");
    setFile(null);
    setResult(null);
  }

  if (step === "preview" && result) {
    return (
      <BulkImportPreviewStep
        result={result}
        isPending={commit.isPending}
        onConfirm={handleConfirm}
        onCancel={reset}
      />
    );
  }

  if (step === "done" && result) {
    return <BulkImportResultStep result={result} onImportAnother={reset} />;
  }

  return <BulkImportUploadStep onFileSelected={handleFileSelected} isPending={preview.isPending} />;
}
