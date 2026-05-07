## 1. Privacy policy reescrita

- [ ] 1.1 Editar `messages/{ca,en,es}.json` — reestructurar la secció `legal` (la actual) o
  crear una secció nova `privacy` amb subseccions: dataController, subprocessors,
  article9, internationalTransfers, rights, retention, contact.
- [ ] 1.2 Modificar `src/app/[locale]/(public)/privacitat/page.tsx` per renderitzar les
  seccions noves. Mantenir el to actual (sòbri, llegible).
- [ ] 1.3 Verificar que els enllaços a /dashboard/perfil als drets ARCO funcionen.

## 2. Schema Prisma — AuditLog + 2FA fields

- [ ] 2.1 Afegir model `AuditLog` a `prisma/schema.prisma`.
- [ ] 2.2 Afegir camps a `User`: `twoFactorEnabled`, `twoFactorSecret`,
  `twoFactorPendingSecret`, `twoFactorRecoveryCodes`.
- [ ] 2.3 `npx prisma generate` (local) i preparar `db push` per al deploy.

## 3. Audit log helper + integracions

- [ ] 3.1 `src/lib/audit.ts` amb `logAuditEvent(action, params)`. Async, fail-safe (catch
  intern; un crash al log no ha de bloquejar la request).
- [ ] 3.2 Connectar als llocs:
  - `src/lib/auth.ts` `authorize()` — `login_success` i `login_failed`.
  - `src/app/api/profile/password/route.ts` — `password_changed` després de l'update.
  - `src/app/api/profile/delete/route.ts` (nou) — `user_deleted`.
  - `src/app/api/pages/[id]/publish/route.ts` — `page_published`.
  - `src/app/api/media/[id]/route.ts` DELETE — `media_deleted`.
  - 2FA endpoints — `2fa_enabled`, `2fa_disabled`, `2fa_failed`.

## 4. Vista admin `/admin/audit-log`

- [ ] 4.1 `src/app/admin/audit-log/page.tsx` — server component amb taula paginada,
  filtres per acció + data + actor. Només SUPERADMIN.
- [ ] 4.2 Afegir item al sidebar admin (sota Configuració o al costat). Icona
  `ScrollText`.
- [ ] 4.3 Endpoint API `/api/admin/audit-log` per donar la query + filtres (paginat).
  Només SUPERADMIN.

## 5. ARCO endpoints

- [ ] 5.1 `src/app/api/profile/export/route.ts` — GET. Retorna JSON amb User + Project +
  Invoice + Message + ContactSubmission (per email). Header
  `Content-Disposition: attachment; filename="auratech-data-{date}.json"`.
- [ ] 5.2 `src/app/api/profile/delete/route.ts` — DELETE. Body
  `{ confirmation: "ELIMINAR" }`. Anonimitza el User i invalida sessió. Loguea
  `user_deleted` a audit log.
- [ ] 5.3 UI a `/dashboard/perfil` — nova secció "Les meves dades" amb dos botons.
  Confirmation modal per l'eliminació (textbox que demana escriure "ELIMINAR").

## 6. 2FA — TOTP + recovery codes

- [ ] 6.1 `src/lib/totp.ts` — pure functions:
  - `generateSecret()` → returns base32 string (16 bytes random)
  - `generateOtpAuthUrl(secret, account, issuer)` → returns `otpauth://...` URL
  - `verifyTotp(secret, code, window?)` → boolean (RFC 6238, time step 30s, ±1 window
    tolerance)
  - `generateRecoveryCodes(n=10)` → returns array of 10 random hex codes
  - Tot pure (no IO, fàcil de testejar manualment).
- [ ] 6.2 `npm install qrcode` per generar la imatge QR (server-side, retornem dataURL).
- [ ] 6.3 Endpoints:
  - `POST /api/profile/2fa/setup` — crea pendingSecret + recovery codes (en clar al
    response, hashed a la BBDD), retorna `{ secret, qrCode, recoveryCodes }`.
  - `POST /api/profile/2fa/confirm` — body `{ code }`. Verifica TOTP contra
    `twoFactorPendingSecret`. Si OK: mou pendingSecret a secret, activa
    `twoFactorEnabled`, neteja pending. Loguea audit.
  - `POST /api/profile/2fa/disable` — body `{ password, code }`. Verifica password (re-auth)
    + codi. Si OK: desactiva. Loguea audit.
- [ ] 6.4 Login flow en dues passes:
  - Primer pas (NextAuth `authorize`) — email + password com ara. Si l'usuari té
    `twoFactorEnabled=true`, retornar un objecte amb un flag temporal o llançar un error
    específic perquè el client demani el codi.
  - **Implementació pragmàtica**: NextAuth `CredentialsProvider` no suporta natiu el
    flow two-step. Patró establert: el camp `code` també es passa al provider; si
    `twoFactorEnabled` i el `code` no està o és invàlid → throw amb missatge específic
    "TOTP_REQUIRED" o "TOTP_INVALID". El frontend mostra un input nou i reenvia tot.
  - Modificar `src/app/[locale]/(auth)/login/page.tsx` perquè:
    1. Primer submit només envia email + password.
    2. Si la resposta és error "TOTP_REQUIRED", mostrar un nou input per al codi.
    3. Segon submit envia email + password + code; el provider verifica.
- [ ] 6.5 UI a `/dashboard/perfil` — nova secció "Seguretat avançada" amb estat 2FA i
  flow d'activació.
- [ ] 6.6 Pàgina `/setup-2fa` (server component) — força a admins sense 2FA. Middleware
  redirigeix-hi.
- [ ] 6.7 Middleware: si rol és SUPERADMIN/ADMIN i `twoFactorEnabled=false` i el path
  no és `/setup-2fa` ni `/api/profile/2fa/*` ni `/api/auth/*`, redirect a `/setup-2fa`.
  Necessita info del JWT — afegir `twoFactorEnabled` al token jwt.
- [ ] 6.8 Recovery codes: també acceptats al login en lloc del codi TOTP. Quan se'n consum
  un, marcar com a usat (treure de l'array). Al admin profil, opció per regenerar tots
  els codes.

## 7. Tasques transversals

- [ ] 7.1 `npx tsc --noEmit` net.
- [ ] 7.2 `npm run build` net.
- [ ] 7.3 Commits separats per secció.
- [ ] 7.4 Push a GitHub.
- [ ] 7.5 Deploy: pull, rebuild backend, `prisma db push`, restart.
- [ ] 7.6 **Avisar Sandra** abans del deploy. Tu i ella sou els que haureu d'activar 2FA
  immediatament després del deploy. Fer-ho a una hora coordinada (idealment dins
  l'horari laboral perquè podeu provar de seguida).
- [ ] 7.7 Smoke tests post-deploy:
  - /privacitat carrega amb les seccions noves.
  - /dashboard/perfil mostra les seccions "Les meves dades" i "Seguretat avançada".
  - Login amb un compte CLIENT funciona normalment (sense 2FA).
  - Login amb tu (SUPERADMIN, just després del deploy 2FA opcional fins activar) → t'envia
    a /setup-2fa.
  - Després d'activar el 2FA: logout + login → demana codi.
  - Recovery code funciona.
  - `/admin/audit-log` mostra els darrers events incloent el teu propi login_success i
    2fa_enabled.
- [ ] 7.8 Moure el change a `openspec/changes/archive/`.
