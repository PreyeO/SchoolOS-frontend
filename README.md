# SchoolOS Frontend

Multi-tenant SaaS school management platform for Nigerian K–12 schools. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, and shadcn/ui.

---

## Getting started

```bash
# 1. Copy env template
cp .env.example .env.local
# Fill in NEXT_PUBLIC_API_BASE_URL (backend at http://localhost:8000/api by default)

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev          # http://localhost:3000

# Other commands
npm run build        # production build
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run format:check # Prettier (check only, used in CI)
```

---

## Architecture

### Route groups

| Group | Path prefix | Purpose |
|-------|-------------|---------|
| `(marketing)` | `/` | Public site: landing, pricing, about, contact |
| `(auth)` | `/login`, `/register`, … | Unauthenticated auth flows |
| `(dashboard)` | `/admin`, `/teacher`, … | Role-scoped app shell (requires auth) |
| `api/` | `/api/*` | Next.js Route Handlers — BFF / proxy to Django backend |

Route groups are a Next.js convention (the `(name)` folder is not part of the URL).

### State management

| Concern | Tool |
|---------|------|
| Server / async data | TanStack Query (`useQuery`, `useMutation`) |
| Client / UI / auth state | Zustand stores in `src/stores/` |

**Rule:** server data lives in TanStack Query cache only. Do not duplicate it into Zustand.

### Feature modules

Everything domain-specific lives under `src/features/<name>/`. Each feature is self-contained:

```
features/
  students/
    components/   # React components used only by this feature
    hooks/        # Custom hooks (useStudents, useStudent, etc.)
    api/          # TanStack Query wrappers + fetch functions
    types.ts      # TypeScript types for this domain
```

Cross-feature shared components live in `src/components/shared/`. Global reusable hooks live in `src/hooks/`.

---

## Folder reference

```
src/
├── app/                    Next.js App Router (pages + layouts + API routes)
│   ├── (marketing)/        Public marketing site
│   ├── (auth)/             Authentication flows
│   ├── (dashboard)/        Role-based dashboards (admin/bursar/teacher/parent/student)
│   └── api/                Route Handlers (BFF layer)
├── components/
│   ├── ui/                 shadcn/ui primitives (auto-generated, do not edit by hand)
│   ├── shared/             Cross-app reusable components (Logo, DataTable, etc.)
│   ├── layout/             Navbar, Sidebar, Footer, MobileNav
│   ├── landing/sections/   Marketing page sections (Phase 2)
│   └── providers/          React context providers (QueryProvider, ThemeProvider)
├── features/               Domain modules (students, attendance, results, fees, etc.)
├── hooks/                  Global reusable hooks (use-media-query, use-debounce, etc.)
├── lib/
│   ├── api/                HTTP client + endpoint definitions
│   ├── validations/        Shared Zod schemas
│   ├── utils.ts            cn() and generic helpers
│   └── constants.ts        Roles, route paths, app name
├── stores/                 Zustand stores (auth-store, ui-store)
├── types/                  Global shared TypeScript types
├── data/                   Static data and config-as-data (nav items, mock data)
├── config/                 Site config, env access wrapper
└── styles/                 Extra CSS (empty — globals.css is in app/)
```

---

## Conventions

### Imports
Always use the `@/` alias. Never use deep relative paths (`../../..`).

```ts
// Good
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";

// Bad
import { cn } from "../../../lib/utils";
```

### File naming

| Type | Convention | Example |
|------|------------|---------|
| React components | `PascalCase.tsx` | `StudentTable.tsx` |
| Hooks | `use-thing.ts` exporting `useThing` | `use-media-query.ts` |
| Everything else | `kebab-case.ts` | `api-client.ts` |

### Server vs client components
Default to **server components** — no `'use client'` unless the file needs:
- Browser APIs / `window` / `document`
- React hooks (`useState`, `useEffect`, etc.)
- Event handlers

### Env values
Never read `process.env` directly in components. Import from `@/config/env`:

```ts
import { env } from "@/config/env";
const apiUrl = env.apiBaseUrl;
```

### Constants
Roles, route paths, and app name live in `@/lib/constants.ts`. Never hardcode `"/admin"` or `"teacher"` in a component.

### Barrel files (`index.ts`)
Only add a barrel where it genuinely cuts import noise. Do not auto-generate them.

---

## Design principles

- **Accessibility first** — all interactive elements must be keyboard-accessible and meet WCAG AA. This is a project default, not an afterthought.
- **Mobile-first** — responsive design assumed throughout. Start from the smallest viewport and scale up.
- **No secrets in code** — all config comes from env via `@/config/env`.

---

## Tech stack

| Tool | Version | Purpose |
|------|---------|---------|
| Next.js | 16.x | Framework (App Router) |
| TypeScript | 5.x strict | Type safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | 4.x | Component primitives |
| Zustand | 5.x | Client state |
| TanStack Query | 5.x | Server state |
| react-hook-form | 7.x | Form management |
| Zod | 4.x | Schema validation |
| lucide-react | latest | Icons (via shadcn) |
| Prettier | 3.x | Code formatting |
| ESLint | 9.x | Linting |
