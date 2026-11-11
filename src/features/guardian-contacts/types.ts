import type { UserMinimal } from "@/lib/api/profile-summary";

// One row of GET /api/guardian-contacts/. The phone is the FULL number here
// (E.164, "+2348031234567") so an edit can round-trip; issuance and message
// screens get a masked one instead and must never show this one there.
export interface GuardianContact {
  id: string;
  student: string;
  admission_number: string;
  student_name: string;
  name: string;
  phone: string;
  // The number a card PIN is texted to. At most one per student.
  is_primary: boolean;
  created_by: UserMinimal | null;
  created_at: string;
  updated_at: string;
}

// A linked parent ACCOUNT's phone that issuance texts when the student has no
// guardian contact (backend 1cd3adf). Read-only: not a contact, so nothing to
// edit or delete here. name and phone are the parent's. Full phone, like the
// contacts list; never show it on issuance or message screens.
export interface AccountPhone {
  student_id: string;
  admission_number: string;
  student_name: string;
  name: string;
  phone: string;
}

export interface CreateContactPayload {
  student_id: string;
  name: string;
  phone: string;
  is_primary: boolean;
}

export type UpdateContactPayload = Partial<Pick<CreateContactPayload, "name" | "phone" | "is_primary">>;

export interface ContactImportRow {
  row: number;
  admission_number: string;
  student_id: string;
  guardian_name: string;
  // Normalised to E.164 by the server, so the preview shows what will be saved.
  guardian_phone: string;
}

export interface ContactImportResult {
  applied: ContactImportRow[];
  skipped: { row: number; reason: string }[];
}
