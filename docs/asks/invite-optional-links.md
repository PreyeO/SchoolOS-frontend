# Two optional fields on the invite endpoints

Both are frontend-blocked today. Neither can be built without a backend change,
and the reason is worth stating up front: **the invite endpoints return only
`{"detail": "..."}`** — no id for the profile they just created. So the frontend
can't even do it in two calls without searching for the person it just invited
by email, which is a race and a hack.

## 1. `POST /api/invites/invite-teacher/` — optional `class_arm_id`

`InviteTeacherSerializer` currently takes `first_name`, `last_name`, `email`,
`phone_number`, `teacher_type`. Adding an optional `class_arm_id` would let an
admin invite a form teacher and seat them in one step.

Three rules that already exist in `AcademicService.assign_class_teacher` and
would need to hold here too:

- **`teacher_type` must be `class` or `both`.** A `subject`-only teacher can't
  be a class teacher. Since the invite sets `teacher_type` in the same payload,
  `teacher_type=subject` plus a `class_arm_id` should be a 400, not a silent
  skip.
- **A deactivated arm is refused.** Already handled there.
- **An arm has exactly one class teacher, and `assign_class_teacher` replaces
  the existing one silently.** That's defensible on a deliberate reassignment
  screen, but on an invite it would quietly displace whoever currently holds
  the arm, with the admin not necessarily realising the arm was taken. Worth a
  400 ("this arm already has a class teacher") rather than inheriting the
  replace-silently behaviour.

## 2. `POST /api/invites/invite-parent/` — optional children

`InviteParentSerializer` currently takes `first_name`, `last_name`, `email`,
`phone_number` only.

**A bare array of student profile ids isn't quite enough.**
`ParentStudentLinkCreateSerializer` requires `relationship` (a ChoiceField with
no default: `father`/`mother`/`guardian`/`other`) and takes an optional
`is_primary_contact`. If the invite accepted only ids, the backend would have to
invent a relationship for every link — and every one of those is then wrong
until a human corrects it.

So the useful shape is a list of objects, mirroring the fields that already
exist:

```json
{
  "first_name": "...", "last_name": "...", "email": "...",
  "children": [
    { "student_profile_id": "...", "relationship": "mother", "is_primary_contact": true }
  ]
}
```

`relationship` per child rather than one for the whole invite, since a parent
can be mother to one pupil and guardian to another.

## Both should be atomic with the invite

If the link fails after the invite succeeds, the result is a teacher with no
arm or a parent with no children, and the admin sees a success message. Rolling
the whole call back on a bad `class_arm_id` or `student_profile_id` keeps that
from happening.

## The fallback, if you'd rather not touch the serializers

Return the created profile id from both endpoints instead of just `{"detail":
...}`, and the frontend can make a second call to
`POST /class-arms/{id}/assign-class-teacher/` or
`POST /parent-student-links/`. It works, but it's strictly worse: two round
trips, no atomicity, and the failure mode above becomes ours to handle rather
than impossible.

## Frontend is ready for either

Nothing needs building on our side beyond the form fields:

- The arm picker already exists and already excludes deactivated arms
  (`pickableArms`), matching the rule above.
- `PersonSearchSelect` handles picking students, and the parent-student-link
  feature already has `RelationshipType` and the create payload typed.
- The invite forms (`invite-teacher-form.tsx`, `invite-parent-form.tsx`) are
  where the fields would slot in.
