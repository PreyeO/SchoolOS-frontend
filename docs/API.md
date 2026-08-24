SchoolOS — API Reference (for Claude Code)
Compiled from wired contracts plus a direct backend audit. The backend code in SchoolOS-backend is the source of truth — it moves fast (active commit history), so re-check rather than trusting your last read. Anything still marked ⚠️ is genuinely unconfirmed; everything else below has been read directly off the current views/serializers/urls.
Global
Base URL: NEXT_PUBLIC_API_BASE_URL (dev http://localhost:8000).
Auth: Authorization: Bearer <access> on authenticated calls. Public (no token): signup, verify-email, resend-verification, login, password-reset request/confirm, accept-invite, invite token lookup.
Errors: { "detail": <string | string[]> }. Route through the shared normalizer. Success sometimes returns objects/arrays instead of detail (noted below). 403s (HasSchoolPermission/HasPlatformPermission) all share one generic detail regardless of endpoint — the frontend keys off the status code (`isPermissionDeniedError()`), not the message, to show a distinct "you don't have permission" UI.
Trailing slashes matter — copy them exactly as written here. Confirmed rule: every endpoint here is DRF-router-generated (DefaultRouter, default trailing_slash=True), so custom @action routes carry a trailing slash exactly like the list/detail routes, with two known exceptions noted inline (class/subject templates) that were separately confirmed against a live request.
JWT claims: user_id, school_id, membership_id, personas[] (values: admin, owner, teacher, parent, student — not mutually exclusive), is_platform_admin.

Auth (public)
POST /api/users/ — signup
Body: { first_name, last_name, email, password, confirm_password, phone_number? } (omit phone_number when blank). Success: { "detail": "Account created. Please check your email for a verification code." } → route to /verify-otp (carry email).
POST /api/auth/verify-email/ — verify OTP
Body: { email, otp } (otp = 6 digits). Success: { detail, state, access, refresh } (state e.g. "create_school"). Store tokens, route by state.
POST /api/auth/resend-verification/ — resend OTP
Body: { email } → { detail }.
POST /api/auth/login/ — login
Body: { identifier, password, school_slug? }. identifier = email OR admission_number (don't validate as email). Include school_slug when on a school subdomain; omit to allow multi-school selection. Success (single/scoped): { requires_school_selection: false, state, access, refresh }. Success (must pick school, no tokens): { requires_school_selection: true, state, schools: [{ name, slug, subdomain }] } → user picks → re-POST login with school_slug to get scoped tokens. Errors: { detail } e.g. "Please verify your email address before logging in." (→ resend + go to verify), "No active membership found for this school."
POST /api/auth/password-reset/request/ — request reset OTP. Wired (/forgot-password).
Body: { email }. Always returns 200 with a generic { "detail": "If an account with this email exists and is eligible, a reset OTP has been sent." } regardless of whether the email exists — also silently no-ops for a synthetic internal student email (no self-serve reset path for those; an admin uses reissue-password instead). No account-existence leak, so the frontend copy doesn't hint at either case.
POST /api/auth/password-reset/confirm/ — complete reset. Wired (/reset-password).
Body: { email, otp (6 digits), password, confirm_password }. Success: { "detail": "Password reset successful. Please log in with your new password." } — no token pair, frontend redirects to /login. Confirmed live: reusing the same OTP a second time correctly 400s with "Invalid or expired OTP."
⚠️ GET /api/auth/school/ is NOT a valid route — only POST (create_school) is registered on that path. features/auth/api/auth-api.ts's getCurrentSchool() currently calls GET on this path and almost certainly always fails silently (caught in use-login.ts, falls back to default branding). Use GET /api/schools/:id/ instead — see below.

School
POST /api/auth/school/ — create school (authenticated)
Body: { name, slug, school_type, levels[], state, city, address, phone_number, email, student_capacity }.
levels[] from the 5 level values; school_type derived from levels; state = uppercase enum (see states). Success: { requires_school_selection, state, access, refresh, school{...full} }. Store new tokens + school in the school-store.
GET /api/schools/:id/ — school detail (authenticated)
Returns full school including levels and branding (primary_color, accent_color, logo, motto). This is the correct endpoint to hydrate currentSchool after a plain login (see the known bug above) — already used this way by onboarding's useSchoolLevels().
GET /api/schools/ — school list (authenticated). Wired: features/dashboard (school switcher), via lib/school/get-my-schools.ts.
Paginated { count, next, previous, results: [{ id, name, slug, subdomain, school_type, levels, city, state, logo, is_active, created_at }] }. Has levels but no branding colours (primary_color/accent_color) — fine for a school-switcher list, not for branding logic (use the :id/ detail endpoint for that). get_queryset() filters to the caller's OWN active memberships for non-platform-admins (platform admins get every school) — confirmed live: returns every school a user belongs to regardless of which one their current token is scoped to, since list/retrieve only require IsAuthenticated, not IsSchoolMember.
POST /api/auth/switch-school/ — switch JWT context (authenticated). Wired: features/dashboard/hooks/use-switch-school.ts.
Body: { school_slug }. Exchanges any valid current JWT (scoped to any of the user's schools, or unscoped) for one scoped to a different school the caller has an active membership at — no re-auth needed. Success: same shape as login's scoped response (built from the same backend _token_pair_dict helper) — { requires_school_selection: false, state, access, refresh }. Errors: 400 if no active membership at that slug; platform admins get PermissionDenied (no personal school memberships to switch between).
GET /api/schools/search/?q= — public school name search (AllowAny). Wired: create-school's duplicate warning, via features/auth/api/auth-api.ts searchSchools().
Returns a BARE ARRAY (no pagination envelope) of { id, name, slug, city, state } — confirmed live. Matches name__icontains, so it's a substring search ("Academy" matches anything containing it). q must be >= 2 chars or it 400s ("Ensure this field has at least 2 characters."), so callers must gate on length. city/state are returned so a near-duplicate can be told apart from the real thing. Purpose per its own docstring: warn a would-be owner about duplicate schools during registration — advisory only, since school NAMES have no uniqueness constraint (only slug does).
PATCH /api/schools/:id/ — update school / branding (authenticated)
Confirmed PATCH. Onboarding branding step sends ONLY: { logo, primary_color, accent_color, motto }. Full profile (name, address, city, phone_number, email, website) editable here in dashboard Settings. Returns full school → update currentSchool (repaint shell).

Onboarding — owner-only (IsSchoolMember + IsSchoolOwner on all three actions below)
GET /api/schools/:id/onboarding/ — stage
Confirmed shape: { current_step, skipped_steps, is_completed, completed_at } (matches OnboardingProgressSerializer exactly). Drives resume + completed→dashboard. Has a trailing slash — fixed from an earlier wrong assumption; the old "no trailing slash" version only worked via Django's APPEND_SLASH redirect on GET.
POST /api/schools/:id/onboarding/advance/ — advance
Body: { step, skipped? }. Response: same shape as stage. Call after each step (completed or skipped). Confirmed step keys/order: branding → academic_year → classes → subjects → review (accounts/enums.py OnboardingStep); advancing review is confirmed to set is_completed=True. Owner-only: a non-owner admin gets 403 (view-level IsSchoolOwner) and, even if that were bypassed, the service layer independently rejects non-owners too.
GET /api/schools/:id/onboarding/review/ — review aggregate
Has a trailing slash (see note above). Returns { school (levels + branding), academic_sessions:[{id,name,periods:[{id,name,order,start_date,end_date,is_current}],created_at}], classes:[{id,name,level,order,arms:[{id,name}],created_at}], subjects:[{id,name,level,is_core,created_at}] }. Still useful as a one-call read-all for the onboarding Review step; for dashboard Settings, prefer the dedicated list endpoints below instead.

Academic sessions & periods (token-scoped)
POST /api/academic-sessions/with-periods/
Body: { name, periods: [{ name, order, start_date, end_date, is_current }] }. Periods are flexible: free-text names, any count, exactly one is_current. Response: { id, name, periods:[{id,...}], created_at }.
GET /api/academic-sessions/ — list (confirmed, school-scoped) · GET /api/academic-sessions/:id/ — detail
PATCH /api/academic-sessions/:id/ — edit session (name and/or full periods replace) · DELETE — remove session
PATCH /api/academic-periods/:id/ — edit one period (name/order/start_date/end_date/is_current) · DELETE /api/academic-periods/:id/ — remove one period
Confirmed built (already wired: Phase 4.2 Review edit/add/delete). No backend guard against deleting a session's last period, or against leaving no period is_current after a delete — both are enforced client-side only.
POST /api/academic-periods/:id/mark-current/ — one-click term rollover. Wired: Settings > Sessions' "Make current" action (features/settings/components/sessions/term-row.tsx). No body. Requires manage_academic_structure. Unsets whichever period was current before, atomically — verified live on a 3-term session. Redundant with PATCH { is_current: true } (update_academic_period unsets the others too), but avoids sending unrelated fields for the common case.
POST /api/academic-sessions/:id/academic-periods/ — add a period to an existing session
Confirmed built and wired (nested @action on AcademicSessionViewSet). Body: { name, order, start_date, end_date, is_current? }.

Classes & arms
GET /api/classes/templates (no trailing slash — separately confirmed against a live request, an exception to the general DRF-router rule above)
{ primary:[{name,order}], junior_secondary:[...], senior_secondary:[...] } — class names only, no arms. Prefill filtered by the school's levels. Nursery/creche: no template → add-your-own.
GET /api/classes/ — list (confirmed, school-scoped) · GET /api/classes/:id/ — detail
POST /api/classes/bulk/
Body: { classes: [{ name, level, arms?: [{ name }] }] }. arms optional — omit entirely when a class has no arms (don't send arms: []; arm name is the full label e.g. "Primary 1 A"). Response: bare array [{ id, name, level, order, arms:[{id,name}], created_at }] — NOT wrapped in { classes: [...] }.
PATCH /api/classes/:id/ edit · DELETE — remove class
level is deliberately not editable post-creation (ClassUpdateSerializer excludes it) — delete and recreate if a different level is needed.
PATCH /api/class-arms/:id/ edit arm · DELETE /api/class-arms/:id/ — remove arm
POST /api/classes/:id/arms/ — add a single arm to an existing class
Confirmed built and wired. Body: { name }.

Subjects
GET /api/subjects/templates (no trailing slash — same confirmed exception as classes/templates)
{ nursery:[{name,is_core}], primary:[...], junior_secondary:[...], senior_secondary:[...] }. Prefill filtered by the school's levels.
GET /api/subjects/ — list (confirmed, school-scoped) · GET /api/subjects/:id/ — detail
POST /api/subjects/bulk/
Body: { subjects: [{ name, level, is_core }] }. Response: bare array [{ id, name, level, is_core, created_at }] — NOT wrapped in { subjects: [...] }.
PATCH /api/subjects/:id/ edit (name / level / is_core) · DELETE — remove
/api/subjects/bulk-update/ exists but not used — prefer per-record PATCH.

Grading (shipped 2026-08-02, wired to /settings/grading)
GET /api/grading-systems/ — list (school-scoped, paginated — a school has at most one per level, ≤5 total, so the default page size always covers it) · GET /api/grading-systems/:id/ — detail
Item shape: { id, level, name, components: [{id,name,max_obtainable,order}], ranges: [{id,grade,min_score,max_score,remark}], created_at }.
POST /api/grading-systems/ create — Body: { level, name?, components: [{name,max_obtainable,order}], ranges: [{grade,min_score,max_score,remark}] }. Atomic — creates the system with its components and ranges in one call. Validation (400): level must be one the school offers; only one system per (school, level); component max_obtainable values must sum to exactly 100; ranges must be contiguous, no gaps/overlaps, covering 0-100 inclusive. Gated on manage_academic_structure.
PATCH /api/grading-systems/:id/ edit — Body: { name?, components?, ranges? }. If components/ranges is provided, it WHOLLY REPLACES the existing set (deleted and recreated) — not merged, and independent of each other. level is not editable post-creation. Same validation as create.
DELETE /api/grading-systems/:id/ — cascades to components and ranges. Gated on manage_academic_structure.
Confirmed live: duplicate-level create correctly 400s ("A grading system already exists for this level"); creating for a level the school doesn't offer 400s ("School does not offer level(s): ...").

Roles
GET /api/school-admin-roles/ — list roles for the caller's school
{ id, name, permissions, is_owner }[], paginated. Wired: features/invitations/hooks/use-roles.ts (admin-invite role_id picker) and Settings → Roles (features/settings/components/roles-page.tsx).
POST /api/school-admin-roles/ create · PATCH /api/school-admin-roles/:id/ edit · DELETE remove
All gated on manage_roles. The Owner role can't be renamed or deleted. Wired: Settings → Roles.
GET /api/school-admin-roles/permissions/ — full permission-string catalog
{ permissions: [...] } — the complete SCHOOL_PERMISSIONS list, for populating a role-creation multiselect. Requires only school membership, not manage_roles.

Invitations (authenticated unless noted)
POST /api/invites/invite-admin/
Body: { first_name, last_name, email, phone_number?, role_id } → { detail }. Wired.
POST /api/invites/invite-teacher/
Body: { first_name, last_name, email, phone_number?, teacher_type } where teacher_type ∈ class | subject | both → { detail }. Wired.
POST /api/invites/invite-parent/
Body: { first_name, last_name, email, phone_number? } → { detail }. Wired. (Parent↔student linking is separate — see below.)
POST /api/invites/invite-student/ — direct create (NOT an email invite)
Body: { first_name, last_name, admission_number, password, gender, date_of_birth?, email? } (gender ∈ male|female|other). Success returns the student object incl. credentials: { first_name, last_name, email (auto internal), phone_number, subdomain, admission_number, gender, date_of_birth, password, password_note }. `password`/`password_note` are BOTH null when the email/admission-number resolved to an EXISTING user rather than creating one — their existing password is kept as-is (not reset), and `password_note` explains why (e.g. "User already has existing password for this email."). Otherwise `password` is the plaintext just set and `password_note` is null. Show a copyable credentials screen when `password` is present ("won't be shown again"); show `password_note` instead when it's not. Student logs in with admission_number + password. Wired.
GET /api/invites/ — list pending invites. Wired.
Paginated (fetched with page_size=100, no pagination UI), filterable (?persona=, ?status=) and searchable (?search=, by email). Persona-scoped server-side: the caller only sees invite types their own admin permissions allow (manage_roles → admin invites, add_staff → teacher, add_students → parent+student) — a non-admin or under-permissioned admin gets an empty list, not a 403. Item shape: { id, token, email, persona, school_admin_role: {id,name,permissions}|null, status: pending|accepted|invalidated|expired, expires_at, created_at }. `status` is `InviteToken.status` (a real stored field — `PENDING`/`ACCEPTED`/`INVALIDATED`, `InviteTokenStatus` TextChoices) EXCEPT `expired`, which stays derived server-side (pending + past `expires_at`, never stored).
GET /api/invites/{token}/ — invite detail (public). Wired.
For rendering the accept-invite page. Returns { school: {name,slug,subdomain}, persona, email, has_password }.
POST /api/invites/accept/ — accept an invite (public). Wired.
Body: { token, password?, confirm_password? } (both required only if the invitee has none yet — confirm_password is cross-checked server-side too, not just client-side). Success: JWT pair, same shape as login (built from the same _token_pair_dict helper) — the frontend's useAcceptInvite reuses useLogin's exact post-success flow (store tokens, hydrate school branding, resolve landing path).
POST /api/invites/{id}/resend/ — resend an invite. Wired.
Sets the old token's `status` to `INVALIDATED` and issues a fresh one (confirmed: blocks on already-`accepted` or already-`invalidated`, not on expiry — so an expired invite can still be resent). Response: the new invite token object, same shape as the list item. Frontend disables the Resend button for both `accepted` and `invalidated` rows up front, matching this.

Directories — list + detail (all school-scoped for school members; platform admins see all + can filter by school_id).
GET /api/teachers/ , GET /api/teachers/:id/ — Wired. requires view_staff (school) / view_platform_staff (platform). Frontend: features/staff (nav label "Staff"). List item: { id, user: UserMinimal, employee_id, teacher_type, specialization, created_at }. Detail adds membership, school, qualification, date_joined_school.
GET /api/parents/ , GET /api/parents/:id/ — Wired. requires view_parents / view_platform_parents. Frontend: features/parents. Detail response prefetches linked students as student_links: [{ id, student_id, student_name, admission_number, relationship, is_primary_contact }].
GET /api/students/ , GET /api/students/:id/ — Wired. requires view_students / view_platform_students. Frontend: features/students. Search covers name, email, and admission_number. Detail prefetches linked parents as parent_links (same shape, reversed) and includes medical/admission fields (blood_group, genotype, allergies, etc. — all nullable).
POST /api/students/:id/reissue-password/ — Wired. admin reissues a password for a student with a synthetic internal email. Requires edit_students. Body: { password }. Only shown in the UI when the student's email ends in @internal.schoolos.com (real-email students must use self-serve reset instead; the backend rejects it otherwise).
GET /api/school-admins/ , GET /api/school-admins/:id/ — Wired. Frontend: features/admins (nav label "School Admins"). requires view_staff / view_platform_staff. List item: { id, user: UserMinimal, school_admin_role: {id,name,permissions}|null, created_at }. Detail adds membership, school. Filterable by school_admin_role (role id), plus the shared filters below.
POST /api/school-admins/:id/assign-role/ — Wired. Body: { role_id }. Requires manage_roles. Raises if the role belongs to a different school.
POST /api/school-admins/:id/unassign-role/ — Wired. No body. Requires manage_roles. Sets school_admin_role to null (admin becomes permissionless until reassigned).
All four directories support ?search= (name/email, +admission_number for students), is_active (bool, filters on membership.is_active), created_at_after/before, page, page_size — plus teacher_type (teachers), gender/enrollment_status (students), state (parents), school_admin_role (school-admins).
Real gap, not a docs gap: none of these profiles carry a class/arm (student) or class/subject (teacher) assignment yet — those FKs don't exist on the backend models. Directory read views ship without them; "enrol"/"assign" actions can't until the backend adds them.

Parent↔student linking (authenticated). Wired — frontend: features/parent-student-links (shared create/delete), surfaced directly on the Student and Parent detail pages (features/students, features/parents) rather than a separate page.
GET /api/parent-student-links/ — list, filterable by parent_profile / student_profile (not used directly by the frontend — it reads links from the parent/student detail responses' nested student_links/parent_links instead).
POST /api/parent-student-links/ — create
Body: { parent_profile_id, student_profile_id, relationship, is_primary_contact? } — the field names are parent_profile_id/student_profile_id (with the _id suffix), not parent_profile/student_profile. Gated on add_students (same permission as parent/student invites). Response: { id, parent_profile: ParentListItem, student_profile: StudentListItem, relationship, is_primary_contact, created_at }.
DELETE /api/parent-student-links/:id/ — remove
No update action — change relationship/is_primary_contact by delete + recreate (the UI does this as unlink + a fresh "Link a parent/student" dialog).

Audit log (new `audit` app, shipped 2026-08-02/03. Wired: dashboard home's Recent Activity, via features/dashboard/api/audit-log-api.ts)
GET /api/audit-logs/ , GET /api/audit-logs/:id/ — read-only (no write endpoints anywhere, immutable by design). School members need view_audit_logs and see only their own school's logs (school=null platform-level entries excluded); platform admins need view_platform_audit_logs and see everything, filterable by school_id.
Item shape: { id, actor: UserMinimal|null, school, school_name, action, target_type, target_id, target_repr, changes, created_at }. actor is null for system-triggered events. changes is a list of {field,old,new} dicts, null for create/delete (target_repr suffices there).
Filters: ?action= (icontains), ?actor= (UUID), ?school_id= (UUID, platform admins only in practice), ?created_at_after=/?created_at_before= (date, date__gte/date__lte), ?search= (actor's first_name/last_name/email ONLY — confirmed live that a target's name matches nothing, so the UI must not imply otherwise). Paginated. Wired twice: /settings/audit-log (25/page, ?action= as free text since icontains makes partials useful, both date bounds, ?search=) and the dashboard-home widget (?page_size=5, no pagination UI).
Known gaps the audit-log UI ran into: no export endpoint; no target_type filter (so "all changes to Students" isn't expressible); no way to filter/search by who was AFFECTED; and no action-catalog endpoint, so features/audit-logs/lib/action-catalog.ts hardcodes all 40 action strings (verified 1:1 against the backend on 2026-08-05).
Populated by both the accounts and academic apps' services (invites, role changes, branding/session/class/subject/grading edits, etc.). target_repr defaults to Python str(target) when the service call doesn't pass one explicitly (audit/services.py) — confirmed every model's __str__ used here appends " @ SchoolName" (or, for SchoolAdminRole, ends in the literal word "role"); features/dashboard/lib/format-audit-entry.ts strips both since this feed is always single-school. ~34 distinct action strings exist (accounts + academic services) — format-audit-entry.ts maps each to a sentence, with a generic fallback for any new one added later.

Fees — fee items (wired 2026-08-24 to /settings/fees; every line below confirmed against a live request)
A FeeItem is one billable line for a (klass, academic_period) pair. Scoped to Class, NOT level — SS3 can carry a WAEC fee SS1 doesn't, while SS3 A and SS3 B are billed identically, so arms never enter into it. There is no fee-structure wrapper and no invoice entity: a class's termly total is just the sum of its active items. Amounts are integer Naira (not kobo, not a decimal string).
Unlike most academic-structure viewsets, even listing is gated — fees are financial data. list/retrieve need view_fees; create/update/destroy need edit_fees. Confirmed live: a teacher-only token 403s on the list with the generic permission detail, so ErrorState's status-based branch is what shows it.
GET /api/fee-items/?klass=&academic_period=&is_active= — list (paginated).
Filters are the bare FK names (klass, academic_period), while the create body takes klass_id/academic_period_id — same read/write asymmetry as subject-assignments. Item shape: { id, klass, class_name, academic_period, academic_period_name, session_name, name, amount, is_active, created_at }. The frontend deliberately omits is_active and splits the two sets client-side (features/fees/api/fee-items-api.ts) — one class/term holds a handful of items, and it makes the Show-retired toggle instant.
POST /api/fee-items/ — Body: { klass_id, academic_period_id, name, amount }. amount is min_value=1. 400s on a duplicate name within the same (klass, academic_period): "An active fee item with this name already exists for this class and period." Confirmed live that the check is case-insensitive ("tuition" collides with "Tuition").
PATCH /api/fee-items/{id}/ — Body: { name?, amount? }. Confirmed live that sending amount alone works and returns the full serializer. Amount edits are deliberately unguarded even after payments exist — balances are computed live, so raising an amount just surfaces a fresh remainder next read. Do NOT build a "locked because paid" state. klass, academic_period and is_active are all read-only here, so a deactivated item can never be revived through this API.
DELETE /api/fee-items/{id}/ — deletes, OR deactivates in place (is_active=false) when any Payment or StudentFeeWaiver references the item. Returns 204 either way, so the response cannot be read for which happened — the refetched list is what settles it. Confirmed live: with one waiver attached, DELETE returned 204 and the item came back from the list with is_active:false. Also confirmed the unique-name constraint is conditional on is_active, so a fresh item with the same name can be created after a deactivation (an active and a retired "Tuition" can coexist).
Not yet wired (slices 2–3): fee-waivers, payments (+ receipt PDF), GET /api/students/{id}/fees/, GET /api/class-arms/{id}/fees/defaulters/, GET /api/fee-items/collection-summary/ (gated on view_analytics, not view_fees). See SchoolOS-backend/docs/fees-frontend-handoff.md, and re-verify against the serializers before building.

Reference values
Levels: creche, nursery, primary, junior_secondary, senior_secondary.
Gender: male, female, other.
teacher_type: class, subject, both.
States (value=uppercase, multi-word uses _): ABIA, ADAMAWA, AKWA_IBOM, ANAMBRA, BAUCHI, BAYELSA, BENUE, BORNO, CROSS_RIVER, DELTA, EBONYI, EDO, EKITI, ENUGU, FCT, GOMBE, IMO, JIGAWA, KADUNA, KANO, KATSINA, KEBBI, KOGI, KWARA, LAGOS, NASARAWA, NIGER, OGUN, ONDO, OSUN, OYO, PLATEAU, RIVERS, SOKOTO, TARABA, YOBE, ZAMFARA.
