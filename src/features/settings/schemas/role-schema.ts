import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().trim().min(1, "Required").max(100),
  permissions: z.array(z.string()),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
