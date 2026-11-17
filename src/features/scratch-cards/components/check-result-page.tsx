"use client";

import { useState } from "react";

import { Container } from "@/components/layout/Container";

import { useCheckPeriods, useCheckResult, useDownloadResultPdf, useResultPreview } from "../hooks/use-result-check";
import type { CheckResultValues } from "../schemas/check-result-schema";
import { CheckResultForm } from "./check-result-form";
import { CheckResultHeading, CheckResultHelp } from "./check-result-intro";
import { CheckResultView } from "./check-result-view";

// The public result checker: a parent with a card and no account.
//
// The check (JSON) comes first: it validates the card, binds it on first use,
// and gives the name for the header. The school's branded report card (HTML)
// follows for display. Nothing typed is kept once the page is left.
export function CheckResultPage() {
  const check = useCheckResult();
  const preview = useResultPreview();
  const pdf = useDownloadResultPdf();
  const [submitted, setSubmitted] = useState<CheckResultValues | null>(null);
  // Card details kept for "Another term", which skips retyping them.
  const [carryOver, setCarryOver] = useState<Omit<CheckResultValues, "academic_period_id"> | undefined>();
  const periods = useCheckPeriods(submitted?.serial ?? null);

  function onCheck(values: CheckResultValues) {
    setSubmitted(values);
    check.mutate(values, { onSuccess: () => preview.mutate(values) });
  }

  function backToForm(keepCard: boolean) {
    setCarryOver(
      keepCard && submitted
        ? { serial: submitted.serial, pin: submitted.pin, admission_number: submitted.admission_number }
        : undefined,
    );
    check.reset();
    preview.reset();
    pdf.reset();
    setSubmitted(null);
  }

  const report = check.data;
  const term = periods.data?.periods.find((p) => p.id === submitted?.academic_period_id);

  return (
    <section className="py-12 md:py-16">
      <Container>
        {report && submitted ? (
          <div className="mx-auto max-w-4xl">
            <CheckResultView
              report={report}
              termName={term?.name ?? "Result"}
              sessionName={periods.data?.session_name ?? ""}
              previewHtml={preview.data ?? null}
              // Not just isPending: there's a render between the check landing
              // and the preview starting, which would flash the plain table.
              previewLoading={!preview.data && !preview.isError}
              onDownload={() => pdf.mutate(submitted)}
              downloading={pdf.isPending}
              downloadError={pdf.error}
              onAnotherTerm={() => backToForm(true)}
              onAnotherCard={() => backToForm(false)}
            />
          </div>
        ) : (
          // Phone: heading, form, help. Desktop: heading over help on the
          // left, the form beside them on the right.
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-10">
            <div className="lg:col-start-1 lg:row-start-1">
              <CheckResultHeading />
            </div>
            <div className="lg:col-start-1 lg:row-start-2">
              <CheckResultHelp />
            </div>
            <div className="row-start-2 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:pt-2">
              <div className="rounded-2xl border border-n-200 bg-white p-5 shadow-sm sm:p-6">
                {/* Keyed so "Another term" starts a fresh form seeded with the card. */}
                <CheckResultForm
                  key={carryOver ? `carry-${carryOver.serial}` : "fresh"}
                  initial={carryOver}
                  onCheck={onCheck}
                  isChecking={check.isPending}
                  checkError={check.error}
                />
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
