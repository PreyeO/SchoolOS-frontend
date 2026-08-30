import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";

import type { ClassRecord } from "./class-record";
import { isActiveArm, pickableArms } from "./real-arms";

export interface ArmOption {
  armId: string;
  // What to call this teaching unit. An arm shows its own name; a class with no
  // real arms shows the class name, since "Default" is an internal placeholder.
  label: string;
  className: string;
  level: SchoolLevelValue;
}

export interface ArmOptionGroup {
  level: SchoolLevelValue;
  levelLabel: string;
  options: ArmOption[];
}

// Flattens classes into the pickable teaching units, grouped by level in school
// order. A class with real arms contributes one option per arm; a class with
// only the system placeholder contributes a single option carrying that arm's
// id — the id is still what enrollment/attendance/assignment payloads need, it's
// only the *name* that must never surface.
//
// Lives in lib/ rather than a feature: teaching assignments, attendance and
// adding a student all pick an arm the same way, and all three must apply the
// same default-arm rule.
export function buildArmOptions(classes: ClassRecord[]): ArmOptionGroup[] {
  const options: ArmOption[] = [];

  [...classes]
    .sort((a, b) => a.order - b.order)
    .forEach((klass) => {
      // pickableArms, not realArms: this builds PICKERS, and every one of
      // them feeds a write the backend rejects for a deactivated arm.
      const arms = pickableArms(klass);
      const level = klass.level as SchoolLevelValue;

      if (arms.length === 0) {
        // Only the system placeholder: still pickable — its id is what the
        // payload needs — but labelled by class, since "Default" is internal.
        const systemArm = klass.arms.find(isActiveArm);
        // No arms at all. Only possible for classes created before the
        // placeholder-arm behaviour existed; nothing here can hold an
        // enrollment, so it's excluded — see armlessClasses, which reports it
        // rather than letting the class vanish from the picker unexplained.
        if (!systemArm) return;
        options.push({ armId: systemArm.id, label: klass.name, className: klass.name, level });
        return;
      }

      arms.forEach((arm) => {
        options.push({ armId: arm.id, label: arm.name, className: klass.name, level });
      });
    });

  return SCHOOL_LEVELS.map((l) => ({
    level: l.value,
    levelLabel: l.label,
    options: options.filter((o) => o.level === l.value),
  })).filter((g) => g.options.length > 0);
}

// Classes carrying no arm whatsoever — not even the system placeholder. Every
// class created since that behaviour landed has one, so this only catches older
// rows. They can't hold an enrollment, a teaching assignment or attendance
// because all three key off a class_arm_id, so pickers have to skip them — this
// names them instead of dropping them silently.
export function armlessClasses(classes: ClassRecord[]): ClassRecord[] {
  return classes.filter((klass) => klass.arms.length === 0);
}
