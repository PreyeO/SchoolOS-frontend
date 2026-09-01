# Platform admins receive full student records for every school

Not urgent, and nothing is leaking outside SchoolOS — but it's more than we
need, and the people it's about are mostly children.

## What a platform admin gets today

`GET /api/students/?school_id=…` with a platform token returns, for every
student on the platform:

```json
{
  "user": {
    "first_name": "…", "last_name": "…",
    "email": "…", "phone_number": "…", "photo": "…"
  },
  "admission_number": "…",
  "gender": "female",
  "enrollment_status": "active",
  "date_of_admission": "2026-08-10",
  "current_class": { "class_name": "Primary 3", "arm_name": "Primary 3 A", … }
}
```

Name, gender, photo and class together identify a specific child. No school
consent or involvement is needed to read it, and any SchoolOS employee with
`view_platform_students` can page through every school.

## What we changed on the frontend

The platform directory now renders students as **admission number + class**
only — no name, email, photo or gender. Teachers, parents and school admins are
unchanged, since they're adults and the people a platform admin actually
corresponds with.

That's display-only. **The full record still crosses the wire** and sits in the
browser and the network tab, so it's a partial mitigation at best.

## What would actually fix it

A reduced serializer when the caller is a platform admin rather than a school
member — `id`, `admission_number`, `enrollment_status`, `current_class`, and
nothing else. `StudentProfileViewSet` already branches on platform vs school
context for permissions (`platform_required_permission` vs
`school_required_permission`), so there's an existing seam to hang it on.

Worth checking whether the platform panel needs student *rows* at all. The
uses we know of are:

- **Billing** — needs a count, which `/schools/financials/` already gives.
- **Support** — "this student isn't showing up", where the school quotes an
  admission number. That works with the reduced shape above.

Neither needs a name. If there's a third use we've missed, say so and we'll
size it against the exposure.

## Also worth a look

`view_platform_students` is currently granted by the seeded **Super Admin**
role, which is every platform admin today. If the reduced serializer lands, the
permission is a reasonable thing to keep. If it doesn't, consider whether it
should be on the default role at all.
