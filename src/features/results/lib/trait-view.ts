import { TRAIT_CATEGORIES, type BehavioralTrait, type TraitCategory } from "../types";

export interface TraitView {
  // Categories this class's level actually has traits in. The toggle only
  // offers these, so a school that rates affective only never lands on an
  // empty Psychomotor tab.
  categories: TraitCategory[];
  // The one shown: the teacher's pick if it has traits, else the first that does.
  category: TraitCategory | null;
  traits: BehavioralTrait[];
}

// Which traits the Behaviour & Remarks screen shows for one class.
//
// Traits are optional. A school that hasn't set any up still needs this screen
// for the class teacher's remark, which is a separate report-card section and
// can't be written anywhere else. So "no traits" has to leave the students and
// their remark boxes in place, never replace them with an empty state.
//
// Scoped by level as well as category: a Primary form teacher mustn't see the
// JSS traits. `level` undefined (class list not loaded yet) doesn't filter.
export function resolveTraitView(
  traits: BehavioralTrait[] | undefined,
  level: string | undefined,
  chosen: TraitCategory,
): TraitView {
  const forLevel = (traits ?? []).filter((t) => t.is_active && (!level || t.level === level));
  const categories = TRAIT_CATEGORIES.filter((c) => forLevel.some((t) => t.category === c));
  const category = categories.includes(chosen) ? chosen : (categories[0] ?? null);
  return {
    categories,
    category,
    traits: forLevel.filter((t) => t.category === category).sort((a, b) => a.order - b.order),
  };
}
