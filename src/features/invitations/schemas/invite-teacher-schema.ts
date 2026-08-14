import { z } from "zod";

import { nameField, optionalPhoneNumber } from "./shared";

export const inviteTeacherSchema = z.object({
  first_name: nameField,
  last_name: nameField,
  email: z.string().email("Enter a valid email address"),
  phone_number: optionalPhoneNumber,
  // No default in the form, so this is a genuine "you haven't answered yet"
  // rather than a type check — the message has to say that.
  teacher_type: z.enum(["class", "subject", "both"], {
    error: "Choose what kind of teacher this is.",
  }),
});

export type InviteTeacherFormValues = z.infer<typeof inviteTeacherSchema>;
