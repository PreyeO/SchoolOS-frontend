import { z } from "zod";

import { nameField, optionalPhoneNumber } from "./shared";

export const inviteParentSchema = z.object({
  first_name: nameField,
  last_name: nameField,
  email: z.string().email("Enter a valid email address"),
  phone_number: optionalPhoneNumber,
});

export type InviteParentFormValues = z.infer<typeof inviteParentSchema>;
