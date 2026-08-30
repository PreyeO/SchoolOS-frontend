import type { ClassArmRecord, ClassRecord } from "./class-record";

// A deactivated arm keeps existing so its history has something to point at,
// but every write path rejects it server-side — enrolling, marking, scoring,
// locking, assigning, offering all 400 with "Class arm not found in this
// school." So it must never reach a picker that feeds one of those.
//
// Treats a missing flag as active: a response predating the field means the
// arm is live, and defaulting the other way would empty every picker.
export function isActiveArm(arm: ClassArmRecord): boolean {
  return arm.is_active !== false;
}

// A class created with no arms still gets one system arm (is_default: true) so
// enrollment/attendance always have a class_arm_id to point at. It is not a real
// section and must never appear in arm management, arm pickers, or arm counts —
// the admin never named it and can't meaningfully rename or delete it. The first
// arm they do add converts that row in place rather than creating a second.
export function isRealArm(arm: ClassArmRecord): boolean {
  return !arm.is_default;
}

// Arms an admin can see and manage: real (not the system placeholder), but
// INCLUDING deactivated ones — the Classes & Arms screen has to show them so
// their historical attendance and results still have visible context.
export function realArms(klass: ClassRecord): ClassArmRecord[] {
  return klass.arms.filter(isRealArm);
}

// Arms that can actually be picked for an action. The distinction from
// realArms is the whole point: management screens list deactivated arms,
// pickers must not offer them.
export function pickableArms(klass: ClassRecord): ClassArmRecord[] {
  return klass.arms.filter((arm) => isRealArm(arm) && isActiveArm(arm));
}

// The arm id to submit for a class in enrollment/invite/attendance payloads when
// the user picked the class itself rather than one of its arms. A class with no
// real arms has exactly one system arm, and that arm's id is the right answer.
export function soleArmId(klass: ClassRecord): string | null {
  const real = pickableArms(klass);
  if (real.length === 1) return real[0].id;
  // Falls back to the system placeholder, which must also be active — a
  // placeholder arm can be deactivated like any other.
  if (real.length === 0) return klass.arms.find(isActiveArm)?.id ?? null;
  return null;
}
