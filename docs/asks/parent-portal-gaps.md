> **CLOSED 2026-08-29.** Every ask below shipped, and the frontend now consumes
> all of it — attendance screens for both personas, payment history and receipt
> downloads, and `useMyStudentId` reading `/me.student.id` instead of scanning
> the class roster. Two "smaller/optional" items also landed (`enrollment-history`
> and the full `students/{id}/` profile for parents/students); those are open but
> not yet consumed. Kept as the record of what was asked and why.
>
> Still outstanding from §4: **online fee payment** (no gateway, no webhook) —
> genuinely unbuilt, and its own project.

# Backend asks — Parent & Student portals

Both portals are built and live on the frontend:

- **Parent** — dashboard (term average, position, subject breakdown, fee progress,
  performance trend across terms), Results, Fees, Child profile, all scoped by a
  child switcher.
- **Student** — dashboard, My results, My subjects (with the teacher for each),
  My fees.

Everything below is a capability the **frontend is ready to consume the moment
the endpoint allows it** — no redesign needed, just wiring.

Every status claim here was checked against the running dev server with a real
parent-only and a real student-only token, not read off the source. Where
something is quoted as returning 403 or an empty list, that's an observed
response.

Ordered by value-to-effort.

---

## 1. Attendance for parents and students — returns an empty list, silently

**The biggest hole in both portals.** A parent can't see whether their child was
in school today, and a student can't see their own record. It's the thing
parents ask about most.

`attendance/views.py`, `AttendanceRecordViewSet.get_queryset()` (~line 30-52):

```python
if (
    (membership.is_admin and admin_profile and admin_profile.has_permission('view_attendance')) or
    (membership.is_teacher and hasattr(membership, 'teacher_profile'))
):
    pass
else:
    qs = qs.none()     # ← parents and students land here
```

Two problems:

- **No parent/student branch.** Observed: `GET /api/attendance/` returns
  `200 {"count":0,...,"results":[]}` for both a parent and a student token — not
  a `403`. It fails *silently*; nothing distinguishes "no records exist" from
  "you're not allowed", on either side of the wire.
- **No `student` filter.** `attendance/filters.py` exposes only `class_arm_id`,
  `date`, `date_after`, `date_before`. Even with visibility granted there's no
  way to scope to one student.

**Ask:** add a persona branch mirroring what fees and results already do —
self-scoped for a student, `ParentStudentLink`-scoped for a parent — plus a
`student` / `student_id` field on `AttendanceRecordFilter`. The pattern to copy
is `FeesService._assert_ledger_visible` (`fees/services.py:280-306`).

Ideally `daily-summary` too (it derives from the same queryset), so we can draw
an attendance-rate trend rather than just a list of days.

**Until this lands** both nav items (`/child/attendance`, `/my/attendance`) are
badged "Soon" and point at a placeholder. We deliberately did not build screens
that would always be blank.

---

## 2. Payments and receipts — closed to both parents and students

They can see **what is owed** but not **what has been paid** — no transaction
record, and no receipt to keep.

`fees/views.py`, `PaymentViewSet.get_required_permission()`:

```python
'list': 'view_fees',
'retrieve': 'view_fees',
'receipt': 'view_fees',
```

`view_fees` runs through `HasSchoolPermission`, which hard-requires
`membership.is_admin` (`accounts/permissions.py`). Observed: `GET /api/payments/`
returns `403 {"detail":"You do not have permission to perform this action."}` for
both a parent and a student token — including the receipt for a payment made
against their own account.

**The odd half-position:** `GET /api/students/{id}/fees/` already admits a parent
and a student (verified 200). So they can see a fee is fully paid, but not when
it was paid, by whom, or with any proof of it.

**Ask:** let a parent (and student) read payments and receipts **for a student
they're linked to, or themselves**. The cleanest shape matching this codebase is
what the ledger already does: set `required_permission = None` for
`list`/`retrieve`/`receipt`, filter the queryset to permitted students for
non-privileged callers, and reuse `_assert_ledger_visible` for the receipt's
object check.

**Frontend is ready:** `PaymentHistory` and the receipt-download button are built
and working on the bursar screen. Both portals pass `canViewFees={false}` purely
because of this gate — flipping it is a one-line change on each screen.

---

## 3. A student cannot discover their own `StudentProfile.id`

**Not a blocker** — the student portal ships without this. But the workaround it
forces has a privacy cost worth closing.

**What we do now.** `/auth/me/` gives the student their `user.id` and their
`current_class.class_arm_id`. `GET /api/class-arms/{arm}/` is readable by a
student (verified 200) and returns the arm's full roster, each entry carrying
both `id` (the StudentProfile id) and `user.id`. So we fetch the whole class and
find the one row whose `user.id` matches the caller's.

**The cost:** to learn its own id, a student's app downloads **every classmate's
name and email**. We display none of it — only the caller's own row is read —
but the request happens and that data crosses the wire to a student's device.
`AcademicService.get_class_arm_detail` neither caps nor paginates the roster, so
in a class of sixty that's sixty students' PII fetched to answer a question about
one.

`accounts/services.py`, `get_me()` (~line 616-634):

```python
if membership.is_student and hasattr(membership, 'student_profile'):
    student_profile = membership.student_profile      # ← the id is right here
    ...
    data['student'] = {
        "current_class": ...,
        "parent_links": ...,
        # no "id"
    }
```

The id isn't in the JWT either (`accounts/tokens.py` carries `school_id`,
`membership_id`, `personas` only), and `GET /api/students/{id}/` is gated on
`CanViewStudents` (verified 403 for a student on their own record).

**Ask:** one line — `"id": str(student_profile.id)` in that dict. The value is
already in scope, it exposes nothing the student can't already reach, and it lets
the frontend stop pulling the class roster on every load.

---

## 4. Smaller / optional

- **Enrollment history** (`students/{id}/enrollment-history/`) is on
  `CanViewStudents` — verified 403 for a parent and a student. Neither can see
  which classes they've been through. Nice-to-have; same link-scoped treatment.
- **Fuller profile.** A parent/student only gets the `StudentListItem` nested in
  the ledger and report-card responses (name, photo, admission no., current
  class, gender, enrolment status). Reasonable — but worth a deliberate decision
  on whether a parent should see e.g. medical/emergency fields for their own
  child, which today only `GET /api/students/{id}/` carries.
- **Online fee payment** — genuinely unbuilt, not just gated:
  `PaymentSource.PAYSTACK`/`FLUTTERWAVE` are unused enum values,
  `gateway_reference` is written by nothing, `PaymentViewSet.create` requires
  `record_fees` unconditionally, and there's no webhook route anywhere. Real
  gateway work (initiate → verify → idempotent webhook); scope it on its own
  rather than bundling with the above.

---

## Already working — no change needed

Verified live with parent-only and student-only tokens:

| Endpoint | Parent | Student |
|---|---|---|
| `students/{id}/fees/` | 200 | 200 (self) |
| `students/{id}/report-card/` | correct pre-publish 403 | correct pre-publish 403 |
| `students/{id}/report-card/pdf/` | correct pre-publish 403 | correct pre-publish 403 |
| `announcements/` | 200, audience-scoped | 200, audience-scoped |
| `academic-sessions/` | 200 | 200 |
| `class-arms/{arm}/` + `/subject-assignments/` | — | 200 |

Two things worth calling out as *right*, so they don't get "fixed":

- **The pre-publish 403 message is doing real work.** Both report-card endpoints
  return `{"detail":"This report card is not yet available."}` rather than a
  generic permission error, which is what lets the UI say "not published yet —
  nothing is missing on your side" instead of alarming a parent. Please keep that
  distinct from the `HasSchoolPermission` wording.
- **The live `ParentStudentLink` re-check on every request** (rather than a
  cached grant) is the right call and we rely on it: unlinking a parent revokes
  access on their very next request, and the frontend re-resolves the selected
  child against `/me` on each load so a stale selection can't linger.

---

## One thing we could not test

There are **no published results in the dev database** — every `ClassArmResult`
has `locked_at = NULL`. So we've confirmed the report card and its PDF are
correctly *withheld* pre-publish, but never seen either succeed. If you publish
one arm, both portals light up end-to-end (report card, PDF download in the
school's configured template, and the multi-term performance trend) and we can
close that last gap.
