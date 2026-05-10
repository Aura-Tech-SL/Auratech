# Operations

Deployment, environment, DNS. **No secrets in this file.** Credentials
live on the production server (`/opt/auratech/.env` and `/opt/vural/.env`)
and references in the maintainer's session memory.

## Production environment

- **Host**: Hetzner VPS, hostname `auratech-prod`
- **Process**: Docker Compose at `/opt/auratech/docker-compose.yml`
- **Repo working tree**: `/opt/auratech/repo`
- **Containers**:
  - `auratech-backend-1` — Next.js standalone build
  - `auratech-db-1` — Postgres 16-alpine
  - (`vural-web-1` runs alongside but belongs to a separate parked
    project — do not touch.)
- **DB backups**: `/opt/auratech/backups/` (created by `backup.sh`)
- **Cron**: Hetzner host crontab runs the scheduled-publish trigger
  every 5 min.

## Deploy sequence

```bash
# 1. backup
docker compose exec -T db pg_dump -U auratech auratech | \
  gzip > /opt/auratech/backups/pre-$(date +%F-%H%M).sql.gz

# 2. pull
cd /opt/auratech/repo && git pull --ff-only origin main

# 3. build + up (rebuilds backend, keeps db running)
cd /opt/auratech && docker compose build backend && \
  docker compose up -d backend

# 4. (only when adding a new prisma migration)
docker compose exec -T backend npx -y prisma@5.22.0 migrate deploy
```

### Prisma version pin

`npx prisma` without `@5.22.0` auto-fetches Prisma v7, which breaks the
v5 schema (`url = env("DATABASE_URL")` is invalid in v7). Always pin.

## Environment variables

Two-tier model:

- **Secrets** (`/opt/auratech/.env`) — DB password, NextAuth secret,
  Resend API, OVH credentials, Sentry DSN, cron secret. Gitignored.
- **Hostnames & URLs** (`/opt/auratech/docker-compose.yml`) —
  `DATABASE_URL`, `NEXTAUTH_URL`, `FRONTEND_URL`, `NEXT_PUBLIC_APP_URL`,
  `NEXT_PUBLIC_APP_NAME`. Computed at runtime from the secrets above
  using `${VAR}` interpolation. This keeps the `.env` portable
  (pulling to local doesn't pin you to docker-internal `db:5432`).

`.env.example` in the repo lists the full key set, with empty values
and explanatory comments.

### Local .env sync

`scripts/env-sync.sh` mirrors prod ↔ local:

```bash
scripts/env-sync.sh pull       # prod → local
scripts/env-sync.sh push [-y]  # local → prod (with backup + smoke test)
scripts/env-sync.sh diff       # compare keys (values redacted)
scripts/env-sync.sh watch      # auto-push on every local save
scripts/env-sync.sh restart    # kick prod backend, no .env touched
scripts/env-sync.sh bootstrap  # pull + append local-dev overrides
                               # (DATABASE_URL=localhost, NEXTAUTH_URL=localhost…)
```

`push` runs end-to-end: backup prod `.env`, scp the new one, restart
backend, smoke `https://auratech.cat/ca` for HTTP 200. On smoke fail it
prints a one-liner to roll back.

### Local dev quick-start

```bash
# 1. clone, install
git clone <repo>
cd auratech-web && npm install

# 2. start local Postgres
docker compose up -d                      # uses local docker-compose.yml

# 3. bootstrap .env from prod (adds local hostnames)
scripts/env-sync.sh bootstrap

# 4. set up DB
npm run db:generate
npm run db:migrate                        # applies migrations
npm run db:seed                           # optional fixture data

# 5. dev server
npm run dev
```

## DNS (auratech.cat)

Managed via OVH API. Two distinct tokens, each scoped to a single zone:

| Zone | Credentials path | OVH app |
| --- | --- | --- |
| `auratech.cat` | `/opt/auratech/.env` | `auratech-claude` |
| `vural.io` | `/opt/vural/.env` | `auratech-vural` |

Both files use the same variable names (`OVH_API_KEY`, `OVH_API_SECRET`,
`OVH_CONSUMER_KEY`, `OVH_API_REGION=eu`).

**No code in this repo touches OVH.** DNS is operational tooling.

### OVH API — signed-call snippet

Every OVH call needs a signed header. Signature is `$1$<sha1>` where
the SHA-1 input is `{AS}+{CK}+{METHOD}+{URL}+{BODY}+{TIMESTAMP}`.

```bash
OVH_BASE=https://eu.api.ovh.com/1.0

ovh_call() {
  local METHOD="$1" PATH_="$2" BODY="${3:-}"
  local URL="${OVH_BASE}${PATH_}"
  local TS=$(curl -s "${OVH_BASE}/auth/time")
  local SIG="\$1\$$(printf '%s' "${OVH_API_SECRET}+${OVH_CONSUMER_KEY}+${METHOD}+${URL}+${BODY}+${TS}" | openssl dgst -sha1 -r | cut -d' ' -f1)"
  curl -s -X "$METHOD" \
    -H "X-Ovh-Application: ${OVH_API_KEY}" \
    -H "X-Ovh-Consumer: ${OVH_CONSUMER_KEY}" \
    -H "X-Ovh-Timestamp: ${TS}" \
    -H "X-Ovh-Signature: ${SIG}" \
    ${BODY:+-H "Content-Type: application/json" -d "$BODY"} \
    "$URL"
}

# Examples
ovh_call GET "/domain/zone/auratech.cat/record"
ovh_call PUT "/domain/zone/auratech.cat/record/5333324718" \
  '{"target":"new value","ttl":3600}'
ovh_call POST "/domain/zone/auratech.cat/refresh"   # always after writes
```

Gotchas:

- TXT values: send WITHOUT wrapping quotes. `dig` adds them on display.
- `ttl: 0` in responses means "use zone default".
- `null` response on PUT/POST is normal (successful mutations return
  empty body).
- Always `POST /refresh` after writes — without it the change sits
  pending.
- DNS propagation: typically <30s on OVH, observed ~10s on Cloudflare
  1.1.1.1 / Google 8.8.8.8.

## Cron — scheduled publish

A shell wrapper at `/usr/local/bin/auratech-run-scheduled-publish.sh`
runs every 5 minutes. It POSTs to:

```http
POST https://auratech.cat/api/cron/run-scheduled-publish
Authorization: Bearer $CRON_SECRET
```

`$CRON_SECRET` lives in `/opt/auratech/.env` and is plumbed to the
backend container via `docker-compose.yml`.

Logs at `/var/log/auratech-scheduled-publish.log`.

The endpoint promotes any `Page` or `BlogPost` row where `publishAt <=
now()` AND `status = 'SCHEDULED'` to `PUBLISHED` and sets `publishedAt`.

## Sentry

Configured in `sentry.client.config.ts`, `sentry.server.config.ts`,
`sentry.edge.config.ts`. With `NEXT_PUBLIC_SENTRY_DSN` empty, init is a
no-op (intentional — keeps dev environments quiet).

Source-map upload happens at build time via `withSentryConfig` in
`next.config.mjs`, gated on `SENTRY_AUTH_TOKEN` being present (CI only).

## Backups

`/opt/auratech/backup.sh` runs `pg_dump` to `/opt/auratech/backups/`.
Snapshots are timestamped. Retention is manual — prune periodically.

A backup is taken automatically before every `env-sync push` and every
deploy (see deploy sequence).

## Rollback

For env: each `env-sync push` writes
`/opt/auratech/.env.backup-<timestamp>` first; restore by `cp`-ing it
back and running `docker compose up -d backend`.

For deploy: `git checkout <previous-sha>` in `/opt/auratech/repo` then
`docker compose build backend && docker compose up -d backend`.

For DB: latest dump in `/opt/auratech/backups/`. `gunzip -c
backup.sql.gz | docker compose exec -T db psql -U auratech auratech`.

## Decommissioned

- nginx in front of port 3000 was removed 2026-05-06; Next.js
  standalone serves directly. Commented entries kept in
  `docker-compose.yml` for 90-day reversibility.
