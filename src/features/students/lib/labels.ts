import type { BloodGroup, EnrollmentStatus, Gender, Genotype, Religion } from "../types";

const GENDER_LABELS: Record<Gender, string> = { male: "Male", female: "Female", other: "Other" };

const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  // "Enrolled", not "Active". Enrollment status and membership.is_active are
  // different facts — one is "currently in a class", the other "can still sign
  // in" — and calling them both "Active" put two identical green pills side by
  // side on the student header. Every other value here already names itself.
  active: "Enrolled",
  graduated: "Graduated",
  transferred: "Transferred out",
  withdrawn: "Withdrawn",
  suspended: "Suspended",
  expelled: "Expelled",
};

const RELIGION_LABELS: Record<Religion, string> = { christian: "Christian", islam: "Islam", other: "Other" };

const GENOTYPE_LABELS: Record<Genotype, string> = { aa: "AA", bb: "BB", ab: "AB", oo: "OO", unknown: "Unknown" };

const BLOOD_GROUP_LABELS: Record<BloodGroup, string> = {
  a_positive: "A+",
  a_negative: "A-",
  b_positive: "B+",
  b_negative: "B-",
  ab_positive: "AB+",
  ab_negative: "AB-",
  o_positive: "O+",
  o_negative: "O-",
  unknown: "Unknown",
};

export function genderLabel(g: Gender): string {
  return GENDER_LABELS[g];
}

export function enrollmentStatusLabel(s: EnrollmentStatus): string {
  return ENROLLMENT_STATUS_LABELS[s];
}

export function religionLabel(r: Religion): string {
  return RELIGION_LABELS[r];
}

export function genotypeLabel(g: Genotype): string {
  return GENOTYPE_LABELS[g];
}

export function bloodGroupLabel(b: BloodGroup): string {
  return BLOOD_GROUP_LABELS[b];
}

// Option lists for the edit form's pickers, derived from the same records the
// read-only labels use so a value can never render one way and pick another.
// Object.entries preserves declaration order, which is deliberate for
// enrollment status — "Enrolled" first, then the ways a student leaves.
function options<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.entries(labels) as [T, string][]).map(([value, label]) => ({ value, label }));
}

export const GENDER_OPTIONS = options(GENDER_LABELS);
export const ENROLLMENT_STATUS_OPTIONS = options(ENROLLMENT_STATUS_LABELS);
export const RELIGION_OPTIONS = options(RELIGION_LABELS);
export const GENOTYPE_OPTIONS = options(GENOTYPE_LABELS);
export const BLOOD_GROUP_OPTIONS = options(BLOOD_GROUP_LABELS);
