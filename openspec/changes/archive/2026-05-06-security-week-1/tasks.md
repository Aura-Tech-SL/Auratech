## 1. Rate limiter compartit (BBDD-backed)

- [ ] 1.1 Afegir model `RateLimit` a `prisma/schema.prisma` amb camps:
  `key (String, unique)`, `count (Int)`, `resetAt (DateTime)`, `createdAt`, `updatedAt`. Índex
  per `resetAt` per a poder netejar entrades expirades amb un cron.
- [ ] 1.2 `npx prisma db push` (mantenim el patró actual; les migracions reals queden per
  setmana 4).
- [ ] 1.3 Crear `src/lib/rate-limit.ts` amb la funció pura
  `checkRateLimit(key: string, max: number, windowMs: number) → Promise<{ allowed: boolean,
  remaining: number, resetAt: Date }>`. Implementació atòmica via `prisma.$transaction` per
  evitar races. Si la fila no existeix o `resetAt` és al passat, la crea/reseteja.
- [ ] 1.4 Tests manuals: comparar 6 crides ràpides amb `max=5, windowMs=60_000` → 6a torna
  `allowed=false`.
- [ ] 1.5 Afegir un script `prisma/cleanup-rate-limit.ts` que esborra files amb `resetAt <
  now() - 1 day`. Documentar al README com fer-ho a cron (no implementar el cron a producció
  ara — opcional, tasques de Setmana 4).

## 2. IDOR — `/api/projects/[id]` GET

- [ ] 2.1 A `src/app/api/projects/[id]/route.ts`, després de `findUnique`, comprovar
  `project.userId === session.user.id || ADMIN_ROLES.includes(session.user.role)`. Si no,
  retornar HTTP 403 amb cos `{ error: "Insufficient permissions" }`.
- [ ] 2.2 Verificar amb un test manual amb dos comptes CLIENT: A demana
  `GET /api/projects/<id-de-B>` → 403.
- [ ] 2.3 Mateix patró per `PUT /api/projects/[id]` si existeix.

## 3. IDOR — `/api/media/[id]` DELETE

- [ ] 3.1 A `src/app/api/media/[id]/route.ts`, després de `findUnique`, comprovar
  `media.uploadedById === session.user.id || ADMIN_ROLES.includes(session.user.role)`. Si
  no, HTTP 403.
- [ ] 3.2 Mateix check al GET si existeix (per evitar enumeració de IDs).

## 4. IDOR i Zod — `/api/missatges`

- [ ] 4.1 Crear `messageCreateSchema` a `src/lib/validations/`: `{ receiverId:
  z.string().min(1), content: z.string().min(1).max(5000) }`. (Sender no entra al body — es
  fixa per sessió.)
- [ ] 4.2 A `POST /api/missatges`, validar `body` amb `safeParse`. Si invalid → HTTP 400.
- [ ] 4.3 Comprovar que `receiverId` correspon a un User existent. Si no → HTTP 400.
- [ ] 4.4 A `GET /api/missatges`, filtrar `where: { OR: [{ senderId: session.user.id }, {
  receiverId: session.user.id }] }` excepte ADMIN/SUPERADMIN.

## 5. Zod a `/api/projectes` POST

- [ ] 5.1 Decidir: `/api/projectes` (legacy, sense Zod) vs `/api/projects` (canonical, amb
  Zod). Si `/api/projectes` no s'usa enlloc del frontend (verificar amb grep), eliminar-lo.
  Si s'usa, crear `projectCreateSchema` i validar.
- [ ] 5.2 `grep -r "/api/projectes" src/` per confirmar ús. Reportar i decidir.

## 6. Rate limit a login

- [ ] 6.1 Crear wrapper `lib/auth-rate-limit.ts` que envolta el callback `authorize()` de
  NextAuth: abans de comprovar credencials, fa `checkRateLimit(\`login:${ip}\`, 5,
  15 * 60_000)`. Si excedit, llança `new Error("Massa intents. Torna a provar en uns
  minuts.")`.
- [ ] 6.2 Obtenir IP del request: NextAuth callbacks no reben `req` directament al
  `authorize`; cal fer servir `headers()` de Next 14 i agafar `x-forwarded-for` o
  `x-real-ip`.
- [ ] 6.3 Test manual: 6 intents seguits amb credencials incorrectes → 6è dóna error de
  rate limit (no "Email o contrasenya incorrectes").

## 7. Uniform error messages a auth

- [ ] 7.1 A `src/lib/auth.ts`, substituir tant `throw new Error("Usuari no trobat")` com
  `throw new Error("Contrasenya incorrecta")` per `throw new Error("Email o contrasenya
  incorrectes")`.
- [ ] 7.2 Verificar que el missatge mostrat al `/login` page és consistent amb aquest text
  (revisar les traduccions a `messages/{ca,en,es}.json`).

## 8. MIME whitelist + magic bytes a `/api/media/upload`

- [ ] 8.1 `npm install file-type` (versió compatible amb Node 20).
- [ ] 8.2 Whitelist al codi: `const ALLOWED_MIMES = ["image/jpeg", "image/png",
  "image/webp", "image/svg+xml", "image/gif", "application/pdf", "video/mp4",
  "video/webm"]`.
- [ ] 8.3 Per cada `File` rebut: llegir els primers 4 KB, passar a `fileTypeFromBuffer()`,
  comparar amb `file.type`. Si no coincideixen o el detectat no és a la whitelist, HTTP
  400.
- [ ] 8.4 Restricció de role: només `SUPERADMIN`/`ADMIN` poden pujar. CLIENT i EDITOR
  reben HTTP 403. (Decisió: EDITOR pot editar pages però no pot adjuntar fitxers nous? El
  meu vot és que EDITOR sí — re-discutir si l'usuari prefereix limitar més. Si s'acaba
  acceptant `EDITOR`, ajustar la whitelist a `["SUPERADMIN", "ADMIN", "EDITOR"]`.)
- [ ] 8.5 SVG és perillós (pot contenir scripts). Si l'usuari volia SVG-as-image, mantenir
  i sanititzar el contingut SVG amb DOMPurify. Si no, treure `image/svg+xml` de la
  whitelist (vot meu: treure-l per simplificar).

## 9. Vista `/admin/contacte`

- [ ] 9.1 Afegir camp `notes String? @db.Text` al model `ContactSubmission`. `prisma db
  push`.
- [ ] 9.2 Crear `src/app/api/admin/contact-submissions/route.ts` amb `GET` paginat
  (`?page=1&limit=20&isRead=true|false`). Auth: SUPERADMIN/ADMIN.
- [ ] 9.3 Crear `src/app/api/admin/contact-submissions/[id]/route.ts` amb `PATCH` (body
  validat per `updateSubmissionSchema`: `{ isRead?: boolean, notes?: string }`) i `DELETE`.
- [ ] 9.4 Crear `src/app/admin/contacte/page.tsx` amb la llista (server component que fa
  fetch directe a `prisma.contactSubmission.findMany`, no via API — és server side, més
  ràpid).
- [ ] 9.5 Crear `src/app/admin/contacte/[id]/page.tsx` amb el detall + form per a notes
  + accions (marcar com a llegit, eliminar).
- [ ] 9.6 Afegir item al `Sidebar` admin: "Contacte" amb icona `Mail` cap a `/admin/contacte`.
  Mostrar pastilla amb el comptador d'unread.
- [ ] 9.7 Traduccions ca/en/es per a totes les UI strings noves.

## 10. Higiene del servidor

- [ ] 10.1 SSH al servidor. Aturar i eliminar containers obsolets:
  `docker compose stop frontend prerender && docker compose rm -f frontend prerender`.
- [ ] 10.2 Eliminar imatges associades:
  `docker rmi auratech-frontend auratech-prerender || true`.
- [ ] 10.3 Comentar (no eliminar) seccions `frontend:` i `prerender:` a
  `/opt/auratech/docker-compose.yml`. Afegir capçalera comentada amb data + motiu.
- [ ] 10.4 `docker system prune -af` per recuperar espai. Verificar `df -h /` baixa per sota
  del 75%.
- [ ] 10.5 Confirmar que la web continua funcionant igual: `curl -I https://auratech.cat/es`,
  `curl -I https://auratech.cat/ca/automatitzacions-ia`.

## 11. `.env` fora del repo

- [ ] 11.1 `git rm --cached .env` (al repo `auratech-web/`).
- [ ] 11.2 Confirmar que `.gitignore` inclou `.env` i `.env.*` (excepte `.env.example`).
- [ ] 11.3 Verificar que `/opt/auratech/.env` a producció **no és** el mateix
  `NEXTAUTH_SECRET="dev-secret-key-not-for-production-use"` que tenia el repo. Si és el
  mateix, generar un nou amb `openssl rand -base64 32`, reemplaçar al servidor i fer
  `docker compose up -d backend`. Això invalida totes les sessions actives — els usuaris
  hauran de tornar a loguejar-se.

## 12. Tasques transversals

- [ ] 12.1 `npx tsc --noEmit` net.
- [ ] 12.2 `npm run build` net (només warning preexistent del `<img>`).
- [ ] 12.3 Tests manuals de tots els fluxos modificats segons § 2-9.
- [ ] 12.4 Commits separats per tasca (cada § és un commit, excepte les tasques minor que
  poden anar amb la seva família). Patró: `fix(security):` o `feat(admin):`.
- [ ] 12.5 Push a `Aura-Tech-SL/Auratech` main.
- [ ] 12.6 Deploy al servidor en una tirada al final de la setmana, no per cada commit
  (rebuild de Docker és costós).
- [ ] 12.7 Verificar producció: smoke test dels endpoints crítics (login, contact form,
  /admin/contacte).
- [ ] 12.8 Quan tot verde, moure aquesta carpeta a `openspec/changes/archive/2026-05-06-
  security-week-1/` i actualitzar les specs vives a `openspec/specs/<capability>/spec.md`
  amb les `MODIFIED` requirements.
