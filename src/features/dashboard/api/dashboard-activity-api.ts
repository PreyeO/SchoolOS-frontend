// A dashboard widget with no backend behind it.
//
// It used to return invented school data — notifications reading "5 students
// have overdue fee balances", "Second Term results are ready to publish", "Your
// free trial ends in 24 days". None of it was real, and all of it was
// indistinguishable from real: a school would go looking for those five
// students and find nothing.
//
// It now returns nothing, so the widget falls through to the honest empty state
// it already had ("No new notifications"). That's a truthful blank rather than
// a convincing fiction.
//
// What it would need to become real: no endpoint exists, but the *data* does —
// fee arrears, publish-readiness and access status are all already fetched
// elsewhere in this app. A notification feed could be derived client-side from
// those without any backend work. Worth doing as its own piece; not worth
// faking in the meantime.
//
// The Upcoming events widget that used to sit beside this was removed on
// 2026-09-24. It had the same problem and a worse one: there is no
// calendar/events module in the backend at all, so it needed the module built,
// not just an endpoint. The admin home shows recent announcements in that
// slot instead — the `event` announcement category covers "PTA on Friday" until
// a real calendar exists.

export interface Notification {
  id: string;
  text: string;
  timestamp: string;
  unread: boolean;
}

export async function getNotifications(): Promise<Notification[]> {
  return [];
}
