"use client";

import { useEffect } from "react";

import { applyAuthTokens } from "@/lib/auth/apply-auth-tokens";
import {
  HANDOFF_ACK,
  HANDOFF_READY,
  HANDOFF_REQUEST,
  isTrustedHandoffOrigin,
  trustedHandoffOrigins,
  type HandoffMessage,
} from "@/lib/auth/handoff-contract";

// The receiving half of the cross-subdomain hand-off. Runs inside a hidden
// iframe on the school's own origin, so anything it writes to localStorage
// belongs to that origin — which is the entire point, since the apex can't
// write there directly.
//
// Never navigated to by a person. It renders nothing and does nothing unless a
// trusted origin posts it a session.
//
// SECURITY: the origin check is the boundary. Any page that can postMessage
// here could otherwise plant a session on this school's origin, so only the
// apex is accepted — deliberately not other school subdomains, which would let
// one tenant write tokens into another's storage.
export function AuthBridgeView() {
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (!isTrustedHandoffOrigin(event.origin)) return;

      const data = event.data as Partial<HandoffMessage> | null;
      if (data?.type !== HANDOFF_REQUEST) return;
      if (typeof data.access !== "string" || typeof data.refresh !== "string") return;

      // Writes to THIS origin's localStorage, then tells the apex it's safe to
      // navigate. Without the ack the apex would redirect into an empty store
      // and bounce the user back to /login — the exact bug this replaces.
      applyAuthTokens(data.access, data.refresh);
      (event.source as Window | null)?.postMessage({ type: HANDOFF_ACK }, event.origin);
    }

    window.addEventListener("message", onMessage);

    // Announce only AFTER the listener is attached. The apex used to send on
    // iframe.onload, which fires when this document loads — before React
    // hydrates and runs this effect — so the tokens arrived with nothing
    // listening and the hand-off silently timed out. Speaking first, and only
    // once genuinely ready, removes the race.
    //
    // Addressed to each trusted apex origin by name rather than "*". The
    // message carries nothing secret, but wildcard targets in auth code get
    // copied to places where that stops being true.
    for (const origin of trustedHandoffOrigins()) {
      window.parent?.postMessage({ type: HANDOFF_READY }, origin);
    }

    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
}
