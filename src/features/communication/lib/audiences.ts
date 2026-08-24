import type { AnnouncementAudience } from "../types";

// The complete audience set — these four and nothing else. Free-text audiences
// and per-class targeting don't exist in the API, so the multi-select is driven
// from this fixed list rather than from anything the school configures.
//
// Plural labels because the picker asks who a notice goes to, not what one
// person is.
export const ANNOUNCEMENT_AUDIENCES: { value: AnnouncementAudience; label: string }[] = [
  { value: "admin", label: "Admins" },
  { value: "teacher", label: "Teachers" },
  { value: "parent", label: "Parents" },
  { value: "student", label: "Students" },
];

const LABELS: Record<string, string> = {
  admin: "Admins",
  teacher: "Teachers",
  parent: "Parents",
  student: "Students",
};

// Falls back to the raw value so an audience added to the backend enum later
// shows up as itself rather than vanishing from the chips.
export function audienceLabel(value: string): string {
  return LABELS[value] ?? value;
}

// "Teachers and Parents" — for prose, where a row of chips would be heavy.
// Reads the stored order rather than sorting: the backend preserves what was
// submitted, and reordering it would make an edit look like a change.
export function audienceSentence(values: string[]): string {
  const labels = values.map(audienceLabel);
  if (labels.length === 0) return "nobody";
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

// Whether this notice reaches the signed-in member, given their own personas.
//
// Mirrors the backend's OR-based overlap: one match is enough. Only meaningful
// for a post_notices admin, whose list contains announcements aimed at everyone
// — for anyone else the server already filtered, so this is always true.
export function reachesViewer(audience: string[], personas: string[]): boolean {
  return audience.some((a) => personas.includes(a));
}
