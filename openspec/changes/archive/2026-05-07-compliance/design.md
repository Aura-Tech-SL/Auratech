## Decisions tècniques

### 1. TOTP implementation — sense dependència externa

`otplib` i `speakeasy` són les dues llibreries habituals per a TOTP. Cap és gegant. Però
per al nostre cas (un sol secret per usuari, RFC 6238 estàndard, 30-second time step),
una implementació de ~50 línies amb `crypto` (Node built-in) és més transparent i evita
una dependència més. La fem nosaltres.

Algoritme RFC 6238 (HMAC-SHA1 sobre el contador de 30s, truncat a 6 dígits) és
implementable directament amb `crypto.createHmac('sha1', secret).update(counterBuf)`.

Trade-off: si calgués SHA256 o variants, hauríem de reimplementar. Acceptable: SHA1 és
l'estàndard universal per als apps autenticadors (Google Authenticator, Authy, 1Password).

`qrcode` npm package sí l'utilitzem (la lògica de QR és complexa; no hi ha valor en
reimplementar-la).

### 2. Two-step login — sobre NextAuth CredentialsProvider

NextAuth no té flow two-step natiu. Tres opcions:

- **(a)** Provider únic que rep `email + password + code` (opcional). Si 2FA habilitat
  i code missing/invalid → throw amb missatge específic. Frontend captura el missatge i
  ensenya el segon pas. **El meu vot.**
- **(b)** Dos providers (un per password, un per TOTP). Complica el flow client.
- **(c)** Custom session bridge — emetre un JWT temporal "auth-pending" que només permet
  cridar `/api/auth/2fa-verify`. Més robust però més codi.

Triem (a) perquè és el mínim canvi a `lib/auth.ts` i el flow del frontend és lineal.

### 3. Recovery codes — emmagatzematge

10 codes per usuari, hash bcrypt cost 10 (similar al password però menys exigent perquè
els codes tenen entropia alta — 8 hex chars = ~32 bits per code, que en 10 codes són ~106
bits). Format display: `XXXX-XXXX` (8 hex chars amb separador per facilitar la lectura).

Quan un code és usat: removed de l'array `twoFactorRecoveryCodes` a la BBDD. No regeneració
automàtica (l'usuari ho fa manual al panel).

Si tots els codes són consumits sense haver regenerat: l'usuari pot accedir només via TOTP.
Si perd el TOTP també → suport manual (un SUPERADMIN pot resetejar el 2FA d'un altre via
un script `prisma/reset-2fa.ts` ad-hoc).

### 4. Anonimització ARCO — tractament de dades relacionades

Quan un user es elimina via ARCO:

| Taula | Què fem |
|---|---|
| User | Anonimitzar email/name/phone, hash random a password, isActive=false |
| Project | Mantenir userId — la clínica/empresa pot estar legalment obligada a conservar el projecte |
| Invoice | Mantenir userId — Hisenda exigeix conservació 6 anys |
| Message | Eliminar el contingut (`content` → "[Missatge eliminat]") però mantenir la metadada |
| ContactSubmission | Cas especial — no està vinculat a userId. **Buscar per `email` i anonimitzar fields name/email/phone/message del propi ContactSubmission**. Acceptable per RGPD perquè el dret de supressió aplica també als ContactSubmission |

Aquesta política assegura que:
- L'usuari no pot tornar a iniciar sessió.
- L'empresa pot continuar complint obligacions legals.
- Les dades personals identificables s'esborren.

Documentem aquest comportament al privacy policy ("Anonimitzem el teu compte mantenint
els registres econòmics que la legislació espanyola exigeix conservar").

### 5. Audit log — schema mínim útil

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  action     String   // "login_success", "page_published", etc.
  actorId    String?  // null si és un actor anònim (login_failed amb email no existent)
  actorEmail String?  // sempre present si conegut, útil per filtrar
  targetType String?  // "User", "Page", "BlogPost", etc.
  targetId   String?
  ipAddress  String?
  userAgent  String?
  metadata   Json     @default("{}")
  createdAt  DateTime @default(now())

  @@index([createdAt])
  @@index([actorId, createdAt])
  @@index([action, createdAt])
}
```

Sense relació `User → AuditLog` formal — el `actorId` és un string opcional que apunta a
un user.id, però a propòsit no és FK perquè:
- Si un user s'elimina (anonimització), els audit logs sobreviuen amb el seu actorId
  apuntant a un user que ara és anònim.
- Permet logging d'usuaris que mai existiran (logins fallits amb email no existent).

### 6. 2FA enforcement — middleware vs page guard

Tres patrons:

- **(a) Middleware** que comprova el JWT i redirigeix. Únic punt de control. Funciona per
  a totes les rutes (api + pages).
- **(b)** Page guards individuals a cada page admin. Repetitiu.
- **(c) Layout guard** al `/admin/layout.tsx`. Funciona per a admin pages, però no
  controla API endpoints.

Triem (a) — el middleware ja existeix i fa role checks. Afegim un nou check: si rol és
admin i `twoFactorEnabled=false` al JWT i la ruta no és exempta, redirect.

Per al JWT: extens el camp `twoFactorEnabled` al token i la sessió. Cal afegir-ho al
`callbacks.jwt` i `callbacks.session` de NextAuth, i al type declaration a
`src/types/next-auth.d.ts`.

### 7. Setup 2FA — flow UI

```
1. User clica "Activar 2FA" a /dashboard/perfil
2. POST /api/profile/2fa/setup → response { secret, qrCode (dataURL), recoveryCodes }
3. UI mostra:
   a. QR per escanejar amb Google Authenticator / Authy / 1Password
   b. Input per al codi de confirmació
   c. Recovery codes amb botons "Copiar" i "Descarregar TXT"
   d. Checkbox: "He guardat els recovery codes en un lloc segur"
4. User entra el codi. POST /api/profile/2fa/confirm → response { success: true }
5. UI mostra confirmació + recordatori que el 2FA està actiu
```

Flow mancant per als admins forçats: a `/setup-2fa` (no a `/dashboard/perfil`), el mateix
flow però no es pot saltar (no hi ha enllaç a la home, només el botó d'activació).

## Riscos i mitigacions

| Risc | Probabilitat | Mitigació |
|---|---|---|
| Sandra perd el telèfon i recovery codes | Baixa | Tu (SUPERADMIN) pots resetejar amb script. Documentar al README intern |
| Tu i Sandra alhora bloquejats | Molt baixa | Script `prisma/reset-2fa.ts` accessible via SSH al servidor com a últim recurs |
| Audit log creix sense control | Mitjana | Cron mensual de purga (futur). Ara: 1 any de retenció documentada |
| Anonimització no és prou per a algun client | Baixa | Afegir endpoint per a supressió completa via SUPERADMIN si cas raonable |
| TOTP time skew entre client i servidor | Baixa | `verifyTotp()` ja accepta ±1 finestra (60s tolerància) |
| Recovery codes filtrats al log | Mitjana | Mai loguejar el codi (només `2fa_recovery_used`); guardar només hash |
| Setup 2FA en mobile difícil | Baixa | QR és la via universal; recovery codes en text per copiar manualment |
