import type { UserMinimal } from "@/lib/api/profile-summary";

// Who a notice is aimed at. These four are the whole set (AnnouncementAudience
// on the backend) and they map 1:1 onto the membership persona flags — is_admin
// → "admin", and so on. Deliberately NOT the same list as the nav's Persona
// type, which also carries "bursar"; sending that here would be a 400.
export type AnnouncementAudience = "admin" | "teacher" | "parent" | "student";

// What kind of notice this is, so a birthday doesn't render like a fee
// deadline. `general` is the default and is deliberately the plain one — only
// the other three carry any styling. See lib/categories.ts.
export type AnnouncementCategory = "general" | "celebration" | "urgent" | "event";

// AnnouncementSerializer.
//
// body_html arrives already sanitized — the service runs bleach on every create
// and update, so what comes back is what was actually stored, which may be less
// than what was sent. Refetch after saving rather than trusting the local draft.
//
// created_by is null when the author's user record was later removed. Show the
// notice without a byline rather than crashing on it.
export interface Announcement {
  id: string;
  title: string;
  body_html: string;
  audience_personas: AnnouncementAudience[];
  category: AnnouncementCategory;
  created_by: UserMinimal | null;
  created_at: string;
  updated_at: string;
}

// AnnouncementCreateSerializer. audience_personas must be non-empty and free of
// duplicates ("Duplicate personas in submitted list.").
export interface CreateAnnouncementPayload {
  title: string;
  body_html: string;
  audience_personas: AnnouncementAudience[];
  // Optional on the wire — the create serializer defaults it to "general" — but
  // the compose form always has a value, so it's always sent.
  category?: AnnouncementCategory;
}

// AnnouncementUpdateSerializer — every field optional. audience_personas, when
// sent, WHOLLY REPLACES the stored list rather than merging into it, the same
// way report-card enabled_sections does.
export interface UpdateAnnouncementPayload {
  title?: string;
  body_html?: string;
  audience_personas?: AnnouncementAudience[];
  // Unlike create, the update serializer carries NO default here — omitting it
  // leaves the stored category alone rather than resetting it to "general".
  // Verified live: PATCHing only the title kept a "celebration" tag intact.
  category?: AnnouncementCategory;
}
