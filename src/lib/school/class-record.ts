// Canonical shape of a class as the backend returns it (POST /api/classes/bulk/
// and GET /api/schools/:id/onboarding/review). Lives in lib/ (not
// features/onboarding/) so both the onboarding feature and the school-store
// can reference the same real record — including ids — without either
// depending on the other.
// Minimal class teacher as embedded on an arm (academic ClassTeacherSerializer).
// `id` is the TeacherProfile id — the same id assign-class-teacher takes.
export interface ClassTeacherSummary {
  id: string;
  name: string;
  email: string;
}

export interface ClassArmRecord {
  id: string;
  name: string;
  // True for the placeholder arm the backend auto-creates when a class is made
  // with no arms, so every class always has one arm to key enrollment and
  // attendance off. Never shown as a real arm — see isRealArm() — but its id is
  // still what enrollment/invite/attendance payloads must send for such a class.
  is_default: boolean;
  // False once the arm has been "deleted" while historical records depend on
  // it — scores, attendance, results, enrollments, offerings. The row survives
  // so that history still points at something real, but the arm is excluded
  // from every write path server-side and must be excluded from every picker
  // here. Read-only: there is no reactivate endpoint; an admin "restores" an
  // arm by creating a new one with the same name, which the backend allows
  // because uniqueness now only applies to active rows.
  //
  // Optional for the rollout window only — a response predating the field
  // means "active". Drop the `?` once the backend is deployed everywhere.
  is_active?: boolean;
  class_teacher: ClassTeacherSummary | null;
}

export interface ClassRecord {
  id: string;
  name: string;
  level: string;
  order: number;
  arms: ClassArmRecord[];
}
