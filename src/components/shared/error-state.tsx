"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RotateCw, ShieldAlert, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isNetworkError, isPermissionDeniedError } from "@/lib/api/get-error-message";

interface Props {
  error: unknown;
  // e.g. "teachers", "this admin profile" — slotted into "load {resourceLabel}".
  resourceLabel: string;
}

// Distinguishes three outcomes, because the right response differs for each:
//
//   403          — refreshing can never help, so nothing is offered.
//   no response  — the server wasn't reached at all. Could be a dropped
//                  connection, a sleeping backend, or a CORS rejection, which
//                  the browser reports identically to being offline.
//   any other    — the server answered with an error.
//
// The retry button replaces "Please refresh", which was a dead end: it threw
// away every other loaded query on the page to re-attempt one. Refetching the
// active queries retries exactly what failed, in place.
export function ErrorState({ error, resourceLabel }: Props) {
  const queryClient = useQueryClient();
  const [retrying, setRetrying] = useState(false);

  if (isPermissionDeniedError(error)) {
    return (
      <p className="flex items-center gap-2 text-sm text-clay" role="alert">
        <ShieldAlert className="size-4 shrink-0" />
        You don&rsquo;t have permission to view {resourceLabel}.
      </p>
    );
  }

  const unreachable = isNetworkError(error);

  async function retry() {
    setRetrying(true);
    try {
      // Active queries only — the ones this screen is actually waiting on.
      await queryClient.refetchQueries({ type: "active" });
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2" role="alert">
      <p className="flex items-center gap-2 text-sm text-clay">
        {unreachable && <WifiOff className="size-4 shrink-0" />}
        {unreachable
          ? `Couldn't reach the server to load ${resourceLabel}.`
          : `Couldn't load ${resourceLabel}.`}
      </p>
      <Button type="button" variant="outline" size="sm" onClick={retry} disabled={retrying}>
        <RotateCw className={`size-3.5 mr-1.5 ${retrying ? "animate-spin" : ""}`} />
        {retrying ? "Retrying…" : "Try again"}
      </Button>
    </div>
  );
}
