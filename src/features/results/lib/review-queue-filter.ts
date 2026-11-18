import type { ResultSubmission, SubmissionStatus } from "../types";

// Ordered by what needs doing, not alphabetically. Anything waiting on the admin
// comes first; approved work sinks to the bottom because it needs nothing.
const STATUS_ORDER: SubmissionStatus[] = ["submitted", "rejected", "draft", "approved"];

export function sortSubmissions(submissions: ResultSubmission[]): ResultSubmission[] {
  return [...submissions].sort((a, b) => {
    const byStatus = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    if (byStatus !== 0) return byStatus;
    const byClass = `${a.class_name}${a.arm_name}`.localeCompare(`${b.class_name}${b.arm_name}`);
    return byClass !== 0 ? byClass : a.subject_name.localeCompare(b.subject_name);
  });
}

// The status filter, and how each is worded in "N … this term". Labels match
// the dashboard's Results card, whose rows link here pre-filtered.
export const STATUS_FILTERS: Array<{ value: SubmissionStatus; label: string; summary: string }> = [
  { value: "submitted", label: "Awaiting review", summary: "awaiting your review" },
  { value: "rejected", label: "Sent back", summary: "sent back, not resubmitted" },
  { value: "draft", label: "Not submitted", summary: "not submitted yet" },
  { value: "approved", label: "Approved", summary: "approved" },
];

// ?status= from a link; anything unrecognised means "all", never an error.
export function parseStatusFilter(value: string | undefined): SubmissionStatus | "" {
  return STATUS_FILTERS.some((f) => f.value === value) ? (value as SubmissionStatus) : "";
}
