## Why

Setmana 4 del roadmap d'audit. Les setmanes 1-3 van tancar buits crítics
(seguretat, honestedat de producte, compliance). Aquesta setmana és
**sustainability**: instrumentació, automatització i higiene perquè el
codebase pugui créixer sense degradar-se.

Vuit objectius. Sis els executem aquí. Els altres dos depenen d'inputs
externs i s'apliquen quan toqui:

1. **Tests Playwright** — Cada deploy és cec. Necessitem suite de tests
   end-to-end sobre fluxos crítics (login, 2FA, contact form, ARCO export,
   IDOR check) per detectar regressions abans que un usuari les trobi.
2. **Migracions Prisma reals** — Hem fet servir `prisma db push` perquè
   vam validar el patró ràpid. Ara cal fitxers de migració versionats
   per a reproducibilitat (clonar una BBDD nova) i inspeccionabilitat
   (veure el SQL abans d'aplicar canvis grossos).
3. **Refactor type safety** — Hi ha ~18 instàncies de `as unknown as` o
   `as { ... }` per accedir a camps de Session/User. Funciona però amaga
   bugs latents. Centralitzar a tipus auth-helpers.
4. **Optimització imatges** — Imatges en JPG/PNG sense lazy load explícit.
   Lighthouse Performance avui ~75-85; passar a >90 amb WebP + sizes ben
   configurats.
5. **Sentry / error tracking** — Avui els errors a runtime només els veu
   l'usuari final. Necessitem captura amb stack trace + breadcrumbs per a
   reaccionar abans del segon usuari afectat.
6. **DMARC `rua=`** — Estem amb `p=none` sense recollir reports. Avui no
   sabem si els emails legítims passen DKIM/SPF. Configurar `rua=` per a
   començar a recollir reports durant 2-3 setmanes abans de pujar a
   `quarantine`.
7. **Blog posts EN/ES** — 3 articles publicats només en CA. Drafts en
   anglès i castellà perquè els visitants en aquests idiomes no caiguin a
   fallback CA.
8. **Sandra WhatsApp Business** — Out of scope tècnic. Pendent gestió
   externa per part d'Oscar i Sandra.

## What Changes

### Tests Playwright (§ 1 del tasks)

- Nou directori `tests/e2e/` amb config `playwright.config.ts`.
- Setup amb fixtures: pre-creació de tres usuaris (admin amb 2FA enabled,
  client sense projectes, client amb projectes) via un seed dedicat
  `prisma/seed-test-fixtures.ts` que executa només si `NODE_ENV=test`.
- 8-10 tests crítics:
  - `auth.spec.ts` — login, logout, login amb 2FA (codi generat in-test
    via lib/totp), recovery code consum, login amb password incorrecta,
    rate limit després de 5 intents.
  - `contact.spec.ts` — submit del form, smoke check que arriba a BBDD.
  - `dashboard.spec.ts` — empty state per a CLIENT sense projectes,
    redirect a /login per a usuaris no autenticats.
  - `arco.spec.ts` — export download trigger, delete amb confirmació.
  - `idor.spec.ts` — CLIENT_A no pot accedir Project del CLIENT_B (403).
  - `admin.spec.ts` — middleware redirigeix a /setup-2fa si no té 2FA.
- BBDD per a tests: docker compose dedicat amb Postgres ephemeral, o
  reusem el local del dev amb un schema separat. Decisió al design.md.

### Migracions Prisma reals (§ 2)

- `npx prisma migrate dev --name initial-schema-snapshot` localment per a
  generar la primera migració que captura l'estat actual.
- A producció, marcar com a aplicada sense executar SQL:
  `npx prisma migrate resolve --applied initial-schema-snapshot`.
- A partir d'ara, `prisma migrate dev` substitueix `db push` als fluxos
  de canvi de schema. Documentar al README.

### Refactor type safety (§ 3)

- Nou fitxer `src/lib/auth-helpers.ts` amb tipus reutilitzables:
  - `AuthSession` — alias `NonNullable<Awaited<ReturnType<typeof getServerSession>>>`
  - `AuthUser` — alias del `user` field
  - `requireAuth(session)` — narrows null/undefined fora
  - `requireRole(session, roles)` — narrows + 401/403
- Substituir `as unknown as { role: ... }` per accés directe ara que els
  tipus de NextAuth ja inclouen `role` i `twoFactorEnabled` (vam afegir-ho
  a setmana 3).
- Substituir `as any` allà on encara hi ha (serien casos residuals).

### Optimització imatges (§ 4)

- Script `scripts/optimize-images.ts` que llegeix `public/images/*.{jpg,png}`,
  genera versions `.webp` amb `sharp`. Output al mateix directori.
- Modificar referències a components per usar les noves: `next/image` el
  serveix automàticament com a fallback si està disponible.
- Verificar `sizes` props als components rellevants (case cards, hero,
  service landings).
- Lighthouse mobile abans/després.

### Sentry (§ 5)

- `npm install @sentry/nextjs`.
- `npx @sentry/wizard@latest -i nextjs` per a generar configs automàticament.
- Compte Sentry (free tier) — depèn de l'usuari per a les credencials.
- `SENTRY_DSN` al `.env` del servidor.
- Configurar `beforeSend` per redactar password fields i altres camps
  sensibles abans d'enviar.
- Alert email quan apareix error nou.

### DMARC reporting (§ 6)

- Crear bústia o àlies `dmarc@auratech.cat` (Microsoft 365) — Sandra/Oscar
  decidiran quin destinatari prefereixen.
- Actualitzar el TXT `_dmarc.auratech.cat` a OVH amb `rua=mailto:dmarc@auratech.cat`.
- Mantenir `p=none` durant 2-3 setmanes mentre acumulem reports.
- A partir d'aquesta data (a documentar), pujar a `p=quarantine; pct=25`
  i progressar.

### Blog EN/ES (§ 7)

- Drafts dels 3 articles amb el meu nivell de qualitat (decent, no
  professional). L'usuari pot polir amb Perplexity Pro després.
- Modificar `seed-blog-launch.ts` per a crear 6 BlogPost addicionals
  (3 articles × 2 idiomes), cadascun amb el seu rich-text block.
- Cover images, tags, categories: idèntics a CA. Cap canvi visual.

## Impact

### Affected specs
- `auth` — refactor type safety (no nou requirement, només neteja)
- `database` — migracions Prisma reals
- `deployment` — runbook de migracions, Sentry, DMARC quarantine
- `blog` — articles en 3 locales

### Affected code
- `tests/e2e/*` — nou directori
- `playwright.config.ts` — nou
- `prisma/seed-test-fixtures.ts` — nou
- `prisma/migrations/*` — nou (generat per Prisma)
- `src/lib/auth-helpers.ts` — nou
- `src/app/api/**/*.ts` — petits canvis (substituir casts)
- `scripts/optimize-images.ts` — nou
- `public/images/*.webp` — nous binaris
- `sentry.client.config.ts`, `sentry.server.config.ts` — nous
- `prisma/blog-launch-content/*-en.html`, `*-es.html` — nous
- `prisma/seed-blog-launch.ts` — afegir locales EN/ES

### Out of scope (deferred)

- WhatsApp Business per a Sandra — depèn de Meta verification (procés
  extern d'1-2 setmanes).
- DMARC `quarantine` — pujada feta després de 2-3 setmanes de reports
  nets, fora d'aquesta sessió.
- Traducció professional dels blog posts — qui vulgui més qualitat ho
  pot millorar manualment via Perplexity Pro després del seed.
