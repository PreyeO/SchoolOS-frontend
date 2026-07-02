import { z } from "zod";

import { nameField, optionalPhoneNumber } from "./shared";

export const inviteTeacherSchema = z.object({
  first_name: nameField,
  last_name: nameField,
  email: z.string().email("Enter a valid email address"),
  phone_number: optionalPhoneNumber,
  teacher_type: z.enum(["class", "subject", "both"]),
});

export type InviteTeacherFormValues = z.infer<typeof inviteTeacherSchema>;
