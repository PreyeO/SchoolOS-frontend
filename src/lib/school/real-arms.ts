import type { ClassArmRecord, ClassRecord } from "./class-record";

// A class created with no arms still gets one system arm (is_default: true) so
// enrollment/attendance always have a class_arm_id to point at. It is not a real
// section and must never appear in arm management, arm pickers, or arm counts —
// the admin never named it and can't meaningfully rename or delete it. The first
// arm they do add converts that row in place rather than creating a second.
export function isRealArm(arm: ClassArmRecord): boolean {
  return !arm.is_default;
}

export function realArms(klass: ClassRecord): ClassArmRecord[] {
  return klass.arms.filter(isRealArm);
}

// The arm id to submit for a class in enrollment/invite/attendance payloads when
// the user picked the class itself rather than one of its arms. A class with no
// real arms has exactly one system arm, and that arm's id is the right answer.
export function soleArmId(klass: ClassRecord): string | null {
  const real = realArms(klass);
  if (real.length === 1) return real[0].id;
  if (real.length === 0) return klass.arms[0]?.id ?? null;
  return null;
}
