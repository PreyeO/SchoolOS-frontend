// Two dashboard widgets with no backend behind them.
//
// Both used to return invented school data — three fake calendar entries, and
// notifications reading "5 students have overdue fee balances", "Second Term
// results are ready to publish", "Your free trial ends in 24 days". None of it
// was real, and all of it was indistinguishable from real: a school would go
// looking for those five students and find nothing.
//
// They now return nothing, so both widgets fall through to the honest empty
// states they already had ("No upcoming events" / "No new notifications").
// That's a truthful blank rather than a convincing fiction.
//
// What each would need to become real:
//   - Upcoming events: there is no calendar/events app in the backend at all.
//     This needs the module built first, not just an endpoint.
//   - Notifications: no endpoint either, but unlike events the *data* exists —
//     fee arrears, publish-readiness and access status are all already
//     fetched elsewhere in this app. A notification feed could be derived
//     client-side from those without any backend work. Worth doing as its own
//     piece; not worth faking in the meantime.

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
}

export interface Notification {
  id: string;
  text: string;
  timestamp: string;
  unread: boolean;
}

export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  return [];
}

export async function getNotifications(): Promise<Notification[]> {
  return [];
}
