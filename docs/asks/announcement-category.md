# Backend ask: `category` on `Announcement`

**Requested by:** frontend · 2026-08-24
**Size:** one field, one migration, a few serializer lines
**Blocks:** nothing — the announcements screen is live and works without it. This is a quality change, not a fix.

---

## The problem

Every announcement renders identically, because the model gives us nothing to tell them apart:

```
Announcement = school · title · body_html · audience_personas · created_by · created_at · updated_at
```

A school notice board carries genuinely different kinds of message, and right now these three are visually indistinguishable:

- *"Mid-term break dates"* — procedural, should be plain
- *"Happy birthday Mrs. Adeyemi!"* — celebratory
- *"School closed tomorrow — flooding on Awolowo Road"* — urgent, must stand out

We deliberately did **not** guess the kind from the title or body (looking for "birthday", emoji, etc.). That gets it wrong silently, and this codebase's rule is to show real data or nothing.

## The ask

Add one field to `Announcement`:

```python
class AnnouncementCategory(models.TextChoices):
    GENERAL     = 'general',     'General'
    CELEBRATION = 'celebration', 'Celebration'
    URGENT      = 'urgent',      'Urgent'
    EVENT       = 'event',       'Event'

category = models.CharField(
    max_length=20,
    choices=AnnouncementCategory.choices,
    default=AnnouncementCategory.GENERAL,
)
```

Then:

- **`AnnouncementCreateSerializer`** — accept `category`, optional, defaulting to `general`. Existing clients that don't send it must keep working.
- **`AnnouncementUpdateSerializer`** — accept `category`, optional (so an admin can re-tag a notice they mis-filed).
- **`AnnouncementSerializer`** — include `category` in `fields`.
- **Migration** — `default='general'` backfills existing rows, so nothing needs a data migration.

No change to permissions, to the visibility queryset, or to sanitization.

## Nice-to-have, only if it's cheap

`?category=` as a filter on the list endpoint. The list currently takes **no** query params at all, so we filter client-side — fine at present volumes (we fetch `page_size=100`), and it stays fine until a school has years of notices. Not worth a `django-filter` setup on its own if one isn't already wired for this viewset.

## What we'll do with it

`general` stays exactly as plain as it is now — no badge, no colour. Only the other three get treatment:

| category | frontend treatment |
|---|---|
| `general` | unchanged, no decoration |
| `celebration` | warm accent border + a small icon |
| `urgent` | amber/clay treatment, matching the warning styling used elsewhere in the app |
| `event` | date-forward affordance |

Keeping `general` the default and the boring one is the point: the decorated categories only stay meaningful while they're rare. If everything can be urgent, nothing is.

## Explicitly not asking for

To keep the scope honest, we are **not** asking for any of these now, and we haven't built UI implying them:

- read-tracking / unread badges
- push or SMS delivery
- scheduled or future-dated publishing
- drafts
- attachments or inline images
- per-class or per-individual targeting (persona audiences are enough)

## One open question

Should `is_pinned` (bool) come along with this? It would let *"School closed tomorrow"* hold the top of the list regardless of date. It's a second small field and a change to the queryset's `ordering` (`['-is_pinned', '-created_at']`).

We have **no** strong opinion and are happy to defer it — `urgent` as a category may be sufficient on its own, and pinning is the kind of thing that gets left switched on. Include it only if it looks trivial from your side.
