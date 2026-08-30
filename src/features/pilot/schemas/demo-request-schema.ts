import { z } from "zod";

import { CONTACT_TIMES, PILOT_ROLES, STUDENT_RANGES } from "@/data/pilot";
import { SCHOOL_LEVELS } from "@/data/school-levels";

// Option values are derived from the data files rather than retyped, so adding
// a role, a size band or a level in one place can't leave validation behind.
const roleValues = PILOT_ROLES.map((r) => r.value) as [string, ...string[]];
const rangeValues = STUDENT_RANGES.map((r) => r.value) as [string, ...string[]];
const timeValues = CONTACT_TIMES.map((t) => t.value) as [string, ...string[]];
const levelValues = SCHOOL_LEVELS.map((l) => l.value) as [string, ...string[]];

// Required counterpart of invitations' optionalPhoneNumber, matching the same
// loose E.164 shape. Loose on purpose: this is a marketing form, and a visitor
// who writes a real number in an unexpected format should reach us, not be
// argued with. The field defaults to +234 and is labelled for WhatsApp, which
// does more for correctness here than a stricter pattern would.
const phoneNumber = z
  .string()
  .min(1, "We need a number to reach you on")
  .refine((v) => /^\+?[1-9]\d{6,14}$/.test(v.replace(/[\s-]/g, "")), "Enter a valid phone number");

export const demoRequestSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  role: z.enum(roleValues, { error: "Tell us your role at the school" }),
  phone_number: phoneNumber,
  email: z.string().email("Enter a valid email address"),
  school_name: z.string().min(2, "Enter your school's name"),
  state: z.string().min(1, "Select a state"),
  city: z.string().min(2, "Enter your city or LGA"),
  // Held outside the registered inputs (LevelsSelect is a controlled checkbox
  // group), so this is the only guard against submitting none.
  levels: z.array(z.enum(levelValues)).min(1, "Select at least one level"),
  student_range: z.enum(rangeValues, { error: "Select roughly how many students" }),
  best_time_to_call: z.enum(timeValues).optional().or(z.literal("")),
});

export type DemoRequestFormValues = z.infer<typeof demoRequestSchema>;
