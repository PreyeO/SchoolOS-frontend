import type { ClassesFormValues } from "../schemas/classes-schema";
import type { ClassPayload, CreateClassesPayload } from "../types";

// Trims blank arm rows and omits `arms` entirely for a class with none left —
// the backend treats arms as optional and rejects an empty-name arm or an
// explicit `arms: []`.
export function prepareClassesPayload(values: ClassesFormValues): CreateClassesPayload {
  const classes: ClassPayload[] = values.classes.map((cls) => {
    const arms = cls.arms.map((arm) => arm.name.trim()).filter((name) => name.length > 0);

    return {
      name: cls.name.trim(),
      level: cls.level,
      ...(arms.length > 0 ? { arms: arms.map((name) => ({ name })) } : {}),
    };
  });

  return { classes };
}
