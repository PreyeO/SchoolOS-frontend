// Students without a real email get student.{admission_number}.{school_slug}@internal.schoolos.com
// (see accounts services). Only these can have their password reissued by an
// admin — a real email means the student uses the self-serve reset flow instead.
export function isSyntheticEmail(email: string): boolean {
  return email.endsWith("@internal.schoolos.com");
}
