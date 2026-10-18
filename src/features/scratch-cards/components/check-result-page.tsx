"use client";

import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportCardBody } from "@/features/results/components/report-card-body";
import { getErrorMessage } from "@/lib/api/get-error-message";

import { useCheckResult, useDownloadResultPdf } from "../hooks/use-result-check";
import type { CheckResultValues } from "../schemas/check-result-schema";
import { CheckResultForm } from "./check-result-form";

// The public result checker: a parent with a scratch card and no account.
// The same report-card body logged-in parents see, so a school's result looks
// the same whichever way it's opened. Nothing typed here is kept once the page
// is left, and "Check another" forgets the PIN.
export function CheckResultPage() {
  const check = useCheckResult();
  const pdf = useDownloadResultPdf();
  const [submitted, setSubmitted] = useState<CheckResultValues | null>(null);

  function onCheck(values: CheckResultValues) {
    setSubmitted(values);
    check.mutate(values);
  }

  function reset() {
    check.reset();
    pdf.reset();
    setSubmitted(null);
  }

  const report = check.data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {report && submitted ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold text-ink">
                {report.student.user.first_name} {report.student.user.last_name}
              </h1>
              <p className="font-mono text-xs text-n-500">{report.student.admission_number}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => pdf.mutate(submitted)} disabled={pdf.isPending}>
                <Download className="size-4" /> {pdf.isPending ? "Preparing PDF…" : "Download PDF"}
              </Button>
              <Button type="button" variant="outline" onClick={reset}>Check another</Button>
            </div>
          </div>
          {pdf.isError && <p role="alert" className="text-sm text-clay">{getErrorMessage(pdf.error)}</p>}
          <ReportCardBody data={report} />
        </div>
      ) : (
        <div className="mx-auto max-w-md space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="font-display text-3xl font-bold text-ink">Check a result</h1>
            <p className="text-sm text-n-500">
              Enter the details on the scratch card your child&rsquo;s school gave you. No account needed.
            </p>
          </div>
          <div className="rounded-xl border border-n-200 bg-white p-5">
            <CheckResultForm onCheck={onCheck} isChecking={check.isPending} checkError={check.error} />
          </div>
        </div>
      )}
    </div>
  );
}
