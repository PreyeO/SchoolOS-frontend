import type { StudentListItem } from "@/features/students/types";

import type { FeeItem } from "./fee-items";

// One fee item as it stands for this student, from StudentFeeLedgerItemSerializer.
//
// `amount` duplicates fee_item.amount — it's the row's own billed figure, kept
// flat so a row can be read without reaching into the nested item.
//
// balance is 0 when waived, otherwise max(amount - paid, 0). It can never go
// negative: overpayment is rejected at record time rather than banked as credit,
// so there is no such thing as a positive balance owed *to* a student.
export interface StudentLedgerItem {
  fee_item: FeeItem;
  amount: number;
  is_waived: boolean;
  paid: number;
  balance: number;
}

// A student's live fee position for one term (StudentFeeLedgerSerializer).
//
// Nothing here is stored — it's recomputed per request from the student's
// *current* class. A student who transferred mid-term is billed only against
// their new class's items; the old class's lines are absent entirely rather
// than shown as zeroed out. Their historical payments still exist.
//
// is_billed is false (with items empty and total_balance 0) when the student has
// no current enrollment for this period's session. That must read as "not billed
// this term", never as "₦0 outstanding" — the two mean opposite things to a
// bursar chasing arrears.
export interface StudentLedger {
  student: StudentListItem;
  academic_period_id: string;
  is_billed: boolean;
  items: StudentLedgerItem[];
  total_balance: number;
}
