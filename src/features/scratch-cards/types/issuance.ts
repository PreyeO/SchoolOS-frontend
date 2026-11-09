// Giving cards to named students (backend docs/wallet-sms-issuance-frontend-handoff.md).

export type IssuanceChannel = "sms" | "print";
export type ReplaceReason = "lost" | "never_arrived" | "resend";
export type AssignmentReason = "issued" | ReplaceReason;
export type IssuanceScope = "school" | "class" | "arm" | "selection";

// `sending` is the gap between queued and sent. Print rows have no message.
export type MessageStatus = "pending" | "sending" | "sent" | "delivered" | "failed" | "unknown";

// One row of GET /api/card-assignments/. A card can have several over its
// life; the active one has superseded_at null.
export interface CardAssignment {
  id: string;
  card: string;
  serial: string;
  intended_student: string;
  admission_number: string;
  student_name: string;
  academic_session: string;
  guardian_name: string;
  // Masked by the server. Empty for a print with no contact on file.
  phone: string;
  channel: IssuanceChannel;
  reason: AssignmentReason;
  superseded_at: string | null;
  issuance_batch: string | null;
  message: string | null;
  message_status: MessageStatus | null;
  // The card was bound to a different student than the one it was given to.
  // Shown, never acted on (per the handoff).
  mismatch: boolean;
  assigned_at: string;
}

// A print PIN row. These exist only in the commit/replace response.
export interface IssuedPin {
  student_id: string;
  admission_number: string;
  student_name: string;
  serial: string;
  pin: string;
}

export interface IssuanceBatch {
  id: string;
  academic_session: string;
  session_name: string;
  channel: IssuanceChannel;
  scope: IssuanceScope;
  student_count: number;
  message_batch: string | null;
  created_at: string;
  // Detail only; the list omits it.
  assignments?: CardAssignment[];
}

// Commit and replace both return this. `pins` is null for SMS.
export interface IssuanceResult {
  batch: IssuanceBatch;
  pins: IssuedPin[] | null;
  created: boolean;
}

export interface ReplaceCardPayload {
  reason: ReplaceReason;
  channel: IssuanceChannel;
  idempotency_key: string;
}
