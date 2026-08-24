import type { UserMinimal } from "@/lib/api/profile-summary";
import type { StudentListItem } from "@/features/students/types";

// StudentFeeWaiverSerializer. A waiver forgives one fee item in full for one
// student — there are no partial or percentage discounts, which is why the row
// carries no amount of its own.
//
// `fee_item` is the raw id: it's what the ledger's own rows key against when
// matching a waiver back to the line it forgives.
export interface FeeWaiver {
  id: string;
  student: StudentListItem;
  fee_item: string;
  fee_item_name: string;
  reason: string | null;
  waived_by: UserMinimal | null;
  waived_at: string;
}

// StudentFeeWaiverCreateSerializer. `reason` is optional and free text.
export interface CreateWaiverPayload {
  student_id: string;
  fee_item_id: string;
  reason?: string;
}
