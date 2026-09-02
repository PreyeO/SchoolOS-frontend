"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { CurrentSchool } from "@/stores/school-store";

interface Props {
  school: CurrentSchool | null;
  className?: string;
}

export function SchoolLogo({ school, className }: Props) {
  // Logo URLs are presigned S3 GET links that expire after an hour
  // (S3_PRESIGNED_READ_EXPIRY), and the school store persists to localStorage —
  // so a tab left open, or one reopened the next morning, will hold a URL that
  // now 403s. Without this the browser renders its broken-image glyph in the
  // sidebar and topbar, which reads as a corrupted logo rather than a stale
  // link. Falling back to the initial is both correct and self-healing:
  // useSyncSchoolData refetches on mount and focus, and a fresh URL resets this.
  //
  // Stores WHICH url failed rather than a boolean, so a refreshed URL is retried
  // with no reset effect. A `useState(false)` + `useEffect(reset, [src])` pair
  // is the obvious version and is what react-hooks/set-state-in-effect exists to
  // reject — it renders the broken state once before correcting itself.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = school?.logoUrl;

  if (src && failedSrc !== src) {
    return (
      // Plain <img>: a presigned URL is signed and expiring, so next/image would
      // need the bucket as a configured remote pattern and would cache a link
      // that dies within the hour.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={school.name}
        onError={() => setFailedSrc(src)}
        className={cn("rounded object-cover shrink-0", className)}
      />
    );
  }

  return (
    <div
      className={cn("rounded flex items-center justify-center text-white font-bold shrink-0", className)}
      style={{ backgroundColor: school?.primaryColor ?? "#1E5B4F" }}
    >
      {school?.name?.[0]?.toUpperCase() ?? "S"}
    </div>
  );
}
