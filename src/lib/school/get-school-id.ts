import { useAuthStore } from "@/stores/auth-store";
import { useSchoolStore } from "@/stores/school-store";

// Primary source: the school_id claim on the decoded access token. Falls back
// to the school-store's currentSchool.id (set right after create-school, before
// the fresh token may have even been decoded yet in some race conditions).
export function getSchoolId(): string | null {
  const claimsSchoolId = useAuthStore.getState().claims?.school_id ?? null;
  if (claimsSchoolId) return claimsSchoolId;
  return useSchoolStore.getState().currentSchool?.id ?? null;
}
