import { DetailField } from "@/components/shared/detail-field";
import { formatDate } from "@/lib/text/format-date";

import { bloodGroupLabel, genderLabel, genotypeLabel, religionLabel } from "../lib/labels";
import type { StudentDetail } from "../types";
import { EditAboutDialog } from "./edit-about-dialog";
import { EditAdmissionDialog } from "./edit-admission-dialog";
import { EditPersonalDialog } from "./edit-personal-dialog";

// The three read-only field cards, split out of the detail page once it went
// past 150 lines. A real seam rather than line-count theater: these are the
// stored-profile fields, all rendered the same way, all edited through the same
// partial PATCH — as opposed to the enrolment, results, parent-link and account
// blocks around them, each of which carries its own permission and endpoint.
//
// One Edit per card, not one form for all eighteen fields, because the update
// is a PATCH: nobody should open a full profile to correct a single allergy.
// canEdit mirrors the backend's CanEditStudentProfile (an admin with
// edit_students, OR any teacher) — the teacher branch is deliberate, since a
// teacher may need to record a medical note for a child they don't teach.
export function StudentProfileCards({
  student,
  canEdit,
}: {
  student: StudentDetail;
  canEdit: boolean;
}) {
  return (
    <>
      <Card title="Admission" action={canEdit && <EditAdmissionDialog student={student} />}>
        <DetailField label="Admission no." value={student.admission_number} />
        <DetailField label="Gender" value={genderLabel(student.gender)} />
        <DetailField
          label="Date of birth"
          value={student.date_of_birth ? formatDate(student.date_of_birth) : null}
        />
        <DetailField
          label="Date of admission"
          value={student.date_of_admission ? formatDate(student.date_of_admission) : null}
        />
        <DetailField label="Previous school" value={student.previous_school} />
        <DetailField label="Nationality" value={student.nationality} />
      </Card>

      <Card
        title="Personal &amp; medical"
        action={canEdit && <EditPersonalDialog student={student} />}
      >
        <DetailField label="State of origin" value={student.state_of_origin} />
        <DetailField
          label="Religion"
          value={student.religion ? religionLabel(student.religion) : null}
        />
        <DetailField
          label="Blood group"
          value={student.blood_group ? bloodGroupLabel(student.blood_group) : null}
        />
        <DetailField
          label="Genotype"
          value={student.genotype ? genotypeLabel(student.genotype) : null}
        />
        <DetailField label="Allergies" value={student.allergies} />
        <DetailField label="Chronic conditions" value={student.chronic_conditions} />
        <DetailField label="Disabilities" value={student.disabilities} />
        <DetailField label="Emergency medications" value={student.emergency_medications} />
      </Card>

      <Card title="About" action={canEdit && <EditAboutDialog student={student} />}>
        <DetailField label="Favourite food" value={student.favourite_food} />
        <DetailField label="Hobbies" value={student.hobbies} />
        <DetailField label="Ambitions" value={student.ambitions} />
      </Card>
    </>
  );
}

function Card({
  title,
  action,
  children,
}: {
  title: string;
  action: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-n-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
        {action}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">{children}</div>
    </div>
  );
}
