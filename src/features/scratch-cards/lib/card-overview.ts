import type { IssuancePreview, PreviewRow } from "../types";

// Where one enrolled student stands with their result card this session.
export type StudentCardState = "has_card" | "ready" | "needs_number";

export interface OverviewStudent extends PreviewRow {
  state: StudentCardState;
  // needs_number only: a number is saved but isn't a textable mobile.
  invalidNumber?: boolean;
}

export interface CardOverview {
  // Enrolled this session (not_enrolled and not_found are left out).
  total: number;
  haveCard: number;
  waiting: number; // ready + needs_number
  ready: number; // has a textable number
  needsNumber: number; // no number, or one that can't be texted
  stockLeft: number;
  credits: number;
  creditsToTextReady: number;
  students: OverviewStudent[];
}

// Everything the Result Cards overview shows, from ONE whole-school SMS
// preview (backend IssuanceService.preview; writes nothing). Its buckets
// already split every enrolled student by card and phone: already_has_card
// (a bound card or an active assignment this session), eligible (no card,
// textable number), no_number / invalid_number (no card, can't be texted).
// Printed slips handed out anonymously aren't tied to a student, so a family
// holding one still counts as waiting here: that's the truth the server has.
export function buildCardOverview(preview: IssuancePreview): CardOverview {
  const tag = (rows: PreviewRow[], state: StudentCardState): OverviewStudent[] => rows.map((r) => ({ ...r, state }));
  const needs = [...preview.no_number, ...preview.invalid_number];
  const students = [
    ...tag(preview.eligible, "ready"),
    ...tag(preview.no_number, "needs_number"),
    ...tag(preview.invalid_number, "needs_number").map((s) => ({ ...s, invalidNumber: true })),
    ...tag(preview.already_has_card, "has_card"),
  ].sort((a, b) => a.student_name.localeCompare(b.student_name));

  return {
    total: students.length,
    haveCard: preview.already_has_card.length,
    waiting: preview.eligible.length + needs.length,
    ready: preview.eligible.length,
    needsNumber: needs.length,
    stockLeft: preview.stock_available,
    credits: preview.wallet_balance,
    creditsToTextReady: preview.credits_required,
    students,
  };
}

export type OverviewFilter = "all" | "waiting" | "needs_number" | "has_card";

export function filterStudents(students: OverviewStudent[], filter: OverviewFilter, search: string): OverviewStudent[] {
  const q = search.trim().toLowerCase();
  return students.filter((s) => {
    if (filter === "waiting" && s.state === "has_card") return false;
    if (filter === "needs_number" && s.state !== "needs_number") return false;
    if (filter === "has_card" && s.state !== "has_card") return false;
    return !q || s.student_name.toLowerCase().includes(q) || s.admission_number.toLowerCase().includes(q);
  });
}
