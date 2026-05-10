# Auratech web — project guide

Canonical project doc. Loaded automatically by Claude Code in every session.
Keep this current; if a fact about *the project itself* belongs in memory,
prefer putting it here instead.

## What this is

`auratech.cat` — corporate site + custom CMS for **Auratech SL**, a Catalan
tech consultancy (IoT & retail, cloud & infra, digital strategy). Two halves
in the same Next.js app:

- **Public site** (`/[locale]/...`) — i18n marketing site, blog, projects
  portfolio, services, contact. Catalan/Spanish/English, default `es`.
- **Admin CMS** (`/admin/...`) — block-based page & blog editor with
  scheduled publishes, version history, multi-locale editing, media library,
  contact submissions, audit log. Inspired by WordPress/Gutenberg.
- **Client dashboard** (`/dashboard/...`) — minimal area for clients
  (invoices, messages, project tracking).

Production runs on a Hetzner VPS via Docker Compose. See
[Operations](#operations).

## Stack

- **Framework**: Next.js 14 App Router + TypeScript (strict)
- **Database**: PostgreSQL 16 via Prisma 5.22.0 (pinned — see
  [Operations](#operations))
- **Auth**: NextAuth (Credentials provider) + TOTP 2FA
  (`bcryptjs`, `qrcode`)
- **i18n**: `next-intl` v4 — locales `en`, `ca`, `es`, default `es`
- **UI**: Tailwind v3 + Radix primitives, `class-variance-authority`
  and `tailwind-merge` for class composition. No shadcn/ui.
- **Fonts**: Space Grotesk (body, `--font-sans`) + JetBrains Mono
  (mono, `--font-mono`), both via `next/font/google` in
  [src/app/layout.tsx](src/app/layout.tsx)
- **Animation**: `framer-motion`
- **Editor**: TipTap v3 (rich text, inline) + `@dnd-kit` (drag-reorder)
- **Forms**: React Hook Form + Zod
- **Email**: Resend (`resend`)
- **Errors**: Sentry (`@sentry/nextjs`)
- **Tests**: Playwright (e2e only)
- **Bundle output**: `output: "standalone"` for Docker

Next config lives in `next.config.mjs`.

## Repo layout

```text
src/
  app/
    [locale]/
      (public)/         marketing site, i18n routes
      (auth)/           login, registre
    admin/              CMS (no locale prefix)
    dashboard/          client area (no locale prefix)
    api/                REST endpoints
    layout.tsx, robots.ts, sitemap*.ts, not-found.tsx
  components/
    ui/                 Radix-based primitives, custom variants
    layout/             header, footer, language-selector
    sections/           reusable landing sections
    blocks/             CMS block components + block-renderer
    admin/              admin-only UI
      page-editor/      WP-style canvas + sticky inspector
    dashboard/          client dashboard UI
    seo/, analytics/, team/
  lib/
    auth.ts, db.ts, authz.ts, rate-limit.ts, email.ts,
    validations/, file-type.ts, preview-mode.ts, …
  i18n/
    config.ts (locales), request.ts (next-intl wiring)
  middleware.ts         next-intl routing + admin/dashboard auth gate
  types/

prisma/
  schema.prisma         all models (see "Database" below)
  migrations/           SQL migrations — production uses these, not db push
  seed.ts + seed-*.ts   fixtures + maintenance scripts

messages/
  ca.json, es.json, en.json   next-intl translations

public/                 static assets
scripts/
  env-sync.sh           prod ↔ local .env sync (see memory)
  optimize-images.ts    sharp-based image preprocessing

openspec/               design-doc archive for major changes
                        (referenced from comments in src/lib/authz.ts,
                        src/lib/rate-limit.ts, src/app/api/media/upload/)

tests/e2e/              Playwright smoke + headers
docs/                   user-facing docs (architecture, cms, operations)
```

## Routes

### Public (`src/app/[locale]/(public)/`)

Locale prefix is always present. `next-intl` middleware enforces this on
public routes only (skipped for `/api`, `/admin`, `/dashboard`).

| Route | Purpose |
| --- | --- |
| `/[locale]` | Home |
| `/[locale]/serveis` | Services index |
| `/[locale]/serveis/[slug]` | Service detail |
| `/[locale]/projectes` | Projects portfolio |
| `/[locale]/blog` | Blog index |
| `/[locale]/blog/[slug]` | Blog post |
| `/[locale]/sobre` | About |
| `/[locale]/contacte` | Contact form |
| `/[locale]/labs` | Labs / resources |
| `/[locale]/casos` | Case studies |
| `/[locale]/avis-legal`, `/privacitat`, `/cookies` | Legal |
| `/[locale]/[slug]` | Dynamic single-segment route for CMS-authored pages |

The dynamic `[slug]/page.tsx` is what serves CMS pages — e.g.
`/automatitzacions-ia` resolves here because a `Page` exists with that
slug across all 3 locales. (It is not a catch-all in the Next.js sense:
it matches a single path segment, not nested paths.)

`force-dynamic` is set explicitly on the routes that read DB content:
`projectes/page.tsx`, `serveis/page.tsx`, `blog/page.tsx`,
`blog/[slug]/page.tsx`, `[slug]/page.tsx`. Other public pages
(home, sobre, contacte, labs, casos, legal) are not force-dynamic.

There is **no** `/projectes/[slug]` public detail page on `main`. Project
cards link only to the listing.

### Admin CMS (`src/app/admin/`)

Protected by `middleware.ts` — requires `SUPERADMIN`/`ADMIN`/`EDITOR`. 2FA
is mandatory for `SUPERADMIN`/`ADMIN`.

| Route | Purpose |
| --- | --- |
| `/admin` | Dashboard home |
| `/admin/blog`, `/admin/blog/nou`, `/admin/blog/[id]` | Blog CRUD + editor |
| `/admin/pagines`, `/admin/pagines/nova`, `/admin/pagines/[id]` | Pages CRUD + editor |
| `/admin/serveis` | Services list + reorder (DND Kit) |
| `/admin/projectes` | Projects list |
| `/admin/scheduled` | Upcoming scheduled publishes |
| `/admin/media` | Media library + upload |
| `/admin/contacte`, `/admin/contacte/[id]` | Contact submissions |
| `/admin/clients` | Users / clients |
| `/admin/configuracio` | Site settings |
| `/admin/audit-log` | Security audit trail |

### Client dashboard (`src/app/dashboard/`)

Authenticated, all roles. `/dashboard`, `/perfil`, `/projectes[/[id]]`,
`/factures`, `/missatges`.

### API (`src/app/api/`)

REST-style. `route.ts` per folder. Highlights:

- `auth/[...nextauth]` — Credentials login
- `blog/*`, `pages/*`, `services/*`, `projects/*` — content CRUD,
  block subcollection, version history (`/versions[/v]`), schedule,
  publish
- `blog/slug/[slug]` — public lookup of a post by slug
- `services/reorder` — drag-reorder support for `/admin/serveis`
- `media/*` — list, upload (multipart, magic-byte validated), delete
- `contacte` — public form submission
- `admin/contact-submissions/*` — review submissions
- `profile/*` — password change, 2FA setup/confirm/disable, GDPR export
  & delete
- `factures`, `missatges` — client dashboard data
- `og` — dynamic OG-image generation (`route.tsx`, JSX-based)
- `cron/run-scheduled-publish` — internal endpoint, called by Hetzner
  crontab every 5 min with `Authorization: Bearer $CRON_SECRET`

Auth helpers live in:

- [`src/lib/auth.ts`](src/lib/auth.ts) — NextAuth `authOptions`
  (Credentials provider, JWT shape, callbacks)
- [`src/lib/api-auth.ts`](src/lib/api-auth.ts) — `requireAuth(roles?)`
  for API routes (returns `{error, session}` shape)
- [`src/lib/auth-helpers.ts`](src/lib/auth-helpers.ts) — type-safe
  wrappers around `getServerSession` so routes don't need
  `as any` casts
- [`src/lib/authz.ts`](src/lib/authz.ts) — `ADMIN_ROLES`, ownership
  helpers (IDOR prevention) — see
  `openspec/changes/archive/2026-05-06-security-week-1/specs/api/spec.md`

Rate limiting via the `RateLimit` Postgres table
([`src/lib/rate-limit.ts`](src/lib/rate-limit.ts)) — no Redis yet,
trade-off documented in
`openspec/changes/archive/2026-05-06-security-week-1/design.md §1`.

## Database

14 Prisma models in `prisma/schema.prisma`:

- **`User`** — credentials, role enum (SUPERADMIN/ADMIN/EDITOR/CLIENT),
  2FA fields (`twoFactorSecret`, `twoFactorPendingSecret`,
  `twoFactorRecoveryCodes` — recovery codes hashed)
- **`BlogPost` / `BlogPostVersion`** — locale-scoped, `translationKey`
  groups variants across locales, append-only versions
- **`Page` / `PageVersion`** — locale-scoped, slug shared across locales
  (locale variants share the same slug; pages query siblings by `slug`)
- **`Block`** — generic block, belongs to `Page` *or* `BlogPost` via
  nullable FKs (`pageId`, `blogPostId`); two indexes
  `(pageId, order)` and `(blogPostId, order)`
- **`Service`** — `@@unique([slug, locale])`
- **`Project`** — `user User?` (nullable owner via `userId`),
  locale-scoped (`@@unique([slug, locale])`)
- **`Media`** — uploaded assets, indexed on `folder` and `mimeType`
- **`Invoice`, `Message`** — client portal data
- **`ContactSubmission`** — public form intake
- **`AuditLog`** — append-only security events (actor, action, target,
  IP, UA, metadata JSON)
- **`RateLimit`** — Postgres-backed counters keyed by `"action:ip"`

Migrations are the source of truth in production. Use
`prisma migrate dev` locally, `prisma migrate deploy` on prod.
**Never** use `db push` in production.

## CMS editor (the WP-style canvas + inspector)

Validated UX pattern — do not regress to slide-in panels. Lives under
[`src/components/admin/page-editor/`](src/components/admin/page-editor/):

- **Top bar** (sticky): back arrow, eyebrow context label, Save / Publish.
  Minimal — no title or status here.
- **Center column**: title (large inline input) + visual block stack with
  drag-reorder via `dnd-kit`.
- **Right sidebar** (`InspectorSidebar`, sticky, ~320px): three tabs —
  document tab (label varies: "Pàgina" / "Article"), "Bloc"
  (auto-switches when a block is selected), "SEO".
- **Inline TipTap** for `rich-text` blocks: editor renders directly inside
  the block on the canvas with its toolbar. When unselected, the formatted
  HTML renders read-only with `prose prose-invert`. The inspector "Bloc"
  tab for rich-text shows a notice pointing back to inline editing — never
  duplicates the editor.
- **All other block types** edit via `BlockEditorForm` in the inspector
  "Bloc" tab. Block types: hero, features-grid, pricing, stats, rich-text,
  image, gallery, video, contact-form, cta, team-grid, testimonial,
  accordion, logo-grid, code, divider, spacer (17 types in
  [`src/components/blocks/`](src/components/blocks/), plus
  `block-renderer.tsx` which dispatches to the right one).
- **Side-by-side multi-locale editing**: 3-col grid (canvas + canvas +
  inspector). `activeSide: 'left' | 'right'` tracks which variant the
  inspector drives. Pages query siblings by `slug`; blog by
  `translationKey`.

Key files: `visual-canvas.tsx`, `sortable-block-shell.tsx`,
`canvas-block-body.tsx`, `block-summary.tsx`, `insert-point.tsx`,
`inspector-sidebar.tsx`, `seo-panel.tsx`, `schedule-controls.tsx`,
`version-history.tsx`, `version-preview-dialog.tsx`,
`use-variant-state.ts`, `variant-column.tsx`.

`useVariantState` exposes `setBlocksRaw` for bulk imports (used by "Copia
els blocs de CA"); cloned blocks drop persisted ids so each becomes a new
row on save. Block IDs in the editor: `_clientId` is a stable React key,
`id` (optional) is the persisted DB id — new blocks have no `id` until
first save.

**Do not reintroduce Plate.js**: was attempted, abandoned for fragmented
ecosystem. TipTap is sufficient.

## Scheduled publishing

`PostStatus` and `PageStatus` both include `SCHEDULED`. Both models have
`publishAt: DateTime?`.

Hetzner crontab runs `/usr/local/bin/auratech-run-scheduled-publish.sh`
every 5 min, which POSTs to `/api/cron/run-scheduled-publish` with
`Authorization: Bearer $CRON_SECRET` (secret in `/opt/auratech/.env`,
plumbed to backend container via compose env). Logs at
`/var/log/auratech-scheduled-publish.log`.

The endpoint promotes rows where `publishAt <= now()` AND
`status = 'SCHEDULED'` to `PUBLISHED` and sets `publishedAt = now()`.

## Auth & security

- Credentials only (no OAuth). Passwords hashed with `bcryptjs`.
- 2FA: RFC 6238 TOTP, `qrcode` for setup. Pending secret is promoted on
  confirm. 10 plaintext recovery codes shown once, hashed for storage.
- Mandatory 2FA for `SUPERADMIN`/`ADMIN` before `/admin/*` access —
  enforced in `middleware.ts`.
- Rate limiting via `RateLimit` table (login, contact form,
  password-reset).
- Audit logging on sensitive actions (`AuditLog` is append-only).
- GDPR: `/api/profile/delete` (anonymizes user) and `/api/profile/export`
  (JSON download).
- File upload: magic-byte validation in `src/lib/file-type.ts`. Spec:
  `openspec/changes/archive/2026-05-06-security-week-1/design.md §4`.
- Security headers configured in `next.config.mjs` (CSP, HSTS via
  `upgrade-insecure-requests` in prod only — Safari refuses
  `upgrade-insecure-requests` for localhost in dev).

## i18n conventions

- 3 locales, default `es`. Definition: `src/i18n/config.ts`.
- Public routes: locale prefix always present (`/es/blog`, `/ca/serveis`).
- Admin/dashboard: no locale prefix.
- Translations: `messages/{en,ca,es}.json` (~42 KB each).
- For internal nav in public routes, use `Link` from
  [`@/i18n/navigation`](src/i18n/navigation.ts) — a `next-intl`
  wrapper that auto-prefixes the active locale. Admin/dashboard use
  plain `next/link` because those areas have no locale prefix.
- Database content: `Page`/`BlogPost`/`Service` rows are locale-scoped.
  Pages share `slug` across locales; blog posts use `translationKey` to
  group locale variants (slugs differ per language by SEO design).

## Build / dev / test

```bash
npm run dev               # next dev
npm run build             # next build (Sentry wraps if SENTRY_AUTH_TOKEN set)
npm run start             # production server
npm run lint              # next lint

npm run db:generate       # prisma generate
npm run db:migrate        # prisma migrate dev (local)
npm run db:migrate:deploy # prisma migrate deploy (prod / CI)
npm run db:push           # prisma db push (LOCAL ONLY, never prod)
npm run db:seed           # tsx prisma/seed.ts
npm run db:studio         # GUI

npm run test:e2e          # Playwright
```

Local dev needs Postgres running. Easiest: `docker compose up -d` from
repo root (uses local `docker-compose.yml`). Then sync env from prod —
see [Operations](#operations).

## Operations

Full procedure in [docs/operations.md](docs/operations.md). On-server
credential paths and SSH access are in session memory (`prod_access.md`)
because they don't belong in the public repo.

- **Deploy sequence**: `git pull` in `/opt/auratech/repo`, then
  `docker compose build backend && docker compose up -d backend` from
  `/opt/auratech/`. Add `prisma migrate deploy` only when there's a new
  migration.
- **Env sync**: `scripts/env-sync.sh {pull|push|diff|watch|bootstrap}`
  mirrors prod ↔ local. `.env` is gitignored. Hostnames live in
  `docker-compose.yml`, secrets live in `.env`.
- **OVH DNS**: `auratech.cat` zone is managed via OVH API tokens stored
  in `/opt/auratech/.env` on prod. **No code in this repo touches OVH**
  — DNS is operational tooling, snippet in
  [docs/operations.md](docs/operations.md).

### Prisma version pin gotcha

`npx prisma` without a version tag auto-fetches Prisma v7, which breaks
this v5 schema (`url = env("DATABASE_URL")` is no longer valid in v7).
Always use `npx -y prisma@5.22.0` for migrate commands on prod.

## Conventions

- **File naming**: kebab-case for components and utilities
  (`rich-text-editor.tsx`, `auth-helpers.ts`). Pages are `page.tsx`,
  layouts `layout.tsx`, API handlers `route.ts`.
- **Server vs client**: most components are server-rendered. `'use client'`
  is sparse and intentional — interactive forms, the block editor, and
  anything using browser APIs or Framer Motion event handlers.
- **Data fetching**: in server components via Prisma directly; client
  components hit `/api/*` routes.
- **Validation**: Zod schemas in `src/lib/validations/` for any user
  input. React Hook Form + Zod for form components.
- **Styling**: Tailwind utilities + `cn()` (clsx + tailwind-merge)
  helper. No CSS modules, no styled-components.
- **Comments**: only when "why" is non-obvious. No commentary on
  what the code does.

## Design system & brand voice

**"Precision Lab"** — dark, no light-mode toggle.

- **Background**: `hsl(225 15% 6%)` (deep dark with blue undertone)
- **Accent**: `hsl(195 90% 55%)` (cyan/teal)
- **Fonts**: Space Grotesk (body), JetBrains Mono (labels, technical
  details). Both via `next/font/google` in `src/app/layout.tsx`.
- **No serif fonts** (DM Serif Display was removed).
- **Emphasis** via opacity contrast (`text-foreground/40`), not italic.
- **Labels**: `font-mono text-[11px] tracking-[0.3em] uppercase
  text-foreground/40` — see `<SectionLabel>` and `GridBackground`,
  `GlowOrb`, `Logo` (geometric "A" SVG + "Aura" medium + "tech" mono).
- **Animations**: subtle (y: 8–10px, 0.3–0.5s).
- **No shadows** — border-based elevation only.

**Brand architecture**: Auratech is the **parent engineering studio** —
this is its public site. **Divina Combustión** (creative arm) lives in a
separate, future repo with brutalist style — do **not** mix into this
codebase.

**Copy guidelines** (Catalan, set by Oscar):

- Personality-driven, technically literate, never corporate boilerplate.
- No fake stats / made-up numbers.
- No stock photography — precision-minimalist approach.
- Examples of voice: "No fem PowerPoints bonics", "Equip tècnic senior,
  no becaris amb IA".

## What's NOT here

- No `Divina Combustión` site (separate project, not yet built).
- No top-level `/projectes/[slug]` detail page (only listing).
- No Vercel deploy — production is Docker on Hetzner.
- No Redis (rate-limit uses Postgres). May change later — see
  `openspec/changes/archive/2026-05-06-security-week-1/design.md §1`.

## Pointers for further reading

- [docs/architecture.md](docs/architecture.md) — fuller architecture overview
- [docs/cms.md](docs/cms.md) — admin user guide (for editors)
- [docs/operations.md](docs/operations.md) — deploy, env, DNS (no secrets)
- `openspec/specs/` — active specs (admin-dashboard, analytics, api,
  auth, block-editor, blog, client-portal, contact-system,
  content-blocks, content-models, …)
- `openspec/changes/archive/` — design docs for completed changes
  (active proposals, when any, would live in `openspec/changes/`
  directly)
