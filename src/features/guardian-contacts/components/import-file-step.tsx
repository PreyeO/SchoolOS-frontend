"use client";

import { useRef, useState } from "react";
import { Download, FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";

import { downloadContactsTemplate } from "../lib/contacts-template";

interface Props {
  onPreview: (file: File) => void;
  isPending: boolean;
}

// Choosing a file sends nothing; "Check file" does. Same shape as the student
// bulk import's upload step.
export function ImportFileStep({ onPreview, isPending }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-n-500">
          Three columns, with this exact header row:{" "}
          <span className="font-mono text-xs text-ink">admission_number, guardian_name, guardian_phone</span>.
        </p>
        <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 text-xs" onClick={downloadContactsTemplate}>
          <Download className="size-3.5" /> Template
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        aria-label="CSV file"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-n-200 p-6 text-center transition-colors hover:border-n-300"
      >
        <Upload className="size-6 text-n-400" />
        {file ? (
          <span className="flex items-center gap-1.5 text-sm font-medium text-ink break-all">
            <FileText className="size-4 shrink-0" /> {file.name}
          </span>
        ) : (
          <span className="text-sm text-n-500">Click to choose a CSV file</span>
        )}
      </button>

      <ul className="list-disc space-y-1 pl-5 text-xs text-n-500">
        <li>Phone numbers can be 0803…, +234…, or 803… if Excel dropped the zero. Landlines are refused.</li>
        <li>Each imported number becomes that student&rsquo;s main number.</li>
        <li>
          Importing adds numbers; it never replaces them. Importing the same file twice gives each student a second,
          identical number.
        </li>
      </ul>

      <Button type="button" className="w-full" disabled={!file || isPending} onClick={() => file && onPreview(file)}>
        {isPending ? "Checking file…" : "Check file"}
      </Button>
    </div>
  );
}
