import {
  HANDOFF_ACK,
  HANDOFF_READY,
  HANDOFF_REQUEST,
  HANDOFF_TIMEOUT_MS,
  handoffUrl,
  schoolOrigin,
} from "./handoff-contract";

// Moves a freshly-issued session from the apex to the school's own subdomain,
// so signing in at www.myschoolos.io lands you on fgc.myschoolos.io/dashboard.
//
// The token itself is portable — the backend validates a signature and has no
// idea which origin holds it. What isn't portable is localStorage, which is
// scoped per origin, so the tokens have to be handed over explicitly.
//
// Deliberately NOT via the URL. A query string reaches Vercel and Cloudflare
// logs and the Referer header; a fragment avoids both but still lands in
// browser history, where any script on the destination page can read it before
// it's stripped. The refresh token is valid for seven days, so on a shared
// staffroom machine that is a real credential sitting in history.
//
// postMessage into a hidden iframe keeps the tokens out of the URL, out of
// history and off every server. targetOrigin pins the recipient, and the bridge
// checks event.origin on the way in.
export async function handoffSessionToSchool(
  slug: string,
  access: string,
  refresh: string,
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const targetOrigin = schoolOrigin(slug);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.display = "none";
  iframe.src = handoffUrl(slug);

  return new Promise<boolean>((resolve) => {
    let settled = false;

    function finish(ok: boolean) {
      if (settled) return;
      settled = true;
      window.removeEventListener("message", onMessage);
      clearTimeout(timer);
      iframe.remove();
      resolve(ok);
    }

    function onMessage(event: MessageEvent) {
      // Only the subdomain we asked.
      if (event.origin !== targetOrigin) return;
      const type = (event.data as { type?: string } | null)?.type;

      // The bridge tells us when it has a listener attached; sending before
      // that raced its hydration and the tokens went nowhere. This listener is
      // registered before the iframe is appended, so the signal can't be missed.
      if (type === HANDOFF_READY) {
        iframe.contentWindow?.postMessage(
          { type: HANDOFF_REQUEST, access, refresh },
          targetOrigin,
        );
        return;
      }

      if (type === HANDOFF_ACK) finish(true);
    }

    // Any failure — bridge not deployed, storage partitioned, network gone —
    // resolves false, and the caller stays on the apex with a working session.
    // Never strand someone for the sake of a nicer URL.
    const timer = setTimeout(() => finish(false), HANDOFF_TIMEOUT_MS);

    window.addEventListener("message", onMessage);

    // Nothing is sent on load — the bridge's own ready signal drives it.
    iframe.onerror = () => finish(false);

    document.body.appendChild(iframe);
  });
}
