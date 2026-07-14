import { z } from "zod";

export { periodSchema, type PeriodFormValues } from "./academic-year-schema";

// Shared by every "single text field" edit dialog (session name, class name,
// arm name, add-arm) via the generic edit-name-dialog component.
export const editNameSchema = z.object({
  name: z.string().min(1, "Required"),
});

export type EditNameFormValues = z.infer<typeof editNameSchema>;

export const editSubjectSchema = z.object({
  name: z.string().min(1, "Required"),
  level: z.string().min(1, "Required"),
  is_core: z.boolean(),
});

export type EditSubjectFormValues = z.infer<typeof editSubjectSchema>;
