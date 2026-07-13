import type { SchoolResponse } from "../../types";

export function BrandingSummary({ school }: { school: SchoolResponse }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        {school.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={school.logo}
            alt={`${school.name} logo`}
            className="size-12 rounded-lg object-cover border border-n-200"
          />
        ) : (
          <div className="size-12 rounded-lg bg-n-100" aria-hidden="true" />
        )}
        <div className="flex gap-2" aria-hidden="true">
          <span className="size-6 rounded-full border border-n-200" style={{ backgroundColor: school.primary_color }} title="Primary colour" />
          <span className="size-6 rounded-full border border-n-200" style={{ backgroundColor: school.accent_color }} title="Accent colour" />
        </div>
      </div>
      {school.motto && <p className="text-sm italic text-n-500">&ldquo;{school.motto}&rdquo;</p>}
    </div>
  );
}
