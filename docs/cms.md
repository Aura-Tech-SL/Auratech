# CMS user guide

How to use the Auratech admin panel at `/admin`. For developer-facing
architecture see [architecture.md](architecture.md) and
[`/CLAUDE.md`](../CLAUDE.md).

## Access

1. Log in at `/login` with your editor account.
2. If you are `SUPERADMIN` or `ADMIN`, you must enrol 2FA on first
   login (TOTP — scan the QR code in any authenticator app, save the
   recovery codes).
3. Land on `/admin`. Sidebar links to every area.

## Roles

| Role | Can do |
|---|---|
| `SUPERADMIN` | Everything, including user role changes |
| `ADMIN` | Manage all content + contact submissions + clients |
| `EDITOR` | Create/edit content (blog, pages, services, projects) |
| `CLIENT` | Cannot access `/admin` — sees `/dashboard` instead |

## Pages (`/admin/pagines`)

CMS-authored pages render at `/[locale]/[slug]` via the catch-all route.
For example, the page with slug `automatitzacions-ia` is reachable at
`/ca/automatitzacions-ia` once published.

**Multi-locale**: pages share the same slug across CA/ES/EN. To create a
locale variant, use the locale pills on the editor and the "Copia els
blocs de CA" button to seed the new variant from an existing one.

**Statuses**: `DRAFT` → `SCHEDULED` (with `publishAt`) → `PUBLISHED`.
Scheduled pages auto-promote via cron every 5 min.

## Blog (`/admin/blog`)

Blog posts use **locale-specific slugs** (each language has its own URL
for SEO). Locale variants are linked via `translationKey` so you can
edit them side-by-side.

Same editor as Pages. Each post has: title, excerpt, cover image, tags,
category, read time, blocks, SEO fields.

## The block editor

Layout (both Pages and Blog use this):

```
┌────────────────────────────────────────────────────────────────┐
│  ← Back   |   Pàgina · Home    [Save Draft] [Publish]          │  ← top bar
├────────────────────────────────┬───────────────────────────────┤
│                                │  ┌─────────────────────────┐  │
│   [Page title input]           │  │  Pàgina | Bloc | SEO    │  │
│                                │  └─────────────────────────┘  │
│   ┌──────────────────────────┐ │                               │
│   │ ▦ Hero block             │ │  Status: DRAFT                │
│   │   "Engineering studio…"  │ │  Slug:   home                 │
│   └──────────────────────────┘ │  Locale: CA                   │
│         + (insert point)       │  Publish at: ___              │
│   ┌──────────────────────────┐ │                               │
│   │ ▦ Rich text (selected)   │ │  ─── Versions ───             │
│   │   ┌──────────────────┐   │ │   • 2026-05-08 14:32 (Oscar)  │
│   │   │ TipTap editor    │   │ │   • 2026-05-07 19:11 (Oscar)  │
│   │   │ here, inline     │   │ │                               │
│   │   └──────────────────┘   │ │                               │
│   └──────────────────────────┘ │                               │
│         + (insert point)       │                               │
│                                │                               │
└────────────────────────────────┴───────────────────────────────┘
```

### Editing blocks

- **Click a block** to select it. The right sidebar's "Bloc" tab
  auto-opens with that block's form.
- **Rich-text blocks** edit inline — the TipTap toolbar appears in the
  block on the canvas. The "Bloc" tab will show a notice pointing back
  to the inline editor.
- **All other block types** (hero, features, image, etc.) edit through
  the form in the "Bloc" tab.
- **Drag the grip** on the left of a block to reorder. Insert new
  blocks via the `+` button between blocks.

### Block types

Hero, features-grid, pricing, stats, rich-text, image, gallery, video,
contact-form, CTA, team-grid, testimonial, accordion, logo-grid, code,
divider, spacer.

### Side-by-side multi-locale

Click "Compare locales" → the canvas splits into two columns (e.g. CA on
the left, EN on the right). The inspector drives whichever side you
clicked last (`activeSide`). Use "Copia els blocs de CA" to seed a new
locale variant.

### Versions (history)

The inspector "Pàgina" / "Article" tab has a Versions section listing
recent saves. Click to preview a version (read-only render). "Restaurar"
swaps the current draft's blocks for that version's — your work is *not*
saved until you click Save.

### Scheduled publish

In the inspector, set "Publicar el dia" with a date + time. Status
becomes `SCHEDULED`. Cron promotes it to `PUBLISHED` at the right time.

### SEO panel

Third inspector tab. Edit `metaTitle`, `metaDescription`, `ogImage`.
Live character counts (warns at 60 / 160) and Google preview render.

## Services (`/admin/serveis`)

Drag-to-reorder list. Each service has icon, features (JSON), `isActive`
toggle. Locale-scoped — create a variant per language.

Service detail pages live at `/[locale]/serveis/[slug]`.

## Projects (`/admin/projectes`)

CRUD for the portfolio. Status enum (PENDING / IN_PROGRESS / REVIEW /
COMPLETED), category (IOT / CLOUD / STRATEGY), progress %, technologies
(string array), images.

There is **no public detail page** for projects right now — only the
`/projectes` listing.

## Media library (`/admin/media`)

Upload images and other assets. Magic-byte validated. Filter by folder
and mimeType. Used by the block editor's MediaPicker for inline image
insertion in TipTap and for cover images.

## Contact submissions (`/admin/contacte`)

List of submissions from the public `/contacte` form. Mark as read,
add internal notes. Notification email sent on submit (Resend).

## Clients (`/admin/clients`)

User management. Set roles, reset 2FA, deactivate accounts.

## Audit log (`/admin/audit-log`)

Read-only feed of security events (logins, role changes, content
publishes, user mutations). Entries cannot be edited or deleted —
append-only by design.

## Settings (`/admin/configuracio`)

Site-wide settings.
