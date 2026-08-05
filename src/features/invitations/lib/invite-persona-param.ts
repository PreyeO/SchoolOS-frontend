import type { InvitePersona } from "../types";

const PERSONAS: InvitePersona[] = ["admin", "teacher", "parent", "student"];

// Which form the invitations screen opens on, carried in the URL so the
// directories' "Invite teacher" / "Add student" buttons land on the right one
// instead of always falling back to Admin. Named to match the backend's own
// ?persona= vocabulary on the invites list.
const PERSONA_PARAM = "persona";

// Defined here rather than inline in each directory page so the param name and
// its four valid values live in exactly one place.
export function inviteHref(persona: InvitePersona): string {
  return `/invitations?${PERSONA_PARAM}=${persona}`;
}

// Anything unrecognised (a hand-typed or stale URL) falls back to admin, which
// is the screen's default form — a bad param should never blank the page.
export function parseInvitePersona(value: string | undefined): InvitePersona {
  return PERSONAS.find((p) => p === value) ?? "admin";
}
