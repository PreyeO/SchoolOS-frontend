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
        <p className="text-sm font-medium text-ink truncate">{value}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
        className="shrink-0 text-n-400 hover:text-brand transition-colors"
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
    <div className="space-y-4 print:p-6">
      <div className="flex items-start gap-2.5 rounded-lg border border-clay/30 bg-clay/10 px-3.5 py-3">
        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-clay" />
        <p className="text-sm text-ink">
          Save these — the student signs in with the admission number and password. This
          password won&rsquo;t be shown again.
        </p>
      </div>

      <div className="space-y-2">
        <CopyField label="Student" value={`${student.first_name} ${student.last_name}`} />
        <CopyField label="Admission number" value={student.admission_number} />
        <CopyField label="Password" value={student.password} />
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
