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
} as const;
