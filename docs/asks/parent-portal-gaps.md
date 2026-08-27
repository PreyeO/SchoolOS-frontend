# Backend asks — Parent & Student portal

The parent portal is built and live on the frontend: dashboard (term average,
position, subject breakdown, fee progress, performance trend across terms),
Results, Fees, and Child profile, all scoped by a child switcher. Everything
below is a capability the **frontend is ready to consume the moment the endpoint
allows it** — no frontend redesign needed, just wiring.

Ordered by value-to-effort. (1) and (2) are small and unblock whole screens.

---

## 1. Attendance for parents & students — currently returns an empty list, silently

**The single biggest hole in the parent portal.** A parent cannot see whether
their child was in school today, which is the thing parents ask about most.

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

- **No parent/student branch.** A parent gets `200 OK` with an empty list, not a
  `403` — so it fails *silently*. Nothing distinguishes "no records exist" from
  "you're not allowed", on either side of the wire.
- **No `student` filter.** `attendance/filters.py` exposes only `class_arm_id`,
  `date`, `date_after`, `date_before`. Even with visibility granted there's no way
  to scope to one child.

**Ask:** add a persona branch mirroring what fees and results already do —
self-scoped for a student, `ParentStudentLink`-scoped for a parent — plus a
`student` / `student_id` field on `AttendanceRecordFilter`. The pattern to copy
is `FeesService._assert_ledger_visible` (`fees/services.py:280-306`).

Ideally `daily-summary` too (it derives from the same queryset), so we can draw
an attendance-rate trend rather than just a list of days.

**Until this lands** the nav item is badged "Soon" and points at a placeholder —
we deliberately did not build a screen that would always be blank.

---

## 2. A student cannot discover their own `StudentProfile.id`

**This blocks the entire student portal.** A logged-in student currently has no
way to call any `/api/students/{id}/...` endpoint about themselves.

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
`CanViewStudents`, so a student can't look themselves up.

**The irony:** `results/services.py:829-884` and `fees/services.py:280-306`
*already* have working `is_self` branches. The permission logic is done — students
just have no id to call it with.

**Ask:** one line — `"id": str(student_profile.id)` in that dict.

That alone lets us give students their own Results and Fees screens, reusing
everything already built for parents.

---

## 3. Parents cannot see payment history or download receipts

A parent can see **what they owe** but not **what they've paid** — so there's no
record of their own transactions and no receipt to keep.

`fees/views.py`, `PaymentViewSet.get_required_permission()`:

```python
'list': 'view_fees',
'retrieve': 'view_fees',
'receipt': 'view_fees',
```

`view_fees` runs through `HasSchoolPermission`, which hard-requires
`membership.is_admin` (`accounts/permissions.py`) — so a parent 403s on all three,
including the receipt for a payment made against their own child.

**Ask:** let a parent (and student) read payments and receipts **for a student
they're linked to**. The cleanest shape matching this codebase is what the ledger
already does: set `required_permission = None` for `list`/`retrieve`/`receipt`,
filter the queryset to linked students for non-privileged callers, and reuse
`_assert_ledger_visible` for the receipt's object check.

Note `GET /api/students/{id}/fees/` already admits parents — so a parent can see
a fee is fully paid but cannot see *when it was paid or by whom*, which is an odd
half-position to leave them in.

**Frontend is ready:** `PaymentHistory` and the receipt-download button are built
and working on the bursar screen; they're passed `canViewFees={false}` on the
parent screen purely because of this gate. Flipping it is a one-line change here.

---

## 4. Smaller / optional

- **Enrollment history** (`students/{id}/enrollment-history/`) is on
  `CanViewStudents`, so a parent can't see which classes their child has been
  through. Nice-to-have for a profile page; same link-scoped treatment.
- **Fuller child profile.** A parent only gets the `StudentListItem` nested in the
  ledger/report-card responses (name, photo, admission no., current class, gender,
  enrolment status). Reasonable, but worth a deliberate decision on whether a
  parent should see e.g. medical/emergency fields for their own child, which today
  only `GET /api/students/{id}/` carries.
- **Online fee payment** — genuinely unbuilt, not just gated:
  `PaymentSource.PAYSTACK`/`FLUTTERWAVE` are unused enum values, `gateway_reference`
  is written by nothing, `PaymentViewSet.create` requires `record_fees`
  unconditionally, and there's no webhook route anywhere. Real gateway work
  (initiate → verify → idempotent webhook), worth scoping on its own rather than
  bundling with the above.

---

## Already working — no change needed

For completeness, these already admit a linked parent correctly and are live:

- `GET /api/students/{id}/report-card/` — full result. Correctly withheld until
  the arm's broadsheet is locked, with the live `ParentStudentLink` check.
- `GET /api/students/{id}/report-card/pdf/` — renders in the school's own
  configured template (`ReportCardSettings` per level). Parents download the exact
  document the admin designed.
- `GET /api/students/{id}/fees/` — live ledger, itemised.
- `GET /api/announcements/` — correctly scoped by `audience_personas` overlap.

The live-link re-check on every request (rather than a cached grant) is the right
call and we're relying on it — unlinking a parent revokes access on their next
request, and the frontend resolves the selected child against `/me` each load so a
stale selection can't linger.
