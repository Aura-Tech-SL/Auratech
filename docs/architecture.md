# Architecture

Companion to [`/CLAUDE.md`](../CLAUDE.md). This document is for humans
landing on the repo who want a picture of how the parts fit together.

## High-level

```
┌──────────────────────────────────────────────────────────────────┐
│                         Next.js 14 app                           │
│                                                                  │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐    │
│  │ Public site    │   │ Admin CMS      │   │ Client portal  │    │
│  │ /[locale]/...  │   │ /admin/...     │   │ /dashboard/... │    │
│  │ (i18n, SSR)    │   │ (block editor) │   │                │    │
│  └────────┬───────┘   └────────┬───────┘   └────────┬───────┘    │
│           │                    │                    │            │
│           └────────────────────┼────────────────────┘            │
│                                │                                 │
│                          ┌─────▼─────┐                           │
│                          │  /api/*   │                           │
│                          └─────┬─────┘                           │
└────────────────────────────────┼─────────────────────────────────┘
                                 │
                  ┌──────────────┼──────────────┐
                  │              │              │
              ┌───▼───┐     ┌────▼────┐     ┌───▼────┐
              │Prisma │     │ Resend  │     │ Sentry │
              │  +    │     │ (email) │     │        │
              │  Pg   │     └─────────┘     └────────┘
              └───────┘
```

External: Hetzner VPS hosts the app + DB in Docker Compose. OVH manages
DNS for `auratech.cat`. Cron on the host triggers scheduled-publish
endpoint every 5 min.

## Three apps in one Next.js project

The repo serves three distinct experiences from a single Next.js process,
using App Router route groups + segment-level layouts to isolate them:

### 1. Public marketing site — `src/app/[locale]/(public)/`

- All routes carry a locale prefix. `next-intl` middleware enforces it.
- Pages render with `force-dynamic` so the CMS catch-all
  (`[locale]/[slug]/page.tsx`) can serve content authored in `/admin/pagines`.
- Server-rendered, fetches via Prisma; client interactivity reserved for
  forms, animations, and language switcher.

### 2. Admin CMS — `src/app/admin/`

- No locale prefix. Lives at the app root.
- Auth-gated by `middleware.ts`: `SUPERADMIN | ADMIN | EDITOR`.
- Forced 2FA flow for `SUPERADMIN`/`ADMIN` before they can access any
  `/admin/*` route — handled by middleware redirecting to `/setup-2fa`.
- The block editor (pages and blog) is the centerpiece — see
  [cms.md](cms.md).

### 3. Client dashboard — `src/app/dashboard/`

- No locale prefix.
- Auth-gated by `middleware.ts`: any authenticated role.
- Currently slim: profile + 2FA setup, projects list/detail, invoices,
  messages.

## Auth flow

1. User submits email + password to `/[locale]/login`.
2. NextAuth Credentials provider verifies via `bcryptjs.compare`.
3. `RateLimit` table throttles login attempts per IP.
4. If user has `twoFactorSecret`, prompt for TOTP code (or recovery
   code).
5. JWT issued; role + 2FA status embedded.
6. `middleware.ts` enforces role and 2FA on subsequent requests.

Role matrix:

| Role        | `/admin/*` | `/dashboard/*` | 2FA required |
|-------------|------------|----------------|--------------|
| SUPERADMIN  | ✅          | ✅             | mandatory    |
| ADMIN       | ✅          | ✅             | mandatory    |
| EDITOR      | ✅          | ✅             | optional     |
| CLIENT      | ❌          | ✅             | optional     |

GDPR endpoints: `/api/profile/delete` (anonymizes), `/api/profile/export`
(JSON download).

## Data model

See `prisma/schema.prisma` for the full schema. Core relationships:

```
User ─── owns ──▶ Project, Invoice, BlogPost, Page, Media
     ─── sends ──▶ Message
     └── 2FA fields, audit logs

Page ──┬── has many ──▶ Block (parent: pageId)
       └── has many ──▶ PageVersion (snapshot history)

BlogPost ──┬── has many ──▶ Block (parent: blogPostId)
           ├── has many ──▶ BlogPostVersion
           └── grouped by translationKey across locales

Service, Project ── locale-scoped, no blocks
ContactSubmission ── public form intake, queueable for review
AuditLog, RateLimit ── ops tables
```

Locale handling differs slightly:

- **Pages**: same `slug` across locales (e.g. `home/ca`, `home/en`,
  `home/es`). Fetched as siblings via `GET /api/pages?slug=X`.
- **Blog posts**: locale-specific slugs (better SEO). Linked via
  `translationKey`. Fetched via `GET /api/blog?translationKey=X`.

Both `Block` records can hang off either a `Page` *or* a `BlogPost` —
the model has nullable FKs to both.

## Block editor architecture

The CMS editor renders the same canvas + inspector layout for both
`Page` and `BlogPost`. Components are deliberately content-agnostic:

```
PageEditor / BlogPostEditor
  └─ EditorShell
       ├─ TopBar (back, label, save/publish)
       ├─ VariantColumn (× 1 or × 2 if side-by-side)
       │    ├─ TitleInput
       │    └─ VisualCanvas
       │         ├─ DndContext + SortableContext
       │         ├─ SortableBlockShell (× N)
       │         │    └─ CanvasBlockBody
       │         │         ├─ inline TipTap (rich-text only)
       │         │         └─ BlockSummary (other types)
       │         └─ InsertPoint between blocks
       └─ InspectorSidebar (sticky)
            ├─ Document tab (Pàgina / Article)
            │    └─ status, slug, locale, publishAt, version history
            ├─ Bloc tab (selected block's form)
            └─ SEO tab (metaTitle, metaDescription, ogImage)
```

`useVariantState` is the per-variant hook returning blocks, title, and
handlers; used twice in side-by-side mode. `activeSide` (`'left' |
'right'`) determines which variant the inspector drives.

Persistence: every save writes a fresh `PageVersion`/`BlogPostVersion`
row alongside the update — version history is append-only.

## API surface

All under `src/app/api/`. Each folder is a route handler (`route.ts`),
with HTTP method exports.

Resource patterns:

- `GET /api/{resource}` — list (often with filters: `?slug=`,
  `?translationKey=`, `?mimeType=`, `?folder=`)
- `POST /api/{resource}` — create
- `GET /api/{resource}/[id]` — read
- `PUT /api/{resource}/[id]` — update
- `DELETE /api/{resource}/[id]` — delete
- `POST /api/{resource}/[id]/publish` — promote to PUBLISHED (and set
  `publishedAt`)
- `POST /api/{resource}/[id]/schedule` — set `publishAt` + `SCHEDULED`
- `GET /api/{resource}/[id]/versions[/v]` — version history
- `POST /api/{resource}/[id]/blocks` — block subcollection mutations

Shared helpers:

- `src/lib/auth.ts` — NextAuth config, callbacks, JWT shape
- `src/lib/authz.ts` — `requireAuth`, role assertions
- `src/lib/rate-limit.ts` — `RateLimit` table-backed throttle
- `src/lib/validations/` — Zod schemas for input

## i18n flow

```
Request /es/serveis
  │
  ▼
middleware.ts (next-intl middleware for public routes)
  │
  ▼
[locale]/(public)/layout.tsx
  └── NextIntlClientProvider with messages from messages/es.json
       └── (public) layout adds header/footer, then renders page
```

For admin/dashboard the middleware skips i18n routing entirely.

`src/i18n/config.ts` defines the locale list. `src/i18n/request.ts` loads
the right `messages/{locale}.json` per request.

## CSS / styling

Tailwind v3 with custom theme tokens in `tailwind.config.ts` (extends
default with brand colors and the `accent` HSL). `src/app/globals.css`
defines CSS variables for the dark theme + a few base layer overrides.

`cn()` helper (`clsx` + `tailwind-merge`) is used for conditional class
composition — never string concatenation.

## Image pipeline

Source images go in `public/images/` as optimised `.webp` (preferred)
or `.jpg`. The `scripts/optimize-images.ts` script runs `sharp` to
generate optimised versions from arbitrary inputs.

Uploaded media (CMS) goes through `/api/media/upload` (multipart),
validated by magic bytes (`src/lib/file-type.ts`), recorded in the
`Media` table.

## Email

`src/lib/email.ts` wraps Resend. Currently used for:

- Contact form notifications (`sendContactNotification`) — primary +
  optional CC list, both from env (`CONTACT_NOTIFY_EMAIL`,
  `CONTACT_NOTIFY_CC`).

## Error reporting

Sentry initialised in `sentry.client.config.ts`,
`sentry.server.config.ts`, `sentry.edge.config.ts`. With
`NEXT_PUBLIC_SENTRY_DSN` empty, init is a no-op (intentional design for
dev / unconfigured envs).

`next.config.mjs` wraps with `withSentryConfig` for source-map upload —
gated on `SENTRY_AUTH_TOKEN` being present in CI.

## Testing

`tests/e2e/` — Playwright. Currently covers:

- `smoke.spec.ts` — public routes return 200, admin/login redirect works
- `headers.spec.ts` — security headers present

Run with `npm run test:e2e`. CI must run `test:e2e:install` first.

There is **no** unit-test suite — this codebase does not use Jest/Vitest.

## Key non-obvious decisions

- **Postgres rate-limit, no Redis** — added complexity not justified at
  current scale. See `openspec/changes/2026-05-06-security-week-1/design.md §1`.
- **Credentials-only auth, no OAuth** — small known user set, simpler
  for the admin/client model.
- **Mandatory 2FA for admins** — chose hard gate over soft prompt
  because the audit log is the system of record for security.
- **TipTap over Plate.js** — Plate v48 was attempted and abandoned
  due to fragmented ecosystem; TipTap proved sufficient.
- **WP-style canvas + sticky inspector** (not slide-in panels) — user
  validated; do not regress.
- **`output: "standalone"` Docker** — minimal image, runs on Hetzner.
  Vercel was considered but Hetzner won for cost + control.
