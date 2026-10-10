"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ActiveBadge } from "@/components/shared/active-badge";
import { DetailField } from "@/components/shared/detail-field";
import { ErrorState } from "@/components/shared/error-state";
import { OffboardDialog, otherPersonasOf } from "@/components/shared/offboard-dialog";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { formatDate } from "@/lib/text/format-date";

import { useOffboardParent } from "../hooks/use-offboard-parent";
import { useParentDetail } from "../hooks/use-parent-detail";
import { LinkStudentDialog } from "./link-student-dialog";
import { ParentStudentLinks } from "./parent-student-links";

// `former` = an offboarded parent (see the route). Their record is read-only
// history here: no offboard, no new links. Re-inviting their email is how a
// former parent comes back, and that reuses this same profile.
export function ParentDetailPage({ id, former = false }: { id: string; former?: boolean }) {
  const { data: parent, isPending, isError, error } = useParentDetail(id, former);
  const router = useRouter();
  // add_students is the backend's gate for both offboarding a parent and
  // managing links, so one check covers both.
  const canManage = useHasSchoolPermission("add_students");
  const offboard = useOffboardParent(id);

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading parent profile…</p>;
  }

  if (isError || !parent) {
    return <ErrorState error={error} resourceLabel="this parent profile" />;
  }

  const { user } = parent;
  const backHref = former ? "/parents?view=former" : "/parents";

  return (
    <div className="space-y-6">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-n-500 hover:text-ink">
        <ArrowLeft className="size-4" /> {former ? "Back to former parents" : "Back to parents"}
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-n-200 bg-white p-5">
        <div className="flex min-w-0 items-center gap-4">
          <PersonAvatar firstName={user.first_name} lastName={user.last_name} photo={user.photo} className="size-14" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-bold text-ink truncate">
                {user.first_name} {user.last_name}
              </h1>
              {former ? (
                <span className="rounded-full border border-n-200 px-2 py-0.5 text-[11px] text-n-500">
                  Former parent
                </span>
              ) : (
                <ActiveBadge isActive={parent.membership.is_active} />
              )}
            </div>
            <p className="mt-0.5 text-sm text-n-500">{user.email}</p>
            {user.phone_number && <p className="text-sm text-n-500">{user.phone_number}</p>}
          </div>
        </div>
        {canManage && !former && (
          <OffboardDialog
            personName={`${user.first_name} ${user.last_name}`}
            role="parent"
            consequence="They lose access to their children's results, fees and attendance. Their links stay on record as history, and re-inviting the same email restores them."
            otherPersonas={otherPersonasOf(parent.membership, "parent")}
            isPending={offboard.isPending}
            // The profile survives, but the default request no longer finds it.
            onConfirm={(reason) => offboard.mutateAsync(reason).then(() => router.replace(`/parents/${id}?former=1`))}
          />
        )}
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-ink">Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailField label="Occupation" value={parent.occupation} />
          <DetailField label="Address" value={parent.address} />
          <DetailField label="City" value={parent.city} />
          <DetailField label="State" value={parent.state} />
          <DetailField
            label="Account activated"
            value={parent.date_joined_school ? formatDate(parent.date_joined_school) : null}
          />
        </div>
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">{former ? "Children (when linked)" : "Linked children"}</h2>
          {canManage && !former && <LinkStudentDialog parentId={parent.id} />}
        </div>
        <ParentStudentLinks parentId={parent.id} links={parent.student_links} readOnly={former || !canManage} />
      </div>
    </div>
  );
}
