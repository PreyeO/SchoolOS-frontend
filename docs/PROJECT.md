# SchoolOS — Project Guide (for Claude Code)

Read this and `API.md` before building. The backend code in this workspace (the `SchoolOS-backend` folder) is the **source of truth** for API contracts — reconcile anything here against it, and prefer reading the serializers/urls/views over assuming. The backend moves fast; re-check rather than trusting a stale ⚠️ here.

**`SchoolOS-backend/` is read-only.** Read it as much as needed to confirm contracts (or hit the running dev server directly to verify live) — never create, edit, or delete anything inside it. It's a separate codebase the user develops directly. A missing endpoint or field is a gap to report, not something to patch here.

## What this is
SchoolOS is a school-management SaaS for Nigerian K–12 schools (daycare/creche, nursery, primary, junior & senior secondary), sold to private schools. Users: school owners/admins, bursars, teachers, parents, students. Frontend is this repo (`SchoolOS-frontend`); backend is Django/DRF in `SchoolOS-backend`.

## Stack
- **Next.js (App Router)** + **TypeScript (strict)** + **Tailwind** + **shadcn/ui**
- **Zustand** = client/UI/auth state · **TanStack Query** = server state (never put server data in Zustand)
- **react-hook-form + zod** = forms/validation · **axios** = HTTP · **sonner** = toasts · **jwt-decode** = token claims · **lucide-react** = icons · **recharts** = charts
- **TipTap** = the announcement body editor, and the *only* rich-text surface in the app. Locked to the backend's bleach allowlist — see the Announcements block below before touching its config.

## Folder structure
```
src/app/                (marketing)/ (auth)/ (dashboard)/  + api/ layout globals
src/components/         ui/ (shadcn) · shared/ · layout/ · landing/sections/ · providers/
src/features/<domain>/  schemas/ types.ts api/ hooks/ components/   (co-located per domain)
src/hooks/  src/lib/{api,auth,tenant,validations,utils}  src/stores/  src/types/  src/data/  src/config/
```

## Hard conventions (apply to EVERY prompt)
- **No file exceeds 150 lines.** Split along real seams (subcomponents, hooks) — never line-count theater. When a domain's `types.ts` or the endpoint registry outgrows it, split into a folder behind a barrel (`results/types/*` → `results/types.ts`, `lib/api/endpoints/*` → `lib/api/endpoints.ts`) so call sites don't change. **Four known exceptions — see "Deliberate 150-line exceptions" below.**
- **DRY + separation:** schema / types / api call / TanStack hook / UI are separate files. No inline `fetch` in components.
- **Reach for the shared primitive before hand-rolling.** `components/ui/` has `Input`, `Select`, `Button`, `Dialog`, `Sheet`; `components/shared/` has `ErrorState`, `OfflineNotice`, `ArmPicker`, `PersonSearchSelect`, `PaginationControls`, `ConfirmDeleteDialog`; `features/staff/components/teacher-picker.tsx` is the load-once/filter-locally/hold-a-selection teacher chooser (distinct from `PersonSearchSelect`, which is server-search and fires on click). Form controls must go through `Input`/`Select` — both set `text-base md:text-sm`, because iOS Safari zooms the whole page when a focused control is under 16px.
- **Never link someone to a screen they can't open.** Any `<Link>` inside empty-state, error or hint copy on a screen a *teacher* can reach must be gated on `useCanAccess(href)` (`lib/auth/use-can-access.ts`), which asks the nav registry the same question `RouteAccessGuard` does. When it's false, rewrite the sentence — don't just drop the link ("An administrator adds the subjects a class takes" beats a dangling half-instruction). Eight of these leaked before the rule existed, including three in the persistent shell (sidebar footer Settings, user-menu Settings, topbar term chip), where every teacher saw them on every screen. Use `useCanAccess`, not `useIsSchoolAdmin` — routes change audience (the broadsheet went admin-only → staff mid-build) and a hardcoded persona check silently stops matching.
- **No hardcoded URLs/strings** in components — endpoints live in `lib/api/endpoints.ts`, colours/spacing come from design tokens, copy/config in `data/`/`config/`.
- **Prefer a class-arm detail action over the equivalent flat filtered list.** Several pairs return the identical serializer but the flat list demands `manage_academic_structure` while the detail action requires nothing — so the list 403s for teachers. Confirmed for `class-arms/{id}/subjects/` and `class-arms/{id}/subject-assignments/`; assume it for any new pair and verify with a teacher token.
- **Server components by default;** add `'use client'` only where interactivity lives.
- **Import via the `@/` alias.** File naming: components `PascalCase.tsx`, hooks `use-thing.ts` → `useThing`, others `kebab-case.ts`.
- **Preserve trailing slashes exactly** as the backend defines them (some endpoints have them, some don't).

## Deliberate 150-line exceptions (counts re-checked 2026-09-01)

Four files are knowingly over the limit. This is a decision, not an oversight — don't "fix" them casually.

| File | Lines |
|---|---|
| `features/results/components/score-entry-page.tsx` | 441 |
| `features/attendance/components/attendance-page.tsx` | 462 |
| `features/results/components/publish-results-page.tsx` | 418 |
| `features/results/components/behaviour-page.tsx` | 343 |

**Why:** all four carry offline state — draft seeding *during render*, paused-mutation queues, and reconciliation against a query's `dataUpdatedAt`. The order of those render-time state updates is load-bearing (see the comments in `use-register-draft-sync.ts` and `use-score-draft-sync.ts`). **There are no tests in this repo**, and `tsc`/`eslint`/`build` cannot detect a broken seed ordering, a dropped border, or marks that silently stop restoring after a reconnect — a bulk-refactor pass through these files in Aug 2026 shipped exactly such a styling regression, caught only by chance. Splitting them is a real risk with no safety net, and they are already densely commented on *why* each ordering is what it is, which is the part that's hard to reconstruct.

**When to revisit:** split them under cover of a feature change to that screen, when you're clicking through it to test anyway. If you want them compliant sooner, the honest prerequisite is a few tests around the draft hooks — seed on new column, re-seed on fresher server data, queued-counts-as-committed — after which the split is routine.

**Also:** never bulk-rewrite JSX with a script. Two regex passes in that same sweep went wrong (one silently no-op'd on multi-line attributes, the other stripped Tailwind classes from elements it wasn't targeting). Hand-edit, or verify every hunk.

**A fifth exception, of a different kind: `data/countries.ts` (264 lines).** A flat ISO 3166-1 lookup table (249 entries), generated 2026-08-24 by pulling `django_countries.countries` directly off the running backend — not hand-typed — so it can't drift from what `StudentProfileUpdateSerializer` accepts for `nationality`. This is data, not logic, same class as `nigerian-states.ts`; it's only long because there are 249 countries rather than 37 states. Splitting a flat lookup table alphabetically would be line-count theater with no readability gain — there's no real seam to split along. If it needs regenerating, re-run the same `django_countries.countries` pull against the live backend rather than hand-editing entries.

## Error & toast handling (uniform)
- The backend returns `{ "detail": ... }` where `detail` is a **string OR an array of strings**, for both success and error.
- Route EVERY error through the shared normalizer in `lib/api/get-error-message.ts` — never read `error.response.data.detail` directly in a component/hook. Toast via sonner.
- Some success responses return objects (school, stage, created records) instead of `detail` — handle those explicitly (e.g. student-create returns credentials; onboarding steps return the created records).
- **403s get a distinct message, not the generic error copy.** `HasSchoolPermission`/`HasPlatformPermission` both return the same generic `{"detail": "You do not have permission to perform this action."}` regardless of endpoint, so there's nothing useful to show from the message itself — `isPermissionDeniedError()` (`lib/api/get-error-message.ts`) keys off the 403 status instead. Every list/detail/settings page's `isError` branch renders the shared `<ErrorState error={error} resourceLabel="..." />` (`components/shared/error-state.tsx`), which shows "You don't have permission to view X" for 403s and the generic "couldn't load, please refresh" otherwise.

## Auth & tenancy
- Base URL from `NEXT_PUBLIC_API_BASE_URL` (dev: `http://localhost:8000`). School domain from `NEXT_PUBLIC_SCHOOL_DOMAIN`.
- Tokens (`access`,`refresh`) stored in **localStorage** via zustand `persist` (dev; move to httpOnly cookies before launch — noted as TODO). Deliberately localStorage, not sessionStorage — the latter is scoped per tab, which broke opening a dashboard link in a new tab (it saw an empty store and bounced to `/login` despite the user being authenticated elsewhere).
- Axios request interceptor attaches `Authorization: Bearer <access>` — **except on public routes** (`PUBLIC_RULES` in `lib/api/client.ts`): signup, verify-email, resend-verification, login, password-reset request/confirm, refresh, and `POST /api/demo-requests/`. A stale token on a public route causes a 401 — that bug has bitten before. **Rules are `{ path, methods? }`, not bare paths**: `/api/demo-requests/` is public for POST (the marketing form) and authenticated for GET/PATCH (the platform lead queue), and matching on path alone sent the admin's reads out with no header. The same predicate gates the refresh interceptor, so getting it wrong breaks recovery too.
- Decode the access token (`jwt-decode`) for claims: `user_id`, `school_id`, `membership_id`, `personas` (e.g. `["admin","owner"]`), `is_platform_admin`.
- **Multi-tenant:** each school lives on a subdomain (`<slug>.myschoolos.io` — matches the backend's computed `School.subdomain`). Subdomains don't resolve on `localhost` — use a dev fallback (`lvh.me`). Never hardcode the domain — read `env.SCHOOL_DOMAIN`, which made the `schoolos.com` → `myschoolos.io` rename a config change rather than a hunt.
- **Signing in on the apex hands the session to the subdomain** (`lib/auth/handoff.ts` → `/auth-handoff`). The token is portable — the backend validates a signature, not an origin — but `localStorage` is per-origin, so it has to be carried across explicitly. It travels in the URL **fragment**, which never reaches a server; the landing page strips it from history, rotates the refresh token (the backend rotates and blacklists, so the copy that travelled is dead within a second), warms the school store, then hard-navigates. An earlier postMessage/iframe version worked in Chrome and silently did nothing in Safari, which partitions storage for cross-origin iframes. Anyone entering via their own subdomain never touches this: `getCurrentSchoolSlug()` scopes their login from the hostname and they stay put.
- The apex-vs-tenant decision lives in `src/proxy.ts` — **`proxy.ts`, not `middleware.ts`**: Next 16 renamed the convention, and it runs on the nodejs runtime (edge unsupported). It matches `/` only.
- Source `school_id` from the decoded token (fallback `currentSchool.id` in the school-store).
- **`currentSchool` (school-store) reflects other users' edits via refetch-on-mount/focus, not push.** It's written at login/verify-otp/create-school time, and directly by whichever mutation made an edit — a different already-logged-in session (or a second tab) wouldn't otherwise see the change until logout/login. `useSyncSchoolData` (mounted in `DashboardShell`) re-runs `useSchoolProfile`/`useAcademicSessions` (TanStack default: refetch on mount + window refocus) and syncs the result back in via `hydrateSchool`/`updateSession`. This is deliberately not real-time/live — no WebSocket or SSE layer exists in `SchoolOS-backend`, and adding one is out of scope for this workspace (backend is read-only here). A tab left open, focused, and never refreshed still won't pick up another user's change until it refocuses or something else remounts it.

## Domain rules
- **Levels:** `creche`, `nursery`, `primary`, `junior_secondary`, `senior_secondary`. A school picks 1+ at create-school (`levels` array).
- **school_type** (`nursery`|`primary`|`secondary`|`combined`) is **derived** from levels by bands (early=creche+nursery, primary, secondary=jss+sss): one band → that band's value; multiple bands → `combined`. Both are sent; the array carries the truth.
- **Class/subject templates** are filtered by the school's `levels`. Nursery has a subject template; creche has none (add-your-own). Class arms are **optional** (omit `arms` when a class has none — do not send `arms: []`).
- **Grading** is school-configured, one `GradingSystem` per level, via `/settings/grading` — NOT backend-auto-defaulted (there's no seed/template endpoint for it, unlike classes/subjects). `data/grading-defaults.ts` only supplies frontend-side prefill suggestions (a common CA/exam split; WAEC's 9-point A1–F9 scale for senior secondary, a simpler A–F scale elsewhere) — fully editable, not enforced. Components (weights) must sum to 100; ranges must be contiguous and cover 0–100 with no gaps/overlaps — enforced both client-side (`features/settings/schemas/grading-schema.ts`) and server-side (`academic/services.py`).
- **Onboarding resume is forward-only:** the backend stage (`current_step`) is the source of truth; steps before it are read-only (create-only endpoints → re-POST would duplicate). `OnboardingWizard` always seeds itself from the server's `current_step` on load — it has no query-param/deep-link way to jump to an arbitrary step, so anything that sends a user "back into onboarding" should link to bare `/onboarding` and let it resume itself.
- **Every onboarding step is skippable**, not just Branding/Subjects — `advance_onboarding` accepts `skipped: true` for any step in `_ONBOARDING_STEP_ORDER` (records it in `skipped_steps`, still resumable, never sets `is_completed` except on `review`). All four data-entry steps' hooks expose `{ save, isSaving, skip, isSkipping }`.
- **Gating: onboarding is owner-only, enforced on both ends.** Frontend: `canDoOnboarding()` checks `personas.includes("owner")`. Backend: `IsSchoolOwner` (`accounts/permissions.py`) guards the `onboarding`/`advance_onboarding`/`review` actions on `SchoolViewSet`, and `UserService.advance_onboarding` re-checks `membership.is_owner` as defense-in-depth. A non-owner admin gets routed straight to `/dashboard` (`resolve-post-auth-path.ts`) rather than bouncing through `/onboarding`. The dashboard home's setup checklist (`SetupChecklist`) uses the same `canDoOnboarding()` check and renders nothing for non-owners.
- **Dashboard setup checklist vs. backend onboarding state are two different "complete" concepts.** The checklist's own completion (`useSetupStatus`) is derived from real data (branding customized, ≥1 session/class/subject) — a school can be `onboarding_progress.is_completed: true` (wizard finished, possibly via skips) while the checklist still shows real gaps, and that's intentional. Checklist item links route to `/onboarding` while the wizard itself isn't finished (`stage.is_completed === false`), and to their respective Settings pages once it is — routing an unfinished-wizard click straight to a Settings page would let the owner complete the same data without ever advancing `onboarding_progress.current_step`, desyncing the wizard's resume position. The "fully set up" banner's dismissal persists in localStorage, keyed per school (`schoolos-checklist-dismissed:{schoolId}`).

## Design system
- **Palette (CSS vars):** deep pine base (`#0E2A24` ink, `#1E5B4F` primary), amber accent (`#F2A93B`), grass (`#3FA66A`), clean off-white (`#F6F7F3`). The dashboard shell must apply each **school's** `primary_color`/`accent_color` as CSS vars, falling back to these.
- **Fonts:** Bricolage Grotesque (display), Hanken Grotesk (body — legible on cheap Androids), JetBrains/Geist Mono (system labels).
- **Quality floor everywhere:** premium/standard look (Linear/Vercel/Stripe-level), brand-coloured (no rainbow charts), skeleton loaders, designed empty/error states, responsive to ~360px, full a11y (labels, keyboard, focus mgmt, `aria-live`, focus-trap dialogs, contrast, reduced-motion). Sidebar nav is collapsible accordion groups driven by `data/navigation.ts`.

## Phase status
**Built:** scaffold → landing → signup → verify-otp/resend → create-school → login (+multi-school selection, branding correctly hydrates via `GET /api/schools/:id/`) → onboarding UI wired to real APIs (branding, academic session, classes, subjects, review with edit/add/delete — Phase 4.2) → owner-only onboarding gating (frontend + backend) → premium dashboard shell + full navigation IA → dynamic school-color system (sidebar, buttons, charts, icon badges, focus rings, and — via a portal-container fix — modals/dropdowns/mobile nav too, all driven by each school's `primary_color`/`accent_color`) → Dashboard Settings (School Profile, Sessions & Terms, Classes & Arms, Subjects, Roles & Permissions — all five with well-designed, non-onboarding-reused UI: tables/tabs/search where the data warrants it) → invitations (create flows: admin/teacher/parent/student, + roles list for admin-invite `role_id`; part 2: pending-invites list/filter/resend + public accept-invite page) → Staff/Student/Parent directories (read-only list + detail, search/filter/pagination, admin-driven student password reissue) → parent↔student linking (link/unlink from either detail page, via a shared searchable person picker) → forgot/reset password (/forgot-password → /reset-password, mirrors the signup → verify-otp two-page pattern) → School Admins directory (list/detail + role assign/unassign, pairs with Roles & Permissions) → cross-cutting bug-fix pass: cross-tab session persistence (localStorage), Staff→Teachers rename, invite `invalidated` status, shared permission-denied (403) UI, Skip buttons on every onboarding step, and dashboard checklist owner-gating/wizard-resume-routing/dismiss-persistence → refetch-on-mount/focus school-data sync (`useSyncSchoolData`) so branding/term changes made by other sessions show up without a fresh login → Settings > Grading (`GradingSystemViewSet`: one grading system per level, components + grade ranges, full CRUD) → dashboard home's Recent Activity wired to real `GET /api/audit-logs/` data (was 100% mock, capped at 5 entries) → `date_joined_school` shown on Admin/Parent detail pages (already had it on Teacher's) → school switcher wired to real memberships (`GET /api/schools/`, filtered to the caller's own by `SchoolViewSet.get_queryset`) and `POST /api/auth/switch-school/`, replacing the two-school mock. → Audit Log screen (`/settings/audit-log`): day-grouped timeline, free-text action filter over the real 40 action strings, From/To date pickers, actor search, and the first surfacing of `changes` before/after diffs. → duplicate-school warning on create-school (`GET /api/schools/search/`) → one-click "Make current" term action (`POST /api/academic-periods/:id/mark-current/`).

**Since then (daily-ops, all against real endpoints):** Attendance (register + bulk-mark, with a full offline layer — service worker shell precache, TanStack persistence, paused-mutation queue) → Teaching Assignments (arm subject offerings + subject-teacher assignment, bulk-assign in one request) → Results pipeline: Score Entry (per-component score sheet, offline-capable), Result Review (approve/reject), Publish Results (broadsheet lock/unlock), Behaviour Ratings + Principal's Remarks → Report cards (JSON detail, HTML preview in an iframe, single PDF, bulk class-arm PDF/ZIP with skipped-student reporting) + per-level Report Card settings → **Broadsheet** (`/results/broadsheet`: whole arm × all subjects, reconciled against roster and offerings so students with no scores and subjects with no scores are both visible; print-scoped) → **Leaderboard** (`/results/leaderboard`: overall by average, or per-subject within an arm or across a class; dense-ranked so ties share a place).

**Codebase sweep (2026-08-18):** shared `Select` primitive introduced and 20 hand-rolled `<select>`s migrated onto it (fixes the iOS sub-16px zoom on every picker); shared `TeacherPicker` replacing two near-identical hand-rolled teacher choosers; `TermBadge` + `NoCurrentTermNotice` replacing six copies each across the results screens; hardcoded error copy replaced with `<ErrorState>` so 403s stay distinct; `client.ts` public-route allowlist now reads from `ENDPOINTS` instead of duplicating four literal paths; `results/types.ts` and `lib/api/endpoints.ts` split into folders behind barrels. Files over 150 lines went 26 → 4.

**Since the sweep (through 2026-08-24):**
- **Offline cache was corrupting itself.** `shouldPersistQuery` didn't check `query.state.status`, so *pending* queries were dehydrated with a live `promise` that `JSON.stringify` wrote as `{}`; the next `hydrate()` threw and `persistQueryClientRestore` deleted the whole cache, which also meant `resumePausedMutations` never ran and queued marks were never replayed. One offline session poisoned every later one. Fixed, plus `persistKeyFor` now reads the membership from localStorage (`readPersistedMembershipId`) — it was reading a zustand store that reports pre-hydration state inside a `useState` initializer, so the key was permanently `:anonymous` and the per-membership scoping never happened.
- **Service worker no longer registers in development** and tears down anything already installed. `cacheFirst` deliberately never revalidates `/_next/static`, which is right for content-hashed production assets and fatal in dev where Turbopack rewrites chunk URLs on every edit — it served dead chunks while the dev server stayed perfectly healthy and its log stayed clean.
- **Offline gates use `isPaused && !data`,** never `isPending && isPaused` — a *disabled* query is pending with `fetchStatus: "idle"`, so the conjunction silently never fires. That bug left My Classes blank.
- **Promotion** (`/promotion`): source arm → source/target session, per-student destination prefilled from the backend's suggestion, bulk "send everyone to", partial batches, repeaters (assign a same-level arm). Rows lock on `already_in_target_session`.
- **Dashboards:** admin home's three charts were returning hardcoded figures (enrolment 402→486, fees at 82%) rendered identically to the real KPI tiles — now empty with per-chart copy saying *why*. Both homes gained a results block (admin: publish readiness + review backlog; teacher: their own submission status) since attendance had three of four blocks.
- **Report-card remarks reframed.** `CLASS_TEACHER_REMARK` is a top-level `ReportCardSection`, independently togglable from the behaviour ratings — so a remark nested under trait scales read as a conduct note. Both remark screens now show a one-line result context (`StudentResultContext`) and use the card's own section wording.
- **Permission-aware links** — see the convention above.

**Fees (2026-08-24) — the module is complete, in three screens:**
- **Fee Structure** (`/settings/fees`, Settings › Fee Structure): per class × term, create/edit/remove. Built there rather than at `/fees` because that nav item's own description was already *"Configure fee items, amounts, and class-based fee plans"*, and it's configuration — set once a term, not touched daily. `DELETE` deletes *or* deactivates depending on whether payments/waivers reference the item, and returns 204 either way, so the toast stays neutral and retired lines reappear behind a "Show retired fees" toggle.
- **Fees & Invoices** (`/fees`, Finance): the bursar's desk. Search a student → term → live ledger, record payment (capped at the remaining balance), waive/un-waive, per-student payment history with receipt PDFs.
- **Payments** (`/payments`, Finance): two tabs — *Who owes* (class-arm defaulters) and *Payment log* (school-wide, paginated, receipt download). "Automated payment reminders" from the nav description do **not** exist; there's no backend for them.
- **Dashboard wired:** `collection-summary` now feeds the fee chart and the `feeCollectionPct` KPI (previously an honest `—`). The chart's Y axis carried `unit="%"` from its hardcoded-percentage days and would have labelled millions of Naira as `12400000%`; it now formats compact Naira.

**Audit log was silently dropping the acted-upon student's name (fixed 2026-08-24).** `cleanTargetRepr` (`format-audit-entry.ts`) blindly cut every `target_repr` at its last `": "`, on the assumption every repr followed the `str(target)` convention (`"<Type> @ School: id"`) the truncation was built for. `enrollment.updated`'s repr doesn't — it's an explicit, already-finished string (`"Name (ADM): oldClass oldArm → newClass newArm (session)"`) that carries its own legitimate colon with no `@ School` beside it — so the blind cut took the student's name off with it, leaving only the class move. Traced every one of the 82 actions in `audit/enums.py` against its actual call site (explicit `target_repr`/`target_repr_fn` vs default `str(target)`) to confirm this was the *only* one affected — see the comment in `format-audit-entry.ts` for the full reasoning. The fix: only run the colon-cut when the `@ SchoolName` strip actually matched something, since an explicit repr never contains that substring. Verified against real repr strings pulled from the backend source — every `"@School: id"` case is byte-identical to before, `enrollment.updated` now keeps the name.

**Payments → Fees deep link (2026-08-24).** Clicking a student's name in the arrears table (`/payments` → Who owes) now routes to `/fees?student=&period=` and lands directly on that student's ledger for the *same* term they were shown owing against — not the current term, since jumping to "current" could show a different balance than the one that prompted the click. `student-fees-page.tsx` reads those params via `useStudentFeesSelection` (`features/fees/hooks/`), which also keeps the URL a live bookmark of whatever's selected afterwards (mirrors `attendance-page.tsx`'s own arm/date sync) — refreshing or sharing the link returns to the same student, not a blank search box. The id→record resolution runs through `useStudentDetail`, which now takes an optional `enabled` so it can sit idle until a deep link actually needs it.

**Term pickers on the reading screens (2026-08-24).** Review, Broadsheet, Leaderboard and Publish were all hard-locked to the current term. All four now carry a `TermPicker`, defaulting to the current term but free to move; Review also gained class and subject filters. Every one of those endpoints already accepted a period — this was purely a frontend limit.

- **Reading vs writing is the line.** Score entry, behaviour and remarks stay locked to the current term, because a score belongs to the term it was earned in and back-dating one is a correction that belongs to the unlock workflow. *Reviewing, publishing and ranking* a past term are all routine — a school that fell behind still has to lock last term before report cards go out. `use-score-sheets`'s comment about there being no picker still applies, but only to entry.
- **`useTermSelection` (`lib/school/use-term-selection.ts`) is the one source of that state** — seven screens were deriving it inline from the same three helpers. The three fees pages were retrofitted onto it at the same time, so the fallback chain (chosen → current → newest session's first term) can't drift.
- **`TermBadge` turns amber when you're not on the current term.** Publishing is the reason: locking the wrong term is not a mistake to make quietly.
- **`NoTermsNotice` is new and distinct from `NoCurrentTermNotice`.** With a picker, a school whose terms exist but none is marked current is no longer blocked — it falls back to the newest. Only *no terms at all* blocks these screens now. The locked screens keep the original notice.
- **The review queue's truncation warning was comparing against the displayed count.** With a class or subject filter applied that's always fewer, so it would have claimed "this term exceeds the 100-per-request limit" on every filtered view. It now compares against what was fetched.

**Backend catch-up (2026-08-24)** — five capabilities that existed server-side with no consumer:
- **Update Student** (`PATCH /api/students/:id/`) — 18 whitelisted fields, surfaced as **one Edit per card** on the student detail page (Admission / Personal & medical / About) rather than one giant form, because PATCH is partial and nobody should open eighteen fields to fix one allergy. `admission_number` is excluded server-side and absent here — confirmed live that sending it is silently ignored. Blank inputs are converted to `null` (see `toPayload`), because the API and the detail page render `""` and `null` differently. **Gated on `edit_students` OR any teacher** — `useCanEditStudent` mirrors the backend's `CanEditStudentProfile`; the teacher branch is deliberate (a teacher may need to record a medical note for a child they don't teach) and dropping it would hide an action teachers are entitled to.
- **Class arm detail** (`GET /api/class-arms/:id/`) — class context, class teacher, offered subjects and the current roster in one call. New screen at `/classes/[armId]`, reachable by clicking an arm in Settings › Classes. `ClassRowReview` gained a `linkArms` prop, **off by default**, because that component is shared with the onboarding Review step where a link out would drop someone mid-wizard.
- **Student admission-date filter** (`?date_of_admission_after/before`) — added to the directory filter bar. This is when they joined the *school*, not their enrolment into a class for a session; either bound works alone.
- **Audit action catalog** — was 69 entries against the backend's 82, so 13 actions (all of fees and announcements, plus `student_profile.updated`, `enrollment.updated`, `report_card_settings.updated`) fell through to the generic fallback. Now 82/82 with **no drift in either direction**; new files under `lib/actions/` for fees and announcements, plus three new categories. Re-run that diff whenever the backend adds actions — there is still no catalog endpoint.
- **Attendance list date-range filter** (`?date_after/before`) — exists, documented in the endpoint comment, and deliberately **not** wired: `daily-summary` answers the same question by aggregating server-side, and no screen needs the raw per-record span. The list has no `student` filter, so it can't back a per-student attendance history either.

**Announcements (2026-08-24) — one screen, `/announcements`, serving two jobs**, because the API serves two lists from one route. A member holding `post_notices` gets every notice in the school plus compose/edit/delete; everyone else gets a read-only inbox the *server* has already filtered to notices aimed at a persona they hold. Nothing is hidden client-side, and an admin who also teaches still reads their own notices here rather than on a separate screen. Notices aimed at audiences a manager isn't in are marked *"not shown to you"* so they don't read as something missed.

- **TipTap was added to the stack for this** (`@tiptap/react`, `@tiptap/pm`, `@tiptap/core`, `@tiptap/starter-kit` — v3 bundles link and underline, so no extra packages). It is configured in `features/communication/lib/editor-extensions.ts` so it **cannot emit a tag the backend won't keep**: `code`, `codeBlock` and `horizontalRule` are disabled and headings capped at h1–h4. This is not caution — bleach uses `strip=True`, so an unsupported tag loses its markup while its *text survives as bare unwrapped text*. Verified live: a code block came back as naked text, `<hr>` vanished. Widening the editor without widening `announcements/services.py`'s allowlist silently corrupts what people write.
- **`.prose-announcement` in `globals.css` styles both the editor and the rendered notice** from one rule, so the two can't drift. It exists because Tailwind Preflight resets h1–h4, ul, ol and blockquote to nothing — without it an author's structure vanishes visually on publish while remaining in the HTML.
- **The board is day-grouped** ("Today" / "Yesterday" / "Thu, 20 Aug"), reusing the audit log's grouping — which was generalised out to `lib/text/group-by-day.ts` for the purpose, since both screens read as a chronology. It groups consecutive same-day runs in a single pass, so it must only ever be handed a list already ordered by `created_at`, or a day will open twice.
- **Cards are avatar-led**, using `created_by.photo` via the shared `PersonAvatar`. A notice should read as something a person posted, not a row in a table.
- **`category` landed 2026-08-24 and is wired** (`general | celebration | urgent | event`, plus a `?category=` filter). The ask that produced it is kept at [`docs/asks/announcement-category.md`](asks/announcement-category.md) as a template for future ones. Treatment lives in `features/communication/lib/categories.ts`: **`general` renders exactly as it did before categories existed** — no icon, no badge, no colour — and `urgent` is the only one that restyles the card rather than just adding a badge. Keeping the default plain is what keeps the other three meaningful. The compose picker is radios, not a select, so an author posting about a flood can *see* that Urgent exists.
- **Both board filters run client-side**, including category, even though the backend now supports `?category=`. The whole list already arrives in one `page_size=100` request for the audience filter — which has no server equivalent — so filtering the same array twice is one request instead of two and both toggles stay instant. Switch category to the server filter if this ever needs real pagination.
- **Watch for `font-body`** — it doesn't exist. The body token is `--font-sans`, so the utility is `font-sans`. An unknown Tailwind class emits no CSS at all, and `tsc`/`eslint`/`build` all pass while the element silently inherits the wrong face; the category badge inside the `font-display` heading hit exactly this.
- **`getErrorMessage` was fixed while verifying this.** DRF *serializer* validation answers `{"audience_personas": [...]}`, not `{"detail": ...}` — and only the latter was handled, so every such 400 across the whole API showed "Something went wrong" instead of the real message. The fix is purely additive (it only runs where `detail` was absent).

**Three fees gotchas worth remembering** (all confirmed live, all documented in `API.md`):
1. **The ledger has a different gate from everything else.** `GET /api/students/{id}/fees/` sets `required_permission = None` and lets `FeesService._assert_ledger_visible` decide — admin with `view_fees`, **any teacher**, self, or linked parent. Payments and waivers need `view_fees`. A teacher gets 200 on the ledger and 403 on both lists, so those sections are permission-gated in the UI rather than left to fail.
2. **`collection-summary` is gated on `view_analytics`, not `view_fees`** — the only fees route that differs. It shares a query with the enrolment and attendance charts, so its 403 is caught and returned as `[]`; anything else still throws.
3. **An empty defaulters array means "everyone is settled", not "no data".** The endpoint omits any student whose balance is zero.

**A dating correction, made 2026-08-27:** every entry above stamped "2026-08-24" was written on 2026-08-27 — the date got copy-pasted forward from the doc's own prior content instead of read fresh each time. The work itself and its ordering are accurate; only the calendar date on each entry is wrong. Not corrected retroactively (would be a large, purely cosmetic diff); flagged here so nobody dates a decision off it. Everything from this point on uses the real date.

**UI fixes and small wiring, 2026-08-27** — a batch of user-reported issues, each verified against backend source before changing anything:
- **Audit log is now filterable by action, not just free text.** `action-options.ts` derives a grouped dropdown (by category, mirroring the timeline's own icon groups) straight from `ACTION_CATALOG` — so it can't drift from the 82 actions the catalog already knows about the way the icons briefly did. The old free-text `?action=` box asked someone to type `grade_range.created` from memory; gone.
- **Two wording fixes were the same bug in two places.** Both the class-teacher assignment dialog and the admin attendance notice implied attendance-marking needs a class teacher assigned. Checked `attendance/views.py`'s own docstring: *"marking is restricted to any teacher at the school (not just the arm's class_teacher)."* Both were wrong. The assignment dialog's warning now names the real consequence instead — `results/services.py`'s `set_class_teacher_remark` is identity-gated on `class_arm.class_teacher_id`, so with nobody assigned, nobody can write that report-card section. The attendance notice just states the true reason (admins have no override, by design) with no false call-to-action.
- **Teacher dashboard's Classes tile** now says "class arms you teach and/or lead" instead of the vaguer "assigned to". `useMyClasses` already carries `isFormClass` per class, so splitting this into two separate counts (led vs. taught) is a filter away, not a re-fetch, if that's ever wanted instead.
- **Publish Results links to the matching Broadsheet.** Broadsheet gained `?arm=&period=` deep-linking (same pattern as the fees deep link), and Publish Results now has a "View broadsheet" button pointing at the exact arm+term on screen.
- **Student detail page shows results**, defaulting to the current term via the same `useTermSelection` used everywhere else, filterable to any other. Gated on the backend's own privilege check (`view_results` or any teacher) rather than letting a 403 arrive and guessing what it means — a student's own page is reachable by an admin holding `view_students` but not `view_results`, and for that caller a 403 there is a real permission gap, not "not published yet". **Open interpretation call:** "default to the last result" is read as *the current term*, not *the most recently published term ever* — finding the latter automatically would mean probing every term newest-to-oldest until one returns a locked summary, an N-request cost with no backend support. Flagged to the user, not yet resolved either way.
- **Promotion now shows its real validation errors.** `usePromotionPreview`'s 400s (e.g. *"Source and target session must be different."*) were being swallowed by the shared `ErrorState`'s generic "couldn't load" fallback, with a Try Again button that could never fix a rejected input. Added `isValidationError` (a 400 check) to `get-error-message.ts` so `PromotionList` shows the actual message for a genuine validation refusal, while 403s and unreachable-server cases still get `ErrorState`'s own (correct) handling.
- **Sidebar navigation feedback ("still a bit difficult to navigate") was left alone** — no concrete spec was given, and reorganizing nav IA on a guess risks doing real damage to muscle memory across every screen. Needs a follow-up conversation about what specifically is hard to find, before touching `data/navigation.ts`.

**Bulk student import (2026-08-27).** Invitations → Student tab now has a "One at a time" / "Bulk import (CSV)" toggle; the second mode is a 3-step flow (`features/invitations/components/bulk-import-panel.tsx`) mirroring promotion's own preview→commit shape: choose a CSV → preview (applied/skipped tables, nothing written yet — `commit=False` server-side) → confirm (re-POSTs the same `File` object to the real `bulk-import` route) → a result screen with a per-row credentials table plus a "Download credentials" CSV export, for handing out passwords at a scale printing one slip at a time doesn't fit. A "Template" button downloads a starter CSV with the exact header `BULK_STUDENT_IMPORT_COLUMNS` requires, since the backend rejects the whole file on any header mismatch.
- **The two POSTs needed an explicit `Content-Type: "multipart/form-data"` override.** `client.ts`'s instance default is `application/json` for every request; traced through axios's own `transformRequest` source, a `FormData` body under a JSON content-type gets `JSON.stringify`'d instead of sent as a file — this is axios's real behavior, not a hypothetical. Overriding the header per-call avoids that branch; axios then clears it again downstream (`resolveConfig.js`, `isFormData(data)` branch) and lets the browser set the real header with its multipart boundary, same as an unconfigured FormData post would. This was the app's first true file upload, so nothing to copy from elsewhere in the codebase — confirmed by reading node_modules' axios source directly rather than assuming.
- **The credentials CSV export escapes spreadsheet-formula injection** (`bulk-import-credentials-csv.ts`) — a name or admission number starting with `=`, `+`, `-` or `@` gets a leading tab before quoting, since Excel/Sheets would otherwise treat that cell as a formula when the export is reopened. The static template file doesn't need this (its rows are hardcoded), only the export built from the uploaded CSV's own data.
- **Not verified live.** Docker was unresponsive for this entire piece of work — every contract above (the two routes, the response shape, the three account-resolution cases, the fixed column set) came from reading `accounts/views.py`/`serializers.py`/`services.py` directly, not from a round-trip. `tsc`, `eslint`, and a full `next build` (all 76 routes) are clean, and the dev server serves `/invitations` with the new toggle — but no file has actually been POSTed to the backend. First thing to do once Docker's back: upload a real CSV through the UI and confirm the preview and commit responses match what's documented above, especially the multipart header behavior described.

**Parent self-service (2026-08-27).** Parents had a home screen listing their children and a hardcoded "what's coming" list; nothing behind it was real. Now: **Announcements opened to parents *and* students** (one nav change — `AnnouncementsPage` already had a complete read-only branch for non-managers, and `announcements/services.py` already filters by `audience_personas__overlap`, so the whole feature was gated shut by a `staffItem()` that contradicted its own description), and a new **`/my-children` → `/my-children/[studentId]`** pair where a parent reads each child's report card and fee ledger for any term.
- **Everything is reused, not rebuilt.** `useReportCard` + `ReportCardBody`, `useStudentLedger` + `LedgerPanel`, `useTermSelection`/`TermPicker`/`TermBadge`/`NoTermsNotice` — all built for the admin/bursar screens, all generic over a `studentId`, all wired here unchanged. The only shared-component edit: `LedgerPanel.payments` became optional, since it's read solely inside the `canViewFees` branch and a parent has no such query to hand over.
- **The parent's own permission model is "none", and that's the point.** `ChildResultsTab` deliberately does *not* copy `student-results-section.tsx`'s `useIsTeacher() || useHasSchoolPermission("view_results")` gate — that's the *privileged*-caller check, and a parent holds no school permission at all, so gating that way would hide the screen from the only person it exists for. It queries directly and lets `ResultsService.get_report_card` decide (linked-parent allowed, but only once the arm's broadsheet is locked). A 403 there is the ordinary pre-publish state, so the copy says the result isn't published yet rather than `ErrorState`'s "you don't have permission", which would read as a broken account. Fees are the opposite case — balances are live with no lock step — so a plain `ErrorState` is correct there.
- **The detail header reads from `/me`, never `GET /api/students/:id/`** — that endpoint is gated on `CanViewStudents` (admin-with-`view_students` or any teacher), so a parent 403s on it *for their own child*. `useParentChild` matches the route param against `me.parent.student_links` instead, which also means an id that isn't theirs shows "we couldn't find that child" instead of a permission error. Not a security boundary — both endpoints re-check `ParentStudentLink` live on every request — just a better failure.
- **Nav gating verified by exercising the real registry**, not by eye: `canAccessPath`/`getNavGroupsForPersonas` confirm My Children is parent-only (the flat item's prefix match covers `/my-children/<id>` too, same as `/students` covers `/students/<id>`), Announcements now reaches all four personas, and the admin (48 items) and teacher (12) sidebars are byte-identical to before.
- **Student self-service was deliberately NOT built** — see the backend gap below. A student cannot learn their own `StudentProfile.id`, so every self-service endpoint is unreachable for them; a screen would have shown a permanent error. `StudentHome` is untouched apart from gaining Announcements.
- **Not verified live.** Docker stayed unreachable for this work too. Clean `next build` (78 routes, both new ones generated), clean `eslint`, dev server serves every affected route 200, and the nav gating was checked programmatically — but no parent-persona round-trip against the real backend has happened. Worth one click-through as a real parent once Docker's back, mainly for the pre-publish 403 copy and the live link check.

**Parent/student screens redesigned, same day.** The first version rendered only `/me` data, which is a name and an admission number — so the cards read as empty placeholders however they were styled. The fix was a data problem, not a CSS one: **the ledger and report-card responses a parent may already read nest a full `StudentListItem`**, which carries the child's photo and current class, alongside the balance, term average and position. Fetching those per child is what filled the screens.
- **`useChildrenOverview`** fetches ledger + report card per child via `useQueries` (two requests per child, bounded by how many children one parent has), **reusing the exact query keys** `useStudentLedger`/`useReportCard` already use — so opening a child from a card renders from cache rather than refetching what the home screen just loaded. Same pattern as `useTeacherOverview`, including its `isPending && !isPaused` per-item gate so one uncached child can't hang the grid offline.
- **A 403 on the report card is a first-class state, not an error.** It means the arm isn't published yet, so the card says "Not published", the detail tab gets a designed waiting state ("Nothing is missing on your side"), and the snapshot tile shows `—` with a caption. Every tile distinguishes *absent* from *zero* — a `₦0` where "not billed this term" belongs, or a `0%` where "not published" belongs, would each read as a fact and both would be wrong.
- **Only money owed gets colour.** A settled balance is green, an outstanding one is plain ink, and nothing else on the card competes — if every figure is highlighted, the one that needs acting on stops standing out.
- **`RecentNotices` lives in `features/communication/`, not `features/parent/`** — it's an announcements component, and the student home uses it too. Safe on any persona's home because the backend scopes the list by `audience_personas` overlap before it arrives, so it cannot surface a notice its reader shouldn't see whatever screen embeds it.
- **`ordinal()` is new in `lib/text/`** (`3rd in class`, with the 11–13 carve-out). The leaderboard renders ranks too and should use it rather than growing a second copy.
- **Student home gained the notices digest and guardian emails/avatars**, but still no results or fees — that's the missing-`StudentProfile.id` backend gap below, now recorded as a comment in `student-home.tsx` so the absence doesn't read as an oversight to the next person in the file.

**Parent portal restructured around a child switcher, same day (2026-08-27).** The card-per-child layout above was replaced within hours: cards don't scale (a parent with five children gets five cards and no way to focus), and `My Children` under an `Overview` nav group was poor IA. The model is now the one the app already uses for schools — **pick a child once, every screen is scoped to them**.
- **`useSelectedChild` + `parent-store`** hold the choice. Only the id is persisted, never the child record: names, classes and links come from `/me` every load, so a renamed, moved or unlinked child can't be served from a stale copy. The stored id is **resolved against `/me` rather than trusted**, falling back to the first child — `ParentStudentLink` has no soft-delete, so unlinking hard-deletes the row and both services re-check it live; a stale id would otherwise 403 every query on every screen with nothing on screen explaining why.
- **`ChildSwitcher` renders as plain text with one child**, not a disabled dropdown. A control that opens to reveal the only option already shown promises a choice that isn't there — and one child is the common case.
- **Four screens** (`/child/results`, `/child/fees`, `/child/attendance`, `/child/profile`) plus the dashboard, all sharing `ChildContextBar` and `childScreenGuard` — the latter a plain function, not a hook, so it can run after an early return without breaking the rules of hooks.
- **Real analytics, from endpoints that already existed.** `useChildPerformance` asks for the report card once per term in the session (reusing `REPORT_CARD_QUERY_KEY`, so the results screen and dashboard never fetch a term twice) and plots average-per-term. Unpublished terms 403 and are **dropped, not plotted as zero** — a term nobody released is not a term the child scored nothing in — and the card states how many are missing so a short line doesn't read as a dip. Below two points it renders a figure instead of a chart: one dot is not a trend, and early in a session exactly one term is published. `SubjectScoresChart` sorts high-to-low (alphabetical carries no meaning) and accents only sub-40 bars — one "needs attention" colour, not a per-grade rainbow. `FeeProgress` is a stacked bar, not a donut: three parts summing to a known total, with **waived kept separate from paid** because "the school wrote this off" and "you paid this" are different facts.
- **Attendance is a nav item badged "Soon" pointing at `ComingSoon`** — deliberately *unavailable*, not merely unbuilt. `attendance/views.py`'s `get_queryset` returns `qs.none()` to any non-staff caller, so a parent gets a silent empty `200` rather than a `403`, and `attendance/filters.py` has no `student` field. There is no data a screen could show. Both the nav entry and the route file carry that reasoning so nobody "finishes" the screen against an endpoint that will always be empty.
- **Deleted with the restructure:** `/my-children` (both routes — now correctly 404s), `my-children-page`, `child-detail-page`, `child-card`(+skeleton), `child-results-tab`, `child-fees-tab`, `use-parent-child`, `use-children-overview`. The switcher means only the selected child is fetched, so the N-children `useQueries` fan-out went with them.
- **Verified:** clean `next build`, clean `eslint`, no type errors, every file under 150 lines, clean dev log, and the nav gating re-checked programmatically — `/child/*` is parent-only, `/my-children` 404s, and the admin (48 items) and teacher (12) sidebars are unchanged. **Still no live backend round-trip** (Docker unreachable all session), so no real chart has drawn real data.

**Parent parity pass (2026-08-27, same day).** A systematic audit of every admin per-student capability against what a parent may reach, plus the fixes it produced. The full list — including what's blocked and why — is written up for the backend developer at [`docs/asks/parent-portal-gaps.md`](asks/parent-portal-gaps.md).
- **Report card PDF download added for parents.** `students/{id}/report-card/pdf/` sets `required_permission = None` and routes through `ReportCardRenderService.render_pdf` → `build_context` → `ResultsService.get_report_card`, so it applies the *same* linked-parent-and-published check as the JSON call — a parent 200s on it. It renders in the school's own `ReportCardSettings` template for that level, so a parent downloads exactly the document the admin designed under Settings › Report Card Templates. Reuses `useDownloadReportCard` unchanged (it already took a bare `studentId`).
- **The subject bar chart was replaced, not moved as-is.** It went from Results to the dashboard on request, and the form changed on the way: the dataviz guidance is explicit that past ~7 meaning-carrying classes the right answer is a table, not more colour — and a senior arm offers a dozen subjects. It's now `SubjectPerformance`, a sorted meter list: one hue for magnitude (identity was never the job), full subject names with no axis fighting for room, exact scores as text, and no legend needed. The one status colour is a genuine status — a sub-40 score is a fail on every scale in `data/grading-defaults.ts` — and it ships with the words "Below pass" beside it, never colour alone. Recharts is gone from this block entirely; the trend line still uses it, correctly, for change-over-time.
- **The ledger's last column stopped lying to read-only viewers.** `LedgerTable` headed it "Actions" and `LedgerRow` rendered an empty cell for an unpaid row when the viewer held neither `record_fees` nor `edit_fees` — a blank that reads as missing data. It now heads "Status" and shows the row's state for such viewers. This is not parent-only: an admin with `view_fees` but neither write permission had the same dead column.
**Email masking narrowed to teachers and parents (2026-09-01).** School admins are shown in full. They're the customer — the people SchoolOS holds a contractual relationship with and legitimately corresponds with about billing, access and support — so masking their address protected nobody and cost the panel something real. Teachers and parents stay masked: they're a school's own staff and families, and recognising a record is a different need from being able to contact them.

**Marketing anchors were dead on /book-demo (2026-09-01).** The navbar's Product/Features/Pricing/About linked to bare fragments (`#features`), and those section IDs live on the landing page. The navbar now renders on every marketing page, so from `/book-demo` each link pointed at an element that wasn't there and clicking did nothing. Now root-relative (`/#features`): they navigate home and then scroll, and behave exactly as before on the landing page itself. The footer had the same bug for the same reason — it renders there too — so its three real links were fixed with them. Verified in the built output: every anchor on `/book-demo` is root-relative and every target exists on `/`.

**Pilot form opened step 3 already showing errors (2026-09-01).** Arriving at "How to reach you", email and phone were red before the visitor had seen them.
- **The first diagnosis was wrong.** I assumed a zod resolver must validate the whole object on every pass, so step 2's `trigger` would mark step 3's fields, and "fixed" it by clearing them on arrival. It didn't hold: the bug persisted, and RHF's source says `trigger(names)` writes errors for **only** those names (`executeSchemaAndUpdateState` loops `for (const name of names)`). A clue was there all along — if `trigger` hadn't scoped, its return value would have been false and nobody could have advanced past step 2 at all.
- **The real cause: pressing Enter.** A bare `<form>` submits on Enter from any text input, and `handleSubmit` runs `_runSchema()` with no names then assigns `_formState.errors = errors` — the whole schema at once. So typing your name on step 1 and hitting Enter marked every later field invalid, and step 3 opened red without the button ever being pressed.
- Fixed where the behaviour is wrong rather than where it showed: **Enter now means "next" until the last step**, where it submits as expected. Textareas keep Enter as a newline. The `clearErrors` workaround was removed along with its false explanation — a wrong reason in a comment is worse than none.

**Demo requests screen was missing four of its six filters (2026-09-01).** `DemoRequestFilter` exposes `status`, `role`, `student_range`, `state`, `created_at_after` and `created_at_before`; the screen only used status and search. Added the other four as a filter bar, with status kept as chips above it — it's the one people reach for constantly, and burying it in a row of selects would slow the common case.
- A date **range**, not a single date: "leads from last week" is the question, and `created_at_after` alone can't ask it.
- Empty values are omitted rather than sent — django-filter treats an empty param as a real filter on some field types, so `""` is not the same as "no filter".
- The query key now carries the whole filter object; keying on two of six meant different filter sets shared a cache entry.
- **Verified live** against two seeded leads: every filter discriminates (role, student range, state each split 1/1), both date directions behave, and a combination that should match nothing returns 0. Test leads deleted afterwards.

**Platform sidebar collapsed its own group on every click (2026-09-01).** `useSidebarAccordion` re-derives the open group from `findNavItemForPath`, which only searched `NAV_GROUPS` — and `PLATFORM_NAV_GROUPS` is deliberately excluded from that registry because it must not be persona-filtered. So every `/platform/*` route matched nothing, the accordion found no active group, and closed the one that was open. The same gap meant **no platform row ever highlighted**, which nobody had reported but was the other half of the same bug.
- **Split matching from access**, rather than folding the platform groups into `NAV_GROUPS` wholesale. `findNavItemForPath` now searches both — it answers "which row owns this route", used for highlighting and the topbar title. `canAccessPath` keeps a `NAV_GROUPS`-only view, so a platform route can now be *identified* without becoming *reachable*; `/platform/*` stays gated by `PlatformGuard` rather than by the filler personas on `PLATFORM_NAV_GROUPS`.
- **Verified:** all seven platform routes resolve to their row and to the right group (Demo requests/All schools/Revenue → Schools, SchoolOS staff → People, Audit log → Activity); school routes are unchanged including `/students/<id>` → Students; and a teacher still can't reach `/students`.

**Teacher and parent emails masked in the platform directory (2026-09-01).** Adults keep their names — they're the people a platform admin corresponds with, so identifying the record is the point — but the address shows as `ma***@gmail.com`. Recognising a record and being able to contact or correlate someone are different needs, and only the first belongs on a vendor screen.
- The domain is kept on purpose: it tells support whether someone is on the school's own domain or a personal address, and identifies nobody by itself.
- A fixed three asterisks rather than one per hidden character, so the mask doesn't leak how long the address is. Verified across 11 cases including one-character locals, a missing domain, and a 40-character local that still renders `aa***@x.com`.

**Public-path check is now method-aware (2026-09-01).** The demo-requests panel failed with *"Authentication credentials were not provided."* — self-inflicted. `/api/demo-requests/` had been added to `PUBLIC_PATHS` so the marketing form wouldn't attach a signed-in admin's token, but that list matched on **path only**, and the same path serves the platform admin's `GET` and `PATCH`. Every read went out with no `Authorization` header.
- **It broke twice over.** `isPublicPath` is also handed to the refresh interceptor, so on the resulting 401 it declined to retry — believing the path was public. A stale token would have failed to recover for the same reason.
- Entries are now `{ path, methods? }`: absent means the whole path is public, present means only those verbs are. `/api/demo-requests/` is `["post"]`. The predicate takes the request config rather than a bare URL, since axios already carries the method.
- **Verified which requests carry a token**, because this is precisely the kind of rule that fails silently and in the safe-looking direction: POST demo-requests goes without one; GET, filtered GET and PATCH-detail all carry one; login/signup/refresh are unchanged; ordinary traffic is unaffected; and a config with no method defaults to `get` rather than accidentally matching as a public POST.

**Students de-identified in the platform panel (2026-09-01).** A SchoolOS employee could page through every school and see each child's **full name, email, phone, photo, gender, admission number and current class** — no school involvement required. Name + gender + class + photo together identify a specific minor, and supporting a school doesn't need any of it.
- Student rows now show **admission number and class only**. Teachers, parents and school admins are unchanged: they're adults, and they're the people a platform admin actually corresponds with, so identifying them is the point of the lookup.
- The search placeholder changes to "Search by admission number…" on that tab — checked first that `search_fields` includes `admission_number` and that searching one returns the student, so the promise is real rather than cosmetic.
- The screen says why, in one line, rather than leaving the difference to look like a bug.
- **This is display-only and does not solve the problem.** `GET /api/students/` still sends the whole record, so it's in the browser and the network tab regardless. The fix is a reduced serializer for platform-admin reads — `StudentProfileViewSet` already branches on platform vs school context for permissions, so the seam exists. Written up in `docs/asks/platform-student-exposure.md`, including the question of whether the panel needs student rows at all (billing needs a count, which `/schools/financials/` already gives; support needs an admission number, which the reduced shape covers).

**Demo requests wired into the platform panel (2026-09-01).** The backend shipped the `demo_requests` app, so the pilot form's TODO endpoint is now a real contract and the leads have somewhere to be worked.
- **The form needed no change.** Every enum value the backend chose matches what the form was already sending — roles, `student_range`, `best_time_to_call` — and `message` is accepted despite the serializer's comment claiming the frontend doesn't send it. Verified by POSTing the form's exact payload: 201, all fields stored.
- **One path, three permissions.** `POST` is `AllowAny` (the public form, still in `PUBLIC_PATHS` so a signed-in admin doesn't attach a token to it); `GET` needs `view_platform_demo_requests`; `PATCH` needs `manage_platform_demo_requests` and accepts **only** `{status}`. Confirmed live that lead-submitted fields are immutable — sending `school_name` alongside `status` left the name untouched — and that `DELETE` 405s.
- **Built as a work queue, not a table dump.** It defaults to **Pending** rather than All, because the useful first question is "who haven't we called yet". Phone and email are `tel:`/`mailto:` links, since the whole point of the screen is following a lead up. Status is an inline select rather than a dialog: it's the only mutable field, it's reversible, and a confirmation step per row would make the common action the slow one.
- Each row expands for levels, best time to call, and the free-text message — shown in full rather than truncated, since it's usually the most useful thing on the lead.
- The status mutation invalidates **every** filter combination, not just the visible one: moving a lead to "contacted" changes which status-filtered list it belongs to, so refreshing only the current view would leave the others stale behind the chips.
- **Verified:** all six filters (`status`, `role`, `student_range`, `state`, `search`, `created_at_after`) return correctly, the list is paginated with the documented row shape, and the status PATCH round-trips including a 400 on an invalid choice. Test lead deleted afterwards; the table is back to empty.

**The "no current session" bug was a store race, not the hand-off (2026-09-01).** `updateSession` merges into an existing school and **silently no-ops when `currentSchool` is null**. On a fresh origin the store starts empty and `useSyncSchoolData`'s two queries race: whenever the sessions query resolved before the school profile, the term was dropped and the effect never re-ran, because its only dependency was `sessions`. A manual refresh "fixed" it because by then the store was populated and the order stopped mattering.
- **Fixed by making the order irrelevant** — the sessions effect now waits for the school and re-runs when it arrives. Reproduced both orderings in a simulation of the real merge semantics: before, sessions-first yielded `null` permanently; after, both orderings yield the term.
- **The other four writers with the same silent-drop shape** (`updateBranding`, `setLevels`, `setClasses`, `updateSubjectCount`) are all onboarding-only, where the school is hydrated first, so they can't hit it today. Worth remembering they share the hazard.
- **The hand-off now warms the school store** before navigating, alongside the rotation. Both requests run together on a page already showing "Signing you in…". Without it the dashboard painted in the default SchoolOS palette and repainted once the profile landed — and an empty store is precisely what let the race above drop the term.
- **Audit of what else is origin-scoped** and therefore does not survive the move: `schoolos-auth` (handed over), `schoolos-school` (now warmed), `schoolos-query-cache` (refetches — correct, just no warm start), `schoolos-parent` (a parent re-picks their child once), and `schoolos-register-draft` / `schoolos-score-draft` — **a teacher's queued registers and score batches are per-origin**, so anyone who had been working on `www` before this change will not see those drafts on the subdomain. Nothing is lost server-side; they were never submitted.

**Hand-off switched from iframe to URL fragment (2026-09-01).** The postMessage bridge worked in Chrome and did nothing in Safari: Safari partitions storage for a cross-origin iframe, so the bridge wrote to a partitioned bucket the top-level subdomain couldn't read. The whole iframe implementation is removed — bridge route, sender, contract — rather than left behind a flag.
- **Tokens now travel in the URL fragment**, which is never sent to a server (not in the request line, not in `Referer`), so it reaches no log. What it does touch is browser history, and that is handled in order: the landing page strips the fragment with `replaceState` *first*, then stores the pair, then **immediately rotates**. The backend added `ROTATE_REFRESH_TOKENS` + `BLACKLIST_AFTER_ROTATION`; verified live that refresh now returns a new pair and the old token 401s with *"Token is blacklisted"*, so the copy that travelled in the URL is dead within a second. That change needed a **container restart** to take effect — settings are read once at startup.
- **`next` is validated against open redirect.** It arrives from a URL and is echoed into a redirect with a fresh session attached. Verified blocked: `//evil.com`, `/\evil.com` (read as protocol-relative by some browsers), `https://`, `http://`, `javascript:` and bare `evil.com`.
- **Rotation is guarded against StrictMode's double effect** — rotating twice would blacklist the token just stored and log the user straight out.
- **The landing page hard-navigates rather than client-routes**, which is what fixes the reported *"no current session"* bug. The app boots on the hand-off page with an empty auth store; a client route carries that boot forward, and anything that keyed off "no session" at startup — the persisted query cache keys off `membership_id` — stays wrong until a manual refresh. A full load guarantees every store and query starts authenticated.
- **`TermChip` also fixed at the source.** The store holds `null` both for "no term is current" and "we haven't looked yet", so the chip announced *"No current term"* on every fresh boot and corrected itself a moment later. It now shares `useAcademicSessions`' query key (same cache entry, no extra fetch) and stays silent until the answer arrives. A chip that flashes a warning and then retracts it teaches people to distrust it.

**Hand-off raced hydration; fixed with a ready signal (2026-09-01).** The first version sent the tokens on `iframe.onload`, which fires when the child *document* loads — before React hydrates and attaches the bridge's message listener. So the tokens were posted into a void, no ack came back, and it timed out into the apex fallback every time. The bridge was deployed and returning 200 the whole while, which is what made it look like the approach itself had failed.
- **The child now speaks first.** It attaches its listener, *then* announces `HANDOFF_READY`; the apex sends only on that signal. The apex registers its own listener before appending the iframe, so the announcement cannot be missed in the other direction.
- Trusted origins are now enumerated rather than only expressed as a predicate, so the ready announcement is addressed to each apex origin by name instead of `"*"`. It carries nothing secret, but a wildcard target in auth code is the kind of thing that gets copied somewhere it does matter.
- **Verified by simulating both windows** (10 cases): ready → tokens → ack resolves true; tokens are pinned to the school origin and sent *only* after ready; a silent bridge sends no tokens at all and times out to the apex; and a message from a foreign origin triggers neither the send nor the ack.
- **Rotation is not currently possible**, which matters for the fragment fallback: verified live that `POST /api/auth/refresh/` returns `['access']` only — `ROTATE_REFRESH_TOKENS` is unset, so the same refresh token stays valid for its full 7 days. A bridge cannot "immediately rotate" what the backend never reissues. If the fragment approach is ever needed, it needs `ROTATE_REFRESH_TOKENS: True` **and** `BLACKLIST_AFTER_ROTATION: True` (plus the `token_blacklist` app) first, or the exposed token simply survives.

**Cross-subdomain session hand-off (2026-09-01).** Signing in at `www` now lands on `<slug>.myschoolos.io/dashboard`, restoring the school-specific URL that the removed redirect used to attempt — but moving the session across instead of assuming it travels.
- **The token was never the problem.** It's a JWT validated by signature; the backend has no idea which origin holds it, and one minted via `www` works identically from `fgc.` (demonstrable from Postman). What doesn't cross is `localStorage`, which is per-origin. So the tokens are handed over explicitly.
- **Not via the URL, and the token lifetimes are why.** `ACCESS_TOKEN_LIFETIME` is 60 minutes but `REFRESH_TOKEN_LIFETIME` is **7 days**, and both have to travel or the session dies at the first refresh. A query string reaches Vercel/Cloudflare logs and the `Referer`; a fragment avoids both but still lands in browser history, readable by any script on the destination page before it's stripped. A seven-day credential in the history of a shared staffroom machine is not worth a nicer URL.
- **postMessage into a hidden iframe** on the school's origin instead: tokens never touch the URL, never enter history, never reach a server. `targetOrigin` pins the recipient; the bridge checks `event.origin` coming in.
- **The origin allowlist is the security boundary.** Only the apex may hand a session to a subdomain — deliberately *not* other tenant subdomains, which would otherwise let one school plant tokens on another's origin. Verified: `fgc.myschoolos.io` and `graceland-collage.myschoolos.io` are both rejected, as are `myschoolos.io.evil.com`, `wwwXmyschoolos.io` and plain-`http` variants.
- **Fails closed, never blocks access.** No ack within 2.5s — bridge undeployed, storage partitioned, network gone — and the user simply stays on the apex with a working session. The nicer URL is the only thing ever lost.
- `/auth-bridge` is a top-level route so it inherits no shell and no `AuthGuard` (a guard would bounce it to `/login` before it could receive the session it exists to receive), is `noindex`, and renders nothing. Confirmed in the build output; `proxy.ts` only matches `/`, so it passes through untouched.
- **Unverified:** Safari storage partitioning. `www.` and `<slug>.` are the same site, so the iframe should get normal first-party storage rather than a partitioned bucket, but that can't be tested from here. If it does get partitioned the hand-off simply fails closed and the user stays on the apex.
- Context: the tenant worker fix shipped, so `fgc.myschoolos.io/` now 307s to `/login` with `x-schoolos-routing: tenant host=fgc.myschoolos.io`. Anyone entering via their own subdomain was already staying there; this closes the last gap, which was the marketing site's Log in link.

**Post-login subdomain hand-off removed (2026-08-31).** *(Superseded 2026-09-01 — the hand-off is back, carrying the session across rather than assuming it travels. The constraint below is why, and still holds.)* Reported as "after logging in at www I don't see my school's subdomain". Investigating it found the reverse of a cosmetic problem: the URL staying on the apex is the path that *works*, and the one case that did redirect was silently logging people out.
- **Tokens live in `localStorage`, which is scoped per origin.** `www.myschoolos.io` and `fggc.myschoolos.io` are different origins, so `window.location.href = "https://<slug>.myschoolos.io/dashboard"` delivered the user to their subdomain with an empty token store, and straight back to `/login`.
- **It only fired when the caller already knew the slug**, which on the apex meant the multi-school picker alone — so it hit exactly the users with more than one school. Two such accounts exist (`p@gmail.com`, `ayibakep@gmail.com`, both `fgc` + `graceland-collage`). A single-school user never had a slug to redirect with, which is why the reported symptom was a wrong URL rather than a failed login.
- **A third instance: switching school from a subdomain.** `use-switch-school` passed the *new* school's slug and then hard-navigated — so switching from `fgc.` to `graceland-collage.` crossed origins too. It wasn't in the first grep because it never referenced `external`; `tsc` caught it when the argument was removed.
- **The apex is now the canonical app host.** Subdomains still work for anyone who goes to one directly — `getCurrentSchoolSlug()` reads the host and scopes their login automatically, and they stay put. What's gone is the forced hop. `external` was removed from the resolver contract entirely rather than left always-false, along with `lib/tenant/school-url.ts`, so nobody rewires a redirect without first solving the session.
- **Reinstating it needs the session shared across subdomains** — a cookie scoped to `.myschoolos.io`, ideally httpOnly and set by the backend. That's the real fix if the subdomain URL matters commercially; until then, crossing origins mid-flow logs people out.
- **Verified** by executing the real `resolveNextStep` against the apex hostname before and after: the multi-school case went from an absolute cross-origin URL to `/dashboard`, and no path can now return an absolute URL. **Not verified in a browser** — there is no browser automation in this project, so the session loss itself is inferred from per-origin storage rather than observed.

**Pilot contact step simplified (2026-08-31).** The "how should we reach you?" chooser is gone, along with WhatsApp as a named channel. Email and phone are both required, and a free-text box was added.
- **Both details rather than one.** The chooser asked for only the matching field, which was tidier but left a single route to the school; taking both is also a simpler question to answer than one that changes the form beneath you. The zod `superRefine` that made the requirement conditional went with it — validation is back to plain per-field rules.
- **The free-text field is the only place someone can say something the form didn't think to ask** ("we run three campuses", "we're mid-term, can you wait"). Last, clearly optional, capped at 1000 characters.
- `best_time_to_call` stayed — it's a time, not a channel, and wasn't part of the removal.
- **Verified:** 13 schema cases, including both details missing (both flagged), the prefilled `+234` still treated as empty, and the message boundary at exactly 1000 and 1001 characters. Confirmed no `whatsapp` / `contact_method` reference survives anywhere in the feature or the built page.

**Pilot form reworked into three steps (2026-08-31).** One long column became *About you* (2 fields) → *Your school* (5) → *How to reach you*, with a step counter and progress bar so it doesn't read as open-ended. `Next` validates only the fields on screen via react-hook-form's `trigger`, and is `type="button"` — a submit there would run the whole schema and surface errors for steps the visitor hasn't reached yet.
- **Contact channel is chosen, not assumed.** WhatsApp / Email / Phone call, and only the matching field is then asked for — picking Email shouldn't require a phone number. The mapping lives once in `CONTACT_METHODS` (`field`, `inputLabel`, `hint`), read by both the schema and the form. Enforced with a zod `superRefine` that attaches the error to the field the visitor can actually see. The success state names the channel they picked, since promising WhatsApp to someone who asked for email is a small broken promise and the last thing they read.
- **A real bug the tests caught: `08012345678` was rejected.** The inherited E.164 pattern required a leading 1-9, so the way a Nigerian actually writes their own number failed validation — exactly the "argue with a prospect" failure the loose validation was meant to avoid. `lib/phone.ts` now accepts a leading 0 and normalises the one unambiguous case (11-digit local mobile → `+234…`). Deliberately narrow: a `+44` number passes through untouched rather than having a country code guessed onto it. 13 schema cases and 11 phone cases verified.
- Levels now says **"Choose all that apply"** — the cards look like a single choice, and a school running nursery through SSS should tick four.

**Pilot signup page at `/book-demo` (2026-08-31).** Public marketing page in the `(marketing)` group, framed as joining a free pilot rather than a generic contact form. Every marketing CTA now points at it: hero, final CTA, navbar "Start free", both pricing tier CTAs, both "Book a demo instead" links, and the attendance wedge.
- **⚠️ The endpoint does not exist.** `POST /api/demo-requests/` returns **404** — verified live and against the router registry, which registers no demo/pilot/lead route. The payload shape is an assumption too. Isolated behind one function (`features/pilot/api/demo-requests-api.ts`), one payload type and one endpoint constant, all marked TODO, so repointing at a real endpoint, a form service or a webhook is a single-file change. **The page will fail on submit until the backend lands** — this is a deliberate build-ahead, not a working funnel.
- **Public route, no token.** `PILOT_ENDPOINTS.DEMO_REQUEST` is in `client.ts`'s `PUBLIC_PATHS`, so a signed-in admin who opens the page doesn't attach their Bearer token to a marketing enquiry. Verified against the real `isPublicPath` logic.
- **Reuses the onboarding components rather than copying them**: `StateSelect` (the same 36+FCT list, 37 options confirmed in the built HTML) and `LevelsSelect` (the same five level values the rest of the app stores), wired through react-hook-form's `Controller` exactly as create-school does. Option values for roles, size bands and levels are derived from the data files inside the zod schema, so adding an option can't leave validation behind.
- **Phone is required and validated loosely on purpose.** It's prefilled `+234` and labelled "Phone number (WhatsApp)" because that's the follow-up channel. A marketing form should let a real number through in an unexpected format rather than argue with a prospect; the prefill and the label do more for correctness than a strict pattern would. `inputMode="tel"` gives the numeric keypad without stripping the leading `+`.
- **`(marketing)/layout.tsx` gained the Footer** its own TODO asked for, plus `pt-20` to clear the fixed Navbar. No double-up: the landing page composes Navbar and Footer itself and sits outside the group.
- **Left as anchors deliberately:** the two "See a sample report card" / "See how it works" wedge CTAs still scroll to the final CTA — they promise a look at the product, not a signup form.

**Optional links on teacher and parent invites (2026-08-30).** Backend commit `ff65937` added `class_arm_ids` to invite-teacher and `students` to invite-parent, both optional and both applied inside the same atomic call. Consumed on both forms.
- **The container was serving pre-pull code for four hours**, and the failure mode was invisible: DRF silently drops unknown fields, so the stale server returned **201 "Teacher invited successfully"** while assigning nothing — even `"class_arm_ids": "not-a-list"` came back 201. It read as "the feature isn't there" rather than "the process is stale". **After pulling backend changes, restart the container**; the autoreloader isn't catching them. Diagnosed by comparing container start time (18:33) against file mtime (22:11).
- **`class_arm_ids` is plural**, so one invite can seat a teacher on several arms. The picker is a new `ArmMultiSelect` rather than a change to the shared single-select `ArmPicker`, which 13 screens use.
- **It warns when an arm is already taken.** `assign_class_teacher` replaces an existing class teacher silently, and the invite path inherits that — so picking a held arm quietly removes someone. The arm payload carries `class_teacher`, so each row says who would be displaced. This is the one consequence on the form that unticking a box afterwards doesn't undo.
- **The arm section only appears for `class`/`both` types**, and ids are dropped if the admin switches to `subject` — the backend 400s that combination and creates nothing. Type is mirrored into local state via the radio group's own `onChange` rather than `watch()`, which trips `react-hooks/incompatible-library` (the same reason the selected-card styling uses `has-[:checked]`).
- **Relationship is per child, not per invite** — required server-side with no default, and a parent can be mother to one pupil and guardian to another. Students already added are filtered out of the search, since a duplicate rejects the whole invite rather than being skipped.
- **Verified live, all six paths:** teacher + 2 arms (201, both assigned), subject-type + arm (400), duplicate arms (400), parent + 2 children (201, correct relationships and primary flag), child missing relationship (400 from the nested serializer), duplicate child (400). Failed invites left **no user behind**, confirming the rollback. All 12 test users and their tokens deleted afterwards, and both arms returned to unassigned.

**Personal profile built (2026-08-30).** `/profile`, linked from the user menu, was a `ComingSoon` placeholder promising "account details, password, and notification preferences". It now shows what the school actually knows about the signed-in person, and nothing it can't back up.
- **Read-only by necessity as much as by choice.** `/api/users/` is POST-only and there is no self-update endpoint anywhere, so nothing here is editable. That settles the design: it's a page about your record, not an account-settings screen — the old placeholder's promise of password and notification controls described screens that don't exist.
- **Everything comes from the already-cached `/me`**, so the page costs no extra request. Account block (name, email + verified, phone, created), school block (school, subdomain, location, levels, and the *membership* join date, which differs from account creation for anyone invited), then one card per active persona — personas aren't exclusive, and this account is admin **and** teacher.
- Personas are read off the membership booleans, not the JWT's `personas` claim: the claim is baked at login and goes stale the moment someone gains a second persona.
- **Fixed a real pre-existing bug while here:** the topbar titled every detail route "Dashboard". It used `getNavItemByHref`, an exact-href match, so `/students/<id>` was headed "Dashboard" while the sidebar highlighted Students. Switched to `findNavItemForPath` (longest-prefix, the same rule the sidebar highlight already used). `/profile` isn't in the nav registry at all, so it gets an explicit `OFF_NAV_TITLES` entry.

**Search and notifications off the dashboard header (2026-08-30).** Both out of the MVP. Neither worked anyway, which is the stronger reason: `TopbarSearch` was an input with no handler and no results behind it (plus a ⌘K shortcut that focused it), and the bell's feed was hardcoded copy until it was emptied. A control that invites a click and does nothing costs more trust than the gap costs. Components kept in place rather than deleted, so restoring is re-adding two lines. Layout unaffected — `ml-auto` on the actions group already did the work the search's `flex-1` was doing.

**Unbuilt modules hidden from the sidebar (2026-08-30).** The 24 `soon` items were showing with a "Soon" badge; they're out of the MVP, so they're now hidden outright. Admin sidebar goes **52 items to 28**, and 10 groups to 6 — Operations (8 items) and Insights (2) disappear entirely, being wholly unbuilt. Teacher goes 16 to 9; parent and student to 6 each.
- **The `soon` flag was verified accurate in both directions before trusting it**, since the dangerous failure is hiding a screen that works: all 24 flagged items render only a `ComingSoon` placeholder, and all 40 unflagged ones are real pages. Neither list had an exception.
- **Filtered in `isVisible` (sidebar) rather than `itemAllowed` (access).** Putting it in `itemAllowed` was the first attempt and was wrong: that function also backs `canAccessPath`, so an old bookmark to `/timetable` would have hit *"This page isn't available to your account"* — blaming the reader's permissions for a feature that just doesn't exist. The routes still resolve and still land on the placeholder, which explains itself. What's removed is the invitation to click, not the page.
- `getNavItemByHref` and `findNavItemForPath` read the unfiltered registry, so the placeholder pages still resolve their own label and description, and the topbar still titles them correctly.

**Landing anchors never had targets (2026-08-30).** Reported as a regression from the custom-domain deploy; it wasn't. The navbar has always linked to `#product`, `#features`, `#pricing` and `#about`, and every "Book a demo" CTA to `#demo`, but **no element on the page carried an `id` at all** — confirmed by fetching the live HTML, where the only ids present were auto-generated Radix ones. Nothing to scroll to, on any host, ever. Added the five ids to their sections.
- **Each also needs `scroll-mt-24`.** The Navbar is `fixed`, so an anchor without scroll-margin lands with the section's own heading underneath the header — the fix that looks like it worked but didn't. `html` already had `scroll-smooth`.
- Footer's "Features", "Pricing" and "About" were `href="#"` and now point at the real sections. Six others stay `href="#"` because no such page exists (What's new, Blog, Contact, and the three legal pages). A link that scrolls the reader back to the top reads as broken, so those want real destinations or removal before launch.

**Page titles printed the brand twice (2026-08-30).** The root layout sets `template: "%s | SchoolOS"`, which appends the brand to every title. 79 pages also hardcoded it, so the build was emitting `<title>Dashboard — SchoolOS | SchoolOS</title>`. The auth pages were already correct (bare `"Log in"` → `Log in | SchoolOS`), which is what made the inconsistency visible. Suffix stripped from all 79; titles now read `Dashboard | SchoolOS`.
- **This was a scripted edit, against the standing rule not to bulk-rewrite TSX** — justified because it touches only a `title:` string literal, never JSX, and because all 79 were confirmed byte-identical in shape first (`title: "<NAME> — SchoolOS"`, zero exceptions, none outside a `title:` line). Verified three ways rather than trusted: every one of the 79 lines diffed against a pre-edit snapshot (79 matched, 0 mismatches), then a clean rebuild, then the **rendered** `<title>` read back out of the build output — 47 prerendered pages, 0 containing the brand twice.

**Landing page claims cut back to what ships (2026-08-30).** Em dashes removed from every piece of marketing prose except `HERO.subheadline`, which keeps one deliberately. The four `"—"` cells in `HeroResultsPanel` stay: they're empty-value placeholders in the mock results table, not prose, and blanking them would leave holes in the grid.
- **The bigger half was accuracy.** The page was selling a lot that doesn't exist, checked against the API rather than assumed. Removed: Paystack/Flutterwave (`PaymentSource` calls them "reserved slots", unused "until gateway integration lands"), every SMS and WhatsApp claim (no messaging backend at all, and `send_sms` grants nothing), installment plans (no such concept), "withhold cards for fee defaulters" (the defaulter list is real; nothing gates a report card on fees), bank-statement reconciliation, Excel export of fees (no endpoint, and the only CSV code in the app is the bulk-import flow), assignment resource sharing, and parent-to-school messaging. Each was replaced with something real and comparable rather than just deleted — waivers, receipts, the defaulter list, the parent portal, teacher notes.
- **`CapabilityGrid` was the worst of it**: headed *"Also included"* over six features, **none** of which are built. Now headed "On the roadmap" with a Soon badge on every item. A visible roadmap still sells; six false claims don't.
- **The hero itself claimed "collect fees online" and "keep parents updated automatically"** — a payment gateway and a notification system, neither of which exists. Reworded to "track every naira of fees" and "give parents their own login", keeping the em dash in place.
- **Left for a business decision, not a copy one:** the Growth pricing tier is almost entirely unbuilt (timetable, CBT, HR/payroll, admissions, online payments). Each now carries an explicit "(soon)", which is honest but makes the tier look thin against Starter. Transport was dropped from it entirely since it isn't on the near roadmap. Whether Growth should exist yet, or be repriced, is the owner's call.
- **Deliberately kept:** the FAQ's "Phone and WhatsApp support" — that's a human answering a phone, not a product feature, and the distinction matters. Likewise the NDPA data-export commitment, which is a policy statement rather than a UI claim.

**Nav is permission-gated (2026-08-30).** Persona gating was the only access rule the sidebar knew: `NavItem` declared `personas` and nothing else, so a restricted admin — a Bursar role holding only fee permissions — saw the **complete** 52-item admin sidebar and got a permission error on nearly every screen. Latent rather than live (every role in the database is a full 27/27 Owner), but the Roles editor is already shipped and clickable, so the first school to use it would have found this with no warning. **No backend work was needed** — `/auth/me/` already returns `admin.school_admin_role.permissions`, and `useHasSchoolPermission` was already reading it for 16 button-level checks; nav simply never got wired to it.
- **Permission qualifies the admin persona only.** Attendance and the results screens are `staffItem` (admin + teacher). Gating those on a permission outright would have stripped them from every *teacher's* sidebar — a teacher holds no admin role, so an admin permission has nothing to say about their access. `itemAllowed` returns early on any non-admin persona match.
- **Unknown is not denial.** Permissions arrive over the network, so there's a window on first login where the answer is "not yet". `PermissionSet` is `string[] | null`: null means allow, so the sidebar doesn't blank and refill. `[]` is different and real — a roleless admin genuinely has none (`school_admin_role` is nullable), and gets the gated items hidden. `useSchoolPermissions` is the single place that distinguishes the three states, so the sidebar, `RouteAccessGuard` and `useCanAccess` can't drift.
- **Only nine items are gated, and each was checked rather than assumed.** Every viewset was asked what it requires for `list`: just 8 endpoints require anything. Classes, subjects, attendance, scores, results, announcements, payments and grading are readable by any school member, so gating them would have hidden pages that work — the same "a literal that gates a render is a silent-failure site" trap. Gated: Students (`view_students`), Teachers + School Admins (`view_staff`), Parents (`view_parents`), Fees + Payments + Fee Structure (`view_fees`), Roles (`manage_roles`), Audit Log (`view_audit_logs`).
- **Verified:** 20 cases over the real nav registry — owner unchanged at 52 items and teacher unchanged at 16 (no regression), a Bursar keeping the three fee screens and losing the other six, a roleless admin losing all nine, and `canAccessPath` agreeing with the sidebar on every one including nested detail routes, so a hidden link isn't still reachable by URL.
- **Not done:** seven permissions gate nothing server-side (`delete_students`, `delete_staff`, `delete_fees`, `edit_staff`, `edit_attendance`, `export_fees`, `send_sms`) — grantable in the Roles editor and granting nothing. `edit_attendance` is the most misleading: marking is teacher-only by design, so no admin can ever mark a register whatever is ticked. None maps to a nav item, so gating was unaffected. Backend's call whether to implement or drop them.

**Bulk subject edit built (2026-08-30).** `PUT /api/subjects/bulk-update/` was the one backend capability a full route audit found unconsumed (130 routes; the other five unmatched were redundant detail routes). Settings → Subjects now has a **Bulk edit** mode: every field editable inline, plus row selection with *Mark core / Mark elective / Move to level* so the actual job — "these fourteen are core" — is three clicks instead of fourteen.
- **Drafts span every level, not just the filtered view**, so edits survive switching level tabs and one save can cover several levels. That creates a trap: a row edited under one tab can be filtered out of sight while still counting toward the save, or still blocking it. Both are reported as *"N not shown here"* / *"clear the level filter to see them"* rather than leaving the button dead with no visible cause — the same silent-failure class as `isSyntheticEmail`.
- **The endpoint reports every conflict as one unattributed `{detail}` string** for the whole payload, so a 40-row edit fails with no indication of which row. `validateDrafts` reproduces the uniqueness rules per row so errors land on the field that caused them. Only changed rows are sent, with only their changed fields.
- **It is deliberately stricter than the backend's own checks, because those are wrong.** The service exempts rows inside the submitted set from each other — which reads as permission to swap two subjects' names in one save — then saves row by row inside its transaction, so the first save collides with the second row's not-yet-changed name. **Verified live: a swap returns a 500 IntegrityError, not a 400**, and whether it fires depends on payload order. The UI blocks the swap up front and says to do it one save at a time. **Reported to the backend as a bug.** Case-sensitivity was checked the other way and left permissive — the constraint really is case-sensitive, and "arabic" alongside "Arabic" was accepted live, so validating case-insensitively would have blocked a legal edit.
- **Verified:** every error path probed live (duplicate ids, duplicate pairs, outside-set collision, bad level, empty list, id-only no-op); 15 unit cases over the diff/validation logic; a realistic 5-subject apply + revert against the real database, left exactly as found. Deactivated subjects are excluded from edit mode — the endpoint looks up active rows only and would reject the whole atomic call.

**Three dashboard mocks removed (2026-08-30).** The trial countdown was hardcoded — `getTrialStatus()` returned `{ isTrialing: true, daysLeft: 24 }` to every school, forever. So a **subscribed** school was told it was on trial, and an **expired** school — whose writes are already being refused — saw a comfortable 24-day countdown instead of a warning. The mock's own comment said billing wasn't built; it has been for two days.
- **Now derived from real data with no extra request.** `useAccessStatus` reads the school profile `useSchoolProfile` already fetches, which carries `access_status`, `trial_ends_at` and `subscription_ends_at`. Verified against the live payload plus five edge cases: subscribed, expired, ends-today, subscribed-with-no-end-date, and a teacher's response.
- **The expired state is now surfaced, which the mock could never do.** An expired school can't take a register, enter a score or record a payment — every write refuses. Both the sidebar and the dashboard header now say so, with a link to Subscription. Discovering that one failed save at a time is the outcome this prevents.
- **Non-admins get nothing, correctly.** The backend omits every billing field for a caller who isn't an active admin (verified: a teacher's `/schools/{id}/` response contains none of them), so `useAccessStatus` returns null and both widgets render nothing — "not yours to see", not "not set".
- **Two further mocks were fabricating school data outright.** `getUpcomingEvents` returned three invented calendar entries; `getNotifications` returned *"5 students have overdue fee balances"*, *"Second Term results are ready to publish"*, and — the same fiction again — *"Your free trial ends in 24 days"*. Indistinguishable from real: a school would have gone hunting for those five students. Both now return empty, so the widgets fall through to the honest empty states they already had. **A truthful blank beats a convincing fiction.** Events need a backend module that doesn't exist; notifications don't — arrears, publish-readiness and access status are all already fetched in this app and could drive a real feed client-side, which is worth doing as its own piece.

**Teacher notes on students built (2026-08-30).** A backend feature (`/api/student-notes/`) that had shipped with no frontend consumer. Free-form notes a teacher writes about a student, **persisting across class, session and teacher changes** — the point is handover: next year's teacher inherits context instead of relying on someone remembering to pass it on. Lives on the student detail page, which both `/students/{id}` (admin) and `/my-students/{id}` (teacher) render.
- **Every permission rule probed live with single-persona tokens before building**, because the model's rules are unusually asymmetric: any teacher may write about **any** student (not just their own class — deliberate, so a subject teacher's observation isn't gatekept by a current teaching relationship); only the **author** may edit, including against admins; delete is the author **or** an admin with `edit_students`; an admin without a teacher profile gets **403 on create** (confirmed).
- **Parents and students get `200` with `count: 0`, not a 403.** `visible_notes` returns an empty queryset for them, so a naive reuse on a family-facing screen would render "no notes" rather than an error. Documented on the endpoint constant, since that failure would be silent.
- **`/me.teacher.id` turned out to exist** — checked rather than assumed, having been bitten by the missing student id. It's the TeacherProfile id, which is what `note.author.id` holds, so "is this mine" is a direct comparison rather than a fragile name match. Added to `MeTeacherBlock`.
- **`author.id` is null once that teacher's profile is removed** (`author_name` is snapshotted so attribution survives). At that point nobody can edit the note and only an admin can clear it — `useNotePermissions` checks the null explicitly rather than comparing a possibly-undefined id, which would have made every note look editable to a non-teacher.
- **A plain textarea, not TipTap.** The backend stores unformatted text; a rich editor would imply formatting nothing renders. Line breaks are preserved (`whitespace-pre-wrap`) since they're the only structure a note has.
- **Each note shows the class the student was in *when it was written*** — on an older note that's the point, since it says which year and whose vantage the observation came from.
- **Types went to `types-notes.ts`, not `types/notes.ts`** — `students/types.ts` is a plain file, so a sibling `types/` directory would make the module ambiguous. Matches onboarding's existing `types-review.ts`.

**Class arm / subject deactivation consumed (2026-08-30).** The backend stopped cascade-deleting history: deleting an arm or subject that has scores, attendance, results, enrollments or offerings against it now **deactivates** the row (`is_active: false`) instead of removing it. Both outcomes return 204 and the body doesn't say which happened.
- **Verified live before building, not taken from the handoff.** Created a second arm, gave it a subject offering, deleted it: 204, still listed in `GET /classes/` with `is_active: false`, still retrievable by id, and `PATCH` / `assign-class-teacher` refused with *"Cannot update a deactivated class arm."* Also confirmed `is_active` appears on nested arms, on `/subjects/`, on the arm detail, and on the `subject` nested inside assignments and offerings — but **not** on the flattened `class_arm_id`/`arm_name` those rows carry, exactly as documented. Test data removed afterwards.
- **One choke point covered thirteen screens.** Every arm picker in the app goes through `buildArmOptions`, so a new `pickableArms` (real **and** active) applied there filtered deactivated arms out of enrolment, promotion, attendance, score entry, broadsheet lock, leaderboard, remarks, trait rating, arrears, add-student and teaching assignments at once. `realArms` deliberately keeps returning deactivated arms — the split between the two is the entire point: **management screens must list them, pickers must not offer them.**
- **A missing `is_active` means active.** `isActiveArm`/`isActiveSubject` test `!== false`, so a response predating the field reads as live. Defaulting the other way would have emptied every picker in the app the moment a stale backend answered.
- **`soleArmId` had a subtle hole:** it fell back to `klass.arms[0]` for a class with no real arms, which would hand back a *deactivated* placeholder. Now it searches for an active one and returns null if there isn't one.
- **Delete toasts said "Removed", which the UI then contradicted** — the row reappears a moment later wearing a Deactivated badge, because `useMutationWithToast` already invalidates (so checklist item 5, "refetch after delete", needed no work). Now "Removed from active use", true whichever path the backend took. The arm delete confirmation also explains the two outcomes rather than only warning about enrolled students.
- **Checklist items 5 and 6 were already satisfied by existing architecture** — the shared mutation helper invalidates on success, and `getErrorMessage` surfaces `detail` verbatim, so the new 400s ("Move them first", "Resolve them first") already render as written.
- **Verified the split with a fixture** covering an active arm, a deactivated arm, an arm with the field absent, an active placeholder class and a deactivated placeholder class — pickers exclude the dead ones, management keeps them, `soleArmId` returns null rather than a dead id.
- **Two follow-ups reassessed rather than built on assumption.** The handoff suggests badging deactivated arms on the subject-assignment and class-arm-subject history screens. **That case is unreachable:** those screens are scoped to an arm chosen from `buildArmOptions`, which now excludes deactivated arms — so a deactivated arm's rows can never render there, and the join the handoff proposes (or the extra backend field) would buy nothing. Deactivated **subjects** on an active arm *are* reachable, and now carry the badge on `SubjectCoverageRow`: without it a dead subject reads as a live one that merely lacks a teacher, when in fact no teacher can be assigned and no score entered against it.
- **The class-level 400s needed no new plumbing** — `useMutationWithToast` → `getErrorMessage` already shows `detail` verbatim, and those messages name the offending arms and the next action. What *was* stale is the confirmation copy: "This removes the class and any arms" described the old cascade behaviour, which is precisely what this backend change stopped doing. It now says deletion only works while a class is unused, and that a refusal changes nothing.

**Domains corrected and tenant-root routing added (2026-08-29).**
- **`NEXT_PUBLIC_SCHOOL_DOMAIN` was `schoolos.com`, but the backend computes `School.subdomain` as `{slug}.myschoolos.io`** (confirmed live: `fgc.myschoolos.io`). That value drives `buildSchoolUrl`, `getCurrentSchoolSlug` and `resolveNextStep`'s apex check — so the post-login tenant handoff was pointing at a domain that isn't ours. Fixed in `env.ts`'s default, both env files, `slug-field.tsx`'s preview, and the stale `schoolos.com` in the root layout's `metadataBase` and the footer's support address. The API base URL's commented-out Railway host was replaced with `https://api.myschoolos.io`. The one remaining `schoolos.com` in the tree is the deliberate historical note in `is-synthetic-email.ts`.
- **Tenant roots now redirect to `/login` server-side**, so the apex keeps serving the landing page and `fgc.myschoolos.io/` goes straight to login with no flash of the wrong page.
- **It's `src/proxy.ts`, not `middleware.ts`.** Next 16 deprecated the `middleware` file convention and renamed it to `proxy`, with the export renamed to match (`node_modules/next/dist/docs/.../upgrading/version-16.md:625`). There is no `middleware.md` in this version's docs at all — only `proxy.md`. The old name still works but warns, and `proxy` runs on the **nodejs** runtime; edge is explicitly unsupported there. Exactly the case `AGENTS.md` exists to catch. The build confirms it as `ƒ Proxy (Middleware)`.
- **The apex/tenant decision is shape-first, not config-first — and that was a bug fix, not the original design.** The first version asked "does this host end in `.{SCHOOL_DOMAIN}`?", which reads well and fails silently: with the env var still set to the old `schoolos.com`, `fggc.myschoolos.io` matched nothing, fell through the "unrecognised host" branch to *apex*, and served the landing page. No error, no log — just the wrong page, which is exactly how it was reported. Now `lib/tenant/is-apex-host.ts` treats **any host with three or more labels as a tenant** unless it's explicitly known otherwise (localhost/`lvh.me`/`127.0.0.1`, `www.`, the configured apex, or a platform suffix like `*.vercel.app`). Config still adds apexes; getting it wrong no longer breaks the common case. **Verified across all three env states — correct value, stale value, and empty — 13 host cases each.**
- **`*.vercel.app` and friends stay apex** so a preview deploy renders its own landing page rather than bouncing to `/login`; the redirect is a convenience, not a security boundary. `matcher: "/"` keeps it off every other path, which the docs warn is how auth logic ends up blocking CSS and JS.
- **This was the third silent-failure-on-stale-config bug in two days** (after `isSyntheticEmail`'s hidden button and the templates trailing slash). The pattern is identical each time: a literal or exact-match that *gates* behaviour, going stale, and failing by doing nothing rather than erroring. Prefer the loosest match that is still correct, and make the fallback the safe direction rather than the silent one.
- **Verified 12 host cases in a harness before wiring it**, then live with real `Host` headers: apex/www/localhost/`lvh.me`/vercel → 200; `fgc.myschoolos.io` and `gcu.lvh.me` → 307 to `/login`; `/login` and `/dashboard` on a tenant host untouched at 200.

**Platform admin panel built (2026-08-29).** `/platform` was a static "coming in a future phase" card **with no auth guard on it** — a dead end that was also publicly readable. It's now a full staff console. Every capability claim below was probed with a real Super Admin token first; several are invisible from source.
- **It is its own app surface, not a mode of the dashboard.** A platform admin's token carries no `school_id` and no `membership_id`, and **`GET /auth/me/` 403s for them** — which the entire `DashboardShell` hangs off. Worse, `useNavGroups` falls back to `["admin"]` on an empty persona list, so reusing that shell would have rendered them the *complete school-admin sidebar* with every link 403ing. Hence `src/app/platform/layout.tsx` + `PlatformShell`, a sibling of `DashboardShell`.
- **Reuse was aggressive where it was safe.** `AuthGuard`, `PortalContainerProvider`, every `components/ui/*` and `shared/*`, all of `lib/text/*`, and the whole sidebar sub-component tree (`SidebarNavGroup` and below, `useSidebarAccordion`, `isNavActive`) are prop-driven and imported unchanged. Only `AppSidebar`/`AppTopbar` reach into school state, so those two got thin platform equivalents. **`PLATFORM_NAV_GROUPS` is deliberately NOT registered in `NAV_GROUPS`** — that registry is persona-filtered for school members and has no concept of a platform admin.
- **The audit log is reused almost whole.** Its type already carried `school` and `school_name`, and the API layer has no school id in it — the only blocker was `enabled: !!schoolId`. A `usePlatformAuditLogs` variant drops that gate; filters, the 82-action catalog, timeline, skeleton and empty state are untouched. Rows gained an **opt-in** `showSchool` badge rather than changing `cleanTargetRepr`, whose `" @ SchoolName"` stripping the school-side log still depends on.
- **No `--shell-*` CSS vars are set.** Every consumer reads them as `var(name, fallback)`, so the console resolves to the fixed SchoolOS pine/amber — the right look for a surface that belongs to no school. Verified rather than assumed.
- **Extend-access is two guided dialogs, not one form.** The endpoint takes three optional fields but **rejects a price unless a subscription window exists or is set in the same call**. "Extend trial" (date only) and "Activate subscription" (date **and** price together) make that invalid combination structurally unreachable. Confirmed live: the bare-price payload 400s, and both dialog payloads work — a school went `expired → trialing → has_active_access: true`, and another `→ subscribed` with `price_is_locked` flipping to `true` in the financials rollup.
- **Three latent bugs fixed on the way:** `login-view.tsx` sent an already-signed-in platform admin to `/dashboard` (the school shell); `clearAuth()` never cleared `useSchoolStore`, so a stale `currentSchool` made `getSchoolId()` return a school for a platform admin and un-gated queries they can only 403 on; and `/platform` had no auth guard. Also added `user_id` to `decodeToken` — it's in every JWT but was never decoded, and it's the *only* way a platform admin can identify themselves given `/me` refuses them.
- **Honest scoping, from probing rather than guessing:** `POST /platform-admins/` returns **405**, so the Staff screen is read-only and says platform admins are made with `createsuperuser` instead of showing an Add button that can't work. `PATCH /schools/{id}/` and `update-capacity` both 403 for staff, so the school detail is read-only apart from access. **The four people directories don't expose which school a person is at**, so the Directory screen requires picking a school rather than showing an unattributed merged list — a real backend gap, noted below.

**All three backend asks landed, and both portals are now complete (2026-08-29).** Verified live with parent-only and student-only tokens before writing a line — the asks in `docs/asks/parent-portal-gaps.md` are all shipped, plus two of the "smaller/optional" items nobody explicitly promised.
- **Attendance is open to both personas.** `GET /api/attendance/?student=` returns real rows (parent: 3 for their child; student: 1 for themselves), and `daily-summary` works with an explicit range. Both `/child/attendance` and `/my/attendance` were `ComingSoon` placeholders and are now real screens sharing one `AttendanceRecordView`: rate + per-status counts + every marked day, with the note surfaced (that's where *"Student is sick"* lives, which is the entire point of an excused day to a parent). **`daily-summary` defaults to the trailing 7 days**, so a student whose last mark was a fortnight ago gets `[]` unless a range is passed — the screens pass term bounds via a new `useTermDates`.
- **Payments and receipts are open.** `GET /api/payments/` now 200s for both personas, so `canViewFees={false}` became `canViewFees` in both fee screens — `PaymentHistory` and the receipt download were already built and just gated off. As predicted, a one-line change on each screen.
- **`/me` now carries the student's own `id`.** `useMyStudentId` dropped from ~45 lines to a field read. The old version fetched the student's entire class arm and found the row matching their `user.id` — which meant **downloading every classmate's name and email to answer a question about one student**. That incidental PII exposure is gone, which was the real argument for the ask, not convenience.
- **Also landed unasked:** `enrollment-history` and the full `students/{id}/` profile are now readable by parents and students (both verified 200). Not yet consumed — the child-profile screen still builds from the `StudentListItem` nested in the ledger/report-card. Worth revisiting if a parent should see medical fields for their own child.
- **`?student=` is not optional for a parent with several children** — without it the list interleaves every child's rows with no way to tell them apart. Documented on the endpoint.
- **A stale `.next` produced 404s on every two-segment route** while `/dashboard` served fine, immediately after a `next build`/`npm run dev` collision. Same symptom as 2026-08-27. Killing the server, clearing `.next`, restarting fixed it — the code was never wrong. Worth recognising fast: nested-only 404s with a clean log is a manifest problem, not a routing one.

**Route audit re-run against the live resolver (2026-08-28, end of day): 118 of 128 consumed, and nothing is accidentally missed.** Re-run after the day's backend pulls (125 → 128 routes) and after wiring bulk import + update-capacity. The 10 unconsumed break into four groups, each verified rather than assumed:
- **4 platform-admin routes** — `platform-admins/` (+detail), `schools/financials/`, `schools/{id}/extend-access/`. All gated on platform permissions (`view_platform_analytics`, `manage_platform_schools`); they belong to the platform panel, which is a separate initiative with its own persona.
- **4 detail-retrieves whose list already returns the identical record** — `audit-logs/{id}/`, `class-arm-results/{id}/`, `result-remarks/{id}/`, `subject-result-submissions/{id}/`. **Verified this time instead of repeated as an assumption:** none of the four viewsets defines `get_serializer_class`, so `retrieve` serializes through the same class `list` does. Fetching them would return what we already hold.
- **`academic-periods/` list** — periods arrive nested inside `academic-sessions/`, which is how `buildPeriodOptions` reads them.
- **`subjects/bulk-update/`** — deliberate; per-record PATCH is preferred.
- **Method-level check too, since a path diff misses those:** every write-capable route (18 of them carrying PATCH/PUT/DELETE) is consumed except `subjects/bulk-update/`. No orphaned verb on a path we already call.

**Subscription & Billing screen + self-service capacity (2026-08-28).** Three billing routes landed in the backend during the day (route count 125 → 128): `POST /schools/{id}/update-capacity/` (school admin, `manage_school_settings`), plus `POST /schools/{id}/extend-access/` and `GET /schools/financials/` (both platform-only, left for the platform panel). **I had told the backend dev capacity wasn't editable via the API — that was wrong, and wrong because I was quoting a route audit taken before his pull.** A stale audit reads exactly like a current one; re-run it before making a claim from it.
- **`/settings/subscription` was a `ComingSoon` placeholder and is now a real screen**: access status badge, trial/subscription end date, per-student price, and the capacity control. Deliberately narrow — there's no gateway, no plan-change flow and no invoice list on the backend, so it shows the school's real state and the one thing they can change. The nav description promised "plan, billing details, and invoices" and now names only what exists.
- **The prorated charge is shown BEFORE committing**, at the backend dev's request, because it's the real figure the school gets invoiced. That required duplicating `UserService.update_student_capacity`'s formula client-side (`estimate-proration.ts`) — the authoritative number only exists in the *response*, by which point the `CapacityAdjustment` is already recorded. **Cross-checked against the backend across five cases including both boundaries (0 days, exactly 90 days) — identical.** The one divergence is an exact `.5`, where Python's `round()` is banker's (→0) and JS's is half-up (→1): a ₦1 difference, documented in the file rather than papered over, and the response's own `prorated_amount` is shown afterwards as the authoritative figure.
- **No charge is stated explicitly** for a decrease or a change during trial, since the backend records no adjustment in either case. Left unsaid, "will this cost me?" becomes the reason a school never right-sizes its capacity.
- **Billing fields are optional, not nullable, on `SchoolDetailResponse`** — `_user_can_see_billing` omits them entirely for a non-admin, so absent ("you can't see this") and null ("not set") are different facts. The screen handles the former with its own message rather than rendering blanks.
- **`access_status` is `"trialing"`, not `"trial"`** — verified against `accounts/enums.py` rather than assumed from the UI copy, and there is no `suspended` value.

**My Students for teachers (2026-08-27) — a capability the backend always had and the frontend never exposed.** `CanViewStudents` admits *any* teacher to `students/` and `students/{id}/`, and `CanEditStudentProfile` lets them PATCH — verified live with a teacher-only token: the directory, the full detail (allergies, blood group, genotype, chronic conditions, emergency medications, guardians) and enrollment history all return 200, and PATCH is accepted. But `/students` is an `adminItem`, and because `findNavItemForPath` matches longest-prefix, that one item also governed `/students/{id}` — so a teacher could reach none of it.
- **A second route rather than opening the directory.** `/my-students` (+ `/my-students/{id}`) is `teacherItem`-gated and sits beside My Classes. Letting teachers into `/students` instead would have been one line, but it opens the *school-wide* roster — and a roster carries medical data. Scoped to the arms in `/me` instead, which costs nothing extra. `StudentTableRow`/`StudentsTable` gained a `basePath` prop so both routes share one table.
- **The detail page needed no changes** — `useCanEditStudent` already mirrored `CanEditStudentProfile` (admin with `edit_students`, or any teacher), so a teacher gets the same per-card Edit an admin does.
- **`MedicalAlerts` is new and shown to everyone.** Allergies, chronic conditions, emergency medications and disabilities were rendering as four cells among eighteen, in the same grey as favourite food. A teacher opening a student mid-lesson is asking one question, and "Allergic to peanuts" styled identically to a hobby is a safety problem rather than a styling one — so populated fields now surface as a banner above the fold. It renders nothing when all four are empty, which is what stops the alert becoming wallpaper. Blood group and genotype are deliberately excluded: always-present reference data would dilute a banner that should mean "there is something here you must act on".
- **Gating re-verified:** `/my-students/*` teacher-only, `/students/*` admin-only, neither leaks; admin sidebar unchanged at 48 items, teacher 12 → 13.
- **Then the detail page had to be gated per action, because reusing it exposed four things a teacher 403s on.** Probed each with a teacher token: `PATCH /students/{id}/` → **200** (edit is genuinely theirs, via `CanEditStudentProfile`), but `POST enroll/` → **403**, `POST reissue-password/` → **403**, `POST parent-student-links/` → **403**, and `GET /parents/` → **403**. All four were ungated in the UI — "Move class", "Reissue password", "Link parent", "Unlink", and the parent-name link into the admin directory would all have been visible and then failed on click. Now gated on the permission the backend actually checks: `edit_students` for enrol/reissue, `add_students` for both link and unlink, `useCanAccess("/parents")` for the link out. `useHasSchoolPermission` reads `me.admin.school_admin_role`, so it is correctly false for any teacher *and* for an admin whose role lacks the string.
- **The "Back to students" link was a dead end for teachers** — it pointed at `/students`, which RouteAccessGuard refuses them. Now resolves to `/my-students` for anyone who can't open the directory, with matching copy.
- **`StudentProfileCards` extracted** (the three read-only field cards) to bring the page back under 150 after the gating; a real seam — those are the stored-profile fields sharing one PATCH, as against the enrolment/results/parent-link/account blocks that each carry their own permission and endpoint.
- **The lesson worth keeping:** reusing an admin screen for a lower-privileged persona is not free. The *page* was reachable, but four of its controls were not, and nothing in the type system or the build says so — only asking the API as that persona does.

**Full route audit against the live URL resolver (2026-08-27), Docker up.** Previous audits diffed static source; this one enumerated Django's actual resolver (125 routes, 124 after dropping the `/api/` root) and diffed it against every path literal in `lib/api/endpoints/`. **122 of 124 consumed.** It found one real bug:
- **`/api/classes/templates` and `/api/subjects/templates` were declared without their trailing slashes**, under a comment asserting that was "the confirmed backend contract". The live router says both take one. `APPEND_SLASH=True` was quietly 301-redirecting each call and axios followed, so onboarding *worked* — at two round trips per load, and one production setting away from breaking entirely. `APPEND_SLASH=False` is common hardening, and turning it on would have 404'd onboarding's class and subject template steps with no obvious cause. Both fixed and verified against the resolver. **This is exactly what PROJECT.md's "preserve trailing slashes exactly" rule exists to prevent — and a comment claiming something was verified is not the same as it being verified.**
- **The 8 genuinely unconsumed routes are all deliberate:** four `{id}/` retrieves whose list already carries the record (`audit-logs`, `class-arm-results`, `result-remarks`, `subject-result-submissions`), `academic-periods/` (read nested in sessions), `subjects/bulk-update/` (prefer per-record PATCH), and the two `platform-admins/` routes (separate initiative).
- **Filters were audited too**, since a path diff misses them: every backend `filterset` param was enumerated and compared against what the frontend sends. The only unconsumed ones are `created_at_after/before` on the Students/Teachers/Parents/Admins directories — a "who joined between these dates" filter. Students already has the more meaningful `date_of_admission_after/before` wired; the others are a genuine but minor gap.

**Student portal built (2026-08-27) — and the "blocker" turned out not to be one.** Docker came back, and probing with a real student-only token overturned the standing assumption that a student portal was impossible without a backend change.
- **A student *can* derive their own `StudentProfile.id`.** `/me` gives `user.id` + `current_class.class_arm_id`; `GET /api/class-arms/{arm}/` is readable by a student (verified live, 200) and returns the roster with each entry's profile id beside its user id. Matching on `user.id` yields the caller's own id — `useMyStudentId`. The roster is neither capped nor paginated (`AcademicService.get_class_arm_detail`), so it holds at any class size. **The cost is real and documented:** finding yourself means downloading every classmate's name and email. Nothing from that list is displayed, but the request happens — which is now the actual argument in the backend ask, reframed from "we're blocked" to "we're over-fetching classmate PII to answer a question about one student".
- **Verified live with a student-only token, not inferred:** `/students/{self}/fees/` → 200; `report-card/` and `report-card/pdf/` → 403 `{"detail":"This report card is not yet available."}` (the pre-publish state, so the PDF download will work once an arm is locked); `/class-arms/{arm}/subject-assignments/` → 200, carrying **who teaches each subject**; `/attendance/` → 200 with an empty list; `/students/{self}/` → 403.
- **Screens:** `/dashboard` (class card, snapshot tiles, term trend, subject breakdown, fee progress, notices), `/my/results` (report card + PDF download), `/my/subjects` (offerings joined to assignments — a subject with no teacher shows the subject, not a gap), `/my/fees` (ledger + progress), `/my/attendance` (`ComingSoon`, same backend gap as the parent's).
- **Six components turned out to be persona-neutral and moved to `features/academic-record/`** — `RecordSnapshot` (was `ChildSnapshot`), `PerformanceCard`, `PerformanceTrendChart`, `FeeProgress`, `SubjectPerformance(+Card)`, `DownloadResultButton`, and `usePerformanceTrend` (was `useChildPerformance`). They describe *one student's record*, not a parent's view of it, so a student screen importing them from `features/parent/` would have been backwards coupling.
- **Teacher emails are deliberately not rendered** on My Subjects even though the endpoint returns them: a subject list isn't a contact directory, and student→staff email isn't a flow this app has decided on.
- **Nav gating re-verified programmatically:** `/my/*` is student-only, `/child/*` parent-only, neither leaks to the other, and the admin (48) and teacher (12) sidebars are byte-identical to before.

**Reissue Password was invisible on every student (found and fixed 2026-08-27).** Reported as "did we remove it?" — no: `isSyntheticEmail` (`features/students/lib/`) tested for `@internal.schoolos.com`, but the backend generates `@internal.myschoolos.io` (`UserService._generate_student_email`). The domain changed at some point and the frontend literal went stale, so the check returned false for **every** student and the button never rendered — the admin action was unreachable from the UI entirely. It failed silently precisely because it *gates* a render: nothing errored, the affordance just wasn't there. The same helper now also hides the placeholder address on the parent's child-profile screen, where a stale check meant showing a parent a fake address as if it were a way to contact their child. **Fixed by matching the `internal.` subdomain (`/@internal\.[^@]+$/i`) rather than a full host literal** — anything under `internal.` is a placeholder by construction, so the next rename can't silently hide the button again; verified against seven real/synthetic/legacy/case cases. The stale domain was also corrected in two comments, `API.md`, and the root `CLAUDE.md`, all of which repeated it. **Lesson worth keeping: a literal that gates whether UI renders is a silent-failure site — prefer the loosest match that's still correct.**

- **Confirmed blocked, and deliberately not faked:** payment history and receipt download (`PaymentViewSet` gates `list`/`retrieve`/`receipt` on `view_fees`, which hard-requires `is_admin`), attendance, and enrollment history. A parent can therefore see that a fee is settled but not when it was paid or download proof — an odd half-position worth closing, and ask #3 in the doc above.

**Every note and notice claimed it had been edited (2026-09-01).** Reported on the
teacher dashboard's student notes; the same bug was sitting on announcements.
Both read `updated_at !== created_at`, which is never false: Django sets the two
with **separate `timezone.now()` calls** — `auto_now_add` and `auto_now` each run
their own `pre_save` during the same insert — so a row is born with the pair
microseconds apart. **Confirmed against the real database rather than inferred:**
the one untouched student note had a 40µs gap, and all three untouched
announcements 23–390µs. Every record ever written carried "· edited".
- Fixed with a tolerance in one shared `lib/text/was-edited.ts`, not per-screen —
  the two call sites had already drifted into being two copies of the same
  wrong line, and any future `created_at`/`updated_at` pair from this backend
  has the same property.
- **One second**, which is ~25,000x the observed gap. Both timestamps are
  computed in Python inside a single `pre_save` pass, so no network or DB
  latency widens the real gap; and nobody writes, re-reads and saves an edit
  inside a second. An unparseable timestamp yields `NaN`, whose comparisons are
  all false, so a malformed value reads as "not edited" rather than mislabelling.
- Not a backend change: the gap is an artifact of how the rows are written, and
  only the frontend claims to read meaning into it.

**Pricing collapsed to one plan plus the pilot (2026-09-01).** Was three tiers at
₦400 / ₦350 / custom. Now **₦1,000 per student per term**, one plan, with the
first 90 days free.
- **Starter is gone as a tier, deliberately** — it was the user's own open
  question and the answer is no. The backend has one product with two access
  states, `trialing` and `subscribed` (`School.access_status`), and **no feature
  differs between them**: a trialing school has everything, an expired one loses
  writes. So a free tier beside the paid one would have listed identical
  features and invited "what am I giving up?", whose honest answer is "nothing,
  only time". That's an onboarding step, not a plan.
- **So the free period is the pilot**, which is where the whole funnel already
  pointed (`/book-demo`, `data/pilot.ts`, whose eyebrow already read "Free
  pilot"). Two panels rather than a ladder: price left, pilot right — a pricing
  section that leads with "free" and makes you hunt for the number reads as
  evasive, and left-to-right the pair states the entire offer in one line. The
  pilot panel shows **no price, not even ₦0**, since a zero beside the ₦1,000
  would read as a cheaper product when it's the same one, free for a while.
- **₦1,000 / 90 days is what the backend already models**, not a new convention:
  `DEFAULT_PRICE_PER_STUDENT_NAIRA = 1000` and the capacity proration divides by
  90 (`students_added * price_per_student * days_remaining / 90`). The two must
  move together — the landing page is the only place the figure is public.
- **Roadmap items were dropped from the card, not relabelled.** Carrying five
  "(soon)" lines is what made the old Growth tier look thin; `CapabilityGrid`
  already presents them under "On the roadmap" with a Soon badge.
- **`PRICING_NOTE` was quietly wrong and was corrected while here.** It said
  billing is on active students "enrolled and attending this term". Billing is
  on the **declared `student_capacity`** — that's what the proration charges and
  what `get_schools_financial_summary` projects from. The note now says so and
  points at Settings › Subscription, where a school can change it.
- The FAQ's cost answer and `PRICING_TRUST` carried the old figure too. The
  FAQ's "often less than printing report cards manually" comparison was dropped
  rather than repeated at 2.5x the price.
- **Verified in the built output**, not just in source: the rendered landing page
  has ₦1,000, "One plan. One price", "Free for 90 days" and "Join the pilot",
  and zero occurrences of ₦400, ₦350, Growth, Enterprise, "Most popular" or
  "Up to 200 students". Clean `tsc`, `eslint` and `build`.
- **The 90 days now matches the backend** (corrected 2026-09-02). When this
  shipped, `create_school` still granted `timedelta(days=30)` and it was logged
  as a gap. The same pull that brought S3 changed it to **90 days**, so a
  self-signup at `/signup` now gets exactly what the page promises. Gap closed;
  nothing to do.

**The admin dashboard greeted the school, not the person (2026-09-01).**
`DashboardContextHeader` read `{greeting()}, {school?.name}` — "Good morning,
Grace Academy 👋" — which addresses the building. Now the signed-in person's
first name, matching what the teacher home already did.
- **Costs no extra request.** `/me` is already in cache on every school screen —
  the shell's nav gating goes through `useSchoolPermissions`, which is
  `useMe()` — so this is a cache read, the same reasoning `TeacherHome` records.
- **Falls back to the bare greeting** while `/me` is in flight, rather than
  rendering a comma with nothing after it.
- **Nothing is lost by dropping the school name**, and that was checked rather
  than assumed: it still renders in the sidebar header and in the topbar's
  `SchoolSwitcher` — the latter being the one that survives a collapsed sidebar.
- **`greeting()` was four byte-identical copies** (admin, teacher, parent,
  student). Now one `lib/text/greeting.ts`, the same consolidation `TermBadge`
  and `NoCurrentTermNotice` got. It deliberately returns the greeting alone and
  never "greeting, name", so each caller keeps its own in-flight fallback.

**File upload wired to S3 (2026-09-02).** The backend shipped a `storage` app
(commit `04be93e`) doing direct browser-to-S3 upload; the frontend's logo and
photo fields were still paste-a-URL text boxes carrying a *"restore file upload
when hosting is ready"* TODO. They now upload real files. Contract read from
`storage/{views,services,serializers,urls}.py` and `accounts/serializers.py`,
cross-checked against the backend's own `docs/storage.md`.
- **It arrived as a silent breakage, and that was the urgent half.** The models
  went `School.logo` → `logo_key` and `StudentProfile.photo` → `photo_key`, so
  `SchoolBrandingUpdateSerializer` and `StudentProfileUpdateSerializer` no
  longer accept the field names the frontend was sending. **DRF drops unknown
  fields silently**, so saving a logo returned `200` and changed nothing. Same
  class as the stale-`ff65937`-container bug: a success response for work that
  never happened.
- **Three steps, and the order is the whole contract.** `POST
  /api/presigned-upload/` issues a *reservation*, not an asset; the file goes
  straight to S3 (the backend never sees the bytes); only after S3's 204 may the
  key be attached via PATCH, where the backend HEADs the object before saving.
  A dropped upload means the PATCH simply never happens, which is the correct
  failure — so `useImageUpload` calls `onUploaded` only after the S3 POST
  resolves.
- **The S3 POST uses bare `fetch`, not `apiClient`, deliberately.** The axios
  instance attaches `Authorization: Bearer` to everything not on the public
  list — through it, every logo upload would ship a SchoolOS JWT to Amazon.
  Using a different client is what actually guarantees it, rather than a comment
  saying not to. No `Content-Type` header is set by hand either: the browser
  must generate it for the multipart boundary, and the policy's own
  `Content-Type` condition is satisfied by the form *field* in `fields`, which
  is a different thing from the request header.
- **A generation counter, not a boolean, guards the abandon rule.** Picking B
  while A is still uploading must not save A's key — and A's promise can resolve
  last. Each pick increments a ref; a step resolving against a stale generation
  drops its result. The in-flight request is also aborted so the bytes stop.
- **The form field holds a KEY and defaults to `undefined`, not to the current
  URL.** Three states: `undefined` omits `logo_key` from the PATCH (untouched),
  `null` clears it, a string sets it. The old `logo?.trim() ? … : {}` collapsed
  the first two, so *removing* a logo silently did nothing. Seeding the field
  with the response's `logo` would be worse still — that's a presigned read URL,
  not a key, and the backend's HEAD would 400 it.
- **Save is disabled while bytes are in flight** on all four forms. Saving
  mid-upload would PATCH the *previous* key, which reads as the upload having
  quietly done nothing.
- **An uploaded student photo would have been invisible.** Every student avatar
  read `user.photo` — `User.photo_key`, a different column with **no attach
  endpoint anywhere in the API** — while the upload writes `StudentProfile.
  photo_key`, surfaced as the top-level `photo` that `StudentProfileListSerializer`
  gained in the same commit. The photo would have saved correctly and never
  appeared. All six avatar sites now go through `studentPhoto()` (directory row,
  detail page, attendance register, class-arm roster, parent's child profile),
  which prefers the student's own and falls back to the user's. Staff, admin,
  parent and announcement avatars still read `user.photo`, correctly — those are
  User records with no StudentProfile.
- **Read URLs expire after an hour** (`S3_PRESIGNED_READ_EXPIRY`), and the
  school store persists to `localStorage` — so a tab reopened the next morning
  holds a URL that now 403s. `SchoolLogo` and the switcher's avatar render raw
  `<img>` and had no error handling, so that renders the browser's broken-image
  glyph in the sidebar and topbar: a stale link reading as a corrupted logo.
  Both now fall back to the initial, and both track **which URL failed** rather
  than a boolean — a `useState(false)` + reset-effect pair is the obvious
  version and is exactly what `react-hooks/set-state-in-effect` rejects. Self
  healing, since `useSyncSchoolData` refetches on mount and focus.
- **`user-photos` is accepted by the presigned endpoint and deliberately not in
  `UploadPrefix`.** There is no attach endpoint for `User.photo_key`; offering it
  would produce an orphaned S3 object and nowhere to put the key.
- **NOT VERIFIED LIVE — the backend cannot boot.** `config/settings/base.py:161`
  reads `AWS_ACCESS_KEY_ID` through `config()` with no default, and neither
  `.env` nor `.env.example` carries the four AWS keys, so `school_os_web` exits 1
  on `UndefinedValueError` before serving anything. Clean `tsc`, `eslint` and
  `build`, but not one presigned POST has been issued. First thing once it
  boots: upload a real logo and confirm the 204, the key shape, and that the
  PATCH's S3 HEAD passes. See the gap below.

**Login on the apex flickered through three destinations (2026-09-02).** Reported
as: sign in from the landing page and the URL goes `myschoolos.io/dashboard` →
subdomain → `/auth-handoff` → subdomain again; entering via the subdomain
directly shows none of it. **Not the hand-off's fault** — it was a race on the
apex side, and the hand-off was merely the thing that eventually won.
- **`applyAuthTokens` writes to the auth store synchronously; the redirect is
  two awaits away** — `getSchoolDetail`, then `getOnboardingStage` inside
  `resolvePostAuthPath` for an owner. `LoginView`'s already-signed-in guard
  watches `tokens`, so it fired the instant they landed and `router.replace`'d
  to `/dashboard` **on the apex**, mounting the whole `DashboardShell` (and its
  `/me`, profile and sessions queries) for the few hundred ms before
  `window.location.href` threw it away. Simulated the real ordering: **three**
  apex redirects before the hand-off, one hop after the fix.
- **Fixed by scoping the guard to its actual purpose.** It exists for someone
  who *arrives* at `/login` already signed in; a session appearing while the
  form is on screen belongs to `useLogin`, which may still be deciding where to
  send it — possibly to another origin. `useLogin` now exposes `isRedirecting`,
  set **before** `applyAuthTokens` so there is no window at all. It is not
  `isPending`: that goes false the moment `onSuccess` returns, while
  `handleScoped` is still awaiting.
- **`LoginView` never waited for `hasHydrated`** — a second flash, on the same
  screen. `tokens` is null on the first render whether or not a session exists,
  so an already-signed-in visitor got a frame of the login form before being
  redirected. The auth store's own comment on `hasHydrated` names LoginView as a
  consumer that must wait, and it wasn't. Now gated in both the guard and the
  render.
- **The apex was keeping the session it had just given away.** The hand-off page
  rotates on arrival and the backend blacklists the old refresh token, so within
  a second the apex held a dead pair behind an access token that still looked
  valid for up to an hour — returning there later meant landing on the apex
  dashboard, working for a while, then dying at the first refresh as *"Your
  session expired."* It now hands the session on and drops its copy.
- **New `clearSession()` on the auth store, deliberately not `clearAuth()`.**
  `clearAuth` also wipes the offline query cache and a teacher's queued
  register/score drafts — correct when a session *ends* on a shared device,
  wrong when it is being handed to another origin, where it would be silent
  loss of unsubmitted work.
- **The apex now shows "Signing you in…", the same sentence `/auth-handoff`
  shows**, so the cross-origin move reads as one step rather than two loading
  screens. The URL bar still changes once — that is inherent to moving a
  session across origins, and the `/auth-handoff` stop is what reads the
  fragment.
- Clean `tsc`, `eslint`, `build`. **The ordering is verified by simulation, not
  in a browser** — there is no browser automation here, so the actual flicker
  needs one click-through on a deployed build to confirm.

**Student photo moved onto the avatar (2026-09-02, same day).** The upload
shipped inside **About → Edit**, between hobbies and ambitions — which is where
the field sits in `StudentProfileUpdateSerializer`'s whitelist, and exactly where
nobody looks for it. Reported as *"I can't see an upload image in the student
about card, no icon to indicate."* It was there and it was unfindable, which is
the same thing as not being there.
- **The control is now the avatar itself** (`EditStudentPhotoDialog`): a camera
  badge on the photo in the page header, opening a one-field dialog. You change
  a picture by clicking the picture.
- **The badge is always visible, not hover-only** — a hover affordance doesn't
  exist on a phone, and this page is opened on one constantly.
- **Gated on `canEdit`** (`useCanEditStudent`, mirroring `CanEditStudentProfile`).
  A reader who may not edit gets the plain avatar rather than a camera button
  that would 403 — the same rule as every other action on this page.
- **Removed from the About dialog** rather than left in both places: two
  controls writing one field is worse than a badly-placed one. `aboutSchema`
  lost `photo_key` and the dialog sends the three text fields it always did;
  the photo dialog sends its own single-field PATCH.
- **The lesson is about placement, not plumbing.** The API's field grouping is
  not an information architecture — `photo_key` shares a PATCH with favourite
  food, and that says nothing about where a person looks for it.

**Nothing clickable had a pointer cursor (2026-09-02).** Every button in the app
showed the arrow, not the hand. **Not a codebase mistake — the reset changed
underneath it:** Tailwind v3's Preflight set `cursor: pointer` on `button`, and
**v4's dropped that rule entirely** (verified in
`node_modules/tailwindcss/preflight.css` — there is no cursor declaration for
button at all), so every button fell back to the browser default.
- **One base rule in `globals.css`, not a `cursor-pointer` class per element.**
  A sweep across several hundred buttons is a bulk JSX rewrite — the thing this
  repo has been burned by twice — it can't reach Radix's own internals, and the
  next component added would silently miss it.
- **The native `<select>` was the biggest catch.** `components/ui/select` is a
  real `<select>` (deliberately, for the OS picker on phones), it's on 20+
  screens, and browsers give it `cursor: default`. It opens a dropdown on click,
  so it's in the rule.
- **Scoped to what actually takes a click.** Buttons, selects, summary,
  clickable input types (checkbox/radio/color/file/submit/button/reset), labels
  wrapping a checkbox or radio, and the ARIA roles Radix renders as divs
  (`menuitem`, `option`, `tab`, …). **Text-entry fields are deliberately
  excluded** — text, email, password, number, search and date keep the I-beam,
  because a pointer there promises a click where the gesture is typing.
  `a[href]` needs nothing; the UA stylesheet already points it.
- **Disabled is excluded two ways because Radix expresses it two ways** — a real
  `disabled` attribute on what it renders as `<button>`, `aria-disabled="true"`
  on what it renders as a div with a role. No `[data-disabled]` catch-all: it
  would be redundant *and* would lose on specificity to
  `button:not(:disabled)`, so it would have been a rule with a false comment.
- **Verified in the emitted CSS**, not just in source — the compiled selector
  list is present in the production chunk after Lightning CSS processing
  (which unquotes the attribute values but is otherwise identical).

**Pending invites paginated (2026-09-03).** The list asked for `page_size=100`
(the backend max) and threw the envelope's `count` away, keeping only `results`
— so the 101st invite was simply unreachable, with nothing on screen saying a
page had been cut off. The original comment called a school staying under 100
"expected in practice", which underrates how the list grows: **accepted and
expired invites never leave it**, so it accumulates for the life of the school
rather than tracking how many are outstanding.
- Now the standard shape used by Staff/Students/Parents/Admins: `page` in the
  filters, the full `PaginatedResponse` returned from the API layer, and the
  shared `PaginationControls` below the table. No `page_size` param — the
  backend's default is 25 (`CustomPagination.page_size`, confirmed alongside
  `REST_FRAMEWORK["PAGE_SIZE"]`) and the panel's constant matches it.
- **Every filter change resets to page 1.** Narrowing status/persona/search
  while on page 3 can leave fewer pages than that, and the request returns empty
  on a list that isn't — which reads as "no invites" rather than "no page 3".
- The four `invalidateQueries` callers (resend + the three invite forms) key off
  the `["invitations","pending"]` prefix, so they still refresh every cached
  page without change.
- Consistent with the other directories, there is **no `keepPreviousData`** — the
  table shows the loading line between pages. Worth revisiting for all six at
  once rather than diverging here.

## Next up

Nothing is queued. The last full route audit (2026-08-31) found the backend
essentially fully consumed: of ~130 registered routes, the only unwired ones
were four detail routes whose list response already carries everything
(`audit-logs`, `class-arm-results`, `result-remarks`,
`subject-result-submissions`) and the flat `academic-periods/` list, which is
read nested inside sessions. All deliberate, none overlooked.

Re-audit rather than trust this: the backend moves between sessions, and a
path-level diff misses new *methods* and *query params* on a path already
marked consumed. Grep the hand-written `create`/`update`/`partial_update`/
`destroy` methods and every `filterset_fields` declaration, not just the URL
resolver.

## Real backend gaps

What still needs backend work the frontend cannot do alone. Re-verified
2026-09-01.

- **No backend app at all:** Admissions · Expenses · Payroll · Messages ·
  SMS/WhatsApp · Events & Calendar · Timetable · CBT · Transport. These are the
  nav items hidden as unbuilt, and the same list the landing page presents as
  roadmap rather than features.
- **Online fee payment is unbuilt server-side**, not merely unwired.
  `PaymentSource.PAYSTACK`/`FLUTTERWAVE` are unused enum slots,
  `Payment.gateway_reference` is written by nothing, and there is no webhook
  endpoint. A gateway-integration project (initiate, verify, webhook,
  idempotent recording), not an addition.
- **Seven school permissions gate nothing server-side** — `delete_students`,
  `delete_staff`, `delete_fees`, `edit_staff`, `edit_attendance`,
  `export_fees`, `send_sms`. They're grantable in the Roles editor and grant
  nothing. `edit_attendance` is the most misleading: marking is teacher-only by
  design, so no admin can ever mark a register whatever is ticked. Backend's
  call whether to implement or drop them.
- **Audit log:** no export endpoint (the NDPA-compliance ask); no `target_type`
  filter, so "every change to Students" isn't expressible; `search` covers the
  actor only, not who was affected; and the 82 action strings are hardcoded in
  `features/audit-logs/lib/actions/` — a catalog endpoint like
  `school-admin-roles/permissions/` would remove that coupling.
- **`PUT /subjects/bulk-update/` 500s on a name swap.** The service's own
  validation permits it, then its row-by-row save trips the unique constraint
  mid-loop. Order-dependent. See `docs/asks/subject-bulk-update-swap-500.md`;
  the bulk editor blocks the case client-side meanwhile.
- **Platform admins receive full student records** for every school — name,
  email, gender, photo, class. The panel now displays only admission number and
  class, but that's display-only. See `docs/asks/platform-student-exposure.md`.
- **Profile update endpoints don't exist.** `TeacherProfile`/`ParentProfile`/
  `SchoolAdminProfile` have no update route, and `/api/users/` is POST-only —
  so nobody can edit their own name or phone. That's why `/profile` is
  read-only.
- **`school_os_web` will not boot without four AWS env vars.**
  `config/settings/base.py:161-164` reads `AWS_ACCESS_KEY_ID`,
  `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME` and `AWS_S3_REGION_NAME`
  through `config()` with **no default**, so a missing one raises
  `UndefinedValueError` at import time and the container exits 1. Neither `.env`
  nor `.env.example` carries them, so there is nothing to copy from — which
  makes this a fresh-clone blocker, not just a local one. Adding them to
  `.env.example` (empty, as documentation) would have made it self-evident.
  Until they're set, every screen is unreachable, upload or not.
  **Also needs the bucket's CORS to allow the frontend origin** — Django's
  `CORS_ALLOWED_ORIGINS` has no say over a direct-to-S3 POST, and a bucket
  rejection surfaces in the browser as an opaque `TypeError` with no response.
- **No test suite anywhere in the frontend.** Not a backend gap, but the most
  consequential absence in the repo: `tsc`/`eslint`/`build` all passed while
  three borders were missing from score entry and while the offline cache was
  deleting itself. Treat every "it builds" as unverified.

Open asks live in `docs/asks/`. Delete one when it ships.

## How to work in this repo
- One concern per prompt. State your plan, then build. Run `lint` + `build` and show results before "done".
- Read the backend code in `SchoolOS-backend` to confirm any contract rather than assuming — it changes between sessions, don't trust your own earlier read without a fresh check. Its `docs/*-frontend-handoff.md` files are useful for *flows and gates*, but the serializers, views and services are the contract; where they disagree, the code wins.
- **Verify live where you can.** The backend runs under Docker (`docker compose up` from `SchoolOS-backend/`). To exercise an endpoint as a specific persona without a password, mint a token in the shell:
  `docker exec -i school_os_web python manage.py shell` → `SchoolAccessToken.for_membership(m.user, m)` (returns an `(access, refresh)` tuple; `str(access)` is the JWT). Test permission-sensitive endpoints with a **teacher-only** membership — several bugs here were invisible from an admin account.
- Keep API calls isolated in `features/*/api/*` so a shape change is a one-file edit.
- **`tsc` + `eslint` + `build` passing is not verification.** There are no tests. None of those three can see a missing border, wrong copy, a broken render-time seed ordering, or a cache that deletes itself. Say plainly what was and wasn't checked, and click through anything touching offline state, styling, or permissions.
