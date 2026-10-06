"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ActiveBadge } from "@/components/shared/active-badge";
import { DetailField } from "@/components/shared/detail-field";
import { ErrorState } from "@/components/shared/error-state";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { formatDate } from "@/lib/text/format-date";

import { useParentDetail } from "../hooks/use-parent-detail";
import { LinkStudentDialog } from "./link-student-dialog";
import { ParentStudentLinks } from "./parent-student-links";

export function ParentDetailPage({ id }: { id: string }) {
  const { data: parent, isPending, isError, error } = useParentDetail(id);

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading parent profile…</p>;
  }

  if (isError || !parent) {
    return <ErrorState error={error} resourceLabel="this parent profile" />;
  }

  const { user } = parent;

  return (
    <div className="space-y-6">
      <Link href="/parents" className="inline-flex items-center gap-1.5 text-sm text-n-500 hover:text-ink">
        <ArrowLeft className="size-4" /> Back to parents
      </Link>

      <div className="flex items-center gap-4 rounded-xl border border-n-200 bg-white p-5">
        <PersonAvatar firstName={user.first_name} lastName={user.last_name} photo={user.photo} className="size-14" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-ink truncate">
              {user.first_name} {user.last_name}
            </h1>
            <ActiveBadge isActive={parent.membership.is_active} />
          </div>
          <p className="mt-0.5 text-sm text-n-500">{user.email}</p>
          {user.phone_number && <p className="text-sm text-n-500">{user.phone_number}</p>}
        </div>
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
          <h2 className="text-sm font-semibold text-ink">Linked children</h2>
          <LinkStudentDialog parentId={parent.id} />
        </div>
        <ParentStudentLinks parentId={parent.id} links={parent.student_links} />
      </div>
    </div>
  );
}
