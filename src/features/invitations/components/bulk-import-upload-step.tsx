"use client";

import { useRef, useState } from "react";
import { Download, FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

import { downloadBulkImportTemplate } from "../lib/bulk-import-template";

interface Props {
  onFileSelected: (file: File) => void;
  isPending: boolean;
}

// A picked file is held locally and only handed up on "Preview import" — so
// choosing the wrong file, or changing your mind, never fires a request.
export function BulkImportUploadStep({ onFileSelected, isPending }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-n-500">
          Create many students at once. Each row becomes a student, enrolled into
          the class and arm named on that row for the current session.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={downloadBulkImportTemplate}
          className="h-8 shrink-0 text-xs"
        >
          <Download className="size-3.5 mr-1" />
          Template
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-n-200 p-8 text-center transition-colors hover:border-n-300"
      >
        <Upload className="size-6 text-n-400" />
        {file ? (
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <FileText className="size-4" /> {file.name}
          </span>
        ) : (
          <span className="text-sm text-n-500">Click to choose a CSV file</span>
        )}
      </button>

      <p className="text-xs text-n-400">
        Columns, in order: first_name, last_name, admission_number, gender
        (male/female/other), date_of_birth, class_name, arm_name, email. Only
        date_of_birth, arm_name and email may be left blank — arm_name only
        resolves on its own when the class has exactly one arm.
      </p>

      <Button
        type="button"
        onClick={() => file && onFileSelected(file)}
        disabled={!file || isPending}
        className="w-full h-11 font-semibold"
      >
        {isPending ? "Checking file…" : "Preview import"}
      </Button>

      {/* Preview writes nothing, but it still parses and validates every row
          against the school's classes and existing admission numbers, so a
          large file is not instant either. Said once here rather than left as
          a button that looks stuck. */}
      {isPending && (
        <p role="status" className="text-center text-xs text-n-500">
          Checking every row against your classes and existing students. A large
          file can take a moment.
        </p>
      )}
    </div>
  );
}
