# `PUT /api/subjects/bulk-update/` returns a 500 when two subjects trade names

Found while building the bulk subject editor. Not urgent — the frontend now
blocks the case — but it's a 500 rather than a 400, and the cause is subtle.

## What happens

Send one payload that swaps two subjects' names at the same level:

```json
{"subjects": [
  {"id": "<agric-id>", "name": "Arabic"},
  {"id": "<arabic-id>", "name": "Agricultural Science"}
]}
```

Response: **HTTP 500, IntegrityError** on
`unique_active_subject_name_per_school_level`.

The transaction rolls back cleanly, so no data is corrupted.

## Why

`AcademicService.bulk_update_subjects` validates correctly — its uniqueness
check exempts rows inside the submitted set from each other, so the swap passes
validation, which looks intentional and matches how the docstring reads.

The problem is the write, not the check. The loop underneath saves row by row:

```python
for item in subjects_data:
    ...
    subject.save()
```

The first `save()` writes `Agricultural Science → "Arabic"` while the second row
still holds `"Arabic"`, so the constraint fires mid-loop before the second save
can free the name.

That also makes the outcome **order-dependent**: the same logical edit can pass
or 500 depending on the order the items appear in the payload.

## Possible fixes

Whichever you prefer — flagging the cause rather than prescribing:

- Defer the constraint for the transaction
  (`SET CONSTRAINTS ... DEFERRED`, which needs the constraint declared
  `DEFERRABLE INITIALLY IMMEDIATE`), or
- Two-pass the writes inside the existing transaction — clear the affected
  names first, then write the final values, or
- Reject swaps explicitly with a 400 and a message, if they're not worth
  supporting. That's the cheapest option and matches what the UI does today.

## What the frontend does meanwhile

The bulk editor validates against every active subject's *current* (name,
level), not just rows outside the submitted set — so a swap is caught before
submit with "… still holds this name until it's saved — swap names one save at
a time." Nothing is blocked that the backend would have accepted, apart from
these swaps, which currently can't succeed anyway.

If you fix it server-side, the frontend rule can be relaxed to match the
service's own semantics — it's one comparison in
`settings/lib/subject-bulk-edit.ts`.

## Checked and fine

- Case-sensitivity: `"arabic"` alongside `"Arabic"` is accepted, consistent
  with the constraint. The frontend matches this and does **not** validate
  case-insensitively.
- Duplicate ids, duplicate (name, level) pairs, collisions with subjects
  outside the submitted set, levels the school doesn't offer, and empty lists
  all return proper 400s.
- Atomicity holds — the failed swap left both rows untouched.
