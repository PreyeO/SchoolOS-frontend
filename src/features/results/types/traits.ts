// Split from the former single results/types.ts along the section banners
// it already used as seams. Re-exported from ../types so no import changed.

import type { StudentListItem } from "@/features/students/types";
import type { UserMinimal } from "@/lib/api/profile-summary";

// ── Behaviour traits and ratings ────────────────────────────────────────────

// Nigerian report cards group behaviour under two headings. Affective is
// attitude and social conduct (punctuality, neatness, politeness); psychomotor
// is physical and practical skill (handwriting, sports, craft).
export const TRAIT_CATEGORIES = ["affective", "psychomotor"] as const;
export type TraitCategory = (typeof TRAIT_CATEGORIES)[number];

export interface BehavioralTrait {
  id: string;
  level: string;
  category: TraitCategory;
  name: string;
  order: number;
  // A trait that already has ratings is deactivated rather than deleted, so
  // historical report cards keep their wording. Read-only.
  is_active: boolean;
}

export interface CreateTraitsPayload {
  level: string;
  category: TraitCategory;
  traits: { name: string; order: number }[];
}

export interface StudentTraitRating {
  id: string;
  student: StudentListItem;
  trait: BehavioralTrait | null;
  // Snapshots taken at rating time, so changing a trait's wording later never
  // rewrites what a past report card said.
  trait_name: string;
  trait_category: TraitCategory;
  rating: number;
  rated_by: UserMinimal | null;
  marked_at: string | null;
  updated_at: string;
}

export interface TraitRatingItem {
  student_id: string;
  trait_id: string;
  // 1-5, enforced by the serializer.
  rating: number;
  marked_at: string;
}

export interface BulkTraitRatingPayload {
  class_arm_id: string;
  academic_period_id: string;
  entries: TraitRatingItem[];
}

export interface BulkTraitRatingResponse {
  applied: StudentTraitRating[];
  skipped: { student_id: string; trait_id: string; reason: string }[];
}

