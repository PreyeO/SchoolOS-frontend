"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Printer, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StudentCreatedResponse } from "../types";

interface FieldProps {
  label: string;
  value: string;
}

function CopyField({ label, value }: FieldProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-n-200 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs text-n-500">{label}</p>
        {/* Truncation is fine on screen (the value is one click from the
            clipboard) but would silently cut off a long internal email on
            paper, where there's no way to recover it. */}
        <p className="text-sm font-medium text-ink truncate print:overflow-visible print:whitespace-normal print:break-all">
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
        className="shrink-0 text-n-400 hover:text-brand transition-colors print:hidden"
      >
        {copied ? <Check className="size-4 text-grass" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

interface Props {
  student: StudentCreatedResponse;
  onAddAnother: () => void;
}

export function StudentCredentialsResult({ student, onAddAnother }: Props) {
  const router = useRouter();

  return (
    // data-print-area scopes window.print() to just this card — see the
    // @media print block in globals.css. Without it the whole dashboard
    // (sidebar, topbar, the pending-invites table below) printed too.
    <div data-print-area className="space-y-4 print:p-6">
      <div className="flex items-start gap-2.5 rounded-lg border border-clay/30 bg-clay/10 px-3.5 py-3">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-clay" />
        <p className="text-sm text-ink">
          {student.password
            ? "Save these — the student signs in with the admission number and password. This password won’t be shown again."
            : "This email already had an account, so its existing password was kept — share the admission number and let them sign in with the password they already use."}
        </p>
      </div>

      <div className="space-y-2">
        <CopyField label="Student" value={`${student.first_name} ${student.last_name}`} />
        <CopyField label="Admission number" value={student.admission_number} />
        {student.password ? (
          <CopyField label="Password" value={student.password} />
        ) : (
          <div className="rounded-lg border border-n-200 px-3 py-2.5">
            <p className="text-xs text-n-500">Password</p>
            <p className="text-sm text-n-500 italic">
              {student.password_note ?? "Existing password kept — not shown here."}
            </p>
          </div>
        )}
        <CopyField label="School subdomain" value={student.subdomain} />
        <CopyField label="Internal email" value={student.email} />
      </div>

      <div className="flex gap-3 print:hidden">
        <Button type="button" variant="outline" onClick={() => window.print()} className="gap-1.5">
          <Printer className="size-4" /> Print
        </Button>
        <Button type="button" variant="outline" onClick={onAddAnother} className="flex-1">
          Add another student
        </Button>
        <Button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex-1 font-semibold"
        >
          Done
        </Button>
      </div>
    </div>
  );
}
