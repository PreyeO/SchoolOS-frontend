"use client";

import { useSchoolProfile } from "../hooks/use-school-profile";
import { SchoolProfileForm } from "./school-profile-form";

export function SchoolProfilePage() {
  const { data: school, isPending, isError } = useSchoolProfile();

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading your school profile…</p>;
  }

  if (isError || !school) {
    return <p className="text-sm text-clay" role="alert">Couldn&rsquo;t load your school profile. Please refresh.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">School Profile</h1>
        <p className="mt-1 text-sm text-n-500">Update your school&rsquo;s details and how it looks across the dashboard.</p>
      </div>
      <SchoolProfileForm school={school} />
    </div>
  );
}
