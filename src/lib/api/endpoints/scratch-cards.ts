// --- Scratch cards (backend docs/scratch-cards-frontend-handoff.md) ---
//
// Platform revenue, not school fees: a school buys result-check cards from
// SchoolOS through Paystack. Every admin route needs manage_scratch_cards.

export const SCRATCH_CARD_ENDPOINTS = {
  // POST { academic_session_id, quantity, gateway: "paystack" } → the purchase
  // with payment_link. No cards exist until the payment is verified.
  PURCHASES: () => `/api/card-purchases/`,
  PURCHASE: (id: string) => `/api/card-purchases/${id}/`,
  // { unit_price } in naira, for the total shown before checkout.
  PRICE: () => `/api/card-purchases/price/`,
  // Public. The payment-return page passes Paystack's ?gateway=&reference=
  // through; this verifies the charge and creates the cards.
  PAYMENT_RETURN: () => `/api/card-purchases/redirect/`,
  // { cards: [{ serial, pin }] } ONCE, then an empty list. The plaintext also
  // expires 15 minutes after the cards are generated.
  REVEAL: (id: string) => `/api/card-purchases/${id}/reveal/`,

  // The stock list. Never includes a PIN.
  CARDS: () => `/api/scratch-cards/`,
  // One card (same row shape, active_assignment included).
  CARD: (id: string) => `/api/scratch-cards/${id}/`,
  // POST { reason, channel, idempotency_key } → { batch, pins, created }.
  // Reissues the card to the student it was issued to. Only works while the
  // card has an active assignment; an anonymous card from a purchase reveal
  // has none and is refused. Print: the new PIN is in `pins`, once. SMS: pins
  // is null and the text goes out after the response.
  REPLACE: (id: string) => `/api/scratch-cards/${id}/replace/`,

  // ?card=&intended_student=&academic_session=&channel=. Who each card was
  // issued to. `superseded_at` null marks the active row. Phone is masked.
  ASSIGNMENTS: () => `/api/card-assignments/`,

  // Issuance (handoff §5). Preview and commit share a body:
  // { academic_session_id, channel, scope, class_id | class_arm_id | student_ids }.
  // Both are throttled to 30/minute per school, so preview on request only.
  // Preview writes nothing. Commit also needs idempotency_key: one per preview,
  // reused on retry. Print returns pins ONCE; a replayed print key is 409.
  ISSUE_PREVIEW: () => `/api/issuance/preview/`,
  ISSUE_COMMIT: () => `/api/issuance/commit/`,
  // POST { message_id, action: mark_failed | resend, idempotency_key }.
  // Only for an unknown or failed message. mark_failed refunds; resend
  // spends new credits and keeps the first charge.
  RESOLVE: () => `/api/issuance/resolve/`,
  // List: counts only, ?channel=&academic_session=. Detail: every recipient
  // with message_status; poll the DETAIL, not the list.
  BATCHES: () => `/api/issuance-batches/`,
  BATCH: (id: string) => `/api/issuance-batches/${id}/`,
  // ?status=unknown|failed|pending|sending&purpose=scratch_card_pin. Phone
  // masked; body has the PIN starred out.
  MESSAGES: () => `/api/outbound-messages/`,
} as const;

// Public result checker: no auth, 15 requests a minute per IP, and five wrong
// attempts lock a card permanently. The PIN only ever goes in a POST body.
export const RESULT_CHECK_ENDPOINTS = {
  // GET ?serial= → { session_name, periods: [{ id, name, order }] }.
  PERIODS: () => `/api/scratch-cards-check/periods/`,
  // POST { serial, pin, admission_number, academic_period_id } → report card JSON.
  VERIFY: () => `/api/scratch-cards-check/verify/`,
  // Same body → the school's own report card template as HTML.
  VERIFY_PREVIEW: () => `/api/scratch-cards-check/verify/preview/`,
  // Same body → PDF (inline).
  VERIFY_PDF: () => `/api/scratch-cards-check/verify/pdf/`,
} as const;
