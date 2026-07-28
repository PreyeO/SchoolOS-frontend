SchoolOS — API Reference (for Claude Code)
Compiled from wired contracts plus a direct backend audit. The backend code in SchoolOS-backend is the source of truth — it moves fast (active commit history), so re-check rather than trusting your last read. Anything still marked ⚠️ is genuinely unconfirmed; everything else below has been read directly off the current views/serializers/urls.
Global
Base URL: NEXT_PUBLIC_API_BASE_URL (dev http://localhost:8000).
Auth: Authorization: Bearer <access> on authenticated calls. Public (no token): signup, verify-email, resend-verification, login, password-reset request/confirm, accept-invite, invite token lookup.
Errors: { "detail": <string | string[]> }. Route through the shared normalizer. Success sometimes returns objects/arrays instead of detail (noted below).
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
GET /api/schools/ — school list (authenticated)
Paginated { count, next, previous, results: [{ id, name, slug, subdomain, school_type, city, state, logo, is_active, created_at }] }. Summary only — no levels, no branding colours. Use for a school-switcher, NOT for level-dependent or branding logic.
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
POST /api/academic-sessions/:id/academic-periods/ — add a period to an existing session
Confirmed built and wired (nested @action on AcademicSessionViewSet). Body: { name, order, start_date, end_date, is_current? }.
POST /api/academic-periods/:id/mark-current/ — dedicated "make this the current period" action
Exists as an alternative to PATCH { is_current: true } (both work; the frontend uses PATCH for one code path).

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

Roles
GET /api/school-admin-roles/ — list roles for the caller's school
{ id, name, permissions, is_owner }[], paginated. Already wired: features/invitations/hooks/use-roles.ts, used for the admin-invite role_id picker.
POST /api/school-admin-roles/ create · PATCH /api/school-admin-roles/:id/ edit · DELETE remove
All gated on manage_roles. The Owner role can't be renamed or deleted. Not yet used by the frontend (would back a Settings → Roles page).
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
Body: { first_name, last_name, admission_number, password, gender, date_of_birth?, email? } (gender ∈ male|female|other). Success returns the student object incl. credentials: { first_name, last_name, email (auto internal), phone_number, subdomain, admission_number, gender, date_of_birth, password } → show a copyable credentials screen ("won't be shown again"). Student logs in with admission_number + password. Wired.
GET /api/invites/ — list pending invites. Wired.
Paginated (fetched with page_size=100, no pagination UI), filterable (?persona=, ?status=) and searchable (?search=, by email). Persona-scoped server-side: the caller only sees invite types their own admin permissions allow (manage_roles → admin invites, add_staff → teacher, add_students → parent+student) — a non-admin or under-permissioned admin gets an empty list, not a 403. Item shape: { id, token, email, persona, school_admin_role: {id,name,permissions}|null, status: pending|accepted|expired, expires_at, created_at }.
GET /api/invites/{token}/ — invite detail (public). Wired.
For rendering the accept-invite page. Returns { school: {name,slug,subdomain}, persona, email, has_password }.
POST /api/invites/accept/ — accept an invite (public). Wired.
Body: { token, password?, confirm_password? } (both required only if the invitee has none yet — confirm_password is cross-checked server-side too, not just client-side). Success: JWT pair, same shape as login (built from the same _token_pair_dict helper) — the frontend's useAcceptInvite reuses useLogin's exact post-success flow (store tokens, hydrate school branding, resolve landing path).
POST /api/invites/{id}/resend/ — resend an invite. Wired.
Invalidates the existing token and issues a fresh one (confirmed: only blocks on already-accepted, not on expiry — so an expired invite can still be resent). Response: the new invite token object, same shape as the list item.

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

Reference values
Levels: creche, nursery, primary, junior_secondary, senior_secondary.
Gender: male, female, other.
teacher_type: class, subject, both.
States (value=uppercase, multi-word uses _): ABIA, ADAMAWA, AKWA_IBOM, ANAMBRA, BAUCHI, BAYELSA, BENUE, BORNO, CROSS_RIVER, DELTA, EBONYI, EDO, EKITI, ENUGU, FCT, GOMBE, IMO, JIGAWA, KADUNA, KANO, KATSINA, KEBBI, KOGI, KWARA, LAGOS, NASARAWA, NIGER, OGUN, ONDO, OSUN, OYO, PLATEAU, RIVERS, SOKOTO, TARABA, YOBE, ZAMFARA.
