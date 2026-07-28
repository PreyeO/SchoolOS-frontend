export type RelationshipType = "father" | "mother" | "guardian" | "other";

export interface CreateParentStudentLinkPayload {
  parent_profile_id: string;
  student_profile_id: string;
  relationship: RelationshipType;
  is_primary_contact?: boolean;
}
