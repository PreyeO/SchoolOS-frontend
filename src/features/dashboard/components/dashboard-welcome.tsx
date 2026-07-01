"use client";

import { Users, Briefcase, BookOpen, LayoutGrid } from "lucide-react";

import { useSchoolStore } from "@/stores/school-store";

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-n-200 bg-white px-4 py-4 flex items-center gap-3">
      <div className="flex size-9 items-center justify-center rounded-lg bg-brand/10 shrink-0">
        <Icon className="size-4 text-brand" />
      </div>
      <div>
        <p className="text-2xl font-bold font-display text-ink leading-none">{value}</p>
        <p className="text-xs text-n-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export function DashboardWelcome() {
  const school = useSchoolStore((s) => s.currentSchool);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          Welcome to {school?.name ?? "your school"} 👋
        </h1>
        <p className="mt-1 text-sm text-n-500">
          Here&rsquo;s a quick overview of your school.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Students" value={0} icon={Users} />
        <StatCard label="Staff" value={0} icon={Briefcase} />
        <StatCard label="Classes" value={school?.classCount ?? 0} icon={LayoutGrid} />
        <StatCard label="Subjects" value={school?.subjectCount ?? 0} icon={BookOpen} />
      </div>
    </div>
  );
}
