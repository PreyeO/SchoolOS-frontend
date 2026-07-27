"use client";

import { useMutationWithToast } from "@/lib/api/use-mutation-with-toast";

import { createClasses } from "../api/onboarding-api";
import { deleteClass, updateClass } from "../api/review-api";
import { prepareClassesPayload } from "../lib/prepare-classes-payload";
import type { ClassesFormValues } from "../schemas/classes-schema";
import type { UpdateClassPayload } from "../types-review";

export function useUpdateClass() {
  return useMutationWithToast(
    ({ id, payload }: { id: string; payload: UpdateClassPayload }) => updateClass(id, payload),
    "Saved",
  );
}

export function useDeleteClass() {
  return useMutationWithToast((id: string) => deleteClass(id), "Removed");
}

// Reuses the exact onboarding create-classes pipeline (schema validation +
// arms-trimming) for a single-class form, so a school can add one more class
// from Review without re-submitting its existing ones.
export function useAddClass() {
  return useMutationWithToast((values: ClassesFormValues) => createClasses(prepareClassesPayload(values)), "Class added");
}
