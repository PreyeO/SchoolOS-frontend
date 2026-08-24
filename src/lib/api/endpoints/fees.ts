// Split from the former single endpoints.ts. Re-exported from ../endpoints,
// so every existing import path is unchanged.
// Trailing slashes are preserved exactly as the backend defines them.

// A fee item is one billable line for a (class, academic_period) pair — scoped
// to Class, not level, because classes at the same level diverge (SS3 carries a
// WAEC fee SS1 doesn't). There is no fee-structure wrapper: a class's total due
// for a term is simply the sum of its active items.
//
// Read actions need view_fees and writes need edit_fees. Note that this is
// stricter than most academic-structure viewsets, where listing is open to any
// school member — fees are financial data, so even the list is gated.
//
// The list filters are `klass`, `academic_period` and `is_active` (plain
// filterset_fields on the model), while the create body takes klass_id and
// academic_period_id. Same read/write asymmetry as subject-assignments.
export const FEE_ITEM_ENDPOINTS = {
  LIST: () => `/api/fee-items/`,
  DETAIL: (id: string) => `/api/fee-items/${id}/`,
  // Collected vs outstanding for the school's six most recent academic periods,
  // chronological. Gated on view_analytics — NOT view_fees, unlike every other
  // route in this file — so an admin who can run the bursar's desk may still
  // 403 here, and the dashboard has to survive that without taking its other
  // charts down with it.
  //
  // Returns a bare array (no pagination envelope), empty when the school has no
  // periods. No date-range params: periods are the natural bucket.
  COLLECTION_SUMMARY: () => `/api/fee-items/collection-summary/`,
} as const;

// A payment is one amount against ONE fee item for one student — itemised, never
// a lump sum. A parent settling tuition and PTA in one visit is two payments and
// two receipt numbers; there is no batch or transaction entity grouping them.
//
// Deliberately no update or destroy: corrections and refunds are handled offline
// (see FeesService.record_payment). Do not build edit or void actions here.
//
// Read filters are `student`, `fee_item` and `status`, while the create body
// takes student_id/fee_item_id — the same read/write asymmetry as fee items.
// list/retrieve/receipt need view_fees; create needs record_fees.
export const PAYMENT_ENDPOINTS = {
  LIST: () => `/api/payments/`,
  DETAIL: (id: string) => `/api/payments/${id}/`,
  // A rendered PDF (Content-Disposition: attachment), not JSON. Fetch it as a
  // blob through apiClient — it's bearer-authenticated, so an <a href> would
  // send cookies and 401. receipt_number is school-prefixed and sequential,
  // drawn from a real counter row rather than derived from the id.
  RECEIPT: (id: string) => `/api/payments/${id}/receipt/`,
} as const;

// A waiver forgives ONE fee item in full for one student. There are no partial
// or percentage discounts, and no PATCH — changing the terms means removing the
// waiver and creating it again.
//
// The ledger reports `is_waived` per row but not the waiver's id, so removing
// one means looking it up here first (filter by `student`).
// list/retrieve need view_fees; create/destroy need edit_fees.
export const FEE_WAIVER_ENDPOINTS = {
  LIST: () => `/api/fee-waivers/`,
  DETAIL: (id: string) => `/api/fee-waivers/${id}/`,
} as const;
