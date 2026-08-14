import { SCHOOL_LEVELS } from "@/data/school-levels";

// The API's class order is not the order a school reads its own structure in.
//
// Class.Meta.ordering is ["level", "order", "name"], and `level` is a plain
// CharField, so the database sorts the stored *strings* alphabetically:
//
//   junior_secondary → nursery → primary → senior_secondary
//
// which puts JSS ahead of Nursery and Primary. `order` only sequences classes
// *within* a level (Primary 1 before Primary 2), so it can't correct this.
//
// Any screen rendering a class list straight from the API therefore has to
// re-sort. Most don't hit it because they go through buildArmOptions, which
// groups by SCHOOL_LEVELS; this is for the ones that render a flat list.
const LEVEL_RANK = new Map<string, number>(SCHOOL_LEVELS.map((l, i) => [l.value, i]));

export function sortClassesByLevel<T extends { level: string; order: number; name: string }>(
  classes: T[],
): T[] {
  return [...classes].sort((a, b) => {
    // An unrecognised level sorts last rather than first, so a level the
    // frontend doesn't know about yet can't push the whole list around.
    const byLevel =
      (LEVEL_RANK.get(a.level) ?? SCHOOL_LEVELS.length) -
      (LEVEL_RANK.get(b.level) ?? SCHOOL_LEVELS.length);
    if (byLevel !== 0) return byLevel;
    if (a.order !== b.order) return a.order - b.order;
    return a.name.localeCompare(b.name);
  });
}
