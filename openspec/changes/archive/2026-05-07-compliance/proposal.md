## Why

L'audit professional del 2026-05-06 va identificar quatre buits de compliance que conviuen
amb el llançament comercial de la línia "Automatitzacions amb IA per a clíniques estètiques":

1. **Privacy policy obsoleta i poc específica** — no menciona Article 9 RGPD (dades de
   salut), no llista els subprocessadors actuals (Resend, Hetzner, Google Fonts, Microsoft
   365, GA4), i no documenta el règim de transferències internacionals (DPF, SCCs).
   Quan una clínica avaluï el nostre producte, qualsevol auditor demanarà aquesta
   documentació; sense ella, el cicle comercial s'allarga o cau.
2. **Drets ARCO** (Article 15 dret d'accés / Article 17 dret a la supressió / Article 20
   dret a la portabilitat) **no operables** — el privacy policy diu "envia un email" però
   no hi ha cap mecanisme tècnic real per exportar o eliminar dades pròpies des del
   compte. Risc: queixa a l'AEPD, que pot multar fins a 20M€ o el 4% de la facturació.
3. **Sense 2FA** per a comptes admin — un sol vector de compromís (phishing, password
   reused) i l'atacant té accés total al CMS, leads del contact form, i dades dels
   pacients de les clíniques quan tinguem el primer pilot. Per al producte de salut és
   inacceptable.
4. **Sense audit log** — si demà hi ha un incident (un EDITOR esborra una pàgina, un compte
   fa accions sospitoses), no podem reconstruir què ha passat ni quan. Necessari per
   incident response, recomanat per RGPD Article 32 (mesures de seguretat).

Aquesta setmana 3 tanca aquests quatre buits. No bloqueja activitat comercial actual però
**és prerequisit per signar el primer pilot real de clínica estètica** sense exposició
legal.

## What Changes

### Privacy policy + DPA documentation (`/privacitat`)

- Reescriure la pàgina amb seccions explícites:
  - **Subprocessadors** llistats: Resend (Ireland EU), Hetzner (Germany EU), Google Fonts
    (DPF), Microsoft 365 (DPA estàndard), Google Analytics 4 (DPF).
  - **Article 9 — dades de salut**: secció dedicada explicant què tractem en el context de
    l'agent IA per a clíniques, on s'emmagatzemen, durant quant de temps, qui hi té
    accés.
  - **Drets ARCO operables**: enlla­ç directe a `/dashboard/perfil` (o pàgina equivalent)
    on l'usuari té els botons "Exporta les meves dades" i "Eliminar el meu compte".
  - **Transferències internacionals**: marc legal explícit (DPF amb US, SCCs amb altres).

### Drets ARCO — endpoints i UI

- `GET /api/profile/export` — retorna un JSON amb totes les dades vinculades al user
  autenticat: User row, Project, Invoice, Message, ContactSubmission (matched per email).
  Format: descarrega com a `.json` amb `Content-Disposition: attachment`.
- `DELETE /api/profile/delete` — **anonimitza**, no esborra fíesicament:
  - `User.email` → `deleted-{uuid}@anonymized.local`
  - `User.name` → `[Compte eliminat]`
  - `User.phone` → null
  - `User.password` → hash random nou (impossibilita login)
  - `User.isActive` → false
  - Registres relacionats (Project, Invoice, Message) es conserven amb el `userId`
    apuntant al User anonimitzat — necessari per obligacions comptables (Hisenda exigeix
    conservar factures 6 anys, RGPD Article 6.1.c ho permet).
- UI a `/dashboard/perfil`: nova secció "Les meves dades" amb dos botons.
- Confirmació explícita per l'eliminació amb un text que requereix escriure "ELIMINAR" per
  evitar clics accidentals.

### 2FA TOTP + recovery codes

- Schema Prisma: nous camps a `User`: `twoFactorEnabled` (Bool), `twoFactorSecret`
  (String?), `twoFactorRecoveryCodes` (String[] hash bcrypt).
- Endpoints:
  - `POST /api/profile/2fa/setup` — genera secret TOTP + 10 recovery codes; retorna QR
    URI i els codes en clar (només una vegada). NO activa encara el 2FA — espera
    confirmació amb codi vàlid.
  - `POST /api/profile/2fa/confirm` — verifica un codi TOTP amb el secret pendent;
    si vàlid, activa `twoFactorEnabled=true`.
  - `POST /api/profile/2fa/disable` — requereix password + codi TOTP actual.
- Login flow modificat:
  - Primer pas — email + password (com avui)
  - Si l'usuari té `twoFactorEnabled=true` → segon pas que demana codi TOTP o recovery
    code abans d'emetre el JWT.
- UI a `/dashboard/perfil`: nova secció "Autenticació de dos factors" amb estat actual
  i flow d'activació (mostrar QR, demanar codi de confirmació, mostrar recovery codes
  per copiar).
- **Aplicació de la política**: middleware comprova el rol; si és SUPERADMIN o ADMIN i
  `twoFactorEnabled=false`, el redirigeix a una pàgina `/setup-2fa` que força la
  configuració abans de qualsevol altra acció admin. Per a EDITOR i CLIENT, és opcional.

### Audit log

- Nou model `AuditLog` (id, action, actorId, actorEmail, targetId, targetType, ipAddress,
  userAgent, metadata Json, createdAt).
- Helper `lib/audit.ts` amb `logAuditEvent({...})` no-bloquejant (si la insercció falla,
  loguejat però no bloqueja la request).
- Esdeveniments registrats:
  - `login_success`, `login_failed`
  - `password_changed`
  - `2fa_enabled`, `2fa_disabled`, `2fa_failed`
  - `role_changed`
  - `user_deleted` (ARCO)
  - `page_published`, `page_archived`
  - `media_deleted`
- Vista admin: `/admin/audit-log` amb taula paginada filtrable per acció / actor / data.
  Només SUPERADMIN.
- Retenció: 1 any. Script de purga `prisma/cleanup-audit-log.ts` (manual; cron en futur).

## Impact

### Affected specs
- `auth` — 2FA flow, login two-step.
- `client-portal` — ARCO buttons al perfil, 2FA setup UI.
- `admin-dashboard` — vista audit log.
- `api` — nous endpoints `/api/profile/export`, `/api/profile/delete`,
  `/api/profile/2fa/*`.
- `database` — taules `AuditLog`, camps 2FA a `User`.

### Affected code
- `prisma/schema.prisma` — `AuditLog` model + 2FA fields a `User`.
- `src/lib/audit.ts` — helper.
- `src/lib/totp.ts` — generació + verificació de codis TOTP (RFC 6238).
- `src/lib/auth.ts` — login flow two-step + audit hooks.
- `src/middleware.ts` — força 2FA a SUPERADMIN/ADMIN.
- `src/app/api/profile/export/route.ts` — nou.
- `src/app/api/profile/delete/route.ts` — nou.
- `src/app/api/profile/2fa/setup/route.ts`, `confirm/route.ts`, `disable/route.ts`,
  `verify/route.ts` (per al segon pas del login) — nous.
- `src/app/dashboard/perfil/page.tsx` — afegir seccions "Les meves dades" i "2FA".
- `src/app/setup-2fa/page.tsx` — pàgina forçada per a admins sense 2FA.
- `src/app/admin/audit-log/page.tsx` — vista admin.
- `src/app/[locale]/(public)/privacitat/page.tsx` — reescriure.
- Traduccions ca/en/es per als textos nous.

### Out of scope (deferred)

- WebAuthn / passkeys — futur (després de la primera ronda de feedback amb usuaris reals).
- 2FA via SMS — desaconsellat (SIM swap), no implementat.
- Audit log streaming a sistema extern (SIEM, Datadog) — quan tingui sentit, ara la
  taula Postgres és suficient.
- DPA legal real signat amb Resend/Hetzner/Google — això ho fas tu al panel de cada
  proveïdor (text plantilla, accepta i firma). El privacy policy diu "DPAs signats" de
  forma genèrica; quan signis tots, ja és veritat completa.
