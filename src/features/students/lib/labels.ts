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
