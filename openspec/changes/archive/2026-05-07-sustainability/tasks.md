# Setmana 4 — Sustainability — Tasks

## Status

All in-scope tasks delivered. Two are deferred by design:

- WhatsApp Business per a Sandra — depends on Meta verification (1–2
  setmanes externes). Cap canvi de codi necessari avui.
- DMARC `p=quarantine` — segueix el runbook a
  `openspec/specs/deployment/dmarc-rollout.md` un cop hi hagi 2–3 setmanes
  de reports nets.

## Delivered

- **§ 1 Playwright tests** — `playwright.config.ts` + `tests/e2e/smoke.spec.ts`
  (8 tests: home CA/EN/ES, /serveis, /contacte, /login, admin auth gate,
  404) + `tests/e2e/headers.spec.ts` (security headers + sitemap + robots).
  Browser download is opt-in via `npm run test:e2e:install`. webServer
  auto-starts `next dev` locally. Commit: `ae8a21d`.

- **§ 2 Prisma migrations** — initial migration captured via
  `prisma migrate diff --from-empty`. `prisma migrate resolve --applied
  20260507000000_initial` is the production runbook step. Commit: `0a6ba6e`.

- **§ 3 Type safety refactor** — `src/lib/auth-helpers.ts` and `src/lib/api-auth.ts`
  expose typed helpers. All `as unknown as` and `as any` casts on `session.user`
  removed across api routes. Commit: `9ad799e`.

- **§ 4 Image optimisation** — 19 JPGs re-encoded with mozjpeg q82 + width-cap
  1600px; parallel WebP companions at q80 (~417KB saved on capable browsers).
  Originals backed up to gitignored `public/images/_originals/`. Script at
  `scripts/optimize-images.ts`. Commit: `7b901ff`.

- **§ 5 Sentry** — `@sentry/nextjs` v10 wired via three runtime configs +
  `instrumentation.ts` + `withSentryConfig` wrap + `app/global-error.tsx`.
  Errors-only (tracesSampleRate=0, replays disabled) and prod-gated. Source-map
  upload activates only when `SENTRY_AUTH_TOKEN` is present. Commit: `bfa5936`.

- **§ 6 DMARC rua= runbook** — `openspec/specs/deployment/dmarc-rollout.md`
  documents the OVH TXT update, the mailbox setup, the 2–3 week observation
  window, and the staged ramp `none → quarantine pct=25 → quarantine pct=100
  → reject`. The DNS edit itself is an Oscar/Sandra task. Commit: `c960e8f`.

- **§ 7 Blog EN/ES** — 6 new HTML files (en/es × 3 posts) and a refactored
  `seed-blog-launch.ts` that upserts all 3 locales per post by
  `(slug, locale)`. Translations are decent first drafts; admin-edited copy
  takes precedence after first save. Commit: `e68481a`.

## Verification

- `npx tsc --noEmit` — clean.
- `npm run build` — clean (no new warnings).
- Sentry: prod-only init means dev/build runs are no-ops without DSN.
- Playwright: dry-run not executed (browser binary not installed in this
  session); will exercise on first CI run after `npm run test:e2e:install`.
