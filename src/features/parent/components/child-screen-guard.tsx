import type { ReactNode } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";

import type { SelectedChild } from "../hooks/use-selected-child";
import { NoChildrenNotice } from "./no-children-notice";

// The states every parent screen shares before it has a child to show, in the
// order they have to be checked: an offline cache miss can't be distinguished
// from "still loading" without checking it first, and "no children" is only
// true once /me has actually answered.
//
// A plain function rather than a hook or a wrapper component — it calls no
// hooks of its own, so it can be invoked after an early return without
// breaking the rules of hooks, and each page stays a flat read.
//
// Returns null when a child resolved and the screen should render normally.
export function childScreenGuard(selected: SelectedChild): ReactNode | null {
  if (selected.unavailableOffline) {
    return <OfflineNotice resourceLabel="Your children" />;
  }
  if (selected.isPending) {
    return (
      <p className="text-sm text-n-400" role="status">
        Loading…
      </p>
    );
  }
  if (selected.isError) {
    return <ErrorState error={selected.error} resourceLabel="your children" />;
  }
  if (!selected.child) {
    return <NoChildrenNotice />;
  }
  return null;
}
