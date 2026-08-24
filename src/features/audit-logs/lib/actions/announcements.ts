import type { ActionMeta } from "../action-catalog-data";

// Announcements. The repr is the notice's own title, passed explicitly at every
// call site.
//
// One known rough edge, inherited rather than introduced: cleanTargetRepr cuts
// everything before the last ": ", so a title like "Notice: school closed"
// logs as "school closed". Harmless for reading the log, and not worth
// special-casing announcements out of a rule that serves every other model.
export const ANNOUNCEMENTS_ACTIONS: Record<string, ActionMeta> = {
  // "posted", not "created" — there are no drafts, so creating one publishes it.
  "announcement.created": { category: "announcements", rest: (t) => `posted the notice ${t}` },
  "announcement.updated": { category: "announcements", rest: (t) => `edited the notice ${t}` },
  // Hard delete with no archive, so this entry is the only remaining trace that
  // the notice ever existed.
  "announcement.deleted": { category: "announcements", rest: (t) => `deleted the notice ${t}` },
};
