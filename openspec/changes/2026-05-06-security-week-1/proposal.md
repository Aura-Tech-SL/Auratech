## Why

L'audit professional executat el 2026-05-06 (codebase + seguretat + producte/compliance) va identificar
sis troballes amb severitat crítica que **bloquegen anar a mercat amb confiança**:

1. **IDOR** a `/api/projects/[id]` (GET), `/api/media/[id]` (DELETE), `/api/missatges` (GET/POST):
   un usuari autenticat pot llegir o modificar recursos que pertanyen a altres usuaris perquè els
   handlers verifiquen autenticació però no pertinença.
2. **Sense rate limit a `/api/auth/[...nextauth]`**: un atacant pot fer força bruta contra el
   formulari de login sense cap límit.
3. **Validació Zod absent a dos endpoints**: `POST /api/projectes` i `POST /api/missatges` accepten
   `body` directament a `prisma.create({ data: body })`, permetent injecció de camps no esperats
   (incloent camps que escalen privilegis com `userId`, `role`, etc.).
4. **`POST /api/media/upload` no valida MIME type**: només neteja el filename i mira la mida.
   Acceptem `.exe`, `.sh`, `.php` i qualsevol cosa que es pengi dins `/public/uploads/`, accessible
   directament. Risc de RCE si Nginx mai serveix els uploads com a executables.
5. **Sense vista `/admin/contacte`**: les `ContactSubmission` arriben a la base de dades però
   l'admin no les pot veure, marcar, anotar ni eliminar. La spec
   `contact-system § Submission Management (Admin)` ja les requereix amb 4 escenaris;
   queden per implementar. Sense això, el primer canal comercial real (form de contacte) es
   perd silenciosament — Sandra rep email i el rastre s'evapora.
6. **Servidor de producció a 82% de disc + dos containers zombie** (`auratech-frontend-1`,
   `auratech-prerender-1`, ~165 MB RAM ociosos). Si seguim així saturem disc i el `docker compose
   build` cau per `no space left on device`.

També aprofitem aquest paquet per a dues correccions que són de la mateixa família "tanca portes":

7. **User enumeration** al `authorize()` de NextAuth: els missatges d'error diferencien "Usuari no
   trobat" de "Contrasenya incorrecta", permetent enumerar comptes vàlids.
8. **`.env` commitat al repo** amb un `NEXTAUTH_SECRET` etiquetat com a "dev-only" però sense
   garantia que producció en faci servir un altre. Cal treure'l del control de versions i confirmar
   que prod usa un secret separat.

Aquest paquet aplica només a la "setmana 1" de l'audit. La setmana 2 (CRM + dashboard real +
disclaimer SaaS), 3 (GDPR Art.9, 2FA, audit log) i 4+ (testing, refactor types) van per separat.

## What Changes

### IDOR i autorització a recursos

- **`/api/projects/[id]` GET**: després de carregar el `Project`, comparar `project.userId` amb
  `session.user.id`. Si no coincideixen i el rol no és `SUPERADMIN`/`ADMIN`, retornar HTTP 403.
- **`/api/media/[id]` DELETE**: després de carregar el `Media`, comparar `media.uploadedById`
  amb `session.user.id`. Si no coincideixen i el rol no és `SUPERADMIN`/`ADMIN`, HTTP 403.
- **`/api/missatges` GET**: la query SHALL filtrar per `senderId === session.user.id OR
  receiverId === session.user.id` (excepte SUPERADMIN/ADMIN que veuen tot).
- **`/api/missatges` POST**: el `senderId` SHALL ser fixat a `session.user.id` (ja és el cas) i el
  `receiverId` SHALL existir a `User`. Si no, HTTP 400.

### Rate limit i validació

- Nou endpoint helper `lib/rate-limit.ts` amb un limiter persistent en BBDD (taula `RateLimit`),
  resilient a redeploy i compatible amb múltiples instàncies. Detalls a `design.md`.
- Aplicar el rate limit a `/api/auth/[...nextauth]` (5 fallits per IP / 15 min) via un
  middleware que envolta el `signIn` flow de NextAuth.
- Crear `projectCreateSchema` i `messageCreateSchema` (Zod) i fer-los servir a `POST
  /api/projectes` i `POST /api/missatges`.

### File upload hardening

- Validar MIME type contra una whitelist explícita (`image/jpeg`, `image/png`, `image/webp`,
  `image/svg+xml`, `image/gif`, `application/pdf`, `video/mp4`, `video/webm`).
- Validar magic bytes amb `file-type` (npm) per detectar fitxers que mentin sobre el seu MIME.
- Restringir `POST /api/media/upload` a SUPERADMIN/ADMIN (avui acceptem qualsevol usuari
  autenticat, incloent CLIENT).

### Vista `/admin/contacte`

- Implementar la spec `contact-system § Submission Management (Admin)` ja existent (línies
  57-85): llistat, lectura, marcar com a llegit/no llegit, eliminar.
- Afegir camp opcional `notes` (text) al model `ContactSubmission` per a anotacions internes
  d'Oscar/Sandra. Migració Prisma additiva.
- Endpoint `GET /api/admin/contact-submissions` (paginat, filtre `isRead`, ordre per data).
- Endpoint `PATCH /api/admin/contact-submissions/[id]` per actualitzar `isRead` i `notes`.
- Endpoint `DELETE /api/admin/contact-submissions/[id]`.

### Auth hardening

- Uniformar els missatges d'error a `authorize()`: tant si l'email no existeix com si la
  contrasenya és incorrecta, retornar `Email o contrasenya incorrectes`.
- Treure `.env` del repo amb `git rm --cached .env`. Confirmar que producció té un
  `NEXTAUTH_SECRET` propi a `/opt/auratech/.env` (ja és el cas — verificar i documentar).

### Higiene del servidor

- Aturar i eliminar els containers `auratech-frontend-1` i `auratech-prerender-1` que ja no
  reben tràfic. Comentar (no eliminar) les seves entrades a `/opt/auratech/docker-compose.yml`
  per documentar la decisió i poder revertir-la si calgués.
- `docker system prune -af` per recuperar espai d'imatges i layers obsolets.
- Documentar el procés de monitorització de disc al spec `deployment` (alerta a 80%).

## Impact

### Affected specs

- **MODIFIED** `auth` — afegir rate limit login + uniform error messages.
- **MODIFIED** `api` — afegir IDOR enforcement explícit + cobertura Zod completa + MIME
  whitelist al file upload.
- **MODIFIED** `contact-system` — afegir camp `notes` al model i endpoints admin.
- **MODIFIED** `media-library` — restringir upload a admin roles + magic-byte validation.
- **MODIFIED** `deployment` — runbook de cleanup de containers obsolets + alerta de disc.

### Affected code

- `src/lib/auth.ts` — uniform error messages.
- `src/lib/rate-limit.ts` — nou helper compartit.
- `prisma/schema.prisma` — model `RateLimit`, camp `notes` a `ContactSubmission`.
- `src/app/api/projects/[id]/route.ts` — IDOR check.
- `src/app/api/media/[id]/route.ts` — IDOR check.
- `src/app/api/missatges/route.ts` — IDOR + Zod.
- `src/app/api/projectes/route.ts` — Zod (o eliminar si confirmem que `/api/projects` el
  substitueix; cal triar).
- `src/app/api/media/upload/route.ts` — MIME whitelist + magic bytes + role check.
- `src/app/api/admin/contact-submissions/` — nous endpoints.
- `src/app/admin/contacte/` — nova vista UI.
- `.gitignore` — incloure `.env*`.

### Out of scope (deferred)

- 2FA per SUPERADMIN/ADMIN — setmana 3.
- Audit log d'esdeveniments de seguretat — setmana 3.
- Tests Playwright dels fluxos d'auth — setmana 4.
- Refactor de tipus (`as any` × 18) — setmana 4.
- Migracions Prisma reals (substituir `db push`) — setmana 4.
