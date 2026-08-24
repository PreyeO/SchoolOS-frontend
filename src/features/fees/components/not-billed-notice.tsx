"use client";

import Link from "next/link";
import { UserRoundX } from "lucide-react";

import { useCanAccess } from "@/lib/auth/use-can-access";

interface Props {
  studentName: string;
  termLabel: string;
}

// is_billed: false — the student has no current enrollment for this term's
// session, so there is nothing to bill them against.
//
// Deliberately not phrased as "₦0 outstanding". To a bursar chasing arrears
// those mean opposite things: one is a student who owes nothing, the other is a
// student the system can't see in a class at all — usually a missing enrolment
// or a term from before they joined, and both are fixable.
export function NotBilledNotice({ studentName, termLabel }: Props) {
  const canEnroll = useCanAccess("/students");

  return (
    <div className="rounded-xl border border-n-200 bg-white px-6 py-10 text-center">
      <UserRoundX className="mx-auto size-6 text-n-300" />
      <p className="mt-3 text-sm font-medium text-ink">Not billed for {termLabel}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-n-500">
        {studentName} isn&rsquo;t enrolled in a class for that term&rsquo;s session, so no fees
        apply to them. This is different from owing nothing.{" "}
        {canEnroll ? (
          <>
            Check their placement on their{" "}
            <Link href="/students" className="text-primary hover:underline">
              student record
            </Link>
            .
          </>
        ) : (
          "An administrator can check their class placement."
        )}
      </p>
    </div>
  );
}
