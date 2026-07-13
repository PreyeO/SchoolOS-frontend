"use client";

import { useQuery } from "@tanstack/react-query";

import { getClassTemplates } from "../api/onboarding-api";

export function useClassTemplates() {
  return useQuery({
    queryKey: ["onboarding", "class-templates"],
    queryFn: getClassTemplates,
  });
}
