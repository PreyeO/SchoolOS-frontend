"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DetailField } from "@/components/shared/detail-field";
import { ErrorState } from "@/components/shared/error-state";
import { formatDate } from "@/lib/text/format-date";
import { formatNaira } from "@/lib/text/format-naira";

import { usePlatformSchool } from "../hooks/use-platform";
import { AccessBadge } from "./access-badge";
import { ActivateSubscriptionDialog } from "./activate-subscription-dialog";
import { ExtendTrialDialog } from "./extend-trial-dialog";

// One school as SchoolOS staff sees it.
//
// The detail route is the only place billing fields exist — the schools LIST
// omits them entirely — so capacity, dates and price all come from here.
//
// Read-only apart from access: PATCH /schools/{id}/ 403s for a platform admin
// (it needs manage_school_settings, a school permission), and so does
// update-capacity. Staff can grant access; they cannot edit a school's profile
// or its capacity on the school's behalf.
export function PlatformSchoolDetailPage({ schoolId }: { schoolId: string }) {
  const { data: school, isPending, isError, error } = usePlatformSchool(schoolId);

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading school…</p>;
  }
  if (isError || !school) {
    return <ErrorState error={error} resourceLabel="this school" />;
  }

  const renewal =
    school.access_status === "subscribed" ? school.subscription_ends_at : school.trial_ends_at;

  return (
    <div className="space-y-5">
      <Link
        href="/platform/schools"
        className="inline-flex items-center gap-1.5 text-sm text-n-500 hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Back to schools
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate font-display text-2xl font-bold text-ink">{school.name}</h1>
            <AccessBadge status={school.access_status} />
          </div>
          <p className="mt-0.5 truncate font-mono text-xs text-n-400">{school.subdomain}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <ExtendTrialDialog schoolId={school.id} />
          <ActivateSubscriptionDialog
            schoolId={school.id}
            currentPrice={school.price_per_student}
          />
        </div>
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">Access &amp; billing</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <DetailField
            label="Student capacity"
            value={school.student_capacity != null ? String(school.student_capacity) : null}
          />
          <DetailField
            label="Price per student"
            value={school.price_per_student ? formatNaira(school.price_per_student) : null}
          />
          <DetailField
            label={school.access_status === "subscribed" ? "Subscription ends" : "Trial ends"}
            value={renewal ? formatDate(renewal.slice(0, 10)) : null}
          />
          <DetailField
            label="Trial ends"
            value={school.trial_ends_at ? formatDate(school.trial_ends_at.slice(0, 10)) : null}
          />
          <DetailField
            label="Subscription ends"
            value={
              school.subscription_ends_at
                ? formatDate(school.subscription_ends_at.slice(0, 10))
                : null
            }
          />
          <DetailField
            label="Has access"
            value={school.has_active_access ? "Yes" : "No"}
          />
        </div>
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">School</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <DetailField label="Type" value={school.school_type.replace(/_/g, " ")} />
          <DetailField label="Levels" value={school.levels.join(", ")} />
          <DetailField label="City" value={school.city} />
          <DetailField label="Email" value={school.email} />
          <DetailField label="Phone" value={school.phone_number} />
          <DetailField label="Website" value={school.website} />
        </div>
      </div>

      <p className="text-xs text-n-400">
        Staff can grant access but not edit a school&rsquo;s profile or capacity — those
        are the school&rsquo;s own to change.
      </p>
    </div>
  );
}
