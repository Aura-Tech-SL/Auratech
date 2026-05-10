# Auratech web

Web corporativa i CMS d'Auratech (`auratech.cat`). Next.js 14 + Postgres,
desplegada amb Docker Compose en un VPS de Hetzner.

Combina **tres aplicacions** en un sol projecte:

- **Site públic** — i18n (CA / ES / EN), blog, projectes, serveis, contacte.
- **CMS** (`/admin`) — editor de blocs estil WordPress amb publicació
  programada, historial de versions i edició multi-idioma.
- **Portal de clients** (`/dashboard`) — factures, missatges, projectes.

## Quick-start

```bash
# 1. Dependències
npm install

# 2. Postgres local
docker compose up -d

# 3. Variables d'entorn (sincronitza amb prod)
scripts/env-sync.sh bootstrap

# 4. Base de dades
npm run db:generate
npm run db:migrate
npm run db:seed         # opcional, dades de prova

# 5. Servidor de dev
npm run dev
```

App a `http://localhost:3000`. Admin a `http://localhost:3000/admin`.

## Documentació

- [`CLAUDE.md`](CLAUDE.md) — guia tècnica completa (stack, rutes, models,
  convencions, decisions). Doc canònic.
- [`docs/architecture.md`](docs/architecture.md) — arquitectura amb diagrames.
- [`docs/cms.md`](docs/cms.md) — guia d'ús de l'admin per a editors.
- [`docs/operations.md`](docs/operations.md) — desplegament, env, DNS.

## Scripts

```bash
npm run dev               # servidor de desenvolupament
npm run build             # build de producció
npm run start             # producció
npm run lint              # ESLint
npm run db:migrate        # nova migració local
npm run db:migrate:deploy # aplicar migracions a prod / CI
npm run db:seed           # seed de fixtures
npm run db:studio         # Prisma Studio (GUI BD)
npm run test:e2e          # tests Playwright
```

Operacions de servidor (deploy, env-sync, DNS) → [docs/operations.md](docs/operations.md).

## Llicència

Privat — Auratech SL © 2026
