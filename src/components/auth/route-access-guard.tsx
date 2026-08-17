"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { canAccessPath, isPersona, type Persona } from "@/data/navigation";
import { useAuthStore } from "@/stores/auth-store";

// Hiding a link from the sidebar is presentation, not access control. Every
// dashboard route was still reachable by typing its URL, so a teacher could open
// Grading Configuration and see the school's real grading setup — the backend
// only gates *writing* it (GradingSystemViewSet requires
// manage_academic_structure on create/update/destroy, nothing on list).
//
// This closes that by reusing the personas the nav already declares per route,
// so there is one list rather than two that could drift apart.
//
// It is a UI guard, not a security boundary — the API remains the authority, and
// anything genuinely sensitive must be enforced there. What it buys is that the
// app stops showing people screens that aren't theirs.
export function RouteAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const claims = useAuthStore((s) => s.claims);

  // Same fallback useNavGroups uses: an owner who created a school in this
  // session has no decoded claims yet, and must not be locked out of their own
  // dashboard on the strength of an empty list.
  const known: Persona[] = (claims?.personas ?? []).filter(isPersona);
  const personas: Persona[] = known.length > 0 ? known : ["admin"];

  if (canAccessPath(pathname, personas)) return <>{children}</>;

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-n-100">
        <ShieldAlert className="size-5 text-n-400" />
      </div>
      <h1 className="mt-4 font-display text-lg font-semibold text-ink">
        This page isn&rsquo;t available to your account
      </h1>
      <p className="mx-auto mt-1.5 text-sm text-n-500">
        It belongs to a different role at this school. If you think you should have access,
        ask an administrator to check your permissions.
      </p>
      <Button type="button" variant="outline" asChild className="mt-5">
        <Link href="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
