import { z } from "zod";

import { CONTACT_TIMES, PILOT_ROLES, STUDENT_RANGES } from "@/data/pilot";
import { SCHOOL_LEVELS } from "@/data/school-levels";

import { isValidPhone } from "../lib/phone";

// Option values are derived from the data files rather than retyped, so adding
// a role, a size band or a level in one place can't leave validation behind.
const roleValues = PILOT_ROLES.map((r) => r.value) as [string, ...string[]];
const rangeValues = STUDENT_RANGES.map((r) => r.value) as [string, ...string[]];
const timeValues = CONTACT_TIMES.map((t) => t.value) as [string, ...string[]];
const levelValues = SCHOOL_LEVELS.map((l) => l.value) as [string, ...string[]];

// Both contact details are required. There was briefly a "how should we reach
// you?" chooser that asked for only the matching one; taking both is the
// simpler ask to answer and leaves a second route to the school if the first
// bounces.
export const demoRequestSchema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  role: z.enum(roleValues, { error: "Tell us your role at the school" }),
  school_name: z.string().min(2, "Enter your school's name"),
  state: z.string().min(1, "Select a state"),
  city: z.string().min(2, "Enter your city or LGA"),
  // Held outside the registered inputs (LevelsSelect is a controlled checkbox
  // group), so this is the only guard against submitting none.
  levels: z.array(z.enum(levelValues)).min(1, "Select at least one level"),
  student_range: z.enum(rangeValues, { error: "Select roughly how many students" }),
  email: z.string().min(1, "We need an email to reach you on").email("Enter a valid email address"),
  // isValidPhone accepts a leading 0, and treats the prefilled "+234" as empty
  // rather than as a seven-character number.
  phone_number: z.string().refine(isValidPhone, "Enter a valid phone number"),
  best_time_to_call: z.enum(timeValues).optional().or(z.literal("")),
  // Optional and generously capped. Somewhere to say "we run three campuses"
  // or "we're mid-term, can you wait" — context a fixed set of fields can't
  // ask for, and the most useful thing on the form when someone uses it.
  message: z.string().max(1000, "Keep it under 1000 characters").optional(),
});

export type DemoRequestFormValues = z.infer<typeof demoRequestSchema>;
