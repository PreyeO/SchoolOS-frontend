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
  // Detail only; the list omits both. Ids only, no names.
  scope_detail?: { type: IssuanceScope; class_id?: string; class_arm_id?: string; student_ids?: string[] };
  assignments?: CardAssignment[];
}

// Commit and replace both return this. `pins` is null for SMS.
export interface IssuanceResult {
  batch: IssuanceBatch;
  pins: IssuedPin[] | null;
  created: boolean;
}

// --- Preview and commit (handoff §5) ---

// Who to issue to. Exactly one target per scope kind.
export type IssuanceTarget =
  | { scope: "school" }
  | { scope: "class"; class_id: string }
  | { scope: "arm"; class_arm_id: string }
  | { scope: "selection"; student_ids: string[] };

export type IssuancePreviewPayload = IssuanceTarget & { academic_session_id: string; channel: IssuanceChannel };
export type IssuanceCommitPayload = IssuancePreviewPayload & { idempotency_key: string };

// One student in a preview bucket. The row ALSO carries the full `phone`;
// show phone_masked only (the handoff keeps full numbers to the contacts list).
export interface PreviewRow {
  student_id: string;
  admission_number: string;
  student_name: string;
  guardian_name: string;
  phone_masked: string | null;
  contact_id: string | null;
  // Credits this one text costs: a name with an apostrophe or accent can push
  // the fixed template to 2+ pages. Warn from this, not a character count.
  pages: number;
}

export interface IssuancePreview {
  eligible: PreviewRow[];
  no_number: PreviewRow[];
  invalid_number: PreviewRow[];
  already_has_card: PreviewRow[];
  not_enrolled: PreviewRow[];
  // A selected id the school doesn't have: only { student_id }.
  not_found: { student_id: string }[];
  stock_available: number;
  stock_shortfall: number;
  credits_required: number;
  credit_shortfall: number;
  estimated_pages: number;
  estimated_cost_naira: number;
  wallet_balance: number;
  credit_price_naira: number;
  // False when nobody is eligible, stock or credits are short, or the batch is
  // over the server's cap (500 unless configured; the cap itself isn't sent).
  can_commit: boolean;
}

export type SkipBucket = "no_number" | "invalid_number" | "already_has_card" | "not_enrolled" | "not_found";

// --- The stuck-SMS queue (handoff §6) ---

export interface OutboundMessage {
  id: string;
  channel: "sms" | "whatsapp";
  purpose: string;
  recipient_phone: string; // masked
  // The text as sent, with the PIN starred out. It names the student, which is
  // the only way to tell who a queued message was for.
  body: string;
  status: MessageStatus;
  attempts: number;
  credits_charged: number;
  credits_refunded: boolean;
  last_error: string;
  failure_reason: string;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface ResolvePayload {
  message_id: string;
  action: "mark_failed" | "resend";
  idempotency_key: string;
}

export interface ResolveResult {
  message_status: MessageStatus;
  credits_refunded: boolean;
  batch?: IssuanceBatch;
}

export interface ReplaceCardPayload {
  reason: ReplaceReason;
  channel: IssuanceChannel;
  idempotency_key: string;
}
