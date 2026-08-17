import { onlineManager } from "@tanstack/react-query";

// Teaches TanStack the connection state it is actually in, rather than the one
// it assumes.
//
// query-core's OnlineManager starts at `#online = true` and only ever changes in
// response to a window "online"/"offline" event — it never reads
// navigator.onLine. That is fine if the app was open when the connection
// dropped: the event fires and everything pauses correctly.
//
// It is wrong for the case this app cares most about. Open the app when the
// device is *already* offline and no event ever fires, because the browser went
// offline before the page existed. onlineManager reports online, so nothing
// pauses: every query fires and fails ("couldn't reach the server"), and saving
// a register fires and fails with a network error instead of queueing. The
// offline badge in the topbar reads online too, since it asks the same manager.
//
// setEventListener is the supported extension point. Seeding from
// navigator.onLine on install fixes the cold start, and re-reading it on each
// event — rather than trusting the event's implied value — keeps the two in step.
export function installOnlineManager(): void {
  if (typeof window === "undefined") return;

  onlineManager.setEventListener((setOnline) => {
    const update = () => setOnline(navigator.onLine);

    // Runs immediately: setEventListener invokes the setup synchronously, which
    // is what seeds the true state before anything subscribes.
    update();

    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  });
}
