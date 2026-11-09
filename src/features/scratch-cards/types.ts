import type { UserMinimal } from "@/lib/api/profile-summary";
import type { StudentListItem } from "@/features/students/types";

export type PurchaseStatus = "pending" | "successful" | "failed";

// One row of GET /api/card-purchases/. Amounts are integer naira.
export interface CardPurchase {
  id: string;
  academic_session: string;
  academic_session_name: string;
  quantity: number;
  unit_price: number;
  amount: number;
  gateway: "paystack" | "flutterwave";
  gateway_reference: string | null;
  status: PurchaseStatus;
  payment_link: string | null;
  // The only signal that decides what the payment-return page shows:
  // true = paid, false = not confirmed, null = still unresolved. The other
  // *_verified flags are tracking only (see the handoff).
  verification_api_verified: boolean | null;
  initiated_by: UserMinimal | null;
  // Includes replacement cards, so it can be higher than quantity.
  card_count: number;
  created_at: string;
}

export interface StartPurchasePayload {
  academic_session_id: string;
  quantity: number;
  // Only Paystack works; flutterwave is accepted by the API but fails checkout.
  gateway: "paystack";
}

export * from "./types/issuance";

// The plaintext pair, which exists only in a reveal, issue or replace response.
export interface CardPin {
  serial: string;
  pin: string;
}

// GET /api/scratch-cards/. Never carries a PIN.
export interface ScratchCard {
  id: string;
  serial: string;
  // Null until the first successful result check binds it, then permanent.
  student: StudentListItem | null;
  purchase: string;
  academic_session_name: string;
  // Five wrong PINs lock a card for good.
  is_locked: boolean;
  // Replaced by a new card (issue or replace rotates it); the serial no longer works.
  is_revoked: boolean;
  revoked_at: string | null;
  regenerated_from: string | null;
  failed_attempts: number;
  bound_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

export interface ScratchCardFilters {
  page?: number;
  is_bound?: boolean;
  is_locked?: boolean;
  // True: cards issuance can still hand out (not revoked, locked, bound, or
  // on an active assignment). The server's definition, so list and commit agree.
  unused?: boolean;
  academic_session_id?: string;
  purchase_id?: string;
}

// --- Public result checker ---

export interface CheckPeriods {
  session_name: string;
  periods: { id: string; name: string; order: number }[];
}

export interface CheckResultPayload {
  serial: string;
  pin: string;
  admission_number: string;
  academic_period_id: string;
}
