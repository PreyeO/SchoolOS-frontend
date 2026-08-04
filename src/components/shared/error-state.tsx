import { ShieldAlert } from "lucide-react";

import { isPermissionDeniedError } from "@/lib/api/get-error-message";

interface Props {
  error: unknown;
  // e.g. "teachers", "this admin profile" — slotted into "load {resourceLabel}".
  resourceLabel: string;
}

// Distinguishes a 403 (no permission) from any other failure (network, 500,
// etc.) so users aren't told to "refresh" when refreshing can never help.
export function ErrorState({ error, resourceLabel }: Props) {
  if (isPermissionDeniedError(error)) {
    return (
      <p className="flex items-center gap-2 text-sm text-clay" role="alert">
        <ShieldAlert className="size-4 shrink-0" />
        You don&rsquo;t have permission to view {resourceLabel}.
      </p>
    );
  }

  return (
    <p className="text-sm text-clay" role="alert">
      Couldn&rsquo;t load {resourceLabel}. Please refresh.
    </p>
  );
}
