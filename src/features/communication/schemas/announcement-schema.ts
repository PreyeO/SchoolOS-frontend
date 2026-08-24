import { z } from "zod";

import { isEditorEmpty } from "../lib/editor-extensions";

// Mirrors AnnouncementCreateSerializer: title max 255, body required, at least
// one audience from the four fixed keys.
//
// body_html is checked with isEditorEmpty rather than .min(1): TipTap represents
// an empty document as "<p></p>", which is five characters long and would sail
// through a length check, letting someone publish a blank notice.
//
// Duplicates aren't validated here because the audience field is a checkbox set
// — it can't produce one. The backend rejects them anyway ("Duplicate personas
// in submitted list.") if some other caller tries.
export const announcementSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give this notice a title")
    .max(255, "Title must be 255 characters or fewer"),
  body_html: z.string().refine((html) => !isEditorEmpty(html), "Write something in the notice"),
  audience_personas: z
    .array(z.enum(["admin", "teacher", "parent", "student"]))
    .min(1, "Choose at least one audience"),
});

export type AnnouncementFormValues = z.infer<typeof announcementSchema>;
