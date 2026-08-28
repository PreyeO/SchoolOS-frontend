// Students without a real email get a generated placeholder address:
// student.{admission_number}.{school_slug}@internal.myschoolos.io
// (accounts/services.py, UserService._generate_student_email). It's a unique
// User.email identifier, not a deliverable mailbox.
//
// Two things key off this: an admin may only reissue a password for such a
// student (a real email means self-serve reset instead, and
// UserService.reissue_student_password 400s otherwise), and a parent shouldn't
// be shown a fake address as if it were a way to contact their child.
//
// Matched on the `internal.` subdomain rather than the full literal
// deliberately. The backend domain has already changed once — from
// internal.schoolos.com to internal.myschoolos.io — and because this check is
// the *gate* on the reissue-password button, a stale literal doesn't fail
// loudly: it silently returns false for every student and the action vanishes
// from the UI with nothing to indicate why. Anything under an `internal.`
// subdomain is a placeholder by construction, so this survives the next rename.
const SYNTHETIC_EMAIL_DOMAIN = /@internal\.[^@]+$/i;

export function isSyntheticEmail(email: string): boolean {
  return SYNTHETIC_EMAIL_DOMAIN.test(email);
}
