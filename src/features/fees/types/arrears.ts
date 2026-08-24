import type { StudentListItem } from "@/features/students/types";

// One student who still owes, from FeeDefaulterSerializer.
//
// total_billed and total_paid EXCLUDE waived rows — the service sums only
// `if not row['is_waived']`. That differs from the per-student ledger, whose
// table foots every billed line including waived ones. So a student with a
// waived fee shows a smaller "billed" here than on their own ledger, and the two
// screens are both right. Don't reconcile one against the other.
export interface FeeDefaulter {
  student: StudentListItem;
  total_billed: number;
  total_paid: number;
  total_balance: number;
}

// One period's collected vs outstanding, from FeeCollectionSummaryPointSerializer.
//
// `term` is the pre-joined "{session name} {period name}" — there is no id or
// is_current flag on a point, so a caller can't match one back to a specific
// AcademicPeriod except by rebuilding that string.
//
// collected counts every successful payment against the period's active fee
// items, including from students who have since transferred or left — that money
// was genuinely received. outstanding is max(billed - waived - collected, 0),
// where billed is item.amount × currently-enrolled-in-that-class.
//
// Known approximation: outstanding nets ALL collected and waived amounts against
// the CURRENT billed roster rather than joining per student. It matches the
// live-ledger rule that old-class debt disappears on transfer, so small
// disagreements against the sum of every student ledger are expected, not a bug.
export interface FeeCollectionPoint {
  term: string;
  collected: number;
  outstanding: number;
}
