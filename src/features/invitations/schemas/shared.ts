import { z } from "zod";

export const optionalPhoneNumber = z
  .string()
  .optional()
  .refine((v) => !v || /^\+?[1-9]\d{6,14}$/.test(v), "Enter a valid phone number");

export const nameField = z.string().min(2, "Min 2 characters");
