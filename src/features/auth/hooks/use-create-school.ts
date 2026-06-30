"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { resolveNextStep } from "@/lib/auth/resolve-next-step";
import { useAuthStore } from "@/stores/auth-store";

import { createSchool } from "../api/auth-api";
import type { CreateSchoolFormValues } from "../schemas/create-school-schema";

export function useCreateSchool() {
  const router = useRouter();
  const setTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: (values: CreateSchoolFormValues) => createSchool(values),
    onSuccess: (data, variables) => {
      if (data.access && data.refresh) {
        setTokens({ access: data.access, refresh: data.refresh });
      }
      const { path, external } = resolveNextStep({
        state: data.state,
        requiresSchoolSelection: data.requires_school_selection,
        slug: variables.slug,
      });
      if (external) {
        window.location.href = path;
      } else {
        router.push(path);
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
