"use client";

import { useSyncExternalStore } from "react";

// A shared, slowly-ticking clock for UI that depends on elapsed time — "this
// queued register is nearly too old to sync", say.
//
// Calling Date.now() during render is impure: two renders in the same commit can
// disagree, and React may re-render at any moment. Reading it through an
// external store instead gives every consumer the same value until the store
// actually ticks, which is both correct and what React's purity rule wants.

const TICK_MS = 60_000;

let now = Date.now();
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  // One interval for the whole app, started with the first subscriber and
  // stopped with the last — nothing ticks while no component is watching.
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((notify) => notify());
    }, TICK_MS);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

// Stable between ticks, which is what makes it safe as a snapshot.
const getSnapshot = () => now;

export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
