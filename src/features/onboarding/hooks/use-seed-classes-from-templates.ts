"use client";

import { useEffect, useRef } from "react";

import type { SchoolLevelValue } from "@/data/school-levels";
import type { ClassTemplatesResponse } from "../types";
import type { ClassesFormValues } from "../schemas/classes-schema";
import { buildClassesFromTemplates } from "../lib/build-classes-from-templates";

interface Args {
  schoolLevels: SchoolLevelValue[];
  templates: ClassTemplatesResponse | undefined;
  reset: (values: ClassesFormValues) => void;
}

// Form defaultValues can't wait on an async fetch, so this resets the classes
// field array the first time templates arrive. Levels with no template (or a
// school with none of the templated levels) simply leave the list empty for
// add-your-own — never an error state.
export function useSeedClassesFromTemplates({ schoolLevels, templates, reset }: Args) {
  const seeded = useRef(false);

  useEffect(() => {
    if (!templates || seeded.current) return;
    seeded.current = true;
    const classes = buildClassesFromTemplates(schoolLevels, templates);
    if (classes.length > 0) reset({ classes });
  }, [templates, schoolLevels, reset]);
}
