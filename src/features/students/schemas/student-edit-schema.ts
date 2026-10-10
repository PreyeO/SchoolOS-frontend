import { z } from "zod";

import { COUNTRIES } from "@/data/countries";

// Mirrors StudentProfileUpdateSerializer's whitelist. admission_number and
// membership are excluded server-side and so are absent here — an admission
// number is the student's identity across the school and is deliberately fixed
// after creation.
//
// enrollment_status left the whitelist on 2026-10-09 and must never come back
// here: DRF drops unknown fields without a word, so sending it would show
// "Student updated" while changing nothing. Status changes go through
// ChangeStatusDialog (bulk-update-status), which requires a reason.
//
// Every optional text field is nullable on the model, and the API treats "" and
// null differently on read (an empty string renders as a blank value, null as
// "not recorded"). Blank inputs are therefore normalised to null on submit —
// see toPayload — rather than writing empty strings into the record.
//
// Dates are plain "YYYY-MM-DD" from <input type="date">, which is exactly what
// the backend's DateField expects, so no conversion is needed.
const optionalText = z.string().trim().max(255, "Keep this under 255 characters");
const optionalLongText = z.string().trim().max(1000, "Keep this under 1000 characters");

// nationality is a django_countries CountryField — the model stores a 2-letter
// ISO 3166-1 code, and StudentProfileUpdateSerializer rejects anything else.
// Confirmed live: sending the full name ("Nigeria") 400s, only the code ("NG")
// is accepted. Validated against the same COUNTRIES list the select is built
// from (a Set membership check rather than z.enum, since the 249-entry tuple
// gains nothing from zod's literal-union typing here) so a stray value can
// never reach the request.
const COUNTRY_CODES: ReadonlySet<string> = new Set(COUNTRIES.map((c) => c.value));
const nationalityCode = z
  .string()
  .refine((v) => v === "" || COUNTRY_CODES.has(v), "Choose a country from the list");

export const admissionSchema = z.object({
  gender: z.enum(["male", "female"]),
  date_of_birth: z.string(),
  date_of_admission: z.string(),
  nationality: nationalityCode,
  previous_school: optionalText,
});

export const personalSchema = z.object({
  state_of_origin: optionalText,
  religion: z.union([z.enum(["christian", "islam", "other"]), z.literal("")]),
  blood_group: z.union([
    z.enum([
      "a_positive",
      "a_negative",
      "b_positive",
      "b_negative",
      "ab_positive",
      "ab_negative",
      "o_positive",
      "o_negative",
      "unknown",
    ]),
    z.literal(""),
  ]),
  genotype: z.union([z.enum(["aa", "bb", "ab", "oo", "unknown"]), z.literal("")]),
  allergies: optionalLongText,
  chronic_conditions: optionalLongText,
  disabilities: optionalLongText,
  emergency_medications: optionalLongText,
});

export const aboutSchema = z.object({
  favourite_food: optionalText,
  hobbies: optionalLongText,
  ambitions: optionalLongText,
  // No photo here. It shares this PATCH's whitelist (photo_key) but not this
  // form: it's edited from the avatar via EditStudentPhotoDialog, which sends
  // its own single-field payload.
});

export type AdmissionFormValues = z.infer<typeof admissionSchema>;
export type PersonalFormValues = z.infer<typeof personalSchema>;
export type AboutFormValues = z.infer<typeof aboutSchema>;
export type StudentEditValues = AdmissionFormValues | PersonalFormValues | AboutFormValues;

// Empty string means "clear this", which the API expresses as null. Sending ""
// would store a blank rather than an absent value, and the detail page renders
// those differently.
//
// `undefined` is left alone rather than converted, and JSON.stringify then drops
// it — so an absent key is omitted from the PATCH instead of clearing the field.
// None of the three forms here relies on that today, but the distinction is the
// reason the conversion tests `=== ""` rather than falsiness.
export function toPayload(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, value === "" ? null : value]),
  );
}
