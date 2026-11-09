// --- Guardian contacts (backend docs/wallet-sms-issuance-frontend-handoff.md §4) ---
//
// The numbers card PINs are texted to. Not logins. Every route needs
// manage_scratch_cards.

export const GUARDIAN_CONTACT_ENDPOINTS = {
  // GET ?student=<uuid>&search=&page= (search: admission no., student name,
  // guardian name, phone). Ordered primary first, then guardian name.
  // POST { student_id, name, phone, is_primary? }. A student's first contact is
  // forced primary; setting primary clears the previous one.
  LIST: () => `/api/guardian-contacts/`,
  // PATCH { name?, phone?, is_primary? } (can't move to another student;
  // can't un-primary the only primary). DELETE → 204.
  DETAIL: (id: string) => `/api/guardian-contacts/${id}/`,
  // Multipart `file`. Fixed header: admission_number, guardian_name,
  // guardian_phone. Both → { applied: [...], skipped: [{ row, reason }] }.
  // Preview writes nothing; commit makes every applied row the primary.
  IMPORT_PREVIEW: () => `/api/guardian-contacts/import/preview/`,
  IMPORT: () => `/api/guardian-contacts/import/`,
} as const;
