import { z } from "zod";

import { nameField, optionalPhoneNumber } from "./shared";

export const inviteAdminSchema = z.object({
  first_name: nameField,
  last_name: nameField,
  email: z.string().email("Enter a valid email address"),
  phone_number: optionalPhoneNumber,
  role_id: z.string().min(1, "Select a role"),
});

export type InviteAdminFormValues = z.infer<typeof inviteAdminSchema>;
