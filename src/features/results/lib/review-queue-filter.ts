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

export interface StatusFilters {
  status: SubmissionStatus;
  classArmId?: string;
  subjectId?: string;
}

// Filters the WHOLE term's submissions to one status (plus class/subject),
// then cuts out one page.
//
// Why this runs here and not on the server: the submissions endpoint can't
// filter by status (filterset_fields is class_arm/subject/academic_period
// only) and orders by -created_at with no ordering param. Paging server-side,
// "4 awaiting review" could be 1 on page 1, 1 on page 2 and 2 on page 3.
// Starting from every row of the term puts all of one status together.
export function pageByStatus(
  all: ResultSubmission[],
  filters: StatusFilters,
  page: number,
  pageSize: number,
): { rows: ResultSubmission[]; count: number; page: number } {
  const matching = sortSubmissions(
    all.filter(
      (s) =>
        s.status === filters.status &&
        (!filters.classArmId || s.class_arm === filters.classArmId) &&
        (!filters.subjectId || s.subject === filters.subjectId),
    ),
  );
  // Clamped: approving the last row on page 2 shrinks the list under you, and
  // an out-of-range page would render empty with work still to do.
  const lastPage = Math.max(1, Math.ceil(matching.length / pageSize));
  const safePage = Math.min(Math.max(page, 1), lastPage);
  const start = (safePage - 1) * pageSize;
  return { rows: matching.slice(start, start + pageSize), count: matching.length, page: safePage };
}
