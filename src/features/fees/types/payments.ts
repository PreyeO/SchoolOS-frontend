import type { UserMinimal } from "@/lib/api/profile-summary";
import type { StudentListItem } from "@/features/students/types";

// What a bursar can actually select at the cash desk. The backend's PaymentMethod
// enum also carries card/ussd/wallet, but those are reserved for a future
// gateway — offering them for a manual entry would record a lie about how the
// money arrived.
export type ManualPaymentMethod = "cash" | "bank_transfer" | "pos" | "cheque";

// Gateway-initiated payments will land pending and flip later; manual ones are
// always created successful. Only successful payments count toward a balance.
export type PaymentStatus = "successful" | "pending" | "failed";

export type PaymentSource = "manual" | "paystack" | "flutterwave";

// PaymentSerializer. `fee_item` is the raw id and `fee_item_name` the flattened
// label — the nested item itself is not returned.
export interface Payment {
  id: string;
  student: StudentListItem;
  fee_item: string;
  fee_item_name: string;
  amount: number;
  method: ManualPaymentMethod | "card" | "ussd" | "wallet";
  source: PaymentSource;
  status: PaymentStatus;
  // School-prefixed and sequential (e.g. "GRN-000452"), drawn from a per-school
  // counter row rather than derived from the id — so it's safe to show, quote
  // and file against.
  receipt_number: string;
  recorded_by: UserMinimal | null;
  created_at: string;
}

// PaymentRecordSerializer. status and source aren't sent: the backend always
// creates a manual payment as successful.
export interface RecordPaymentPayload {
  student_id: string;
  fee_item_id: string;
  amount: number;
  method: ManualPaymentMethod;
}
