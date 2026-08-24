// Split from the former single endpoints.ts. Re-exported from ../endpoints,
// so every existing import path is unchanged.
// Trailing slashes are preserved exactly as the backend defines them.

// One school-scoped notice. No drafts, no scheduled publish, no read-tracking,
// no attachments, no per-class targeting — create is live immediately and delete
// is a hard delete. Don't build UI implying otherwise.
//
// list/retrieve carry NO permission gate; access is shaped entirely by
// get_queryset, which returns two different worlds:
//   - a member holding post_notices sees EVERY announcement in the school,
//     whatever its audience, so they can edit notices not aimed at themselves;
//   - everyone else sees only those whose audience_personas overlaps their own
//     active personas (OR logic — one match is enough).
// A member with zero active personas sees nothing. Retrieve uses the same
// queryset, so a parent can't open an admin-only notice by guessing its UUID.
//
// create/update/destroy require post_notices — held by ANY such admin, not just
// the original author, so never gate editing on created_by.
//
// No filter or search params at all. Newest first (-created_at), paginated.
export const ANNOUNCEMENT_ENDPOINTS = {
  LIST: () => `/api/announcements/`,
  DETAIL: (id: string) => `/api/announcements/${id}/`,
} as const;
