"use client";

import { Users2 } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { formatDate } from "@/lib/text/format-date";
import { formatNaira } from "@/lib/text/format-naira";

import { useSchoolProfile } from "../hooks/use-school-profile";
import { AccessStatusBadge } from "./access-status-badge";
import { UpdateCapacityDialog } from "./update-capacity-dialog";

// Subscription & billing, as far as it exists.
//
// Deliberately narrow: there is no payment gateway, no invoice list and no
// plan-change flow on the backend, so this shows the school's real access
// state and the one thing they can actually change — capacity. Inventing a
// "Manage plan" button with nothing behind it would be worse than its absence.
export function SubscriptionPage() {
  const { data: school, isPending, isError, error } = useSchoolProfile();
  // Same permission the endpoint enforces. An admin without it sees the state
  // but no control, rather than a button that 403s.
  const canManage = useHasSchoolPermission("manage_school_settings");

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading…</p>;
  }
  if (isError || !school) {
    return <ErrorState error={error} resourceLabel="your subscription" />;
  }

  // Billing fields are omitted entirely for a caller who isn't an active admin
  // at this school (SchoolViewSet._user_can_see_billing), so their absence is
  // "not visible to you", not "not set".
  if (school.student_capacity === undefined) {
    return (
      <div className="space-y-5">
        <Header />
        <p className="rounded-xl border border-n-200 bg-white p-6 text-center text-sm text-n-500">
          Subscription details are only visible to school administrators.
        </p>
      </div>
    );
  }

  const renewalDate =
    school.access_status === "subscribed" ? school.subscription_ends_at : school.trial_ends_at;

  return (
    <div className="space-y-5">
      <Header />

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">Access</p>
            <div className="mt-1.5 flex items-center gap-2">
              <AccessStatusBadge status={school.access_status} />
              {renewalDate && (
                <span className="text-sm text-n-500">
                  {school.access_status === "expired" ? "Ended" : "Until"}{" "}
                  {formatDate(renewalDate.slice(0, 10))}
                </span>
              )}
            </div>
          </div>
          {school.price_per_student ? (
            <div className="text-right">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">
                Per student
              </p>
              <p className="mt-1 font-display text-lg font-bold tabular-nums text-ink">
                {formatNaira(school.price_per_student)}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Users2 className="size-5 text-primary" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Student capacity</p>
              <p className="mt-0.5 font-display text-2xl font-bold tabular-nums text-ink">
                {school.student_capacity}
              </p>
              <p className="mt-1 max-w-md text-xs text-n-500">
                The most students this school can hold. Adding students beyond it — including
                by CSV import — is refused until capacity is raised.
              </p>
            </div>
          </div>
          {canManage && (
            <UpdateCapacityDialog
              school={school}
              trigger={
                <Button type="button" variant="outline" size="sm">
                  Change
                </Button>
              }
            />
          )}
        </div>
      </div>

      <p className="text-xs text-n-400">
        Payments aren&rsquo;t collected in the app yet — capacity changes are invoiced
        directly. Contact SchoolOS support for anything else about your subscription.
      </p>
    </div>
  );
}

function Header() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Subscription &amp; Billing</h1>
      <p className="mt-1 text-sm text-n-500">
        Your school&rsquo;s access and how many students it&rsquo;s licensed for.
      </p>
    </div>
  );
}
