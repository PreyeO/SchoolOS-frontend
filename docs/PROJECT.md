# SchoolOS — Project Guide (for Claude Code)

Read this and `API.md` before building. The backend code in this workspace (the `SchoolOS-backend` folder) is the **source of truth** for API contracts — reconcile anything here against it, and prefer reading the serializers/urls/views over assuming. The backend moves fast; re-check rather than trusting a stale ⚠️ here.

**`SchoolOS-backend/` is read-only.** Read it as much as needed to confirm contracts (or hit the running dev server directly to verify live) — never create, edit, or delete anything inside it. It's a separate codebase the user develops directly. A missing endpoint or field is a gap to report, not something to patch here.

## What this is
SchoolOS is a school-management SaaS for Nigerian K–12 schools (daycare/creche, nursery, primary, junior & senior secondary), sold to private schools. Users: school owners/admins, bursars, teachers, parents, students. Frontend is this repo (`SchoolOS-frontend`); backend is Django/DRF in `SchoolOS-backend`.

## Stack
- **Next.js (App Router)** + **TypeScript (strict)** + **Tailwind** + **shadcn/ui**
- **Zustand** = client/UI/auth state · **TanStack Query** = server state (never put server data in Zustand)
- **react-hook-form + zod** = forms/validation · **axios** = HTTP · **sonner** = toasts · **jwt-decode** = token claims · **lucide-react** = icons · **recharts** = charts

## Folder structure
```
src/app/                (marketing)/ (auth)/ (dashboard)/  + api/ layout globals
src/components/         ui/ (shadcn) · shared/ · layout/ · landing/sections/ · providers/
src/features/<domain>/  schemas/ types.ts api/ hooks/ components/   (co-located per domain)
src/hooks/  src/lib/{api,auth,tenant,validations,utils}  src/stores/  src/types/  src/data/  src/config/
```

## Hard conventions (apply to EVERY prompt)
- **No file exceeds 150 lines.** Split along real seams (subcomponents, hooks) — never line-count theater.
- **DRY + separation:** schema / types / api call / TanStack hook / UI are separate files. No inline `fetch` in components.
- **No hardcoded URLs/strings** in components — endpoints live in `lib/api/endpoints.ts`, colours/spacing come from design tokens, copy/config in `data/`/`config/`.
- **Server components by default;** add `'use client'` only where interactivity lives.
- **Import via the `@/` alias.** File naming: components `PascalCase.tsx`, hooks `use-thing.ts` → `useThing`, others `kebab-case.ts`.
- **Preserve trailing slashes exactly** as the backend defines them (some endpoints have them, some don't).

## Error & toast handling (uniform)
- The backend returns `{ "detail": ... }` where `detail` is a **string OR an array of strings**, for both success and error.
- Route EVERY error through the shared normalizer in `lib/api/get-error-message.ts` — never read `error.response.data.detail` directly in a component/hook. Toast via sonner.
- Some success responses return objects (school, stage, created records) instead of `detail` — handle those explicitly (e.g. student-create returns credentials; onboarding steps return the created records).
- **403s get a distinct message, not the generic error copy.** `HasSchoolPermission`/`HasPlatformPermission` both return the same generic `{"detail": "You do not have permission to perform this action."}` regardless of endpoint, so there's nothing useful to show from the message itself — `isPermissionDeniedError()` (`lib/api/get-error-message.ts`) keys off the 403 status instead. Every list/detail/settings page's `isError` branch renders the shared `<ErrorState error={error} resourceLabel="..." />` (`components/shared/error-state.tsx`), which shows "You don't have permission to view X" for 403s and the generic "couldn't load, please refresh" otherwise.

## Auth & tenancy
- Base URL from `NEXT_PUBLIC_API_BASE_URL` (dev: `http://localhost:8000`). School domain from `NEXT_PUBLIC_SCHOOL_DOMAIN`.
- Tokens (`access`,`refresh`) stored in **localStorage** via zustand `persist` (dev; move to httpOnly cookies before launch — noted as TODO). Deliberately localStorage, not sessionStorage — the latter is scoped per tab, which broke opening a dashboard link in a new tab (it saw an empty store and bounced to `/login` despite the user being authenticated elsewhere).
- Axios request interceptor attaches `Authorization: Bearer <access>` — **EXCEPT on public routes**: signup (`/api/users/`), `/api/auth/verify-email/`, `/api/auth/resend-verification/`, `/api/auth/login/`, password-reset request/confirm, and accept-invite. (A stale token on a public route causes a 401 — this bug has bitten before.)
- Decode the access token (`jwt-decode`) for claims: `user_id`, `school_id`, `membership_id`, `personas` (e.g. `["admin","owner"]`), `is_platform_admin`.
- **Multi-tenant:** each school lives on a subdomain (`<slug>.schoolos.com`). Auth happens on the apex; the school app on the subdomain. Subdomains don't resolve on `localhost` — use a dev fallback (`lvh.me`). Keep the tenant redirect isolated in `lib/tenant/school-url.ts`.
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
**Built:** scaffold → landing → signup → verify-otp/resend → create-school → login (+multi-school selection, branding correctly hydrates via `GET /api/schools/:id/`) → onboarding UI wired to real APIs (branding, academic session, classes, subjects, review with edit/add/delete — Phase 4.2) → owner-only onboarding gating (frontend + backend) → premium dashboard shell + full navigation IA → dynamic school-color system (sidebar, buttons, charts, icon badges, focus rings, and — via a portal-container fix — modals/dropdowns/mobile nav too, all driven by each school's `primary_color`/`accent_color`) → Dashboard Settings (School Profile, Sessions & Terms, Classes & Arms, Subjects, Roles & Permissions — all five with well-designed, non-onboarding-reused UI: tables/tabs/search where the data warrants it) → invitations (create flows: admin/teacher/parent/student, + roles list for admin-invite `role_id`; part 2: pending-invites list/filter/resend + public accept-invite page) → Staff/Student/Parent directories (read-only list + detail, search/filter/pagination, admin-driven student password reissue) → parent↔student linking (link/unlink from either detail page, via a shared searchable person picker) → forgot/reset password (/forgot-password → /reset-password, mirrors the signup → verify-otp two-page pattern) → School Admins directory (list/detail + role assign/unassign, pairs with Roles & Permissions) → cross-cutting bug-fix pass: cross-tab session persistence (localStorage), Staff→Teachers rename, invite `invalidated` status, shared permission-denied (403) UI, Skip buttons on every onboarding step, and dashboard checklist owner-gating/wizard-resume-routing/dismiss-persistence → refetch-on-mount/focus school-data sync (`useSyncSchoolData`) so branding/term changes made by other sessions show up without a fresh login → Settings > Grading (`GradingSystemViewSet`: one grading system per level, components + grade ranges, full CRUD) → dashboard home's Recent Activity wired to real `GET /api/audit-logs/` data (was 100% mock, capped at 5 entries) → `date_joined_school` shown on Admin/Parent detail pages (already had it on Teacher's) → school switcher wired to real memberships (`GET /api/schools/`, filtered to the caller's own by `SchoolViewSet.get_queryset`) and `POST /api/auth/switch-school/`, replacing the two-school mock.

**Next up (recommended order, re-audited directly against `SchoolOS-backend` on 2026-08-05):**
1. **Platform admin panel** (`/platform`) — a separate initiative, not a continuation of the school-dashboard roadmap: different persona (SchoolOS staff, `is_platform_admin: true`, no `school_id`), currently just a placeholder page. Backend is ready (`PlatformAdminProfileViewSet`, plus every directory viewset already supports `?school_id=` + cross-school access for platform callers). Worth a separate scoping conversation before starting, since it's a different panel entirely, not more of the current one.
2. **Daily-ops modules — genuinely backend-blocked, not just "needs the data model":** `attendance`, `fees`, and `results` are empty Django app scaffolds (3-line `models.py`/`views.py`, no serializers/urls, **not even listed in `INSTALLED_APPS`**), confirmed unchanged as of 2026-08-05. There is zero API surface here, so none of Attendance / Results & Report Cards / Fees & Payments can start on the frontend until backend work happens first.
3. **"Admissions"** nav item (`/admissions`) — same situation as #2: no backend app, no models, purely a placeholder for a future online-admissions module (applications/entrance tests/offers).
4. Minor, low-priority: `GET /api/auth/me/` (refresh onboarding state) is built but unused on the frontend — token responses already carry `state`, so there's been no need for it yet.

## Real backend gaps (not a docs problem — these genuinely don't exist yet)
- **Student → class/arm enrolment:** `StudentProfile` has no FK to `Class`/`ClassArm` at all. Needed before the Students module can do more than list/view.
- **Teacher → class/subject assignment:** `TeacherProfile` has `teacher_type` but no FK linking a teacher to specific classes or subjects. Needed before the Staff module's "assign to classes/subjects."
- **Attendance, Fees, Results apps:** confirmed empty scaffolds, not registered in `INSTALLED_APPS` — see #3 above. Nothing to build against yet.
- **Admissions:** no backend app at all — see #4 above.

## How to work in this repo
- One concern per prompt. State your plan, then build. Run `lint` + `build` and show results before "done".
- Read the backend code in `SchoolOS-backend` to confirm any contract rather than assuming — it changes between sessions, don't trust your own earlier read without a fresh check.
- Keep API calls isolated in `features/*/api/*` so a shape change is a one-file edit.
