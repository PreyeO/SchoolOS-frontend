import { z } from "zod";

import { CONTACT_METHODS, CONTACT_TIMES, PILOT_ROLES, STUDENT_RANGES } from "@/data/pilot";
import { SCHOOL_LEVELS } from "@/data/school-levels";

// Option values are derived from the data files rather than retyped, so adding
// a role, a size band or a level in one place can't leave validation behind.
const roleValues = PILOT_ROLES.map((r) => r.value) as [string, ...string[]];
const rangeValues = STUDENT_RANGES.map((r) => r.value) as [string, ...string[]];
const timeValues = CONTACT_TIMES.map((t) => t.value) as [string, ...string[]];
const levelValues = SCHOOL_LEVELS.map((l) => l.value) as [string, ...string[]];
const methodValues = CONTACT_METHODS.map((m) => m.value) as [string, ...string[]];

import { isValidPhone } from "../lib/phone";

// phone_number and email are both optional at the shape level, because which
// one is required depends on contact_method. superRefine below applies that
// rule and attaches the error to the field the visitor can actually see.
export const demoRequestSchema = z
  .object({
    full_name: z.string().min(2, "Enter your full name"),
    role: z.enum(roleValues, { error: "Tell us your role at the school" }),
    school_name: z.string().min(2, "Enter your school's name"),
    state: z.string().min(1, "Select a state"),
    city: z.string().min(2, "Enter your city or LGA"),
    // Held outside the registered inputs (LevelsSelect is a controlled checkbox
    // group), so this is the only guard against submitting none.
    levels: z.array(z.enum(levelValues)).min(1, "Select at least one level"),
    student_range: z.enum(rangeValues, { error: "Select roughly how many students" }),
    contact_method: z.enum(methodValues, { error: "Choose how we should reach you" }),
    phone_number: z.string().optional(),
    email: z.string().optional(),
    best_time_to_call: z.enum(timeValues).optional().or(z.literal("")),
  })
  .superRefine((values, ctx) => {
    const method = CONTACT_METHODS.find((m) => m.value === values.contact_method);
    if (!method) return;

    if (method.field === "email") {
      const email = values.email?.trim() ?? "";
      if (!email || !z.string().email().safeParse(email).success) {
        ctx.addIssue({ code: "custom", path: ["email"], message: "Enter a valid email address" });
      }
      return;
    }

    if (!isValidPhone(values.phone_number ?? "")) {
      ctx.addIssue({
        code: "custom",
        path: ["phone_number"],
        message: "Enter a valid phone number",
      });
    }
  });

export type DemoRequestFormValues = z.infer<typeof demoRequestSchema>;
