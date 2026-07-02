import { cn } from "@/lib/utils";
import type { CurrentSchool } from "@/stores/school-store";

interface Props {
  school: CurrentSchool | null;
  className?: string;
}

export function SchoolLogo({ school, className }: Props) {
  if (school?.logoUrl) {
    return (
      // Logo is a local blob URL — next/image requires configured remote domains.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={school.logoUrl}
        alt={school.name}
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
