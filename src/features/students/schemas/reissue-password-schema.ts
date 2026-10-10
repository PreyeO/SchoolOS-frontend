import { z } from "zod";

import { passwordField } from "@/lib/validations/password";

export const reissuePasswordSchema = z.object({
  password: passwordField,
});

export type ReissuePasswordFormValues = z.infer<typeof reissuePasswordSchema>;
