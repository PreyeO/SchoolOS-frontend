import type { ClassRecord } from "./class-record";
import { realArms } from "./real-arms";

// What to call the thing that holds a register, in this school's own words.
//
// "Arm" is only meaningful to a school that streams — Primary 1 A alongside
// Primary 1 B. A school with one group per class has no arms, has never used the
// word, and reads "assign a form teacher to each arm" as an instruction about
// something it doesn't have. Under the hood it always *is* an arm (the backend
// keeps a hidden placeholder so a register has something to hang off), but that
// is our model leaking, not their vocabulary.
//
// So the noun follows the school: "class" until they name an arm, "arm"
// afterwards. Copy that would otherwise have to pick one and be wrong for half
// of them interpolates this instead.
export interface TeachingUnitWords {
  one: string;
  many: string;
  // True once the school names arms. Lets copy drop a whole clause rather than
  // just swap a noun — "arms in the same class often differ" is useful guidance
  // to a streamed school and pure confusion to everyone else.
  streamed: boolean;
}

export const CLASS_WORDS: TeachingUnitWords = { one: "class", many: "classes", streamed: false };
export const ARM_WORDS: TeachingUnitWords = { one: "arm", many: "arms", streamed: true };

export function teachingUnitWords(classes: ClassRecord[] | undefined): TeachingUnitWords {
  // Real arms only. The placeholder doesn't count — it's exactly the thing the
  // school never named and shouldn't be told about.
  return (classes ?? []).some((klass) => realArms(klass).length > 0) ? ARM_WORDS : CLASS_WORDS;
}
