import type { EnrollmentStatus } from "../types";

// Mirrors accounts/enums.py's TERMINAL_ENROLLMENT_STATUSES: the student has
// left. One-way — no move out of these, not even back to active — and the
// backend refuses them new enrollment, promotion, attendance and scores.
// Suspended is deliberately absent: a suspended student is still current and
// still billed.
const TERMINAL: ReadonlySet<EnrollmentStatus> = new Set([
  "graduated",
  "transferred",
  "withdrawn",
  "expelled",
]);

const ALL: EnrollmentStatus[] = ["active", "suspended", "graduated", "transferred", "withdrawn", "expelled"];

export function isTerminalStatus(status: EnrollmentStatus): boolean {
  return TERMINAL.has(status);
}

// Where a student in `from` may legally go, per
// UserService._is_legal_status_transition: anywhere but where they already
// are, unless they're terminal, in which case nowhere. Offering only these
// keeps the all-or-nothing endpoint from rejecting a whole batch over one row.
export function legalTargets(from: EnrollmentStatus): EnrollmentStatus[] {
  if (isTerminalStatus(from)) return [];
  return ALL.filter((s) => s !== from);
}

// Targets every student in a batch can move to, since one status applies to
// the whole batch. Empty if any of them is terminal.
export function commonTargets(statuses: EnrollmentStatus[]): EnrollmentStatus[] {
  return ALL.filter((target) => statuses.every((from) => legalTargets(from).includes(target)));
}
