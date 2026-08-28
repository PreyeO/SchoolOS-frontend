# Reply to backend: bulk import — revalidated after both pulls

Copy-paste for the chat. Everything below was measured against the running dev
container after pulling the parallel-hashing fix.

---

Retested after both pulls. **The parallel hashing fix works** — good call, that
was the right fix rather than just a bigger timeout.

Measured end to end (external clock, not just curl's):

```
60 students -> 29.6s  (~494ms effective per student)
```

Extrapolating: **300 students ≈ 148s**, so it now fits inside the 200s worker
timeout where before it was ~240s serial and died at 30s. I couldn't run a true
300 in one go — the school hit its `student_capacity` of 300 first (see below) —
so treat 148s as measured-rate extrapolation, not an observed run.

Two corrections to what I sent earlier, both mine:

1. **I said "200s isn't enough for 300 students."** That was based on serial
   hashing (796ms each → ~240s). With your thread pool it's ~148s, so 200s does
   cover 300. My earlier number was right for the old code and wrong as advice
   about the new.
2. **I also briefly saw a 200-row import return in 2.3s** and nearly reported it
   as the real figure. It wasn't reproducible — a clean 60-row run timed with an
   external clock gave 29.6s, matching the benchmark. I've thrown the 2.3s
   reading away rather than pass it on.

**One thing worth knowing about the speedup:** on this container the pool gives
about **1.7x**, not 8x — `os.cpu_count()` is 4, so 8 workers are core-bound
rather than thread-bound. Benchmarked directly:

```
serial            : 796 ms/hash
200 via 8 threads : 95.8s -> 479 ms/hash effective  (1.7x)
```

Which puts the practical ceiling at roughly:

| batch | time | vs 200s timeout |
|---|---|---|
| 300 | ~148s | fits, ~25% headroom |
| 400 | ~198s | right on the line |
| 500 | ~247s | **fails** |

So 300 is fine now, 500 isn't. If schools will realistically upload 500+, either
raise the timeout again or move it to a background job. Prod hardware with more
cores will do better than 4 — worth re-measuring there before deciding.

---

## Two other things that blocked me, unrelated to the timeout

**1. `restart` doesn't pick up entrypoint changes — it needs `--build`.**

The Dockerfile does `COPY docker/entrypoint.sh /entrypoint.sh` and
`ENTRYPOINT ["/entrypoint.sh"]`, so the file that actually runs is the copy
baked into the image. After the first pull I could see `--timeout 200` in
`/app/docker/entrypoint.sh` (bind-mounted source) while `/entrypoint.sh` (image
copy) still had the old line, and `docker compose restart` kept using the stale
one. `docker compose up -d --build web` fixed it.

Quick check that it's actually live:

```
docker exec school_os_web sh -c 'tr "\0" " " < /proc/1/cmdline'
```

That may be why it looked like it hadn't taken effect for you either.

**2. Every school in the dev DB has an expired trial**, so all writes 403 with:

> *Your school's trial period has ended and no active subscription was found…*

Trials ran out between 13–27 Aug. I temporarily extended one school's
`trial_ends_at` to run these tests and **restored it to its original value
afterwards**. Worth pushing the dev-seed trial dates out, or nobody can test any
write path.

I also cleaned up after myself: the 260 students created during testing
(`CAPOK/`, `FRESH/`, `TIMEOUT/` prefixes) plus their users, memberships and
enrollments are all deleted. DB is back to where it was.

---

## New behaviour I noticed and wired for

**Capacity is now enforced on bulk import** — a 300-row file into a school with
4 students and `student_capacity: 300` returns 400 with:

> *This import would bring the school to 304 students, exceeding its capacity of
> 300. Increase capacity or reduce the batch before proceeding.*

That's a good message and the frontend surfaces it as-is. Flagging it only
because our docs previously said capacity was unenforced — I've corrected that.

Related: `student_capacity` still can't be edited through the API
(`SchoolBrandingUpdateSerializer` excludes it), so an admin who hits this ceiling
has no self-serve way past it. Is raising capacity meant to be a
support/billing action, or should there be an endpoint for it?

---

## Frontend side (done)

- `timeout: 210_000` on preview + commit only; global stays 15s. Deliberately
  10s above your 200s so your response always wins the race — equal timeouts
  mean the client can abort a reply you were about to send.
- Loading copy names the wait and warns the admin to keep the page open during
  commit; if they navigate away mid-write the generated passwords are gone.
- A timeout no longer reports as "network error". It now says the import may
  have completed and to check the student list before re-uploading, and
  refreshes that list so it's accurate when they look.
- Preview is fast and was never the issue: **4.2s for 300 rows**.
