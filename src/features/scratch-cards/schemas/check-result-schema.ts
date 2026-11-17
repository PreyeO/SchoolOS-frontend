import { z } from "zod";

// Typed off a printed card, so be forgiving about case and stray spaces, and
// strict only where the server is (lengths from VerifyScratchCardSerializer).
export const checkResultSchema = z.object({
  serial: z
    .string()
    .transform((v) => v.trim().toUpperCase())
    .pipe(z.string().min(1, "Enter the serial number on the card").max(20, "That's longer than a card serial")),
  pin: z
    .string()
    .transform((v) => v.replace(/\s+/g, ""))
    .pipe(z.string().min(1, "Enter the PIN from the card").max(10, "A PIN is at most 10 characters")),
  admission_number: z
    .string()
    .trim()
    .min(1, "Enter the student's admission number")
    .max(50, "That's longer than an admission number"),
  academic_period_id: z.string().min(1, "Choose a term"),
});

export type CheckResultInput = z.input<typeof checkResultSchema>;
export type CheckResultValues = z.output<typeof checkResultSchema>;
