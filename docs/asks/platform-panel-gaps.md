# Backend asks — Platform admin panel

The staff console is built and live: Overview, Schools (+ detail with
extend-access), Revenue, Directory, Staff, Audit log. Everything below was
found by probing with a real Super Admin token — none of it is visible from
reading the source.

Ordered by how much it limits the panel.

---

## 1. The people directories don't say which school anyone is at

`/students/`, `/teachers/`, `/parents/` and `/school-admins/` all return every
profile on the platform to a platform admin — but **none of the four list
serializers include the person's school**. Observed keys:

```
students      id, user, admission_number, gender, enrollment_status,
              date_of_admission, current_class, created_at
teachers      id, user, employee_id, teacher_type, specialization,
              class_arms, date_joined_school, created_at
parents       id, user, occupation, date_joined_school, created_at
school-admins id, user, school_admin_role, date_joined_school, created_at
```

So staff can ask **"who is at this school"** (via `?school_id=`, which works —
teachers 5→4, parents 3→2, admins 5→1 when filtered) but never **"which school
is this person at"** — which is the actual support question when someone
emails in.

The Directory screen therefore *requires* a school to be picked, rather than
showing a merged list with no attribution. That's the honest version, but it
means finding an unknown person means checking each school in turn.

**Ask:** add the school to each list serializer — `school_id` + `school_name`
would be enough, mirroring what `AuditLogSerializer` already does. Then the
directory becomes a real cross-school lookup and the school filter turns into
a refinement rather than a prerequisite.

---

## 2. The audit log can't be filtered by school

`AuditLogFilters` exposes `action`, `actor` search, and a `created_at` range —
no school parameter. The platform audit log is cross-school (914 entries here)
and each row *carries* `school_name`, so we can label rows but not narrow to
one school.

**Ask:** a `school_id` filter on `AuditLogViewSet`. Cheap, and it turns "what
happened at this school" from scrolling into a query. It would also let the
school detail page show that school's recent activity inline.

---

## 3. Financials carries no dates, so "expiring soon" can't be computed

`/schools/financials/` gives `access_status` per school — enough to list what's
already **expired** — but not `trial_ends_at` / `subscription_ends_at`. Those
live only on the school *detail* route, one request per school.

So the Overview's "Needs attention" list can only show schools that have
already lapsed. The more useful list — schools lapsing in the next fortnight,
while there's still time to act — needs one detail call per school, which isn't
reasonable on a dashboard.

**Ask:** include `trial_ends_at` and `subscription_ends_at` on each financials
row. The screen already has the logic (`buildAttentionList` takes an optional
dates map); it just has nothing to feed it.

---

## 4. Smaller

- **`POST /platform-admins/` returns 405.** Platform admins can only be created
  with `createsuperuser`. The Staff screen is read-only and says so. Fine if
  deliberate — flagging it in case the viewset was meant to allow creation.
- **`/schools/` (list) omits billing fields** while `/schools/{id}/` includes
  them for a platform admin. Not a problem — the list has `access_status`,
  which is what it needs — but worth knowing the two shapes differ, since it's
  the kind of thing that looks like a bug from the frontend.
- **Platform admins have no `/me`.** `GET /auth/me/` 403s for them, so identity
  (name, role, permissions) is resolved by fetching `/platform-admins/` and
  matching the JWT's `user_id`. It works and needs nothing — but a
  `/platform-admins/me/` would be more direct than pulling the whole staff list
  to find one row.

---

## Verified working — no change needed

With a Super Admin token (13/13 permissions):

| Endpoint | Result |
|---|---|
| `/schools/` · `/schools/{id}/` · `/schools/financials/` | 200 |
| `/platform-admins/` | 200 |
| `/audit-logs/` | 200, cross-school, carries `school_name` |
| `/students/` `/teachers/` `/parents/` `/school-admins/` | 200, cross-school, `?school_id=` filters |
| `POST /schools/{id}/extend-access/` | 200 — both paths exercised end to end |

**extend-access is well-designed and we've leant on it.** Splitting the UI into
"extend trial" and "activate subscription" was possible precisely because the
validation is strict: a price with no subscription window is refused
(`{"detail":["Provide at least one of trial_ends_at or subscription_ends_at."]}`),
which let the frontend make that combination unreachable rather than
recoverable. Confirmed live: a school went `expired → trialing` with
`has_active_access` flipping to `true`, and another `→ subscribed` with
`price_is_locked` becoming `true` in the financials rollup.

Also worth noting it fixed the dev database — **every school's trial had
expired** (13–27 Aug), blocking all writes platform-wide. That's now a button
rather than a shell command.
