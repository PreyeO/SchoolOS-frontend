# SchoolOS — Project Guide (for Claude Code)

Read this and `API.md` before building. The backend code in this workspace (the `SchoolOS-backend` folder) is the **source of truth** for API contracts — reconcile anything here against it, and prefer reading the serializers/urls/views over assuming. The backend moves fast; re-check rather than trusting a stale ⚠️ here.

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

## Auth & tenancy
- Base URL from `NEXT_PUBLIC_API_BASE_URL` (dev: `http://localhost:8000`). School domain from `NEXT_PUBLIC_SCHOOL_DOMAIN`.
- Tokens (`access`,`refresh`) stored in **sessionStorage** via zustand `persist` (dev; move to httpOnly cookies before launch — noted as TODO).
- Axios request interceptor attaches `Authorization: Bearer <access>` — **EXCEPT on public routes**: signup (`/api/users/`), `/api/auth/verify-email/`, `/api/auth/resend-verification/`, `/api/auth/login/`, password-reset request/confirm, and accept-invite. (A stale token on a public route causes a 401 — this bug has bitten before.)
- Decode the access token (`jwt-decode`) for claims: `user_id`, `school_id`, `membership_id`, `personas` (e.g. `["admin","owner"]`), `is_platform_admin`.
- **Multi-tenant:** each school lives on a subdomain (`<slug>.schoolos.com`). Auth happens on the apex; the school app on the subdomain. Subdomains don't resolve on `localhost` — use a dev fallback (`lvh.me`). Keep the tenant redirect isolated in `lib/tenant/school-url.ts`.
- Source `school_id` from the decoded token (fallback `currentSchool.id` in the school-store).

## Domain rules
- **Levels:** `creche`, `nursery`, `primary`, `junior_secondary`, `senior_secondary`. A school picks 1+ at create-school (`levels` array).
- **school_type** (`nursery`|`primary`|`secondary`|`combined`) is **derived** from levels by bands (early=creche+nursery, primary, secondary=jss+sss): one band → that band's value; multiple bands → `combined`. Both are sent; the array carries the truth.
- **Class/subject templates** are filtered by the school's `levels`. Nursery has a subject template; creche has none (add-your-own). Class arms are **optional** (omit `arms` when a class has none — do not send `arms: []`).
- **Grading** (CA/exam split, A1–F9 for senior) is auto-defaulted by the backend; editing lives in dashboard Settings later.
- **Onboarding resume is forward-only:** the backend stage (`current_step`) is the source of truth; steps before it are read-only (create-only endpoints → re-POST would duplicate).
- **Gating: onboarding is owner-only, enforced on both ends.** Frontend: `canDoOnboarding()` checks `personas.includes("owner")`. Backend: `IsSchoolOwner` (`accounts/permissions.py`) guards the `onboarding`/`advance_onboarding`/`review` actions on `SchoolViewSet`, and `UserService.advance_onboarding` re-checks `membership.is_owner` as defense-in-depth. A non-owner admin gets routed straight to `/dashboard` (`resolve-post-auth-path.ts`) rather than bouncing through `/onboarding`.

## Design system
- **Palette (CSS vars):** deep pine base (`#0E2A24` ink, `#1E5B4F` primary), amber accent (`#F2A93B`), grass (`#3FA66A`), clean off-white (`#F6F7F3`). The dashboard shell must apply each **school's** `primary_color`/`accent_color` as CSS vars, falling back to these.
- **Fonts:** Bricolage Grotesque (display), Hanken Grotesk (body — legible on cheap Androids), JetBrains/Geist Mono (system labels).
- **Quality floor everywhere:** premium/standard look (Linear/Vercel/Stripe-level), brand-coloured (no rainbow charts), skeleton loaders, designed empty/error states, responsive to ~360px, full a11y (labels, keyboard, focus mgmt, `aria-live`, focus-trap dialogs, contrast, reduced-motion). Sidebar nav is collapsible accordion groups driven by `data/navigation.ts`.

## Phase status
**Built:** scaffold → landing → signup → verify-otp/resend → create-school → login (+multi-school selection, branding correctly hydrates via `GET /api/schools/:id/`) → onboarding UI wired to real APIs (branding, academic session, classes, subjects, review with edit/add/delete — Phase 4.2) → owner-only onboarding gating (frontend + backend) → premium dashboard shell + full navigation IA → dynamic school-color system (sidebar, buttons, charts, icon badges, focus rings, and — via a portal-container fix — modals/dropdowns/mobile nav too, all driven by each school's `primary_color`/`accent_color`) → Dashboard Settings (School Profile, Sessions & Terms, Classes & Arms, Subjects, Roles & Permissions — all five with well-designed, non-onboarding-reused UI: tables/tabs/search where the data warrants it) → invitations (create flows: admin/teacher/parent/student, + roles list for admin-invite `role_id`; part 2: pending-invites list/filter/resend + public accept-invite page) → Staff/Student/Parent directories (read-only list + detail, search/filter/pagination, admin-driven student password reissue) → parent↔student linking (link/unlink from either detail page, via a shared searchable person picker).

**Next up (recommended order):**
1. **Forgot/reset password** — backend is fully ready (`POST /api/auth/password-reset/request/`, `POST /api/auth/password-reset/confirm/`); the `/forgot-password` page is currently a static "not available yet" placeholder.
2. **Daily-ops modules** (need the directories' data model, now built): Attendance → Results & Report Cards → Fees & Payments.

## Real backend gaps (not a docs problem — these genuinely don't exist yet)
- **Student → class/arm enrolment:** `StudentProfile` has no FK to `Class`/`ClassArm` at all. Needed before the Students module can do more than list/view.
- **Teacher → class/subject assignment:** `TeacherProfile` has `teacher_type` but no FK linking a teacher to specific classes or subjects. Needed before the Staff module's "assign to classes/subjects."

## How to work in this repo
- One concern per prompt. State your plan, then build. Run `lint` + `build` and show results before "done".
- Read the backend code in `SchoolOS-backend` to confirm any contract rather than assuming — it changes between sessions, don't trust your own earlier read without a fresh check.
- Keep API calls isolated in `features/*/api/*` so a shape change is a one-file edit.
