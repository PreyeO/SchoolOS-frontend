"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { canAccessPath } from "@/data/navigation";
import { PERSONA_LABELS } from "@/lib/auth/active-persona";
import {
  useActivePersona,
  useAvailablePersonas,
  useSetActivePersona,
} from "@/lib/auth/use-active-persona";
import { useRolePermissions, useSchoolPermissions } from "@/lib/auth/use-school-permissions";

// Hiding a link from the sidebar is presentation, not access control. Every
// dashboard route was still reachable by typing its URL, so a teacher could open
// Grading Configuration and see the school's real grading setup — the backend
// only gates *writing* it (GradingSystemViewSet requires
// manage_academic_structure on create/update/destroy, nothing on list).
//
// This closes that by reusing the personas the nav already declares per route,
// so there is one list rather than two that could drift apart.
//
// Checked against the active persona only, so an admin working as a teacher is
// kept off admin pages the same way a teacher is. The API would still let them
// in — it authorises the whole membership — and that's fine: this is a UI
// guard, not a security boundary, and anything genuinely sensitive must be
// enforced there. What it buys is that the app stops showing people screens
// that aren't theirs, or aren't the mode they chose.
export function RouteAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const persona = useActivePersona();
  const available = useAvailablePersonas();
  const permissions = useSchoolPermissions();
  const rolePermissions = useRolePermissions();
  const setActivePersona = useSetActivePersona();

  if (canAccessPath(pathname, [persona], permissions)) return <>{children}</>;

  // A page they *can* open, just not as the persona they're working as — a
  // bookmark or a typed URL from their other mode. "Ask an administrator" would
  // be wrong advice to someone who is one, so offer the switch instead. Staying
  // on this URL afterwards is deliberate: it's the page they came for.
  const other = available.find(
    (p) => p !== persona && canAccessPath(pathname, [p], rolePermissions),
  );

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-n-100">
        <ShieldAlert className="size-5 text-n-400" />
      </div>
      <h1 className="mt-4 font-display text-lg font-semibold text-ink">
        {other
          ? `This page is part of your ${PERSONA_LABELS[other]} profile`
          : "This page isn’t available to your account"}
      </h1>
      <p className="mx-auto mt-1.5 text-sm text-n-500">
        {other
          ? `You’re using your ${PERSONA_LABELS[persona]} profile right now. Switch profiles to open it.`
          : "It belongs to a different role at this school. If you think you should have access, ask an administrator to check your permissions."}
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {other && (
          <Button type="button" onClick={() => setActivePersona(other)}>
            Switch to {PERSONA_LABELS[other]}
          </Button>
        )}
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
