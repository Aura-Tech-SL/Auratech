# Frontend Integration Spec

## Purpose

Defines how the Lovable frontend (Vite + React SPA at repo root) connects to the Next.js backend (at `auratech-web/`). The Lovable app is the public-facing website; the Next.js app serves as API + CMS admin panel. Lovable changes are visual/frontend-only and synced via git pull.

## Architecture

```
┌─────────────────────────┐     ┌──────────────────────────────┐
│  Lovable Frontend       │     │  Next.js Backend             │
│  (Vite + React SPA)     │────▶│  (API + CMS Admin)           │
│  Port 8080 (dev)        │     │  Port 3000 (dev)             │
│  / (root of repo)       │     │  /auratech-web/              │
│                         │     │                              │
│  Public website:        │     │  API Routes:                 │
│  - Home, Serveis, etc.  │     │  - /api/pages                │
│  - Blog, Contacte       │     │  - /api/blog                 │
│  - Client portal        │     │  - /api/services             │
│                         │     │  - /api/projects             │
│  Consumes API via       │     │  - /api/media                │
│  React Query + fetch    │     │  - /api/contacte             │
│                         │     │  - /api/auth (NextAuth)      │
│                         │     │                              │
│                         │     │  CMS Admin:                  │
│                         │     │  - /admin/pagines            │
│                         │     │  - /admin/blog               │
│                         │     │  - Block editor              │
└─────────────────────────┘     └──────────────────────────────┘
         │                                    │
         └──────────── Docker ────────────────┘
                    PostgreSQL 16
```

## Requirements

### Requirement: Dev Proxy Configuration

The Vite dev server proxies API requests to the Next.js backend, avoiding CORS issues in development.

#### Scenario: API requests proxied in development

- **WHEN** the Lovable dev server runs on port 8080
- **AND** the Next.js backend runs on port 3000
- **THEN** all requests matching `/api/*` are proxied from `localhost:8080` to `localhost:3000`
- **AND** the frontend can call `/api/services` directly without specifying the backend host

#### Scenario: Production deployment

- **WHEN** deployed to production
- **THEN** the frontend uses `VITE_API_URL` environment variable to resolve API endpoints
- **AND** the backend configures CORS headers to allow requests from the frontend domain

### Requirement: API Client Layer

A centralized API client in the Lovable frontend handles all backend communication.

#### Scenario: API client initialization

- **WHEN** the frontend app starts
- **THEN** an API client is available at `src/services/api.ts`
- **AND** it uses `fetch` with base URL from env or relative path (proxied)
- **AND** all requests include `Content-Type: application/json` for JSON bodies
- **AND** credentials are included (`credentials: "include"`) for cookie-based auth

#### Scenario: API response handling

- **WHEN** an API call succeeds
- **THEN** the response is typed with TypeScript interfaces matching the Prisma models
- **AND** the `data` field is extracted from the `{ data }` response envelope

#### Scenario: API error handling

- **WHEN** an API call returns 401
- **THEN** the user is redirected to the login page
- **WHEN** an API call returns 4xx or 5xx
- **THEN** the error message is shown via toast notification (Sonner)

### Requirement: TypeScript Types

Shared types between frontend and backend for type safety.

#### Scenario: Model types available

- **WHEN** the frontend needs to render data
- **THEN** TypeScript interfaces exist at `src/types/api.ts` for: Page, Block, BlogPost, Service, Project, Media, User, Invoice, Message, ContactSubmission
- **AND** enum types exist for: PageStatus, PostStatus, ProjectStatus, ProjectCategory, BlogCategory, InvoiceStatus, Role

#### Scenario: Types match Prisma schema

- **WHEN** the Prisma schema changes
- **THEN** the frontend types are updated to match
- **AND** JSON fields (Block.data, Service.features, Invoice.items) are typed as their expected shapes

### Requirement: React Query Hooks

Custom hooks wrapping React Query for each API resource.

#### Scenario: Public content hooks

- **WHEN** a page component needs published content
- **THEN** it uses hooks like `useServices()`, `useProjects()`, `useBlogPosts()`, `usePage(slug)`
- **AND** these hooks call the public GET endpoints with `status=PUBLISHED` filters
- **AND** data is cached and deduplicated by React Query

#### Scenario: Blog post with blocks

- **WHEN** a blog post detail page loads
- **THEN** `useBlogPost(slug)` returns the post with its blocks array
- **AND** a `<BlockRenderer>` component renders each block by type

#### Scenario: Contact form mutation

- **WHEN** a visitor submits the contact form
- **THEN** `useContactSubmit()` mutation sends POST to `/api/contacte`
- **AND** shows success toast on 200, error toast on failure

#### Scenario: Authenticated content hooks (client portal)

- **WHEN** an authenticated client accesses the dashboard
- **THEN** hooks like `useMyProjects()`, `useMyInvoices()`, `useMyMessages()` fetch user-scoped data
- **AND** these hooks require a valid session (redirect to login if 401)

### Requirement: Authentication Integration

NextAuth.js session cookies work across the Lovable frontend and Next.js backend.

#### Scenario: Login flow

- **WHEN** a user clicks "Accedir" on the Lovable frontend
- **THEN** they are shown a login form (built in Lovable with shadcn/ui)
- **AND** credentials are sent via POST to `/api/auth/callback/credentials` (NextAuth)
- **AND** on success, a session cookie is set by NextAuth
- **AND** the user is redirected to their dashboard

#### Scenario: Session persistence

- **WHEN** the frontend loads with an existing session cookie
- **THEN** it calls `/api/auth/session` to get the current session
- **AND** the session includes `user.id`, `user.name`, `user.email`, `user.role`
- **AND** navigation shows user-specific options (dashboard, logout)

#### Scenario: Logout

- **WHEN** a user clicks "Tancar sessió"
- **THEN** POST to `/api/auth/signout` clears the session cookie
- **AND** the user is redirected to the home page

#### Scenario: Role-based UI

- **WHEN** a user with role SUPERADMIN or ADMIN is logged in
- **THEN** a link to the CMS admin (`/admin` on the Next.js app) is visible
- **WHEN** a user with role CLIENT is logged in
- **THEN** only client portal links are shown (projectes, factures, missatges)

### Requirement: Block Rendering in Lovable

The Lovable frontend renders CMS blocks identically to the Next.js public pages.

#### Scenario: Block components exist in Lovable

- **WHEN** a page or blog post is loaded from the API
- **THEN** the Lovable app renders blocks using its own React components
- **AND** block components match the 17 types: hero, rich-text, image, gallery, cta, features-grid, testimonial, stats, video, code, divider, accordion, pricing, team-grid, contact-form, logo-grid, spacer
- **AND** each component uses shadcn/ui primitives and Tailwind classes from the Lovable design system

#### Scenario: Unknown block type

- **WHEN** the API returns a block with an unrecognized type
- **THEN** it is silently skipped in production
- **AND** a console warning is logged in development

### Requirement: Environment Variables

#### Scenario: Development environment

- **WHEN** running locally
- **THEN** `.env.local` contains:
  - `VITE_API_URL=` (empty, uses proxy)
  - `VITE_APP_NAME=Auratech`
  - `VITE_CMS_ADMIN_URL=http://localhost:3000/admin`

#### Scenario: Production environment

- **WHEN** deployed
- **THEN** environment variables are set:
  - `VITE_API_URL=https://api.auratech.cat` (or backend domain)
  - `VITE_APP_NAME=Auratech`
  - `VITE_CMS_ADMIN_URL=https://admin.auratech.cat`

### Requirement: Lovable Sync Workflow

Changes made in Lovable (visual/frontend) are synced to the local repo.

#### Scenario: Pulling Lovable changes

- **WHEN** the user makes visual changes via Lovable
- **AND** Lovable pushes to the GitHub repo
- **THEN** locally, running `git pull origin main` merges the frontend changes
- **AND** the Next.js backend in `auratech-web/` is unaffected (separate directory)

#### Scenario: Conflict prevention

- **WHEN** backend changes are made locally
- **THEN** they live exclusively in `auratech-web/` and `openspec/` (inside auratech-web)
- **AND** Lovable only modifies files at the repo root: `src/`, `public/`, `index.html`, `package.json`, `tailwind.config.ts`
- **AND** there are no overlapping files between frontend and backend

#### Scenario: Shared config files

- **WHEN** both projects have `package.json`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig.json`
- **THEN** the root-level files belong to Lovable (frontend)
- **AND** the `auratech-web/` copies belong to Next.js (backend)
- **AND** they are independent — no shared config

### Requirement: Docker Development Setup

Both frontend and backend run together via Docker Compose.

#### Scenario: Full stack dev startup

- **WHEN** a developer wants to run the full stack
- **THEN** they run `docker compose up -d` in `auratech-web/` (starts PostgreSQL)
- **AND** they run `npm run dev` in `auratech-web/` (starts Next.js API on :3000)
- **AND** they run `npm run dev` in repo root (starts Lovable frontend on :8080)
- **AND** the frontend proxies API calls to :3000

### Requirement: CORS Configuration

The Next.js backend allows cross-origin requests from the Lovable frontend.

#### Scenario: Development CORS

- **WHEN** the frontend runs on `localhost:8080` and the backend on `localhost:3000`
- **AND** the Vite proxy is used
- **THEN** no CORS headers are needed (same-origin via proxy)

#### Scenario: Production CORS

- **WHEN** frontend and backend are on different domains
- **THEN** the Next.js `next.config.mjs` includes CORS headers for the frontend domain
- **AND** credentials (cookies) are allowed cross-origin
